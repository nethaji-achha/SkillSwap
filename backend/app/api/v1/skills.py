from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.all_models import (
    User, SkillCategory, UserSkill, Achievement, SkillAssessment, Notification
)
from backend.app.schemas.all_schemas import (
    UserSkillCreate, UserSkillUpdate, AssessmentSubmitRequest
)
from backend.app.api.v1.deps import get_current_user
from backend.app.services.learning_service import evaluate_badge_level, is_badge_upgrade

router = APIRouter(prefix="/skills", tags=["Skills, Badges & Assessments"])

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    try:
        categories = db.query(SkillCategory).all()
        if not categories:
            from backend.app.db.init_db import init_db
            init_db(db)
            categories = db.query(SkillCategory).all()

        if categories:
            return [
                {
                    "id": c.id,
                    "name": c.name,
                    "slug": c.slug,
                    "description": c.description,
                    "icon": c.icon
                } for c in categories
            ]
    except Exception:
        pass

    # Safe fallback default categories
    return [
        {"id": "cat-1", "name": "Programming", "slug": "programming", "description": "Software architecture, backend, mobile & algorithms", "icon": "Code"},
        {"id": "cat-2", "name": "Web Development", "slug": "web-dev", "description": "Frontend, full-stack, Next.js, React, Node.js", "icon": "Globe"},
        {"id": "cat-3", "name": "AI & Machine Learning", "slug": "ai-ml", "description": "LLMs, PyTorch, prompt engineering, data science", "icon": "Cpu"},
        {"id": "cat-4", "name": "UI/UX & Product Design", "slug": "ui-ux", "description": "Figma, user research, wireframing, design systems", "icon": "Layers"},
        {"id": "cat-5", "name": "Marketing & Growth", "slug": "marketing", "description": "SEO, performance marketing, content strategy, copy", "icon": "TrendingUp"},
        {"id": "cat-6", "name": "Business & Strategy", "slug": "business", "description": "Product management, startups, pitch decks, finance", "icon": "Briefcase"},
        {"id": "cat-7", "name": "Photography & Video", "slug": "media", "description": "Editing, DaVinci Resolve, lighting, cinematography", "icon": "Video"},
        {"id": "cat-8", "name": "Languages", "slug": "languages", "description": "English, Spanish, French, German, Japanese, Mandarin", "icon": "Languages"},
        {"id": "cat-9", "name": "Music & Audio", "slug": "music", "description": "Production, guitar, piano, mixing & mastering", "icon": "Music"},
        {"id": "cat-10", "name": "Career Development", "slug": "career", "description": "Resume reviews, interview prep, leadership coaching", "icon": "Award"}
    ]

@router.get("/my-skills")
@router.get("/me")
@router.get("/me/skills")
def get_my_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skills_teach = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_type == "teach").all()
    skills_learn = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_type == "learn").all()
    
    # Also fetch user achievements mapped by skill_name lower
    achievements = db.query(Achievement).filter(Achievement.user_id == current_user.id).all()
    achieve_map = {a.skill_name.lower(): a for a in achievements}

    return {
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
                "badge": achieve_map.get(s.skill_name.lower()).badge_level if achieve_map.get(s.skill_name.lower()) else None
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
                "badge": achieve_map.get(s.skill_name.lower()).badge_level if achieve_map.get(s.skill_name.lower()) else None,
                "assessment_status": achieve_map.get(s.skill_name.lower()).assessment_status if achieve_map.get(s.skill_name.lower()) else "none",
                "latest_score": achieve_map.get(s.skill_name.lower()).latest_score if achieve_map.get(s.skill_name.lower()) else None
            } for s in skills_learn
        ]
    }

