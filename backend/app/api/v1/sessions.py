from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict
import json
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from backend.app.core.config import settings
from backend.app.db.session import get_db, SessionLocal
from backend.app.models.all_models import (
    User, Profile, Wallet, Session as DBSession, TokenHold, TokenTransaction, 
    Notification, SessionSummary, Achievement, SkillAssessment
)
from backend.app.schemas.all_schemas import SessionCreate, SessionUpdate, SessionSummaryResponse
from backend.app.api.v1.deps import get_current_user
from backend.app.services.learning_service import (
    generate_session_summary_data,
    generate_skill_assessment_questions,
    is_badge_upgrade
)

router = APIRouter(prefix="/sessions", tags=["Sessions & Escrow"])

# ---------------------------------------------------------------------------
# In-Memory WebRTC Signaling Manager (Room-based)
# ---------------------------------------------------------------------------
class WebRTCSessionManager:
    def __init__(self):
        # Map: session_id -> { user_id: WebSocket }
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, session_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.rooms:
            self.rooms[session_id] = {}
        self.rooms[session_id][user_id] = websocket

        # Notify other peer in the room that a user has joined
        for peer_id, ws in self.rooms[session_id].items():
            if peer_id != user_id:
                try:
                    await ws.send_json({
                        "type": "peer-joined",
                        "user_id": user_id,
                        "peers_count": len(self.rooms[session_id])
                    })
                except Exception:
                    pass

    def disconnect(self, session_id: str, user_id: str):
        if session_id in self.rooms:
            self.rooms[session_id].pop(user_id, None)
            if not self.rooms[session_id]:
                self.rooms.pop(session_id, None)

    async def broadcast_to_peer(self, session_id: str, sender_id: str, message: dict):
        if session_id in self.rooms:
            for peer_id, ws in self.rooms[session_id].items():
                if peer_id != sender_id:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        pass

signaling_manager = WebRTCSessionManager()


