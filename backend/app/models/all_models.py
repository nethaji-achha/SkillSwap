import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user")  # 'user', 'admin', 'moderator'
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("UserSubscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    ai_usage = relationship("AIUsage", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    username = Column(String(100), default="")
    headline = Column(String(255), default="")
    bio = Column(Text, default="")
    location = Column(String(255), default="")
    avatar_url = Column(String(500), default="")
    languages = Column(JSON, default=list)  # ["English", "Hindi"]
    availability = Column(JSON, default=list)  # ["Weekday evenings", "Weekends"]
    interests = Column(JSON, default=list)  # ["AI", "Open Source", "Design Systems"]
    experience = Column(JSON, default=list)  # [{"title": "Senior Engineer", "company": "Acme", "period": "2021 - Present", "description": "..."}]
    education = Column(JSON, default=list)  # [{"degree": "B.S. Computer Science", "institution": "Tech University", "year": "2020"}]
    projects = Column(JSON, default=list)  # [{"title": "OpenDev", "description": "...", "link": "https://..."}]
    certifications = Column(JSON, default=list)  # [{"name": "AWS Certified", "issuer": "Amazon", "year": "2023"}]
    social_links = Column(JSON, default=dict)  # {"github": "...", "linkedin": "...", "portfolio": "...", "website": "..."}
    portfolio_url = Column(String(500), default="")
    teaching_hours = Column(Float, default=0.0)
    learning_hours = Column(Float, default=0.0)
    completed_sessions = Column(Integer, default=0)
    reputation_score = Column(Float, default=5.0)
    rating_count = Column(Integer, default=0)
    onboarding_completed = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="profile")


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), default="")
    icon = Column(String(50), default="BookOpen")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    skills = relationship("Skill", back_populates="category")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), index=True, nullable=False)
    category_id = Column(String(36), ForeignKey("skill_categories.id"), nullable=True)
    description = Column(Text, default="")
    is_verified = Column(Boolean, default=True)

    category = relationship("SkillCategory", back_populates="skills")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    category = Column(String(100), default="General")
    skill_type = Column(String(20), nullable=False)  # 'teach' or 'learn'
    
    # Teach fields
    experience_level = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced, Expert
    years_experience = Column(Float, default=1.0)
    description = Column(Text, default="")
    session_price = Column(Integer, default=10)  # in tokens (🪙)
    is_published = Column(Boolean, default=True)
    
    # Learn fields
    current_level = Column(String(50), default="Beginner")
    target_level = Column(String(50), default="Advanced")
    learning_goal = Column(Text, default="")
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="skills")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    available_balance = Column(Integer, default=15)  # 15 starter tokens
    pending_balance = Column(Integer, default=0)    # Held in escrow
    earned_total = Column(Integer, default=0)
    spent_total = Column(Integer, default=0)
    purchased_total = Column(Integer, default=0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="wallet")
    transactions = relationship("TokenTransaction", back_populates="wallet", cascade="all, delete-orphan")
    holds = relationship("TokenHold", back_populates="wallet", cascade="all, delete-orphan")


class TokenTransaction(Base):
    __tablename__ = "token_transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wallet_id = Column(String(36), ForeignKey("wallets.id"), nullable=False)
    type = Column(String(50), nullable=False)  # 'earned', 'spent', 'purchased', 'pending', 'refunded'
    amount = Column(Integer, nullable=False)
    description = Column(String(255), nullable=False)
    status = Column(String(50), default="completed")  # 'completed', 'pending', 'cancelled', 'refunded'
    reference_id = Column(String(100), default="")  # e.g., session_id or payment_id
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    wallet = relationship("Wallet", back_populates="transactions")


