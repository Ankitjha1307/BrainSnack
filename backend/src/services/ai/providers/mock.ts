import { getQuestionsByTopic, BankQuestion } from '../questionBank';
import {
  AIProvider,
  AdaptiveRecommendationRequest,
  AdaptiveRecommendationResult,
  ProviderQuestion,
  QuestionValidationRequest,
  QuestionValidationResult,
  QuizRequest,
  QuizResponse,
} from '../types';

/** Fisher-Yates shuffle, matching the variety the Python provider added. */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const toProviderQuestion = (q: BankQuestion): ProviderQuestion => ({
  question: q.question,
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanation: q.explanation,
  concept: q.concept,
  difficulty: q.difficulty,
});

/**
 * Mock AI provider backed by the local question bank.
 *
 * This is the same behaviour the old FastAPI mock provider had: score every
 * candidate by how well it matches the learner's weak concepts, recent mistakes
 * and requested difficulty, then shuffle the pick so back-to-back quizzes are
 * not identical.
 */
export class MockAIProvider implements AIProvider {
  readonly name = 'mock' as const;

  async generateQuiz(request: QuizRequest): Promise<QuizResponse> {
    let topicQuestions = getQuestionsByTopic(request.topic);
    if (topicQuestions.length === 0) {
      // Unknown topic: fall back to general knowledge rather than empty-handed.
      topicQuestions = getQuestionsByTopic('general_knowledge');
    }

    const selected = this.selectQuestions(
      topicQuestions,
      request.question_count,
      request.difficulty,
      request.weak_concepts ?? [],
      request.recent_mistakes ?? []
    );

    return { questions: selected };
  }

