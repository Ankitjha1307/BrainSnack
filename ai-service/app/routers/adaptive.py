from fastapi import APIRouter, Depends
from app.models.schemas import AdaptiveRecommendationRequest, AdaptiveRecommendationResponse
from app.providers.base import AIProvider
from app.dependencies import get_ai_provider

router = APIRouter(prefix="/adaptive-recommendation", tags=["adaptive"])


@router.post("", response_model=AdaptiveRecommendationResponse)
async def adaptive_recommendation(
    request: AdaptiveRecommendationRequest,
    provider: AIProvider = Depends(get_ai_provider),
):
    """Recommend what the user should learn next based on their performance history."""
    return await provider.get_adaptive_recommendation(request)
