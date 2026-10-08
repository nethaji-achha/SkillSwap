import os
import uuid
import shutil
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.all_models import User, Profile, UserSkill, Achievement
from backend.app.schemas.all_schemas import UserProfileUpdate
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

def get_upload_dir() -> str:
    base = "/tmp" if (os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")) else os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    upload_path = os.path.join(base, "uploads", "avatars")
    try:
        os.makedirs(upload_path, exist_ok=True)
    except Exception:
        pass
    return upload_path

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image (PNG, JPG, JPEG, WEBP)."
        )
    
    # Generate unique filename
    ext = os.path.splitext(file.filename or "")[1]
    if not ext:
        ext = ".jpg"
    unique_filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    upload_dir = get_upload_dir()
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"/uploads/avatars/{unique_filename}"

    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    profile.avatar_url = avatar_url
    db.commit()
    db.refresh(profile)

    return {
        "message": "Avatar uploaded successfully",
        "avatar_url": avatar_url
    }

@router.get("/community")
def get_community_users(
    search: Optional[str] = None,
    category: Optional[str] = None,
    experience_level: Optional[str] = None,
    availability: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.is_active == True)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.join(Profile).outerjoin(UserSkill).filter(
            (User.full_name.ilike(search_term)) |
            (User.username.ilike(search_term)) |
            (Profile.headline.ilike(search_term)) |
            (Profile.bio.ilike(search_term)) |
            (UserSkill.skill_name.ilike(search_term))
        ).distinct()
    
    users = query.offset(skip).limit(limit).all()
    
    results = []
    for u in users:
        p = u.profile
        skills_teach = db.query(UserSkill).filter(UserSkill.user_id == u.id, UserSkill.skill_type == "teach").all()
        skills_learn = db.query(UserSkill).filter(UserSkill.user_id == u.id, UserSkill.skill_type == "learn").all()
        achievements = db.query(Achievement).filter(Achievement.user_id == u.id).all()
        achieve_map = {a.skill_name.lower(): a.badge_level for a in achievements}
        
        # Apply filters in Python or SQL
        if category and category != "all":
            has_cat = any(s.category.lower() == category.lower() for s in skills_teach + skills_learn)
            if not has_cat:
                continue
                
        if experience_level and experience_level != "all":
            has_lvl = any(s.experience_level.lower() == experience_level.lower() for s in skills_teach)
            if not has_lvl:
                continue
                
        if availability and availability != "all":
            if p and availability not in (p.availability or []):
                continue
        
        results.append({
            "id": u.id,
            "username": u.username or (p.username if p else ""),
            "full_name": u.full_name,
            "is_verified": u.is_verified,
            "created_at": u.created_at,
            "profile": {
                "username": p.username if p else (u.username or ""),
                "headline": p.headline if p else "",
                "bio": p.bio if p else "",
                "location": p.location if p else "",
                "avatar_url": p.avatar_url if p else "",
                "languages": p.languages if p and p.languages else [],
                "availability": p.availability if p and p.availability else [],
                "interests": p.interests if p and p.interests else [],
                "experience": p.experience if p and p.experience else [],
                "education": p.education if p and p.education else [],
                "projects": p.projects if p and p.projects else [],
                "certifications": p.certifications if p and p.certifications else [],
                "social_links": p.social_links if p and p.social_links else {},
                "portfolio_url": p.portfolio_url if p else "",
                "teaching_hours": p.teaching_hours if p else 0.0,
                "learning_hours": p.learning_hours if p else 0.0,
                "completed_sessions": p.completed_sessions if p else 0,
                "reputation_score": p.reputation_score if p else 5.0,
                "rating_count": p.rating_count if p else 0,
            },
            "achievements": [
                {
                    "skill_name": a.skill_name,
                    "badge_level": a.badge_level,
                    "latest_score": a.latest_score,
                    "awarded_at": a.awarded_at
                }
                for a in achievements
            ],
            "skills_teaching": [
                {
                    "id": s.id,
                    "skill_name": s.skill_name,
                    "category": s.category,
                    "experience_level": s.experience_level,
                    "years_experience": s.years_experience,
                    "session_price": s.session_price,
                    "description": s.description,
                    "is_published": s.is_published,
                    "badge": achieve_map.get(s.skill_name.lower())
                } for s in skills_teach
            ],
            "skills_learning": [
                {
                    "id": s.id,
                    "skill_name": s.skill_name,
                    "category": s.category,
                    "current_level": s.current_level,
                    "target_level": s.target_level,
                    "learning_goal": s.learning_goal,
                    "priority": s.priority,
                    "badge": achieve_map.get(s.skill_name.lower())
                } for s in skills_learn
            ]
        })
        
    return results

@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _format_user_profile_response(current_user, db)

