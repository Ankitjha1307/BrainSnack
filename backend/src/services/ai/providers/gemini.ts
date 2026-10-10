
import { GoogleGenAI } from '@google/genai';
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

const isDifficulty = (value: unknown): value is Difficulty =>
  value === 'easy' || value === 'medium' || value === 'hard';

const cleanText = (value: string): string =>
  value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Gemini provider.
 *
 * Uses Google's official server-side SDK. The API key never reaches the
 * browser; the Express route remains responsible for auth and persistence.
 */
export class GeminiAIProvider implements AIProvider {
  readonly name = 'gemini' as const;

  private readonly client = new GoogleGenAI({
    apiKey: config.ai.geminiApiKey,
  });
  private readonly models = config.ai.geminiModels;

  private async call(prompt: string, model: string): Promise<string> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`Gemini timed out after ${config.ai.timeout}ms`)),
        config.ai.timeout
      );
    });

    try {
      const response = await Promise.race([
        this.client.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.35,
            responseMimeType: 'application/json',
          },
        }),
        timeout,
      ]);

      const text = response.text ?? '';
      if (!text.trim()) throw new Error('Gemini returned an empty response');
      return text;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private async callWithFallback(prompt: string): Promise<string> {
    let lastError: unknown;
    for (const model of this.models) {
      try {
        return await this.call(prompt, model);
      } catch (error) {
        lastError = error;
        console.warn(
          `[gemini] model "${model}" failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error('All configured Gemini models failed');
  }

  async generateQuiz(request: QuizRequest): Promise<QuizResponse> {
    let lastError: unknown;
    for (const model of this.models) {
      try {
        const response = await this.generateQuizWithModel(request, model);
        if (response.questions.length >= request.question_count) {
          return response;
        }
        lastError = new Error(
          `${model} returned ${response.questions.length}/${request.question_count} valid questions`
        );
      } catch (error) {
        lastError = error;
        console.warn(
          `[gemini] model "${model}" failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('All configured Gemini models failed');
  }

  private async generateQuizWithModel(
    request: QuizRequest,
    model: string
  ): Promise<QuizResponse> {
    const weakConcepts = request.weak_concepts?.length
      ? request.weak_concepts.join(', ')
      : 'none';

    const recentMistakes = request.recent_mistakes?.length
      ? request.recent_mistakes.join(', ')
      : 'none';

    const prompt = `Generate a quiz with ${request.question_count} questions on the topic "${request.topic}".

Difficulty level: ${request.difficulty}
Weak concepts to focus on: ${weakConcepts}
Recent mistakes to address: ${recentMistakes}
Learner context: ${request.learner_context?.trim() || 'No additional context provided'}

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
      "difficulty": "${request.difficulty}"
    }
  ]
}

Important:
- Generate exactly ${request.question_count} questions.
- Every question must have exactly 4 non-empty options.
- Options must be distinct.
- correctAnswer must be an integer between 0 and 3.
- The correctAnswer is a zero-based index into the options array.
- The question, explanation, and concept must not be empty.
- Questions must be clear, unambiguous, and educational.
- Explanations should explain why the correct answer is correct.
- Each question's difficulty must be easy, medium, or hard.
- Return ONLY the JSON object, with no additional text.`;

    const text = await this.call(prompt, model);

    const parsed = this.parseJson(text) as {
      questions?: unknown;
    };

    const rawQuestions = Array.isArray(parsed.questions)
      ? parsed.questions
      : [];

    const questions: ProviderQuestion[] = rawQuestions
      .filter((value: unknown): value is Record<string, unknown> => {
        if (
          typeof value !== 'object' ||
          value === null ||
          Array.isArray(value)
        ) {
          return false;
        }

        const q = value as Record<string, unknown>;

        if (
          typeof q.question !== 'string' ||
          !q.question.trim() ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          !q.options.every(
            (option: unknown) =>
              typeof option === 'string' && option.trim().length > 0
          ) ||
          new Set(
            q.options.map((option: string) =>
              option.trim().toLowerCase()
            )
          ).size !== 4 ||
          !Number.isInteger(q.correctAnswer) ||
          (q.correctAnswer as number) < 0 ||
          (q.correctAnswer as number) > 3 ||
          typeof q.explanation !== 'string' ||
          !q.explanation.trim() ||
          typeof q.concept !== 'string' ||
          !q.concept.trim()
        ) {
          return false;
        }

        return true;
      })
      .slice(0, request.question_count)
      .map((value): ProviderQuestion => {
        const q = value as {
          question: string;
          options: string[];
          correctAnswer: number;
          explanation: string;
          concept: string;
          difficulty?: unknown;
        };

        return {
          question: cleanText(q.question),
          options: q.options.map((option) => cleanText(option)),
          correctAnswer: q.correctAnswer,
          explanation: cleanText(q.explanation),
          concept: cleanText(q.concept),
          difficulty: isDifficulty(q.difficulty)
            ? q.difficulty
            : request.difficulty,
        };
      });

    return { questions };
  }

  async validateQuestion(
    request: QuestionValidationRequest
  ): Promise<QuestionValidationResult> {
    const prompt = `Validate the following quiz question for quality, correctness, and appropriateness.

Question: ${request.question}
Options: ${request.options.join(', ')}
Correct Answer Index: ${request.correctAnswer}
Explanation: ${request.explanation ?? ''}
Concept: ${request.concept ?? ''}
Difficulty: ${request.difficulty ?? 'medium'}

Evaluate:
- Clarity and unambiguity.
- Whether the indicated answer is correct.
- Whether the distractors are plausible.
- Educational value of the explanation.
- Whether the difficulty is appropriate.

Return a JSON object with this structure:
{
  "is_valid": true,
  "score": 0.9,
  "feedback": "overall feedback",
  "issues": ["issue1", "issue2"]
}

Return ONLY the JSON object, with no additional text.`;

    const text = await this.callWithFallback(prompt);

    const parsed = this.parseJson(text) as {
      is_valid?: unknown;
      valid?: unknown;
      score?: unknown;
      feedback?: unknown;
      issues?: unknown;
    };

    return {
      valid: parsed.is_valid === true || parsed.valid === true,
      score:
        typeof parsed.score === 'number' &&
        Number.isFinite(parsed.score)
          ? Math.max(0, Math.min(1, parsed.score))
          : 0,
      feedback:
        typeof parsed.feedback === 'string' ? parsed.feedback : '',
      issues: Array.isArray(parsed.issues)
        ? parsed.issues.filter(
            (issue): issue is string => typeof issue === 'string'
          )
        : [],
      suggestions:
        typeof parsed.feedback === 'string' && parsed.feedback.trim()
          ? [parsed.feedback]
          : [],
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

Recommend the most appropriate topic, difficulty level, concepts to focus on, and explain why.

Return a JSON object with this exact structure:
{
  "recommended_topic": "topic name",
  "recommended_difficulty": "easy|medium|hard",
  "focus_concepts": ["concept1", "concept2"],
  "reason": "explanation for the recommendation"
}

Return ONLY the JSON object, with no additional text.`;

    const text = await this.callWithFallback(prompt);

    const parsed = this.parseJson(text) as {
      recommended_topic?: unknown;
      recommended_difficulty?: unknown;
      focus_concepts?: unknown;
      reason?: unknown;
    };

    const difficulty = String(
      parsed.recommended_difficulty ?? ''
    ).toLowerCase();

    return {
      recommended_topic:
        typeof parsed.recommended_topic === 'string' &&
        parsed.recommended_topic.trim()
          ? parsed.recommended_topic.trim()
          : 'general_knowledge',
      recommended_difficulty: isDifficulty(difficulty)
        ? difficulty
        : 'medium',
      focus_concepts: Array.isArray(parsed.focus_concepts)
        ? parsed.focus_concepts.filter(
            (concept): concept is string =>
              typeof concept === 'string'
          )
        : [],
      reason:
        typeof parsed.reason === 'string' ? parsed.reason : '',
    };
  }

  /**
   * Parse JSON, tolerating fenced code blocks and surrounding prose.
   */
  private parseJson(text: string): Record<string, any> {
    let cleaned = text.trim();

    if (cleaned.startsWith('```')) {
      const lines = cleaned.split('\n');
      cleaned = lines.slice(1).join('\n').trim();

      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3).trim();
      }
    }

    try {
      const parsed: unknown = JSON.parse(cleaned);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error('Gemini response must be a JSON object');
      }

      return parsed as Record<string, any>;
    } catch (error) {
      // Only attempt to recover a JSON object when direct parsing fails.
      if (
        error instanceof SyntaxError ||
        (error instanceof Error &&
          error.message === 'Gemini response must be a JSON object')
      ) {
        const match = cleaned.match(/\{[\s\S]*\}/);

        if (match) {
          const parsed: unknown = JSON.parse(match[0]);

          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            !Array.isArray(parsed)
          ) {
            return parsed as Record<string, any>;
          }
        }
      }

      throw new Error('Could not parse JSON from Gemini response');
    }
  }
}
