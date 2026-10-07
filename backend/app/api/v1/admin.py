from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.session import get_db
from backend.app.models.all_models import (
    User, Profile, SkillCategory, Skill, UserSkill, Session as DBSession,
    Payment, Wallet, TokenTransaction, SubscriptionPlan, UserSubscription, Report
)
from backend.app.api.v1.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("")
@router.get("/analytics")
@router.get("/stats")
def get_admin_analytics(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_sessions = db.query(DBSession).count()
    completed_sessions = db.query(DBSession).filter(DBSession.status == "completed").count()
    
    total_revenue_inr = db.query(func.sum(Payment.amount_inr)).filter(Payment.status == "success").scalar() or 0
    total_tokens_circulating = db.query(func.sum(Wallet.available_balance + Wallet.pending_balance)).scalar() or 0
    total_skills_offered = db.query(UserSkill).filter(UserSkill.skill_type == "teach").count()
    total_learning_goals = db.query(UserSkill).filter(UserSkill.skill_type == "learn").count()
    
    active_subscriptions = db.query(UserSubscription).filter(UserSubscription.plan_slug != "basic").count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_revenue_inr": total_revenue_inr,
        "total_tokens_circulating": total_tokens_circulating,
        "total_skills_offered": total_skills_offered,
        "total_learning_goals": total_learning_goals,
        "active_subscriptions": active_subscriptions
    }

@router.get("/users")
def get_all_users_admin(
    search: Optional[str] = None,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        query = query.filter((User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%")))
    users = query.order_by(User.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at,
            "available_tokens": u.wallet.available_balance if u.wallet else 0,
            "completed_sessions": u.profile.completed_sessions if u.profile else 0,
            "reputation_score": u.profile.reputation_score if u.profile else 5.0
        } for u in users
    ]

@router.post("/users/{user_id}/verify")
def toggle_user_verification(user_id: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.is_verified = not user.is_verified
    db.commit()
    return {"message": f"User verification status set to {user.is_verified}", "is_verified": user.is_verified}

@router.post("/users/{user_id}/toggle-status")
def toggle_user_active(user_id: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User active status set to {user.is_active}", "is_active": user.is_active}

@router.get("/payments")
def get_all_payments_admin(limit: int = 50, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    payments = db.query(Payment).order_by(Payment.created_at.desc()).limit(limit).all()
    results = []
    for p in payments:
        user = db.query(User).filter(User.id == p.user_id).first()
        results.append({
            "id": p.id,
            "user_name": user.full_name if user else "Unknown",
            "user_email": user.email if user else "",
            "razorpay_order_id": p.razorpay_order_id,
            "razorpay_payment_id": p.razorpay_payment_id,
            "amount_inr": p.amount_inr,
            "purpose": p.purpose,
            "tokens_credited": p.tokens_credited,
            "status": p.status,
            "created_at": p.created_at
        })
    return results

@router.get("/reports")
def get_reports(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        reporter = db.query(User).filter(User.id == r.reporter_id).first()
        results.append({
            "id": r.id,
            "reporter_name": reporter.full_name if reporter else "User",
            "target_id": r.target_id,
            "target_type": r.target_type,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at
        })
    return results
