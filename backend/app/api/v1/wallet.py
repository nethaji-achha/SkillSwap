from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.all_models import User, Wallet, TokenTransaction, TokenHold, TokenPackage
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet & Tokens"])

@router.get("")
@router.get("/balance")
def get_wallet_balance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = current_user.wallet
    if not wallet:
        wallet = Wallet(user_id=current_user.id, available_balance=15)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        
    return {
        "available_balance": wallet.available_balance,
        "pending_balance": wallet.pending_balance,
        "earned_total": wallet.earned_total,
        "spent_total": wallet.spent_total,
        "purchased_total": wallet.purchased_total,
        "updated_at": wallet.updated_at
    }

@router.get("/transactions")
def get_wallet_transactions(
    type_filter: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = current_user.wallet
    if not wallet:
        return []
        
    query = db.query(TokenTransaction).filter(TokenTransaction.wallet_id == wallet.id)
    if type_filter and type_filter != "all":
        query = query.filter(TokenTransaction.type == type_filter)
        
    transactions = query.order_by(TokenTransaction.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": t.id,
            "type": t.type,
            "amount": t.amount,
            "description": t.description,
            "status": t.status,
            "reference_id": t.reference_id,
            "created_at": t.created_at
        } for t in transactions
    ]

@router.get("/packages")
def get_token_packages(db: Session = Depends(get_db)):
    packages = db.query(TokenPackage).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "tokens": p.tokens,
            "price_inr": p.price_inr,
            "is_popular": p.is_popular,
            "badge": p.badge
        } for p in packages
    ]
