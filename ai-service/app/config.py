import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock").lower()
    # The Node API is the only expected caller.
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    @property
    def AI_PROVIDER_NAME(self) -> str:
        if self.AI_PROVIDER == "gemini":
            return "gemini" if self.GEMINI_API_KEY else "gemini (no API key - using local bank)"
        return "mock"


settings = Settings()