@router.post("")
@router.post("/add")
@router.post("/me/skills")
def add_user_skill(
    skill_in: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = UserSkill(
        user_id=current_user.id,
        skill_name=skill_in.skill_name,
        category=skill_in.category,
        skill_type=skill_in.skill_type,
        experience_level=skill_in.experience_level,
        years_experience=skill_in.years_experience,
        description=skill_in.description,
        session_price=skill_in.session_price,
        is_published=skill_in.is_published,
        current_level=skill_in.current_level,
        target_level=skill_in.target_level,
        learning_goal=skill_in.learning_goal,
        priority=skill_in.priority
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return {
        "id": skill.id,
        "skill_name": skill.skill_name,
        "category": skill.category,
        "skill_type": skill.skill_type,
        "experience_level": skill.experience_level,
        "years_experience": skill.years_experience,
        "session_price": skill.session_price,
        "description": skill.description,
        "is_published": skill.is_published,
        "current_level": skill.current_level,
        "target_level": skill.target_level,
        "learning_goal": skill.learning_goal,
        "priority": skill.priority
    }

@router.put("/{skill_id}")
def update_user_skill(
    skill_id: str,
    skill_in: UserSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
        
    update_data = skill_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)
        
    db.commit()
    db.refresh(skill)
    return {"message": "Skill updated successfully", "id": skill.id}

@router.delete("/{skill_id}")
def delete_user_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
        
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted successfully"}

# ==================== ACHIEVEMENTS (BRONZE, SILVER, GOLD) ====================

@router.get("/achievements/my")
def get_my_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    achievements = db.query(Achievement).filter(
        Achievement.user_id == current_user.id
    ).order_by(Achievement.awarded_at.desc()).all()

    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "skill_name": a.skill_name,
            "badge_level": a.badge_level,
            "source_session_id": a.source_session_id,
            "latest_score": a.latest_score,
            "assessment_status": a.assessment_status,
            "awarded_at": a.awarded_at,
            "updated_at": a.updated_at
        }
        for a in achievements
    ]

@router.get("/achievements/user/{user_id}")
def get_user_achievements(
    user_id: str,
    db: Session = Depends(get_db)
):
    achievements = db.query(Achievement).filter(
        Achievement.user_id == user_id
    ).order_by(Achievement.awarded_at.desc()).all()

    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "skill_name": a.skill_name,
            "badge_level": a.badge_level,
            "latest_score": a.latest_score,
            "assessment_status": a.assessment_status,
            "awarded_at": a.awarded_at
        }
        for a in achievements
    ]

# ==================== SKILL ASSESSMENTS ====================

@router.get("/assessments/my")
def get_my_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now_utc = datetime.now(timezone.utc)
    assessments = db.query(SkillAssessment).filter(
        SkillAssessment.user_id == current_user.id
    ).order_by(SkillAssessment.created_at.desc()).all()

    results = []
    for a in assessments:
        is_available = a.status == "completed" or (a.available_at and a.available_at.replace(tzinfo=timezone.utc if a.available_at.tzinfo is None else a.available_at.tzinfo) <= now_utc)
        
        # If past time and was scheduled, update status to available
        if is_available and a.status == "scheduled":
            a.status = "available"
            db.commit()

        # Sanitize questions if not completed
        sanitized_questions = []
        if a.questions:
            for q in a.questions:
                if a.status == "completed":
                    sanitized_questions.append(q)
                else:
                    sanitized_questions.append({
                        "id": q.get("id"),
                        "question": q.get("question"),
                        "options": q.get("options", [])
                    })

        results.append({
            "id": a.id,
            "user_id": a.user_id,
            "session_id": a.session_id,
            "skill_name": a.skill_name,
            "topic": a.topic,
            "status": a.status,
            "available_at": a.available_at,
            "is_available": is_available,
            "questions": sanitized_questions,
            "questions_count": len(a.questions) if a.questions else 0,
            "score": a.score,
            "percentage": a.percentage,
            "badge_awarded": a.badge_awarded,
            "feedback": a.feedback,
            "created_at": a.created_at,
            "completed_at": a.completed_at
        })

    return results

