from fastapi import APIRouter, Depends
from app.models.schemas import QuestionValidationRequest, QuestionValidationResponse
from app.providers.base import AIProvider
from app.dependencies import get_ai_provider

router = APIRouter(prefix="/validate-question", tags=["validation"])


@router.post("", response_model=QuestionValidationResponse)
async def validate_question(
    request: QuestionValidationRequest,
    provider: AIProvider = Depends(get_ai_provider),
):
    """Validate a question for quality, correctness, and appropriateness."""
    return await provider.validate_question(request)
