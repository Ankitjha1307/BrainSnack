from fastapi import APIRouter, Depends
from app.models.schemas import QuizRequest, QuizResponse
from app.providers.base import AIProvider
from app.dependencies import get_ai_provider

router = APIRouter(prefix="/generate-quiz", tags=["quiz"])


@router.post("", response_model=QuizResponse)
async def generate_quiz(
    request: QuizRequest,
    provider: AIProvider = Depends(get_ai_provider),
):
    """Generate a quiz based on user performance and preferences."""
    return await provider.generate_quiz(request)
