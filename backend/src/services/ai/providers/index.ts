import { config } from '../../../config/index';
import { AIProvider } from '../types';
import { MockAIProvider } from './mock';
import { GeminiAIProvider } from './gemini';

let cached: AIProvider | null = null;

/**
 * The active provider.
 *
 * The paid MeshAPI Gemini route is preferred when configured. Direct Google
 * Gemini remains available with AI_PROVIDER=gemini.
 * This is why `/api/status` can honestly report which one is live.
 */
export const getProvider = (): AIProvider => {
  if (cached) return cached;

  if (
    (config.ai.provider === 'mesh' && config.ai.meshApiKey) ||
    (config.ai.provider === 'gemini' && config.ai.geminiApiKey)
  ) {
    cached = new GeminiAIProvider();
  } else {
    cached = new MockAIProvider();
  }

  return cached;
};

/** Why the active provider is not the one configured, if applicable. */
export const getProviderDetail = (): string | undefined => {
  if (config.ai.provider === 'mesh' && !config.ai.meshApiKey) {
    return 'AI_PROVIDER=mesh but MESH_API_KEY is missing; falling back to the local question bank';
  }
  if (config.ai.provider === 'gemini' && !config.ai.geminiApiKey) {
    return 'AI_PROVIDER=gemini but GEMINI_API_KEY is missing; falling back to the local question bank';
  }
  return undefined;
};

export { MockAIProvider, GeminiAIProvider };
