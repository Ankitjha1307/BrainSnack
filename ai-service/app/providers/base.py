from abc import ABC, abstractmethod
from typing import List, Optional
from app.models.schemas import (
    QuizRequest,
    QuizResponse,
    QuestionValidationRequest,
    QuestionValidationResponse,
    AdaptiveRecommendationRequest,
    AdaptiveRecommendationResponse,
)


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def generate_quiz(self, request: QuizRequest) -> QuizResponse:
        """Generate a quiz based on the request parameters."""
        pass

    @abstractmethod
    async def validate_question(
        self, request: QuestionValidationRequest
    ) -> QuestionValidationResponse:
        """Validate a question for quality, correctness, and appropriateness."""
        pass

    @abstractmethod
    async def get_adaptive_recommendation(
        self, request: AdaptiveRecommendationRequest
    ) -> AdaptiveRecommendationResponse:
        """Get adaptive learning recommendations based on user performance."""
        pass
