import { config } from '../../../config/index';
import { AIProvider } from '../types';
import { MockAIProvider } from './mock';
import { GeminiAIProvider } from './gemini';

let cached: AIProvider | null = null;

/**
 * The active provider.
 *
 * Gemini is only used when it is both selected via `AI_PROVIDER=gemini` and
 * given a key; otherwise the mock (local question bank) provider is returned.
 * This is why `/api/status` can honestly report which one is live.
 */
export const getProvider = (): AIProvider => {
  if (cached) return cached;

  if (config.ai.provider === 'gemini' && config.ai.geminiApiKey) {
    cached = new GeminiAIProvider();
  } else {
    cached = new MockAIProvider();
  }

  return cached;
};

/** Why the active provider is not the one configured, if applicable. */
export const getProviderDetail = (): string | undefined => {
  if (config.ai.provider === 'gemini' && !config.ai.geminiApiKey) {
    return 'AI_PROVIDER=gemini but GEMINI_API_KEY is missing; falling back to the local question bank';
  }
  return undefined;
};

export { MockAIProvider, GeminiAIProvider };
