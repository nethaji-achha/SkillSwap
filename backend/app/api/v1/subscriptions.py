from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.all_models import User, SubscriptionPlan, UserSubscription
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

@router.get("/plans")
def get_subscription_plans(db: Session = Depends(get_db)):
    plans = db.query(SubscriptionPlan).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "price_inr": p.price_inr,
            "tokens_per_month": p.tokens_per_month,
            "ai_requests_per_month": p.ai_requests_per_month,
            "features": p.features,
            "is_popular": p.is_popular
        } for p in plans
    ]

@router.get("/current")
def get_current_subscription(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = current_user.subscription
    if not sub:
        sub = UserSubscription(user_id=current_user.id, plan_slug="basic", status="active")
        db.add(sub)
        db.commit()
        db.refresh(sub)
        
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.slug == sub.plan_slug).first()
    
    return {
        "id": sub.id,
        "plan_slug": sub.plan_slug,
        "plan_name": plan.name if plan else "Basic",
        "status": sub.status,
        "ai_requests_used": sub.ai_requests_used,
        "ai_requests_limit": plan.ai_requests_per_month if plan else 15,
        "tokens_per_month": plan.tokens_per_month if plan else 15,
        "current_period_start": sub.current_period_start,
        "current_period_end": sub.current_period_end
    }
