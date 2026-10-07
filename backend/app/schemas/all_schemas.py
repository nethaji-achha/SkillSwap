from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==================== AUTH & USER ====================
class UserSignUp(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class ExperienceItem(BaseModel):
    title: str = ""
    company: str = ""
    period: str = ""
    description: str = ""

class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""

class ProjectItem(BaseModel):
    title: str = ""
    description: str = ""
    link: Optional[str] = ""

class CertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    year: str = ""

class SocialLinks(BaseModel):
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    portfolio: Optional[str] = ""
    website: Optional[str] = ""

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    languages: Optional[List[str]] = None
    availability: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    social_links: Optional[Dict[str, Any]] = None
    portfolio_url: Optional[str] = None
    onboarding_completed: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    username: Optional[str] = ""
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    profile: Optional[Dict[str, Any]] = None

# ==================== SKILLS ====================
class UserSkillCreate(BaseModel):
    skill_name: Optional[str] = None
    category: Optional[str] = "General"
    skill_type: Optional[str] = None  # 'teach' or 'learn'
    
    # Teach fields
    experience_level: Optional[str] = "Intermediate"
    years_experience: Optional[float] = 1.0
    description: Optional[str] = ""
    session_price: Optional[int] = 10
    is_published: Optional[bool] = True
    
    # Learn fields
    current_level: Optional[str] = "Beginner"
    target_level: Optional[str] = "Advanced"
    learning_goal: Optional[str] = ""
    priority: Optional[str] = "Medium"

    @model_validator(mode="before")
    @classmethod
    def normalize_input(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "name" in data and "skill_name" not in data:
                data["skill_name"] = data["name"]
            if "type" in data and "skill_type" not in data:
                data["skill_type"] = data["type"]
            if "level" in data:
                if data.get("skill_type") == "learn":
                    data["current_level"] = data["level"]
                else:
                    data["experience_level"] = data["level"]
            if "years_of_experience" in data and "years_experience" not in data:
                data["years_experience"] = float(data["years_of_experience"])
        return data

class UserSkillUpdate(BaseModel):
    experience_level: Optional[str] = None
    years_experience: Optional[float] = None
    description: Optional[str] = None
    session_price: Optional[int] = None
    is_published: Optional[bool] = None
    current_level: Optional[str] = None
    target_level: Optional[str] = None
    learning_goal: Optional[str] = None
    priority: Optional[str] = None

# ==================== WALLET & TOKENS ====================
class WalletResponse(BaseModel):
    available_balance: int
    pending_balance: int
    earned_total: int
    spent_total: int
    purchased_total: int
    updated_at: datetime

class TokenTransactionResponse(BaseModel):
    id: str
    type: str
    amount: int
    description: str
    status: str
    reference_id: Optional[str] = ""
    created_at: datetime

# ==================== PAYMENTS ====================
class RazorpayOrderCreate(BaseModel):
    package_id: Optional[str] = None
    subscription_plan_id: Optional[str] = None
    purpose: str = "token_purchase"  # 'token_purchase' or 'subscription'

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PaymentResponse(BaseModel):
    id: str
    razorpay_order_id: str
    razorpay_payment_id: Optional[str]
    amount_inr: int
    currency: str
    purpose: str
    tokens_credited: int
    status: str
    created_at: datetime

# ==================== SESSIONS ====================
class SessionCreate(BaseModel):
    teacher_id: str
    skill_name: str
    scheduled_at: datetime
    duration_minutes: int = 60
    token_price: int
    objective: Optional[str] = ""

class SessionUpdate(BaseModel):
    status: Optional[str] = None
    meeting_link: Optional[str] = None

class ReviewCreate(BaseModel):
    session_id: str
    overall_rating: float = Field(..., ge=1.0, le=5.0)
    knowledge: int = Field(5, ge=1, le=5)
    communication: int = Field(5, ge=1, le=5)
    reliability: int = Field(5, ge=1, le=5)
    teaching: int = Field(5, ge=1, le=5)
    professionalism: int = Field(5, ge=1, le=5)
    comment: Optional[str] = ""

# ==================== MESSAGING ====================
class MessageCreate(BaseModel):
    receiver_id: str
    content: str
    conversation_id: Optional[str] = None

# ==================== AI ASSISTANT ====================
class AIRoadmapRequest(BaseModel):
    skill_to_learn: Optional[str] = None
    current_level: Optional[str] = "Beginner"
    target_goal: Optional[str] = "Master core concepts"
    duration_days: Optional[int] = 30

    @model_validator(mode="before")
    @classmethod
    def normalize_roadmap_input(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "target_skill" in data and "skill_to_learn" not in data:
                data["skill_to_learn"] = data["target_skill"]
            elif "skill" in data and "skill_to_learn" not in data:
                data["skill_to_learn"] = data["skill"]
            elif "topic" in data and "skill_to_learn" not in data:
                data["skill_to_learn"] = data["topic"]
            if not data.get("skill_to_learn"):
                data["skill_to_learn"] = "Full Stack Development"
        return data

class AIPricingRequest(BaseModel):
    skill_name: str
    experience_level: str
    years_experience: float
    description: Optional[str] = ""

# ==================== SUMMARIES, ACHIEVEMENTS & ASSESSMENTS ====================
class SessionSummaryResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    skill_name: str
    title: str
    teacher_name: str
    learner_name: str
    duration_minutes: int
    session_date: datetime
    learning_objective: str
    key_concepts: List[str] = []
    important_points: List[str] = []
    practical_tips: List[str] = []
    questions_discussed: List[str] = []
    main_takeaways: List[str] = []
    suggested_revision_points: List[str] = []
    suggested_next_steps: List[str] = []
    raw_summary: Optional[str] = ""
    created_at: datetime

class AchievementResponse(BaseModel):
    id: str
    user_id: str
    skill_name: str
    badge_level: str
    source_session_id: Optional[str] = None
    latest_score: Optional[float] = None
    assessment_status: str
    awarded_at: datetime
    updated_at: Optional[datetime] = None

class AssessmentQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_idx: Optional[int] = None
    explanation: Optional[str] = ""

class SkillAssessmentResponse(BaseModel):
    id: str
    user_id: str
    session_id: Optional[str] = None
    skill_name: str
    topic: str
    status: str
    available_at: datetime
    is_available: bool = False
    questions: List[Dict[str, Any]] = []
    submitted_answers: Optional[Dict[str, Any]] = None
    score: float = 0.0
    percentage: float = 0.0
    badge_awarded: Optional[str] = None
    feedback: Optional[str] = ""
    created_at: datetime
    completed_at: Optional[datetime] = None

class AssessmentSubmitRequest(BaseModel):
    answers: Dict[str, int]

