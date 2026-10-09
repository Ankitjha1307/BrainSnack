import { config } from '../../../config/index';
import {
  AIProvider,
  AdaptiveRecommendationRequest,
  AdaptiveRecommendationResult,
  Difficulty,
  ProviderQuestion,
  QuestionValidationRequest,
  QuestionValidationResult,
  QuizRequest,
  QuizResponse,
} from '../types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const isDifficulty = (value: unknown): value is Difficulty =>
  value === 'easy' || value === 'medium' || value === 'hard';

/**
 * Gemini provider.
 *
 * Talks to the Google Generative Language REST API directly with `fetch` rather
 * than pulling in a Python SDK or a second Node dependency. Only the small
 * surface the app needs is implemented.
 */
export class GeminiAIProvider implements AIProvider {
  readonly name = 'gemini' as const;

  private readonly apiKey = config.ai.geminiApiKey;
  private readonly model = config.ai.geminiModel;

  private async call(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.ai.timeout);

    try {
      const response = await fetch(
        `${GEMINI_BASE}/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8 },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Gemini returned ${response.status}${body ? `: ${body.slice(0, 300)}` : ''}`);
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      if (!text.trim()) throw new Error('Gemini returned an empty response');
      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateQuiz(request: QuizRequest): Promise<QuizResponse> {
    const weakConcepts = request.weak_concepts?.length ? request.weak_concepts.join(', ') : 'none';
    const recentMistakes = request.recent_mistakes?.length
      ? request.recent_mistakes.join(', ')
      : 'none';

    const prompt = `Generate a quiz with ${request.question_count} questions on the topic "${request.topic}".
Difficulty level: ${request.difficulty}
Weak concepts to focus on: ${weakConcepts}
Recent mistakes to address: ${recentMistakes}

Return the response as a JSON object with this exact structure:
{
  "topic": "${request.topic}",
  "difficulty": "${request.difficulty}",
  "questions": [
    {
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "explanation text",
      "concept": "concept name",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Important:
- Each question must have exactly 4 options
- correctAnswer must be an integer between 0 and 3
- Questions should be clear and unambiguous
- Explanations should be detailed and educational
- Return ONLY the JSON object, no additional text`;

    const text = await this.call(prompt);
    const parsed = this.parseJson(text) as { questions?: any[] };

    const questions: ProviderQuestion[] = (parsed.questions ?? [])
      .filter((q: any) => Array.isArray(q?.options) && q.options.length >= 2)
      .map((q: any) => ({
        question: String(q.question ?? ''),
        options: q.options.map((o: unknown) => String(o)),
        correctAnswer: Number(q.correctAnswer ?? 0),
        explanation: String(q.explanation ?? ''),
        concept: String(q.concept ?? ''),
        difficulty: isDifficulty(q.difficulty) ? q.difficulty : request.difficulty,
      }));

    return { questions };
  }

  async validateQuestion(request: QuestionValidationRequest): Promise<QuestionValidationResult> {
    const prompt = `Validate the following quiz question for quality, correctness, and appropriateness.

Question: ${request.question}
Options: ${request.options.join(', ')}
Correct Answer Index: ${request.correctAnswer}
Explanation: ${request.explanation ?? ''}
Concept: ${request.concept ?? ''}
Difficulty: ${request.difficulty ?? 'medium'}

Evaluate the question on clarity, correctness of the answer, quality of the distractors, educational value of the explanation and appropriate difficulty.

Return the response as a JSON object with this exact structure:
{
  "is_valid": true,
  "score": 0.9,
  "feedback": "overall feedback",
  "issues": ["issue1", "issue2"]
}

Return ONLY the JSON object, no additional text.`;

    const text = await this.call(prompt);
    const parsed = this.parseJson(text) as {
      is_valid?: boolean;
      score?: number;
      feedback?: string;
      issues?: string[];
    };

    return {
      valid: Boolean(parsed.is_valid),
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      feedback: parsed.feedback ?? '',
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: parsed.feedback ? [parsed.feedback] : [],
    };
  }

  async getAdaptiveRecommendation(
    request: AdaptiveRecommendationRequest
  ): Promise<AdaptiveRecommendationResult> {
    const prompt = `Based on the following user performance data, recommend what they should learn next.

User ID: ${request.user_id}
Current Difficulty: ${request.current_difficulty}
Weak Concepts: ${JSON.stringify(request.weak_concepts ?? [])}
Topic Mastery: ${JSON.stringify(request.topic_mastery ?? {})}
Recent Performance: ${JSON.stringify(request.recent_performance ?? [])}

Provide a recommendation for the most appropriate topic to study next, the optimal difficulty level, specific concepts to focus on, and a clear reason.

Return the response as a JSON object with this exact structure:
{
  "recommended_topic": "topic name",
  "recommended_difficulty": "easy|medium|hard",
  "focus_concepts": ["concept1", "concept2"],
  "reason": "explanation for the recommendation"
}

Return ONLY the JSON object, no additional text.`;

    const text = await this.call(prompt);
    const parsed = this.parseJson(text) as {
      recommended_topic?: string;
      recommended_difficulty?: string;
      focus_concepts?: string[];
      reason?: string;
    };

    const difficulty = String(parsed.recommended_difficulty ?? '').toLowerCase();

    return {
      recommended_topic: parsed.recommended_topic ?? 'general_knowledge',
      recommended_difficulty: isDifficulty(difficulty) ? difficulty : 'medium',
      focus_concepts: Array.isArray(parsed.focus_concepts) ? parsed.focus_concepts : [],
      reason: parsed.reason ?? '',
    };
  }

  /** Parse JSON, tolerating ```json fenced blocks or surrounding prose. */
  private parseJson(text: string): Record<string, any> {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      const lines = cleaned.split('\n');
      cleaned = lines.slice(1).join('\n').trim();
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3).trim();
    }

    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Could not parse JSON from Gemini response');
    }
  }
}
