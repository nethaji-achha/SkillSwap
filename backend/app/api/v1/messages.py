from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.app.db.session import get_db
from backend.app.db.mongodb import get_mongo_db
from backend.app.models.all_models import User, Message, Notification
from backend.app.schemas.all_schemas import MessageCreate
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/messages", tags=["Messaging"])

def get_convo_id(u1: str, u2: str) -> str:
    return "_".join(sorted([u1, u2]))

@router.get("/conversations")
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Find all messages where current user is sender or receiver
    all_msgs = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).all()
    
    convo_map = {}
    for m in all_msgs:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_id not in convo_map:
            other_user = db.query(User).filter(User.id == other_id).first()
            unread_count = db.query(Message).filter(
                Message.sender_id == other_id,
                Message.receiver_id == current_user.id,
                Message.is_read == False
            ).count()
            
            convo_map[other_id] = {
                "id": m.conversation_id,
                "partner_id": other_id,
                "partner_name": other_user.full_name if other_user else "User",
                "partner_avatar": other_user.profile.avatar_url if other_user and other_user.profile else "",
                "partner_headline": other_user.profile.headline if other_user and other_user.profile else "",
                "last_message": m.content,
                "last_message_at": m.created_at,
                "unread_count": unread_count
            }
            
    return list(convo_map.values())

@router.get("/conversation/{partner_id}")
def get_conversation_messages(partner_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convo_id = get_convo_id(current_user.id, partner_id)
    messages = db.query(Message).filter(Message.conversation_id == convo_id).order_by(Message.created_at.asc()).all()
    
    # Mark unread messages as read
    db.query(Message).filter(
        Message.conversation_id == convo_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "receiver_id": m.receiver_id,
            "content": m.content,
            "is_read": m.is_read,
            "created_at": m.created_at
        } for m in messages
    ]

@router.post("/send")
async def send_message(
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Optional[AsyncIOMotorDatabase] = Depends(get_mongo_db)
):
    receiver = db.query(User).filter(User.id == msg_in.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver not found")
        
    convo_id = get_convo_id(current_user.id, msg_in.receiver_id)
    
    # 1. Persist in Relational DB
    msg = Message(
        conversation_id=convo_id,
        sender_id=current_user.id,
        receiver_id=msg_in.receiver_id,
        content=msg_in.content,
        is_read=False
    )
    db.add(msg)
    
    # Send notification to receiver
    notif = Notification(
        user_id=receiver.id,
        title=f"New message from {current_user.full_name}",
        message=msg_in.content[:100],
        type="message",
        link="/messages"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(msg)
    
    # 2. Persist in MongoDB document store for fast unstructured access & archiving
    if mongo_db is not None:
        try:
            await mongo_db["chat_messages"].insert_one({
                "message_id": msg.id,
                "conversation_id": convo_id,
                "sender_id": current_user.id,
                "receiver_id": msg_in.receiver_id,
                "content": msg_in.content,
                "is_read": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        except Exception:
            pass
    
    return {
        "id": msg.id,
        "conversation_id": convo_id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "created_at": msg.created_at
    }