class TokenHold(Base):
    __tablename__ = "token_holds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wallet_id = Column(String(36), ForeignKey("wallets.id"), nullable=False)
    session_id = Column(String(36), nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(String(50), default="held")  # 'held', 'released', 'refunded'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    released_at = Column(DateTime, nullable=True)

    wallet = relationship("Wallet", back_populates="holds")


class TokenPackage(Base):
    __tablename__ = "token_packages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    tokens = Column(Integer, nullable=False)
    price_inr = Column(Integer, nullable=False)  # in INR (₹)
    is_popular = Column(Boolean, default=False)
    badge = Column(String(50), default="")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    razorpay_order_id = Column(String(100), unique=True, nullable=False)
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    amount_inr = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR")
    purpose = Column(String(50), default="token_purchase")  # 'token_purchase', 'subscription'
    tokens_credited = Column(Integer, default=0)
    package_id = Column(String(36), nullable=True)
    subscription_plan_id = Column(String(36), nullable=True)
    status = Column(String(50), default="created")  # 'created', 'pending', 'success', 'failed', 'refunded'
    error_message = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    price_inr = Column(Integer, nullable=False)  # e.g., 0, 399, 1999, 10699
    tokens_per_month = Column(Integer, default=0)
    ai_requests_per_month = Column(Integer, default=10)
    features = Column(JSON, default=list)
    is_popular = Column(Boolean, default=False)


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    plan_slug = Column(String(50), default="basic")
    status = Column(String(50), default="active")  # 'active', 'past_due', 'cancelled'
    current_period_start = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    current_period_end = Column(DateTime, nullable=True)
    ai_requests_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="subscription")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    learner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    token_price = Column(Integer, nullable=False)
    objective = Column(Text, default="")
    status = Column(String(50), default="scheduled")  # 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed'
    meeting_link = Column(String(500), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id"), unique=True, nullable=False)
    teacher_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    overall_rating = Column(Float, nullable=False)
    knowledge = Column(Integer, default=5)
    communication = Column(Integer, default=5)
    reliability = Column(Integer, default=5)
    teaching = Column(Integer, default=5)
    professionalism = Column(Integer, default=5)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(100), index=True, nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # 'match', 'session', 'wallet', 'message', 'system'
    is_read = Column(Boolean, default=False)
    link = Column(String(255), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")


class AIUsage(Base):
    __tablename__ = "ai_usage"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    feature_type = Column(String(50), nullable=False)  # 'roadmap', 'mentor', 'matching', 'pricing'
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="ai_usage")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_id = Column(String(36), nullable=False)
    target_type = Column(String(50), nullable=False)  # 'user', 'session', 'message'
    reason = Column(String(255), nullable=False)
    details = Column(Text, default="")
    status = Column(String(50), default="open")  # 'open', 'resolved', 'dismissed'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class SessionSummary(Base):
    __tablename__ = "session_summaries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    title = Column(String(255), default="")
    teacher_name = Column(String(255), default="")
    learner_name = Column(String(255), default="")
    duration_minutes = Column(Integer, default=60)
    session_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    learning_objective = Column(Text, default="")
    key_concepts = Column(JSON, default=list)
    important_points = Column(JSON, default=list)
    practical_tips = Column(JSON, default=list)
    questions_discussed = Column(JSON, default=list)
    main_takeaways = Column(JSON, default=list)
    suggested_revision_points = Column(JSON, default=list)
    suggested_next_steps = Column(JSON, default=list)
    raw_summary = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    badge_level = Column(String(20), default="BRONZE")  # 'BRONZE', 'SILVER', 'GOLD'
    source_session_id = Column(String(36), nullable=True)
    latest_score = Column(Float, nullable=True)
    assessment_status = Column(String(50), default="scheduled")  # 'scheduled', 'available', 'completed'
    awarded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    session_id = Column(String(36), nullable=True)
    skill_name = Column(String(100), nullable=False)
    topic = Column(String(255), default="")
    status = Column(String(50), default="scheduled")  # 'scheduled', 'available', 'completed'
    available_at = Column(DateTime, nullable=False)
    questions = Column(JSON, default=list)  # list of question objects with id, question, options, correct_idx, explanation
    submitted_answers = Column(JSON, default=dict)  # { "q_0": 1, "q_1": 2 }
    score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    badge_awarded = Column(String(20), nullable=True)  # 'BRONZE', 'SILVER', 'GOLD'
    feedback = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