@router.get("/assessments/{assessment_id}")
def get_assessment_details(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a = db.query(SkillAssessment).filter(
        SkillAssessment.id == assessment_id,
        SkillAssessment.user_id == current_user.id
    ).first()

    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    now_utc = datetime.now(timezone.utc)
    is_available = a.status == "completed" or (a.available_at and a.available_at.replace(tzinfo=timezone.utc if a.available_at.tzinfo is None else a.available_at.tzinfo) <= now_utc)

    if is_available and a.status == "scheduled":
        a.status = "available"
        db.commit()

    # Sanitize questions if not completed
    sanitized_questions = []
    if a.questions:
        for q in a.questions:
            if a.status == "completed":
                sanitized_questions.append(q)
            else:
                sanitized_questions.append({
                    "id": q.get("id"),
                    "question": q.get("question"),
                    "options": q.get("options", [])
                })

    return {
        "id": a.id,
        "user_id": a.user_id,
        "session_id": a.session_id,
        "skill_name": a.skill_name,
        "topic": a.topic,
        "status": a.status,
        "available_at": a.available_at,
        "is_available": is_available,
        "questions": sanitized_questions,
        "submitted_answers": a.submitted_answers if a.status == "completed" else {},
        "score": a.score,
        "percentage": a.percentage,
        "badge_awarded": a.badge_awarded,
        "feedback": a.feedback,
        "created_at": a.created_at,
        "completed_at": a.completed_at
    }

@router.post("/assessments/{assessment_id}/submit")
def submit_skill_assessment(
    assessment_id: str,
    req: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a = db.query(SkillAssessment).filter(
        SkillAssessment.id == assessment_id,
        SkillAssessment.user_id == current_user.id
    ).first()

    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    now_utc = datetime.now(timezone.utc)
    is_available = a.status == "completed" or (a.available_at and a.available_at.replace(tzinfo=timezone.utc if a.available_at.tzinfo is None else a.available_at.tzinfo) <= now_utc)

    if not is_available and a.status == "scheduled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This assessment is not available yet. It will unlock on {a.available_at.strftime('%b %d, %Y')}."
        )

    # Calculate score
    questions = a.questions or []
    total = len(questions)
    if total == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No questions found in this assessment.")

    correct_count = 0
    submitted = req.answers
    for q in questions:
        qid = q.get("id")
        user_choice = submitted.get(qid)
        if user_choice is not None and user_choice == q.get("correct_idx"):
            correct_count += 1

    percentage = round((correct_count / total) * 100.0, 1)
    earned_badge = evaluate_badge_level(percentage)

    feedback_text = (
        f"Outstanding mastery! You achieved {percentage}% ({correct_count}/{total} correct) and earned the {earned_badge} badge."
        if earned_badge == "GOLD"
        else f"Great effort! You scored {percentage}% ({correct_count}/{total} correct) and achieved the {earned_badge} badge."
        if earned_badge == "SILVER"
        else f"Good attempt! You scored {percentage}% ({correct_count}/{total} correct). You maintain your BRONZE badge. Review key topics and retry in upcoming sessions!"
    )

    # 1. Update SkillAssessment record
    a.status = "completed"
    a.score = float(correct_count)
    a.percentage = percentage
    a.badge_awarded = earned_badge
    a.submitted_answers = submitted
    a.feedback = feedback_text
    a.completed_at = now_utc

    # 2. Update user Achievement for the skill (never downgrade!)
    ach = db.query(Achievement).filter(
        Achievement.user_id == current_user.id,
        Achievement.skill_name == a.skill_name
    ).first()

    if not ach:
        ach = Achievement(
            user_id=current_user.id,
            skill_name=a.skill_name,
            badge_level=earned_badge,
            source_session_id=a.session_id,
            latest_score=percentage,
            assessment_status="completed",
            awarded_at=now_utc
        )
        db.add(ach)
    else:
        # Check if earned_badge is an upgrade over current badge
        if is_badge_upgrade(ach.badge_level, earned_badge):
            ach.badge_level = earned_badge
        ach.latest_score = max(ach.latest_score or 0.0, percentage)
        ach.assessment_status = "completed"
        ach.updated_at = now_utc

    # 3. Send congratulatory Notification
    notif = Notification(
        user_id=current_user.id,
        title=f"Assessment Complete — {earned_badge} Badge! 🏆",
        message=f"You scored {percentage}% on your '{a.skill_name}' assessment and your achievement is now {ach.badge_level}.",
        type="session",
        link=f"/skills"
    )
    db.add(notif)

    db.commit()
    db.refresh(a)
    db.refresh(ach)

    return {
        "message": "Assessment submitted and evaluated successfully.",
        "score": a.score,
        "total_questions": total,
        "percentage": a.percentage,
        "badge_awarded": earned_badge,
        "current_badge": ach.badge_level,
        "feedback": feedback_text,
        "completed_at": a.completed_at.isoformat()
    }