@router.get("/by-username/{username}")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    clean_username = username.lstrip("@").lower()
    user = db.query(User).filter(User.username.ilike(clean_username), User.is_active == True).first()
    if not user:
        # Check profile username
        profile = db.query(Profile).filter(Profile.username.ilike(clean_username)).first()
        if profile:
            user = profile.user
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found with this username")
    return _format_user_profile_response(user, db)

@router.get("/{user_id_or_username}")
def get_user_profile(user_id_or_username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id_or_username, User.is_active == True).first()
    if not user:
        # Check by username
        clean_user = user_id_or_username.lstrip("@").lower()
        user = db.query(User).filter(User.username.ilike(clean_user), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return _format_user_profile_response(user, db)

def _format_user_profile_response(user: User, db: Session):
    p = user.profile
    skills_teach = db.query(UserSkill).filter(UserSkill.user_id == user.id, UserSkill.skill_type == "teach").all()
    skills_learn = db.query(UserSkill).filter(UserSkill.user_id == user.id, UserSkill.skill_type == "learn").all()
    achievements = db.query(Achievement).filter(Achievement.user_id == user.id).order_by(Achievement.awarded_at.desc()).all()
    achieve_map = {a.skill_name.lower(): a.badge_level for a in achievements}

    return {
        "id": user.id,
        "username": user.username or (p.username if p else ""),
        "full_name": user.full_name,
        "is_verified": user.is_verified,
        "created_at": user.created_at,
        "profile": {
            "username": p.username if p else (user.username or ""),
            "headline": p.headline if p else "",
            "bio": p.bio if p else "",
            "location": p.location if p else "",
            "avatar_url": p.avatar_url if p else "",
            "languages": p.languages if p and p.languages else [],
            "availability": p.availability if p and p.availability else [],
            "interests": p.interests if p and p.interests else [],
            "experience": p.experience if p and p.experience else [],
            "education": p.education if p and p.education else [],
            "projects": p.projects if p and p.projects else [],
            "certifications": p.certifications if p and p.certifications else [],
            "social_links": p.social_links if p and p.social_links else {},
            "portfolio_url": p.portfolio_url if p else "",
            "teaching_hours": p.teaching_hours if p else 0.0,
            "learning_hours": p.learning_hours if p else 0.0,
            "completed_sessions": p.completed_sessions if p else 0,
            "reputation_score": p.reputation_score if p else 5.0,
            "rating_count": p.rating_count if p else 0,
            "onboarding_completed": p.onboarding_completed if p else False,
        },
        "achievements": [
            {
                "id": a.id,
                "skill_name": a.skill_name,
                "badge_level": a.badge_level,
                "latest_score": a.latest_score,
                "assessment_status": a.assessment_status,
                "awarded_at": a.awarded_at
            }
            for a in achievements
        ],
        "skills_teaching": [
            {
                "id": s.id,
                "skill_name": s.skill_name,
                "category": s.category,
                "experience_level": s.experience_level,
                "years_experience": s.years_experience,
                "session_price": s.session_price,
                "description": s.description,
                "is_published": s.is_published,
                "badge": achieve_map.get(s.skill_name.lower())
            } for s in skills_teach
        ],
        "skills_learning": [
            {
                "id": s.id,
                "skill_name": s.skill_name,
                "category": s.category,
                "current_level": s.current_level,
                "target_level": s.target_level,
                "learning_goal": s.learning_goal,
                "priority": s.priority,
                "badge": achieve_map.get(s.skill_name.lower())
            } for s in skills_learn
        ]
    }

@router.put("/profile/me")
def update_my_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    update_data = profile_in.model_dump(exclude_unset=True)
    
    # Handle user level fields if passed
    if "full_name" in update_data and update_data["full_name"]:
        current_user.full_name = update_data["full_name"]
    
    if "username" in update_data and update_data["username"]:
        cleaned_username = update_data["username"].lstrip("@").lower().strip()
        # Check uniqueness if changed
        if cleaned_username != (current_user.username or ""):
            existing = db.query(User).filter(User.username == cleaned_username, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken.")
            current_user.username = cleaned_username
            profile.username = cleaned_username

    for field, value in update_data.items():
        if field not in ("full_name", "username") and hasattr(profile, field):
            setattr(profile, field, value)
        
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)
    
    return {
        "id": profile.id,
        "full_name": current_user.full_name,
        "username": current_user.username or profile.username,
        "headline": profile.headline,
        "bio": profile.bio,
        "location": profile.location,
        "avatar_url": profile.avatar_url,
        "languages": profile.languages,
        "availability": profile.availability,
        "interests": profile.interests,
        "experience": profile.experience,
        "education": profile.education,
        "projects": profile.projects,
        "certifications": profile.certifications,
        "social_links": profile.social_links,
        "portfolio_url": profile.portfolio_url,
        "onboarding_completed": profile.onboarding_completed
    }
