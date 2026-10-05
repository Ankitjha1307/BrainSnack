from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.dependencies import active_provider_name, get_ai_provider
from app.routers import quiz, validation, adaptive

app = FastAPI(
    title="BrainSnack AI Service",
    description="AI-powered quiz generation and adaptive learning service",
    version="1.0.0",
)

# Only the Node backend calls this service, server-side, with no Origin header.
# Locking CORS to the API origin avoids the `allow_origins=["*"]` +
# `allow_credentials=True` combination, which browsers reject anyway.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(quiz.router)
app.include_router(validation.router)
app.include_router(adaptive.router)


@app.get("/health")
async def health_check():
    """Health check.

    Reports the active provider and whether the service is actually able to
    serve: Gemini without an API key reads as degraded, not healthy.
    """
    get_ai_provider()  # force resolution so startup errors surface here
    gemini_without_key = settings.AI_PROVIDER == "gemini" and not settings.GEMINI_API_KEY

    return {
        "status": "degraded" if gemini_without_key else "healthy",
        "provider": active_provider_name(),
        "provider_detail": (
            "GEMINI_API_KEY is not set - serving from the local question bank"
            if gemini_without_key
            else None
        ),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
