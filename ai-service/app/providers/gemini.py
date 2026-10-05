import json
import re
from typing import Optional
import google.generativeai as genai
from app.config import settings
from app.models.schemas import (
    QuizRequest,
    QuizResponse,
    QuestionValidationRequest,
    QuestionValidationResponse,
    AdaptiveRecommendationRequest,
    AdaptiveRecommendationResponse,
    Difficulty,
)
from app.providers.base import AIProvider


class GeminiAIProvider(AIProvider):
    """AI provider using Google's Gemini API."""

    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required for GeminiAIProvider")

        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-pro")

    async def generate_quiz(self, request: QuizRequest) -> QuizResponse:
        """Generate a quiz using Gemini API."""
        prompt = self._build_quiz_prompt(request)

        try:
            response = await self.model.generate_content_async(prompt)
            response_text = response.text

            # Parse JSON response
            quiz_data = self._parse_json_response(response_text)

            return QuizResponse(quiz=quiz_data)

        except Exception as e:
            # Fallback to a simple response if API fails
            return QuizResponse(
                quiz={
                    "topic": request.topic,
                    "difficulty": request.difficulty.value,
                    "questions": [],
                    "error": str(e),
                }
            )

    def _build_quiz_prompt(self, request: QuizRequest) -> str:
        """Build a prompt for quiz generation."""
        weak_concepts = ", ".join(request.weak_concepts) if request.weak_concepts else "none"
        recent_mistakes = ", ".join(request.recent_mistakes) if request.recent_mistakes else "none"

        prompt = f"""Generate a quiz with {request.question_count} questions on the topic "{request.topic}".
Difficulty level: {request.difficulty.value}
Weak concepts to focus on: {weak_concepts}
Recent mistakes to address: {recent_mistakes}

Return the response as a JSON object with this exact structure:
{{
  "topic": "{request.topic}",
  "difficulty": "{request.difficulty.value}",
  "questions": [
    {{
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "explanation text",
      "concept": "concept name",
      "difficulty": "easy|medium|hard"
    }}
  ]
}}

Important:
- Each question must have exactly 4 options
- correctAnswer must be an integer between 0 and 3
- Questions should be clear and unambiguous
- Explanations should be detailed and educational
- Return ONLY the JSON object, no additional text"""

        return prompt

    async def validate_question(
        self, request: QuestionValidationRequest
    ) -> QuestionValidationResponse:
        """Validate a question using Gemini API."""
        prompt = f"""Validate the following quiz question for quality, correctness, and appropriateness.

Question: {request.question}
Options: {request.options}
Correct Answer Index: {request.correctAnswer}
Explanation: {request.explanation}
Concept: {request.concept}
Difficulty: {request.difficulty.value}

Evaluate the question on:
1. Clarity and unambiguity
2. Correctness of the answer
3. Quality of distractors
4. Educational value of the explanation
5. Appropriate difficulty level

Return the response as a JSON object with this exact structure:
{{
  "is_valid": true/false,
  "score": 0.0 to 1.0,
  "feedback": "overall feedback",
  "issues": ["issue1", "issue2"]
}}

Return ONLY the JSON object, no additional text."""

        try:
            response = await self.model.generate_content_async(prompt)
            response_text = response.text

            # Parse JSON response
            validation_data = self._parse_json_response(response_text)

            return QuestionValidationResponse(
                is_valid=validation_data.get("is_valid", False),
                score=validation_data.get("score", 0.0),
                feedback=validation_data.get("feedback", ""),
                issues=validation_data.get("issues", []),
            )

        except Exception as e:
            return QuestionValidationResponse(
                is_valid=False,
                score=0.0,
                feedback=f"Validation failed: {str(e)}",
                issues=["API error occurred"],
            )

    async def get_adaptive_recommendation(
        self, request: AdaptiveRecommendationRequest
    ) -> AdaptiveRecommendationResponse:
        """Get adaptive learning recommendations using Gemini API."""
        prompt = f"""Based on the following user performance data, recommend what they should learn next.

User ID: {request.user_id}
Current Difficulty: {request.current_difficulty.value}
Weak Concepts: {request.weak_concepts}
Topic Mastery: {request.topic_mastery}
Recent Performance: {request.recent_performance}

Provide a recommendation for:
1. The most appropriate topic to study next
2. The optimal difficulty level
3. Specific concepts to focus on
4. A clear reason for the recommendation

Return the response as a JSON object with this exact structure:
{{
  "recommended_topic": "topic name",
  "recommended_difficulty": "easy|medium|hard",
  "focus_concepts": ["concept1", "concept2"],
  "reason": "explanation for the recommendation"
}}

Return ONLY the JSON object, no additional text."""

        try:
            response = await self.model.generate_content_async(prompt)
            response_text = response.text

            # Parse JSON response
            recommendation_data = self._parse_json_response(response_text)

            # Validate and convert difficulty
            difficulty_str = recommendation_data.get("recommended_difficulty", "medium")
            try:
                recommended_difficulty = Difficulty(difficulty_str.lower())
            except ValueError:
                recommended_difficulty = Difficulty.MEDIUM

            return AdaptiveRecommendationResponse(
                recommended_topic=recommendation_data.get("recommended_topic", "general_knowledge"),
                recommended_difficulty=recommended_difficulty,
                focus_concepts=recommendation_data.get("focus_concepts", []),
                reason=recommendation_data.get("reason", ""),
            )

        except Exception as e:
            # Fallback recommendation
            return AdaptiveRecommendationResponse(
                recommended_topic="general_knowledge",
                recommended_difficulty=Difficulty.MEDIUM,
                focus_concepts=request.weak_concepts[:3] if request.weak_concepts else [],
                reason=f"Based on your performance, we recommend reviewing fundamental concepts. (Error: {str(e)})",
            )

    def _parse_json_response(self, text: str) -> dict:
        """Parse JSON from response text, handling markdown code blocks."""
        # Remove markdown code block if present
        text = text.strip()
        if text.startswith("```"):
            # Remove first line (```json or ```)
            lines = text.split("\n")
            text = "\n".join(lines[1:])
            # Remove last line if it's ```
            if text.strip().endswith("```"):
                text = text.strip()[:-3]

        # Try to find JSON in the text
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to extract JSON using regex
            json_match = re.search(r"\{[\s\S]*\}", text)
            if json_match:
                return json.loads(json_match.group())
            raise ValueError("Could not parse JSON from response")
