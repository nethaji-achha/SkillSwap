from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.all_models import User, Profile, Wallet, UserSubscription, TokenTransaction
from backend.app.schemas.all_schemas import UserSignUp, UserLogin, TokenResponse
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(user_in: UserSignUp, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    
    # Generate clean username handle
    base_username = user_in.username
    if not base_username:
        base_username = user_in.email.split("@")[0].lower()
    base_username = "".join(c for c in base_username if c.isalnum() or c in ("-", "_")).lower()
    
    # Check if username is taken, append suffix if needed
    username_candidate = base_username
    counter = 1
    while db.query(User).filter(User.username == username_candidate).first():
        username_candidate = f"{base_username}{counter}"
        counter += 1

    # Create user
    user = User(
        email=user_in.email.lower(),
        username=username_candidate,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="user"
    )
    db.add(user)
    db.flush()
    
    # Create empty profile
    profile = Profile(
        user_id=user.id,
        username=username_candidate,
        headline="Skill Swap Learner & Teacher",
        bio="",
        location="",
        languages=["English"],
        availability=["Weekday evenings", "Weekends"],
        interests=[],
        experience=[],
        education=[],
        projects=[],
        certifications=[],
        social_links={},
        onboarding_completed=False
    )
    db.add(profile)
    
    # Create wallet with 100 free Skill Swap credits welcome bonus
    wallet = Wallet(
        user_id=user.id,
        available_balance=100,
        pending_balance=0,
        earned_total=100,
        spent_total=0,
        purchased_total=0
    )
    db.add(wallet)
    db.flush()
    
    # Add initial idempotent transaction record for the 100 welcome bonus credits
    welcome_ref = f"welcome_{user.id}"
    existing_welcome_tx = db.query(TokenTransaction).filter(
        TokenTransaction.wallet_id == wallet.id,
        TokenTransaction.reference_id == welcome_ref
    ).first()
    
    if not existing_welcome_tx:
        welcome_tx = TokenTransaction(
            wallet_id=wallet.id,
            type="WELCOME_BONUS",
            amount=100,
            description="100 free Skill Swap credits",
            status="completed",
            reference_id=welcome_ref
        )
        db.add(welcome_tx)
    
    # Create default basic subscription
    sub = UserSubscription(
        user_id=user.id,
        plan_slug="basic",
        status="active"
    )
    db.add(sub)
    
    db.commit()
    db.refresh(user)
    
    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "is_verified": user.is_verified,
            "profile": {
                "username": profile.username,
                "headline": profile.headline,
                "bio": profile.bio,
                "onboarding_completed": profile.onboarding_completed,
                "reputation_score": profile.reputation_score
            }
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated."
        )
    
    token = create_access_token(user.id)
    profile = user.profile
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username or (profile.username if profile else ""),
            "full_name": user.full_name,
            "role": user.role,
            "is_verified": user.is_verified,
            "profile": {
                "username": profile.username if profile else (user.username or ""),
                "headline": profile.headline if profile else "",
                "bio": profile.bio if profile else "",
                "location": profile.location if profile else "",
                "avatar_url": profile.avatar_url if profile else "",
                "onboarding_completed": profile.onboarding_completed if profile else False,
                "reputation_score": profile.reputation_score if profile else 5.0,
                "completed_sessions": profile.completed_sessions if profile else 0,
                "teaching_hours": profile.teaching_hours if profile else 0.0,
                "learning_hours": profile.learning_hours if profile else 0.0,
            }
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    wallet = current_user.wallet
    subscription = current_user.subscription
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username or (profile.username if profile else ""),
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "profile": {
            "id": profile.id if profile else "",
            "username": profile.username if profile else (current_user.username or ""),
            "headline": profile.headline if profile else "",
            "bio": profile.bio if profile else "",
            "location": profile.location if profile else "",
            "avatar_url": profile.avatar_url if profile else "",
            "languages": profile.languages if profile and profile.languages else [],
            "availability": profile.availability if profile and profile.availability else [],
            "interests": profile.interests if profile and profile.interests else [],
            "experience": profile.experience if profile and profile.experience else [],
            "education": profile.education if profile and profile.education else [],
            "projects": profile.projects if profile and profile.projects else [],
            "certifications": profile.certifications if profile and profile.certifications else [],
            "social_links": profile.social_links if profile and profile.social_links else {},
            "portfolio_url": profile.portfolio_url if profile else "",
            "teaching_hours": profile.teaching_hours if profile else 0.0,
            "learning_hours": profile.learning_hours if profile else 0.0,
            "completed_sessions": profile.completed_sessions if profile else 0,
            "reputation_score": profile.reputation_score if profile else 5.0,
            "rating_count": profile.rating_count if profile else 0,
            "onboarding_completed": profile.onboarding_completed if profile else False,
        },
        "wallet": {
            "available_balance": wallet.available_balance if wallet else 0,
            "pending_balance": wallet.pending_balance if wallet else 0,
            "earned_total": wallet.earned_total if wallet else 0,
            "spent_total": wallet.spent_total if wallet else 0,
            "purchased_total": wallet.purchased_total if wallet else 0,
        },
        "subscription": {
            "plan_slug": subscription.plan_slug if subscription else "basic",
            "status": subscription.status if subscription else "active",
            "ai_requests_used": subscription.ai_requests_used if subscription else 0
        }
    }