  private selectQuestions(
    questions: BankQuestion[],
    count: number,
    difficulty: QuizRequest['difficulty'],
    weakConcepts: string[],
    recentMistakes: string[]
  ): ProviderQuestion[] {
    if (questions.length === 0) return [];

    // The Python provider matched mistakes by question text, then mapped those
    // back to the concept they belong to. Recent mistakes arrive as question
    // text over the wire, so do the same here.
    const mistakeConcepts = new Set(
      questions.filter((q) => recentMistakes.includes(q.question)).map((q) => q.concept)
    );

    const scored = questions.map((q) => {
      let score = 0;

      for (const wc of weakConcepts) {
        if (q.concept.toLowerCase().includes(wc.toLowerCase())) score += 10;
      }

      if (mistakeConcepts.has(q.concept)) score += 8;

      if (q.difficulty === difficulty) {
        score += 3;
      } else if (
        (q.difficulty === 'easy' && difficulty === 'medium') ||
        (q.difficulty === 'hard' && difficulty === 'medium')
      ) {
        score += 1;
      }

      return { score, question: q };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected: ProviderQuestion[] = [];
    const used = new Set<BankQuestion>();

    for (const entry of scored) {
      if (selected.length >= count) break;
      selected.push(toProviderQuestion(entry.question));
      used.add(entry.question);
    }

    if (selected.length < count) {
      const remaining = shuffle(scored.map((s) => s.question).filter((q) => !used.has(q)));
      for (const q of remaining) {
        if (selected.length >= count) break;
        selected.push(toProviderQuestion(q));
      }
    }

    return shuffle(selected);
  }

  async validateQuestion(request: QuestionValidationRequest): Promise<QuestionValidationResult> {
    const issues: string[] = [];
    let score = 1.0;

    const question = request.question ?? '';
    const options = request.options ?? [];
    const explanation = request.explanation ?? '';
    const concept = request.concept ?? '';

    if (question.length < 10) {
      issues.push('Question is too short');
      score -= 0.2;
    }
    if (question.length > 500) {
      issues.push('Question is too long');
      score -= 0.1;
    }
    if (!question.trim().endsWith('?')) {
      issues.push('Question should end with a question mark');
      score -= 0.1;
    }
    if (options.length < 2) {
      issues.push('Question must offer at least 2 options');
      score -= 0.3;
    }
    if (new Set(options).size !== options.length) {
      issues.push('Options contain duplicates');
      score -= 0.2;
    }
    options.forEach((opt, i) => {
      if (opt.length < 1) {
        issues.push(`Option ${i + 1} is empty`);
        score -= 0.1;
      }
      if (opt.length > 200) {
        issues.push(`Option ${i + 1} is too long`);
        score -= 0.05;
      }
    });
    if (explanation.length < 10) {
      issues.push('Explanation is too short');
      score -= 0.15;
    }
    if (explanation.length > 1000) {
      issues.push('Explanation is too long');
      score -= 0.05;
    }
    if (!concept || concept.length < 2) {
      issues.push('Concept tag is missing or too short');
      score -= 0.1;
    }
    if (request.correctAnswer < 0 || request.correctAnswer >= options.length) {
      issues.push(`Correct answer index must be between 0 and ${options.length - 1}`);
      score -= 0.3;
    }

    const ambiguityWords = ['maybe', 'perhaps', 'sometimes', 'usually', 'often'];
    const lower = question.toLowerCase();
    for (const word of ambiguityWords) {
      if (lower.includes(word)) {
        issues.push(`Question contains ambiguous word: '${word}'`);
        score -= 0.05;
      }
    }

    score = Math.max(0, Math.min(1, score));

    const fatal = issues.some((i) => i.includes('must') || i.includes('empty') || i.includes('duplicates'));
    const valid = score >= 0.6 && !fatal;

    const feedback =
      valid && score >= 0.9
        ? 'Excellent question! Well-structured and clear.'
        : valid
        ? 'Good question with minor areas for improvement.'
        : 'Question needs revision before use.';

    return {
      valid,
      score: Math.round(score * 100) / 100,
      feedback,
      issues,
      suggestions: feedback ? [feedback] : [],
    };
  }

  async getAdaptiveRecommendation(
    request: AdaptiveRecommendationRequest
  ): Promise<AdaptiveRecommendationResult> {
    const { weak_concepts: weakConcepts, topic_mastery: topicMastery } = request;
    const currentDifficulty = request.current_difficulty;
    const recentPerformance = request.recent_performance ?? [];

    let recommendedTopic: string;
    if (weakConcepts.length > 0) {
      recommendedTopic = weakConcepts[0] ?? 'general_knowledge';
    } else if (Object.keys(topicMastery).length > 0) {
      recommendedTopic = Object.entries(topicMastery).sort((a, b) => a[1] - b[1])[0][0];
    } else {
      recommendedTopic = 'programming';
    }

    let recommendedDifficulty = currentDifficulty;
    if (recentPerformance.length > 0) {
      const correct = recentPerformance.filter((p) => p.correct === true).length;
      const successRate = correct / recentPerformance.length;

      if (successRate > 0.8) {
        recommendedDifficulty =
          currentDifficulty === 'easy' ? 'medium' : 'hard';
      } else if (successRate < 0.4) {
        recommendedDifficulty =
          currentDifficulty === 'hard' ? 'medium' : 'easy';
      }
    }

    const focusConcepts = weakConcepts.slice(0, 5);

    let reason: string;
    if (weakConcepts.length > 0) {
      reason = `Focus on ${recommendedTopic} to strengthen your understanding of: ${weakConcepts
        .slice(0, 3)
        .join(', ')}.`;
    } else if (recentPerformance.length > 0) {
      const correct = recentPerformance.filter((p) => p.correct === true).length;
      reason = `Based on your recent performance (${correct}/${recentPerformance.length} correct), we recommend continuing with ${recommendedTopic} at ${recommendedDifficulty} difficulty.`;
    } else {
      reason = `Start with ${recommendedTopic} at ${recommendedDifficulty} difficulty to build your knowledge foundation.`;
    }

    return {
      recommended_topic: recommendedTopic,
      recommended_difficulty: recommendedDifficulty,
      focus_concepts: focusConcepts,
      reason,
    };
  }
}