@router.websocket("/ws/{session_id}")
async def webrtc_signaling_endpoint(
    websocket: WebSocket,
    session_id: str,
    token: Optional[str] = Query(None)
):
    """
    Authenticated WebRTC signaling websocket endpoint for 1-on-1 sessions.
    Validates user credentials and relays offer, answer, ice-candidate, and state messages.
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Verify JWT
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except (JWTError, Exception):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Verify session authorization in DB
    db = SessionLocal()
    try:
        session = db.query(DBSession).filter(
            DBSession.id == session_id,
            (DBSession.teacher_id == user_id) | (DBSession.learner_id == user_id)
        ).first()
        if not session:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    finally:
        db.close()

    await signaling_manager.connect(session_id, user_id, websocket)

    try:
        # Acknowledge connection to caller
        await websocket.send_json({
            "type": "connection-established",
            "session_id": session_id,
            "user_id": user_id,
            "room_size": len(signaling_manager.rooms.get(session_id, {}))
        })

        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
            except Exception:
                continue

            msg_type = msg.get("type")
            # Relay signaling messages: offer, answer, ice-candidate, ready, toggle-mic, toggle-video, chat, leave
            await signaling_manager.broadcast_to_peer(session_id, user_id, {
                **msg,
                "sender_id": user_id
            })

            if msg_type == "leave":
                break

    except WebSocketDisconnect:
        pass
    finally:
        signaling_manager.disconnect(session_id, user_id)
        await signaling_manager.broadcast_to_peer(session_id, user_id, {
            "type": "peer-left",
            "user_id": user_id
        })


# ---------------------------------------------------------------------------
# Sessions REST Endpoints
# ---------------------------------------------------------------------------

@router.get("/")
def get_my_sessions(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DBSession).filter(
        (DBSession.teacher_id == current_user.id) | (DBSession.learner_id == current_user.id)
    )
    
    if status_filter and status_filter != "all":
        query = query.filter(DBSession.status == status_filter)
        
    sessions = query.order_by(DBSession.scheduled_at.desc()).all()
    
    results = []
    for s in sessions:
        teacher = db.query(User).filter(User.id == s.teacher_id).first()
        learner = db.query(User).filter(User.id == s.learner_id).first()
        has_summary = db.query(SessionSummary).filter(SessionSummary.session_id == s.id).first() is not None
        results.append({
            "id": s.id,
            "teacher_id": s.teacher_id,
            "teacher_name": teacher.full_name if teacher else "Teacher",
            "teacher_avatar": teacher.profile.avatar_url if teacher and teacher.profile else "",
            "learner_id": s.learner_id,
            "learner_name": learner.full_name if learner else "Learner",
            "learner_avatar": learner.profile.avatar_url if learner and learner.profile else "",
            "skill_name": s.skill_name,
            "scheduled_at": s.scheduled_at,
            "duration_minutes": s.duration_minutes,
            "token_price": s.token_price,
            "objective": s.objective,
            "status": s.status,
            "has_summary": has_summary,
            "meeting_link": s.meeting_link or f"/sessions/{s.id}?join=true",
            "created_at": s.created_at,
            "completed_at": s.completed_at
        })
    return results


@router.get("/summaries/my")
def get_my_session_summaries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all session summaries where the current user was learner or teacher.
    """
    user_sessions = db.query(DBSession).filter(
        (DBSession.teacher_id == current_user.id) | (DBSession.learner_id == current_user.id)
    ).all()
    session_ids = [s.id for s in user_sessions]

    if not session_ids:
        return []

    summaries = db.query(SessionSummary).filter(
        SessionSummary.session_id.in_(session_ids)
    ).order_by(SessionSummary.session_date.desc()).all()

    return [
        {
            "id": sm.id,
            "session_id": sm.session_id,
            "user_id": sm.user_id,
            "skill_name": sm.skill_name,
            "title": sm.title,
            "teacher_name": sm.teacher_name,
            "learner_name": sm.learner_name,
            "duration_minutes": sm.duration_minutes,
            "session_date": sm.session_date,
            "learning_objective": sm.learning_objective,
            "key_concepts": sm.key_concepts or [],
            "important_points": sm.important_points or [],
            "practical_tips": sm.practical_tips or [],
            "questions_discussed": sm.questions_discussed or [],
            "main_takeaways": sm.main_takeaways or [],
            "suggested_revision_points": sm.suggested_revision_points or [],
            "suggested_next_steps": sm.suggested_next_steps or [],
            "raw_summary": sm.raw_summary or "",
            "created_at": sm.created_at
        }
        for sm in summaries
    ]


