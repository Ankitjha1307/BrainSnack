from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Question(BaseModel):
    question: str = Field(..., min_length=5)
    options: List[str] = Field(..., min_length=2, max_length=6)
    correctAnswer: int = Field(..., ge=0, le=5)
    explanation: str
    concept: str
    difficulty: Difficulty


class QuizRequest(BaseModel):
    topic: str
    question_count: int = Field(default=5, ge=1, le=20)
    difficulty: Difficulty = Difficulty.MEDIUM
    weak_concepts: List[str] = []
    recent_mistakes: List[str] = []
    user_performance: Optional[dict] = None


class QuizResponse(BaseModel):
    quiz: dict


class QuestionValidationRequest(BaseModel):
    # Same relaxed bounds as `Question`, so validation can actually report *why*
    # a generated question is bad instead of rejecting it with a 422 before the
    # validator runs.
    question: str = Field(..., min_length=1)
    options: List[str] = Field(..., min_length=1)
    correctAnswer: int = Field(..., ge=-1, le=10)
    explanation: str = ""
    concept: str = ""
    difficulty: Difficulty = Difficulty.MEDIUM


class QuestionValidationResponse(BaseModel):
    is_valid: bool
    score: float = Field(..., ge=0, le=1)
    feedback: str
    issues: List[str] = []


class AdaptiveRecommendationRequest(BaseModel):
    # A BrainSnack user id is a UUID, not an int - the backend passes it straight
    # through, so typing this as `int` made every recommendation request a 422.
    user_id: str
    recent_performance: List[dict] = []
    topic_mastery: dict = {}
    weak_concepts: List[str] = []
    current_difficulty: Difficulty = Difficulty.MEDIUM


class AdaptiveRecommendationResponse(BaseModel):
    recommended_topic: str
    recommended_difficulty: Difficulty
    focus_concepts: List[str]
    reason: str
