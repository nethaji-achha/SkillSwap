import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.db.session import get_db
from backend.app.db.mongodb import get_mongo_db
from backend.app.core.config import settings
from backend.app.models.all_models import User, UserSubscription, AIUsage, SubscriptionPlan
from backend.app.schemas.all_schemas import AIRoadmapRequest, AIPricingRequest
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Engine"])

def check_and_increment_ai_quota(user: User, db: Session, feature: str):
    sub = user.subscription
    if not sub:
        sub = UserSubscription(user_id=user.id, plan_slug="basic", status="active")
        db.add(sub)
        db.flush()
        
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.slug == sub.plan_slug).first()
    limit = plan.ai_requests_per_month if plan else 15
    
    if sub.ai_requests_used >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Monthly AI request quota exceeded ({sub.ai_requests_used}/{limit}). Upgrade your subscription plan for more AI assistance."
        )
        
    sub.ai_requests_used += 1
    usage_entry = AIUsage(
        user_id=user.id,
        feature_type=feature,
        prompt_tokens=50,
        completion_tokens=200
    )
    db.add(usage_entry)
    db.commit()

@router.post("/roadmap")
async def generate_learning_roadmap(
    req: AIRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Optional[AsyncIOMotorDatabase] = Depends(get_mongo_db)
):
    check_and_increment_ai_quota(current_user, db, "roadmap")
    
    roadmap_data = None
    
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""
            You are an expert curriculum designer and AI learning mentor for Skill Swap.
            Generate a detailed, step-by-step learning roadmap for a student learning '{req.skill_to_learn}'.
            Current Level: {req.current_level}
            Target Goal: {req.target_goal}
            Duration: {req.duration_days} days.
            
            Format your response STRICTLY as valid JSON with the following structure:
            {{
              "title": "Roadmap title",
              "overview": "Summary of learning path",
              "estimated_hours_total": 40,
              "recommended_sessions": 4,
              "phases": [
                {{
                  "phase_number": 1,
                  "title": "Phase Title",
                  "duration": "Days 1-7",
                  "objectives": ["obj 1", "obj 2"],
                  "key_topics": ["topic 1", "topic 2"],
                  "practice_tasks": ["task 1", "task 2"],
                  "checkpoint_question": "Question to test mastery"
                }}
              ]
            }}
            Return ONLY the JSON string.
            """
            
            response = model.generate_content(prompt)
            clean_text = response.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            roadmap_data = json.loads(clean_text.strip())
        except Exception:
            pass

    # Structured dynamic fallback when API key is missing or rate limited
    if not roadmap_data:
        roadmap_data = {
            "title": f"{req.skill_to_learn} Mastery Roadmap ({req.duration_days} Days)",
            "overview": f"A comprehensive {req.duration_days}-day structured path to take you from {req.current_level} to achieving: '{req.target_goal}'.",
            "estimated_hours_total": req.duration_days * 2,
            "recommended_sessions": max(2, req.duration_days // 7),
            "phases": [
                {
                    "phase_number": 1,
                    "title": f"Core Foundations of {req.skill_to_learn}",
                    "duration": f"Days 1 - {max(5, req.duration_days // 4)}",
                    "objectives": [
                        f"Understand the architectural mental model of {req.skill_to_learn}",
                        "Set up local development and toolchain",
                        "Master syntax and fundamental building blocks"
                    ],
                    "key_topics": ["Fundamental Principles", "Environment Setup", "Core APIs & Patterns"],
                    "practice_tasks": [
                        "Build a mini proof-of-concept project",
                        "Complete interactive exercises and debug common syntax mistakes"
                    ],
                    "checkpoint_question": f"Can you explain the core lifecycle and paradigm of {req.skill_to_learn} without referencing docs?"
                },
                {
                    "phase_number": 2,
                    "title": f"Intermediate Application & Real-World Patterns",
                    "duration": f"Days {max(6, req.duration_days // 4 + 1)} - {max(15, req.duration_days // 2)}",
                    "objectives": [
                        "Implement state management and asynchronous data workflows",
                        "Learn industry standard best practices and folder organization"
                    ],
                    "key_topics": ["Asynchronous flows", "State & Data architecture", "Error resilience"],
                    "practice_tasks": ["Build a multi-component interactive application with API integration"],
                    "checkpoint_question": "How do you handle edge cases and state synchronization across components?"
                },
                {
                    "phase_number": 3,
                    "title": "Advanced Optimization & Peer Skill Session",
                    "duration": f"Days {max(16, req.duration_days // 2 + 1)} - {req.duration_days}",
                    "objectives": [
                        "Performance profiling, testing, and production deployment",
                        "Book a 1-on-1 Skill Swap review session with an experienced mentor"
                    ],
                    "key_topics": ["Performance tuning", "Security considerations", "Real-world code review"],
                    "practice_tasks": ["Deploy a full-fledged capstone project to production"],
                    "checkpoint_question": "Can you review another peer's code and pinpoint architectural bottlenecks?"
                }
            ]
        }

    # Store full document in MongoDB if available
    if mongo_db is not None:
        try:
            doc = {
                "user_id": current_user.id,
                "skill_to_learn": req.skill_to_learn,
                "current_level": req.current_level,
                "target_goal": req.target_goal,
                "duration_days": req.duration_days,
                "roadmap": roadmap_data,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await mongo_db["ai_roadmaps"].insert_one(doc)
        except Exception:
            pass

    return roadmap_data

@router.get("/roadmaps")
async def get_saved_roadmaps(
    current_user: User = Depends(get_current_user),
    mongo_db: Optional[AsyncIOMotorDatabase] = Depends(get_mongo_db)
):
    """
    Retrieve user's previously generated AI learning roadmaps from MongoDB.
    """
    if mongo_db is None:
        return []
    try:
        cursor = mongo_db["ai_roadmaps"].find({"user_id": current_user.id}).sort("created_at", -1).limit(20)
        results = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            results.append(doc)
        return results
    except Exception:
        return []

@router.post("/pricing-recommendation")
def recommend_skill_pricing(
    req: AIPricingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_and_increment_ai_quota(current_user, db, "pricing")
    
    # Calculate recommended token price based on level, years experience, and market demand
    base_price = 10
    lvl = req.experience_level.lower()
    
    if "beginner" in lvl:
        suggested_range = (5, 10)
        recommended = 8
        tier = "Beginner Mentor"
    elif "intermediate" in lvl:
        suggested_range = (10, 20)
        recommended = 15
        tier = "Practitioner"
    elif "advanced" in lvl:
        suggested_range = (20, 45)
        recommended = 30
        tier = "Senior Specialist"
    else:  # Expert
        suggested_range = (45, 80)
        recommended = 50
        tier = "Expert Authority"

    # Add experience adjustment
    if req.years_experience > 5:
        recommended += 5

    return {
        "skill_name": req.skill_name,
        "recommended_token_price": recommended,
        "suggested_min": suggested_range[0],
        "suggested_max": suggested_range[1],
        "tier": tier,
        "rationale": f"Based on {req.years_experience} years of experience in {req.skill_name} at {req.experience_level} level, this price balances high student demand with fair token compensation."
    }

@router.post("/mentor-chat")
async def mentor_chat(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Optional[AsyncIOMotorDatabase] = Depends(get_mongo_db)
):
    check_and_increment_ai_quota(current_user, db, "mentor")
    user_message = payload.get("message", "")
    reply = ""
    
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""
            You are the Skill Swap AI Mentor. You help users learn skills, find complementary swap partners, prepare for sessions, and give concise actionable advice.
            User: {user_message}
            """
            res = model.generate_content(prompt)
            reply = res.text
        except Exception:
            pass

    if not reply:
        reply = f"As your Skill Swap AI Mentor, I recommend breaking down '{user_message}' into weekly milestones. You can search our Discover page to find experienced peers who teach this skill, or use your welcome tokens to schedule a 1-on-1 session!"

    # Save to MongoDB chat history
    if mongo_db is not None:
        try:
            await mongo_db["ai_chat_history"].insert_one({
                "user_id": current_user.id,
                "user_message": user_message,
                "ai_reply": reply,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        except Exception:
            pass

    return {"reply": reply}

@router.get("/mentor-chat/history")
async def get_mentor_chat_history(
    current_user: User = Depends(get_current_user),
    mongo_db: Optional[AsyncIOMotorDatabase] = Depends(get_mongo_db)
):
    """
    Retrieve user's AI Mentor chat conversation history from MongoDB.
    """
    if mongo_db is None:
        return []
    try:
        cursor = mongo_db["ai_chat_history"].find({"user_id": current_user.id}).sort("created_at", 1).limit(50)
        history = []
        async for doc in cursor:
            history.append({
                "id": str(doc["_id"]),
                "user_message": doc.get("user_message"),
                "ai_reply": doc.get("ai_reply"),
                "created_at": doc.get("created_at")
            })
        return history
    except Exception:
        return []