@router.get("/summaries/{summary_id}")
def get_session_summary_by_id(
    summary_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sm = db.query(SessionSummary).filter(SessionSummary.id == summary_id).first()
    if not sm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session summary not found.")

    session = db.query(DBSession).filter(DBSession.id == sm.session_id).first()
    if not session or (session.teacher_id != current_user.id and session.learner_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this summary.")

    return {
        "id": sm.id,
        "session_id": sm.session_id,
        "user_id": sm.user_id,
        "skill_name": sm.skill_name,
        "title": sm.title,
        "teacher_name": sm.teacher_name,
        "learner_name": sm.learner_name,
        "duration_minutes": sm.duration_minutes,
        "session_date": sm.session_date,
        "learning_objective": sm.learning_objective,
        "key_concepts": sm.key_concepts or [],
        "important_points": sm.important_points or [],
        "practical_tips": sm.practical_tips or [],
        "questions_discussed": sm.questions_discussed or [],
        "main_takeaways": sm.main_takeaways or [],
        "suggested_revision_points": sm.suggested_revision_points or [],
        "suggested_next_steps": sm.suggested_next_steps or [],
        "raw_summary": sm.raw_summary or "",
        "created_at": sm.created_at
    }


@router.get("/{session_id}/summary")
def get_summary_for_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).filter(
        DBSession.id == session_id,
        (DBSession.teacher_id == current_user.id) | (DBSession.learner_id == current_user.id)
    ).first()

    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")

    sm = db.query(SessionSummary).filter(SessionSummary.session_id == session_id).first()
    if not sm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not yet generated for this session.")

    return {
        "id": sm.id,
        "session_id": sm.session_id,
        "user_id": sm.user_id,
        "skill_name": sm.skill_name,
        "title": sm.title,
        "teacher_name": sm.teacher_name,
        "learner_name": sm.learner_name,
        "duration_minutes": sm.duration_minutes,
        "session_date": sm.session_date,
        "learning_objective": sm.learning_objective,
        "key_concepts": sm.key_concepts or [],
        "important_points": sm.important_points or [],
        "practical_tips": sm.practical_tips or [],
        "questions_discussed": sm.questions_discussed or [],
        "main_takeaways": sm.main_takeaways or [],
        "suggested_revision_points": sm.suggested_revision_points or [],
        "suggested_next_steps": sm.suggested_next_steps or [],
        "raw_summary": sm.raw_summary or "",
        "created_at": sm.created_at
    }


@router.get("/{session_id}")
def get_session_by_id(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.query(DBSession).filter(
        DBSession.id == session_id,
        (DBSession.teacher_id == current_user.id) | (DBSession.learner_id == current_user.id)
    ).first()
    
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    teacher = db.query(User).filter(User.id == s.teacher_id).first()
    learner = db.query(User).filter(User.id == s.learner_id).first()
    has_summary = db.query(SessionSummary).filter(SessionSummary.session_id == s.id).first() is not None
    
    return {
        "id": s.id,
        "teacher_id": s.teacher_id,
        "teacher_name": teacher.full_name if teacher else "Teacher",
        "teacher_avatar": teacher.profile.avatar_url if teacher and teacher.profile else "",
        "learner_id": s.learner_id,
        "learner_name": learner.full_name if learner else "Learner",
        "learner_avatar": learner.profile.avatar_url if learner and learner.profile else "",
        "skill_name": s.skill_name,
        "scheduled_at": s.scheduled_at,
        "duration_minutes": s.duration_minutes,
        "token_price": s.token_price,
        "objective": s.objective,
        "status": s.status,
        "has_summary": has_summary,
        "meeting_link": s.meeting_link or f"/sessions/{s.id}?join=true",
        "created_at": s.created_at,
        "completed_at": s.completed_at
    }


@router.post("/book")
def book_session(
    session_in: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if session_in.teacher_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot book a session with yourself.")
        
    teacher = db.query(User).filter(User.id == session_in.teacher_id, User.is_active == True).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found.")

    learner_wallet = current_user.wallet
    if not learner_wallet:
        learner_wallet = Wallet(user_id=current_user.id)
        db.add(learner_wallet)
        db.flush()

    if learner_wallet.available_balance < session_in.token_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient token balance. You have {learner_wallet.available_balance} 🪙, but this session requires {session_in.token_price} 🪙."
        )

    # 1. Escrow hold: Move tokens from available to pending
    learner_wallet.available_balance -= session_in.token_price
    learner_wallet.pending_balance += session_in.token_price
    
    # 2. Create Session
    session = DBSession(
        teacher_id=session_in.teacher_id,
        learner_id=current_user.id,
        skill_name=session_in.skill_name,
        scheduled_at=session_in.scheduled_at,
        duration_minutes=session_in.duration_minutes,
        token_price=session_in.token_price,
        objective=session_in.objective,
        status="scheduled"
    )
    db.add(session)
    db.flush()

    # 3. Create TokenHold entry
    hold = TokenHold(
        wallet_id=learner_wallet.id,
        session_id=session.id,
        amount=session_in.token_price,
        status="held"
    )
    db.add(hold)

    # 4. Record pending transaction
    tx = TokenTransaction(
        wallet_id=learner_wallet.id,
        type="pending",
        amount=session_in.token_price,
        description=f"Escrow hold for '{session_in.skill_name}' session with {teacher.full_name}",
        status="pending",
        reference_id=session.id
    )
    db.add(tx)

    # 5. Send notification to teacher
    notif = Notification(
        user_id=teacher.id,
        title="New Skill Swap Session Request! 🗓️",
        message=f"{current_user.full_name} scheduled a '{session_in.skill_name}' learning session with you.",
        type="session",
        link=f"/sessions/{session.id}"
    )
    db.add(notif)

    db.commit()
    db.refresh(session)
    return {"message": "Session booked and tokens placed in escrow", "session_id": session.id}


@router.post("/{session_id}/complete")
def complete_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(DBSession).filter(
        DBSession.id == session_id,
        (DBSession.teacher_id == current_user.id) | (DBSession.learner_id == current_user.id)
    ).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    teacher = db.query(User).filter(User.id == session.teacher_id).first()
    learner = db.query(User).filter(User.id == session.learner_id).first()

    now_utc = datetime.now(timezone.utc)

    if session.status != "completed":
        # 1. Update session status
        session.status = "completed"
        session.completed_at = now_utc
        
        # 2. Release Escrow from learner to teacher
        learner_wallet = db.query(Wallet).filter(Wallet.user_id == session.learner_id).first()
        teacher_wallet = db.query(Wallet).filter(Wallet.user_id == session.teacher_id).first()
        
        if not teacher_wallet:
            teacher_wallet = Wallet(user_id=session.teacher_id)
            db.add(teacher_wallet)
            db.flush()

        # Deduct learner escrow
        if learner_wallet:
            learner_wallet.pending_balance = max(0, learner_wallet.pending_balance - session.token_price)
            learner_wallet.spent_total += session.token_price
            
            learner_tx = TokenTransaction(
                wallet_id=learner_wallet.id,
                type="spent",
                amount=session.token_price,
                description=f"Completed '{session.skill_name}' session",
                status="completed",
                reference_id=session.id
            )
            db.add(learner_tx)

        # Credit teacher
        teacher_wallet.available_balance += session.token_price
        teacher_wallet.earned_total += session.token_price
        
        teacher_tx = TokenTransaction(
            wallet_id=teacher_wallet.id,
            type="earned",
            amount=session.token_price,
            description=f"Earned from teaching '{session.skill_name}' session",
            status="completed",
            reference_id=session.id
        )
        db.add(teacher_tx)

        # Update TokenHold record
        hold = db.query(TokenHold).filter(TokenHold.session_id == session.id).first()
        if hold:
            hold.status = "released"
            hold.released_at = now_utc

        # Update Profile metrics
        hours = session.duration_minutes / 60.0
        teacher_profile = db.query(Profile).filter(Profile.user_id == session.teacher_id).first()
        learner_profile = db.query(Profile).filter(Profile.user_id == session.learner_id).first()
        
        if teacher_profile:
            teacher_profile.teaching_hours += hours
            teacher_profile.completed_sessions += 1
            
        if learner_profile:
            learner_profile.learning_hours += hours
            learner_profile.completed_sessions += 1

    # 3. Generate & Persist Session Summary (idempotent)
    existing_summary = db.query(SessionSummary).filter(SessionSummary.session_id == session.id).first()
    if not existing_summary:
        summary_payload = generate_session_summary_data(
            skill_name=session.skill_name,
            teacher_name=teacher.full_name if teacher else "Teacher",
            learner_name=learner.full_name if learner else "Learner",
            duration_minutes=session.duration_minutes,
            objective=session.objective or ""
        )
        summary_record = SessionSummary(
            session_id=session.id,
            user_id=session.learner_id,
            skill_name=session.skill_name,
            title=summary_payload.get("title", f"{session.skill_name} Learning Summary"),
            teacher_name=teacher.full_name if teacher else "Teacher",
            learner_name=learner.full_name if learner else "Learner",
            duration_minutes=session.duration_minutes,
            session_date=session.completed_at or now_utc,
            learning_objective=summary_payload.get("learning_objective", session.objective or ""),
            key_concepts=summary_payload.get("key_concepts", []),
            important_points=summary_payload.get("important_points", []),
            practical_tips=summary_payload.get("practical_tips", []),
            questions_discussed=summary_payload.get("questions_discussed", []),
            main_takeaways=summary_payload.get("main_takeaways", []),
            suggested_revision_points=summary_payload.get("suggested_revision_points", []),
            suggested_next_steps=summary_payload.get("suggested_next_steps", []),
            raw_summary=summary_payload.get("raw_summary", "")
        )
        db.add(summary_record)

    # 4. Award BRONZE Achievement for the skill (never downgrade if higher exists)
    achievement = db.query(Achievement).filter(
        Achievement.user_id == session.learner_id,
        Achievement.skill_name == session.skill_name
    ).first()

    if not achievement:
        achievement = Achievement(
            user_id=session.learner_id,
            skill_name=session.skill_name,
            badge_level="BRONZE",
            source_session_id=session.id,
            assessment_status="scheduled",
            awarded_at=now_utc
        )
        db.add(achievement)
    else:
        # Keep existing badge if already BRONZE/SILVER/GOLD, update session reference and status
        achievement.source_session_id = session.id
        achievement.assessment_status = "scheduled"
        achievement.updated_at = now_utc

    # 5. Schedule Skill Assessment (available in 2 days)
    existing_assessment = db.query(SkillAssessment).filter(
        SkillAssessment.session_id == session.id
    ).first()

    available_date = now_utc + timedelta(days=2)

    if not existing_assessment:
        questions_list = generate_skill_assessment_questions(session.skill_name, session.objective or "")
        assessment_record = SkillAssessment(
            user_id=session.learner_id,
            session_id=session.id,
            skill_name=session.skill_name,
            topic=session.objective or f"{session.skill_name} Core Concepts",
            status="scheduled",
            available_at=available_date,
            questions=questions_list,
            submitted_answers={},
            score=0.0,
            percentage=0.0,
            badge_awarded="BRONZE"
        )
        db.add(assessment_record)

    # 6. Notifications
    notif_teacher = Notification(
        user_id=session.teacher_id,
        title="Session Completed & Tokens Released! 🪙",
        message=f"You earned +{session.token_price} 🪙 tokens for teaching '{session.skill_name}'.",
        type="wallet",
        link="/wallet"
    )
    notif_learner = Notification(
        user_id=session.learner_id,
        title="Session Completed & Bronze Badge Awarded! 🥉",
        message=f"Congratulations! You completed '{session.skill_name}' and earned Bronze. Your Skill Assessment is scheduled for {available_date.strftime('%b %d, %Y')}.",
        type="session",
        link=f"/sessions/{session.id}"
    )
    db.add(notif_teacher)
    db.add(notif_learner)

    db.commit()
    return {
        "message": "Session completed successfully. Summary generated, Bronze awarded, and Assessment scheduled.",
        "session_id": session.id,
        "badge": "BRONZE",
        "assessment_available_at": available_date.isoformat()
    }


@router.post("/{session_id}/cancel")
def cancel_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(DBSession).filter(
        DBSession.id == session_id,
        (DBSession.teacher_id == current_user.id) | (DBSession.learner_id == current_user.id)
    ).first()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    if session.status in ["completed", "cancelled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel session with status {session.status}.")

    session.status = "cancelled"
    
    # Refund escrow back to learner
    learner_wallet = db.query(Wallet).filter(Wallet.user_id == session.learner_id).first()
    if learner_wallet:
        learner_wallet.pending_balance = max(0, learner_wallet.pending_balance - session.token_price)
        learner_wallet.available_balance += session.token_price
        
        refund_tx = TokenTransaction(
            wallet_id=learner_wallet.id,
            type="refunded",
            amount=session.token_price,
            description=f"Refund for cancelled session '{session.skill_name}'",
            status="completed",
            reference_id=session.id
        )
        db.add(refund_tx)

    hold = db.query(TokenHold).filter(TokenHold.session_id == session.id).first()
    if hold:
        hold.status = "refunded"

    db.commit()
    return {"message": "Session cancelled and tokens refunded back to learner wallet."}
