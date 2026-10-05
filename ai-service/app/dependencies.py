from app.config import settings
from app.providers.base import AIProvider
from app.providers.gemini import GeminiAIProvider
from app.providers.mock import MockAIProvider

# Provider resolution lives here rather than in `app.main`: the routers import it
# through `Depends`, and importing it from `main` made the import graph circular,
# so the service crashed on startup with
# "cannot import name 'get_ai_provider' from partially initialized module".
_provider: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _provider
    if _provider is None:
        if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            _provider = GeminiAIProvider()
        else:
            # No key, or AI_PROVIDER=mock: the local question bank is a complete,
            # deterministic fallback rather than a degraded mode.
            _provider = MockAIProvider()
    return _provider


def active_provider_name() -> str:
    return settings.AI_PROVIDER_NAME
