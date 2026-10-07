import hmac
import hashlib
import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.models.all_models import (
    User, Wallet, Payment, TokenTransaction, TokenPackage, SubscriptionPlan, UserSubscription, Notification
)
from backend.app.schemas.all_schemas import RazorpayOrderCreate, RazorpayVerifyRequest
from backend.app.api.v1.deps import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments (Razorpay)"])

@router.post("/create-order")
def create_razorpay_order(
    order_in: RazorpayOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    amount_inr = 0
    tokens_to_credit = 0
    package = None
    sub_plan = None
    
    if order_in.purpose == "token_purchase":
        package = db.query(TokenPackage).filter(TokenPackage.id == order_in.package_id).first()
        if not package:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid token package selected.")
        amount_inr = package.price_inr
        tokens_to_credit = package.tokens
    elif order_in.purpose == "subscription":
        sub_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == order_in.subscription_plan_id).first()
        if not sub_plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid subscription plan selected.")
        amount_inr = sub_plan.price_inr
        tokens_to_credit = sub_plan.tokens_per_month
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported payment purpose.")
        
    # Generate Razorpay Order or Mock Razorpay Order ID in sandbox/test mode
    # In live/sandbox with credentials, we initialize razorpay client
    amount_paise = amount_inr * 100
    razorpay_order_id = f"order_ss_{uuid.uuid4().hex[:14]}"
    
    if settings.RAZORPAY_KEY_ID and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_placeholder"):
        try:
            import razorpay
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"rcpt_{uuid.uuid4().hex[:10]}",
                "notes": {
                    "user_id": current_user.id,
                    "purpose": order_in.purpose,
                    "package_id": package.id if package else "",
                    "plan_id": sub_plan.id if sub_plan else ""
                }
            })
            razorpay_order_id = razorpay_order["id"]
        except Exception as e:
            # Fallback to internal order generation if gateway unreachable
            pass
            
    # Record payment entry in database
    payment = Payment(
        user_id=current_user.id,
        razorpay_order_id=razorpay_order_id,
        amount_inr=amount_inr,
        currency="INR",
        purpose=order_in.purpose,
        tokens_credited=tokens_to_credit,
        package_id=package.id if package else None,
        subscription_plan_id=sub_plan.id if sub_plan else None,
        status="created"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return {
        "order_id": razorpay_order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "payment_record_id": payment.id,
        "package_name": package.name if package else (sub_plan.name if sub_plan else ""),
        "tokens": tokens_to_credit,
        "user_email": current_user.email,
        "user_name": current_user.full_name
    }

@router.post("/verify")
def verify_razorpay_payment(
    verify_in: RazorpayVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == verify_in.razorpay_order_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found for verification.")
        
    # Idempotent protection against duplicate payment processing
    if payment.status == "success":
        wallet = current_user.wallet
        return {
            "status": "success",
            "message": "Payment already verified.",
            "tokens_added": payment.tokens_credited,
            "new_balance": wallet.available_balance if wallet else 0,
            "transaction_id": payment.id
        }
        
    # Verify signature if live credentials
    is_valid_signature = True
    if settings.RAZORPAY_KEY_SECRET and not settings.RAZORPAY_KEY_SECRET.startswith("rzp_secret_placeholder"):
        try:
            generated_signature = hmac.new(
                bytes(settings.RAZORPAY_KEY_SECRET, 'utf-8'),
                bytes(f"{verify_in.razorpay_order_id}|{verify_in.razorpay_payment_id}", 'utf-8'),
                hashlib.sha256
            ).hexdigest()
            is_valid_signature = (generated_signature == verify_in.razorpay_signature)
        except Exception:
            is_valid_signature = False

    if not is_valid_signature:
        payment.status = "failed"
        payment.error_message = "Signature verification failed"
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed.")

    # Payment verified! Execute atomic database updates
    payment.razorpay_payment_id = verify_in.razorpay_payment_id
    payment.razorpay_signature = verify_in.razorpay_signature
    payment.status = "success"
    
    wallet = current_user.wallet
    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        db.flush()
        
    wallet.available_balance += payment.tokens_credited
    wallet.purchased_total += payment.tokens_credited
    
    # Record transaction in wallet
    tx = TokenTransaction(
        wallet_id=wallet.id,
        type="purchased",
        amount=payment.tokens_credited,
        description=f"Purchased {payment.tokens_credited} 🪙 tokens via Razorpay",
        status="completed",
        reference_id=payment.id
    )
    db.add(tx)
    
    # If subscription payment, update user subscription
    if payment.purpose == "subscription" and payment.subscription_plan_id:
        sub_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == payment.subscription_plan_id).first()
        if sub_plan:
            sub = current_user.subscription
            if not sub:
                sub = UserSubscription(user_id=current_user.id)
                db.add(sub)
            sub.plan_slug = sub_plan.slug
            sub.status = "active"
            
    # Send user notification
    notif = Notification(
        user_id=current_user.id,
        title="Payment Successful 🎉",
        message=f"You successfully received +{payment.tokens_credited} 🪙 Skill Swap tokens!",
        type="wallet",
        link="/wallet"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(wallet)
    
    return {
        "status": "success",
        "message": "Payment verified successfully",
        "tokens_added": payment.tokens_credited,
        "new_balance": wallet.available_balance,
        "transaction_id": payment.id,
        "payment_id": payment.razorpay_payment_id
    }

@router.get("/history")
def get_payment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "razorpay_order_id": p.razorpay_order_id,
            "razorpay_payment_id": p.razorpay_payment_id,
            "amount_inr": p.amount_inr,
            "currency": p.currency,
            "purpose": p.purpose,
            "tokens_credited": p.tokens_credited,
            "status": p.status,
            "created_at": p.created_at
        } for p in payments
    ]

@router.get("/{payment_id}")
def get_payment_detail(payment_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.user_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return {
        "id": payment.id,
        "razorpay_order_id": payment.razorpay_order_id,
        "razorpay_payment_id": payment.razorpay_payment_id,
        "amount_inr": payment.amount_inr,
        "tokens_credited": payment.tokens_credited,
        "status": payment.status,
        "created_at": payment.created_at
    }
