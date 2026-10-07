from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.all_models import User, Profile, UserSkill
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/matches", tags=["AI Skill Matching"])

def compute_explainable_match(user_a_id: str, user_b_id: str, db: Session):
    user_a = db.query(User).filter(User.id == user_a_id).first()
    user_b = db.query(User).filter(User.id == user_b_id).first()
    if not user_a or not user_b:
        return None

    a_teach = db.query(UserSkill).filter(UserSkill.user_id == user_a_id, UserSkill.skill_type == "teach").all()
    a_learn = db.query(UserSkill).filter(UserSkill.user_id == user_a_id, UserSkill.skill_type == "learn").all()
    b_teach = db.query(UserSkill).filter(UserSkill.user_id == user_b_id, UserSkill.skill_type == "teach").all()
    b_learn = db.query(UserSkill).filter(UserSkill.user_id == user_b_id, UserSkill.skill_type == "learn").all()

    a_teach_names = {s.skill_name.lower(): s for s in a_teach}
    a_learn_names = {s.skill_name.lower(): s for s in a_learn}
    b_teach_names = {s.skill_name.lower(): s for s in b_teach}
    b_learn_names = {s.skill_name.lower(): s for s in b_learn}

    explanations = []
    calculated_score = 0

    # Check 1: User B teaches what User A wants to learn (Learner match)
    direct_match_ba = set(b_teach_names.keys()).intersection(set(a_learn_names.keys()))
    if direct_match_ba:
        matched_skills = [b_teach_names[k].skill_name for k in direct_match_ba]
        explanations.append(f"Teaches {', '.join(matched_skills)} (which you want to learn)")
        calculated_score += 45

    # Check 2: User A teaches what User B wants to learn (Teacher match / 2-way swap)
    direct_match_ab = set(a_teach_names.keys()).intersection(set(b_learn_names.keys()))
    if direct_match_ab:
        matched_skills = [a_teach_names[k].skill_name for k in direct_match_ab]
        explanations.append(f"Wants to learn {', '.join(matched_skills)} (which you teach)")
        calculated_score += 40

    # Check 3: Category overlap
    a_cats = {s.category.lower() for s in a_teach + a_learn}
    b_cats = {s.category.lower() for s in b_teach + b_learn}
    common_cats = a_cats.intersection(b_cats)
    if common_cats:
        cat_names = [c.title() for c in list(common_cats)[:2]]
        if not direct_match_ab and not direct_match_ba:
            explanations.append(f"Shared category interest in {', '.join(cat_names)}")
            calculated_score += 30
        else:
            calculated_score += 5

    # Check 4: Schedule availability overlap
    prof_a = user_a.profile
    prof_b = user_b.profile
    avail_a = set(prof_a.availability or []) if prof_a else set()
    avail_b = set(prof_b.availability or []) if prof_b else set()
    common_avail = avail_a.intersection(avail_b)
    if common_avail:
        explanations.append(f"Matching availability: {', '.join(list(common_avail)[:2])}")
        calculated_score += 10

    # If no specific overlap found but user has skills
    if not explanations:
        if b_teach:
            explanations.append(f"Offers teaching in {', '.join([s.skill_name for s in b_teach[:2]])}")
            calculated_score = 25
        else:
            return None  # No basis for recommendation

    match_score = min(99, max(20, calculated_score))

    # Suggested token price from their teaching profile
    token_price = 15
    if b_teach:
        token_price = b_teach[0].session_price or 15

    return {
        "user_id": user_b.id,
        "username": user_b.username or (prof_b.username if prof_b else ""),
        "user_name": user_b.full_name,
        "headline": prof_b.headline if prof_b else "Skill Swap Member",
        "avatar_url": prof_b.avatar_url if prof_b else "",
        "reputation_score": prof_b.reputation_score if prof_b else 5.0,
        "rating_count": prof_b.rating_count if prof_b else 0,
        "location": prof_b.location if prof_b else "",
        "match_score": match_score,
        "explanations": explanations,
        "skills_teaching": [s.skill_name for s in b_teach],
        "skills_learning": [s.skill_name for s in b_learn],
        "token_price": token_price,
        "availability": prof_b.availability if prof_b else []
    }

@router.get("")
@router.get("/recommendations")
@router.get("/suggested")
def get_recommended_matches(
    tab: Optional[str] = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find all other active users in the database
    other_users = db.query(User).filter(User.id != current_user.id, User.is_active == True).all()
    
    matches = []
    for other in other_users:
        match_data = compute_explainable_match(current_user.id, other.id, db)
        if match_data:
            matches.append(match_data)
            
    # Sort by match_score descending
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches
