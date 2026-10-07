from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.all_models import User, Profile, Session as DBSession, Review, Notification
from backend.app.schemas.all_schemas import ReviewCreate
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])

@router.post("/")
def submit_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).filter(DBSession.id == review_in.session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    if session.learner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the learner can submit a review for this session.")
        
    existing_review = db.query(Review).filter(Review.session_id == session.id).first()
    if existing_review:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Review already submitted for this session.")

    review = Review(
        session_id=session.id,
        teacher_id=session.teacher_id,
        reviewer_id=current_user.id,
        overall_rating=review_in.overall_rating,
        knowledge=review_in.knowledge,
        communication=review_in.communication,
        reliability=review_in.reliability,
        teaching=review_in.teaching,
        professionalism=review_in.professionalism,
        comment=review_in.comment
    )
    db.add(review)
    
    # Update teacher reputation score
    teacher_profile = db.query(Profile).filter(Profile.user_id == session.teacher_id).first()
    if teacher_profile:
        current_ratings = db.query(Review).filter(Review.teacher_id == session.teacher_id).all()
        total_score = sum(r.overall_rating for r in current_ratings) + review_in.overall_rating
        total_count = len(current_ratings) + 1
        teacher_profile.reputation_score = round(total_score / total_count, 1)
        teacher_profile.rating_count = total_count

    # Notification
    notif = Notification(
        user_id=session.teacher_id,
        title="New Review Received! ⭐",
        message=f"{current_user.full_name} gave you a {review_in.overall_rating}★ review for '{session.skill_name}'.",
        type="review",
        link="/profile"
    )
    db.add(notif)

    db.commit()
    return {"message": "Review submitted successfully"}

@router.get("/user/{user_id}")
def get_user_reviews(user_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.teacher_id == user_id).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        reviewer = db.query(User).filter(User.id == r.reviewer_id).first()
        results.append({
            "id": r.id,
            "overall_rating": r.overall_rating,
            "knowledge": r.knowledge,
            "communication": r.communication,
            "reliability": r.reliability,
            "teaching": r.teaching,
            "professionalism": r.professionalism,
            "comment": r.comment,
            "reviewer_name": reviewer.full_name if reviewer else "Learner",
            "reviewer_avatar": reviewer.profile.avatar_url if reviewer and reviewer.profile else "",
            "created_at": r.created_at
        })
    return results
