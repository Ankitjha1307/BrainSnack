import random
from typing import List, Dict, Any
from app.models.schemas import (
    QuizRequest,
    QuizResponse,
    QuestionValidationRequest,
    QuestionValidationResponse,
    AdaptiveRecommendationRequest,
    AdaptiveRecommendationResponse,
    Difficulty,
    Question,
)
from app.providers.base import AIProvider
from app.services.question_bank import (
    get_questions_by_topic,
    get_questions_by_concept,
    get_all_topics,
)


class MockAIProvider(AIProvider):
    """Mock AI provider that returns questions from a local question bank."""

    async def generate_quiz(self, request: QuizRequest) -> QuizResponse:
        """Generate a quiz from the local question bank."""
        topic = request.topic
        question_count = request.question_count
        difficulty = request.difficulty
        weak_concepts = request.weak_concepts
        recent_mistakes = request.recent_mistakes

        # Get questions for the topic
        topic_questions = get_questions_by_topic(topic)

        if not topic_questions:
            # Fallback to general knowledge if topic not found
            topic_questions = get_questions_by_topic("general_knowledge")

        # Filter and prioritize questions
        selected_questions = self._select_questions(
            topic_questions, question_count, difficulty, weak_concepts, recent_mistakes
        )

        # Build response
        quiz_data = {
            "topic": topic,
            "difficulty": difficulty.value,
            "questions": [q.model_dump() for q in selected_questions],
        }

        return QuizResponse(quiz=quiz_data)

    def _select_questions(
        self,
        questions: List[Dict[str, Any]],
        count: int,
        difficulty: Difficulty,
        weak_concepts: List[str],
        recent_mistakes: List[str],
    ) -> List[Question]:
        """Select questions based on user profile and preferences."""
        if not questions:
            return []

        # Score each question based on relevance
        scored_questions = []
        for q in questions:
            score = 0

            # Prioritize weak concepts
            if weak_concepts:
                for wc in weak_concepts:
                    if wc.lower() in q["concept"].lower():
                        score += 10

            # Prioritize questions on concepts the learner recently got wrong.
            # `recent_mistakes` holds question text, so match on the concept
            # attached to those questions rather than the text itself.
            if recent_mistakes:
                mistake_concepts = {
                    q["concept"] for q in questions if q["question"] in recent_mistakes
                }
                if q["concept"] in mistake_concepts:
                    score += 8

            # Slight preference for requested difficulty
            if q["difficulty"] == difficulty:
                score += 3
            elif q["difficulty"] == Difficulty.EASY and difficulty == Difficulty.MEDIUM:
                score += 1
            elif q["difficulty"] == Difficulty.HARD and difficulty == Difficulty.MEDIUM:
                score += 1

            scored_questions.append((score, q))

        # Sort by score descending
        scored_questions.sort(key=lambda x: x[0], reverse=True)

        # Take top questions, but add some variety
        selected = []
        used_indices = set()

        # First, take high-scoring questions
        for score, q in scored_questions:
            if len(selected) >= count:
                break
            selected.append(Question(**q))
            used_indices.add(id(q))

        # If we need more, fill with random questions
        if len(selected) < count:
            remaining = [q for s, q in scored_questions if id(q) not in used_indices]
            random.shuffle(remaining)
            for q in remaining:
                if len(selected) >= count:
                    break
                selected.append(Question(**q))

        # Shuffle final selection for variety
        random.shuffle(selected)
        return selected

    async def validate_question(
        self, request: QuestionValidationRequest
    ) -> QuestionValidationResponse:
        """Validate a question using heuristic checks."""
        issues = []
        score = 1.0

        # Check question length
        if len(request.question) < 10:
            issues.append("Question is too short")
            score -= 0.2
        if len(request.question) > 500:
            issues.append("Question is too long")
            score -= 0.1

        # Check for question mark
        if not request.question.strip().endswith("?"):
            issues.append("Question should end with a question mark")
            score -= 0.1

        # Check options
        if len(request.options) < 2:
            issues.append("Question must offer at least 2 options")
            score -= 0.3

        # Check for duplicate options
        if len(set(request.options)) != len(request.options):
            issues.append("Options contain duplicates")
            score -= 0.2

        # Check option lengths
        for i, opt in enumerate(request.options):
            if len(opt) < 1:
                issues.append(f"Option {i+1} is empty")
                score -= 0.1
            if len(opt) > 200:
                issues.append(f"Option {i+1} is too long")
                score -= 0.05

        # Check explanation
        if len(request.explanation) < 10:
            issues.append("Explanation is too short")
            score -= 0.15
        if len(request.explanation) > 1000:
            issues.append("Explanation is too long")
            score -= 0.05

        # Check concept
        if not request.concept or len(request.concept) < 2:
            issues.append("Concept tag is missing or too short")
            score -= 0.1

        # Check correctAnswer validity
        if request.correctAnswer < 0 or request.correctAnswer >= len(request.options):
            issues.append(
                f"Correct answer index must be between 0 and {len(request.options) - 1}"
            )
            score -= 0.3

        # Check for ambiguity indicators
        ambiguity_words = ["maybe", "perhaps", "sometimes", "usually", "often"]
        question_lower = request.question.lower()
        for word in ambiguity_words:
            if word in question_lower:
                issues.append(f"Question contains ambiguous word: '{word}'")
                score -= 0.05

        # Ensure score is within bounds
        score = max(0.0, min(1.0, score))

        # Determine validity: a question must clear the score bar and have no
        # structurally fatal issue.
        fatal = [i for i in issues if "must" in i or "empty" in i or "duplicates" in i]
        is_valid = score >= 0.6 and not fatal

        # Generate feedback
        if is_valid and score >= 0.9:
            feedback = "Excellent question! Well-structured and clear."
        elif is_valid:
            feedback = "Good question with minor areas for improvement."
        else:
            feedback = "Question needs revision before use."

        return QuestionValidationResponse(
            is_valid=is_valid,
            score=round(score, 2),
            feedback=feedback,
            issues=issues,
        )

    async def get_adaptive_recommendation(
        self, request: AdaptiveRecommendationRequest
    ) -> AdaptiveRecommendationResponse:
        """Generate adaptive learning recommendations."""
        weak_concepts = request.weak_concepts
        current_difficulty = request.current_difficulty
        topic_mastery = request.topic_mastery
        recent_performance = request.recent_performance

        # Determine recommended topic
        if weak_concepts:
            # Find topic with most weak concepts
            recommended_topic = weak_concepts[0] if weak_concepts else "general_knowledge"
        elif topic_mastery:
            # Find topic with lowest mastery
            recommended_topic = min(topic_mastery, key=topic_mastery.get)
        else:
            # Default recommendation
            recommended_topic = "programming"

        # Adjust difficulty based on performance
        if recent_performance:
            # Calculate recent success rate
            correct = sum(1 for p in recent_performance if p.get("correct", False))
            total = len(recent_performance)
            success_rate = correct / total if total > 0 else 0.5

            if success_rate > 0.8:
                # User is doing well, increase difficulty
                if current_difficulty == Difficulty.EASY:
                    recommended_difficulty = Difficulty.MEDIUM
                elif current_difficulty == Difficulty.MEDIUM:
                    recommended_difficulty = Difficulty.HARD
                else:
                    recommended_difficulty = Difficulty.HARD
            elif success_rate < 0.4:
                # User is struggling, decrease difficulty
                if current_difficulty == Difficulty.HARD:
                    recommended_difficulty = Difficulty.MEDIUM
                elif current_difficulty == Difficulty.MEDIUM:
                    recommended_difficulty = Difficulty.EASY
                else:
                    recommended_difficulty = Difficulty.EASY
            else:
                recommended_difficulty = current_difficulty
        else:
            recommended_difficulty = current_difficulty

        # Determine focus concepts
        focus_concepts = weak_concepts[:5] if weak_concepts else []

        # Generate reason
        if weak_concepts:
            reason = f"Focus on {recommended_topic} to strengthen your understanding of: {', '.join(weak_concepts[:3])}."
        elif recent_performance:
            correct = sum(1 for p in recent_performance if p.get("correct", False))
            total = len(recent_performance)
            reason = f"Based on your recent performance ({correct}/{total} correct), we recommend continuing with {recommended_topic} at {recommended_difficulty.value} difficulty."
        else:
            reason = f"Start with {recommended_topic} at {recommended_difficulty.value} difficulty to build your knowledge foundation."

        return AdaptiveRecommendationResponse(
            recommended_topic=recommended_topic,
            recommended_difficulty=recommended_difficulty,
            focus_concepts=focus_concepts,
            reason=reason,
        )
