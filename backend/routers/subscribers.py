from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models.subscriber import Subscriber
from schemas.subscriber import (
    SubscriberCreate,
    SubscriberResponse,
    SubscriberUnsubscribe,
)
from services.email import send_welcome_email
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscribers", tags=["Subscribers"])


@router.post(
    "/", response_model=SubscriberResponse, status_code=status.HTTP_201_CREATED
)
async def subscribe(
    subscriber_in: SubscriberCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Subscribe an email to the newsletter.
    """

    # Check if user already exists
    existing = (
        db.query(Subscriber).filter(Subscriber.email == subscriber_in.email).first()
    )

    if existing:
        if not existing.confirmed:
            existing.confirmed = True
            existing.unsubscribed_at = None
            db.commit()
            db.refresh(existing)

            # Re-trigger welcome email
            background_tasks.add_task(
                send_welcome_email,
                email=existing.email,
                subscriber_id=existing.id,
                name=existing.name,
            )

            return existing
        else:
            raise HTTPException(status_code=400, detail="Email is already subscribed")

    # Create new subscriber
    new_sub = Subscriber(
        email=subscriber_in.email,
        name=subscriber_in.name,
        confirmed=True,  # In a real app we'd employ double opt-in, but starting simple
    )

    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)

    # Trigger welcome email in the background
    background_tasks.add_task(
        send_welcome_email,
        email=new_sub.email,
        subscriber_id=new_sub.id,
        name=new_sub.name,
    )

    return new_sub


@router.get("/unsubscribe/{subscriber_id}")
async def unsubscribe(subscriber_id: str, db: Session = Depends(get_db)):
    """
    Unsubscribe an email. We just mark unsubscribed_at instead of deleting to keep records.
    """
    subscriber = db.query(Subscriber).filter(Subscriber.id == subscriber_id).first()

    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")

    from datetime import datetime

    subscriber.unsubscribed_at = datetime.utcnow()
    subscriber.confirmed = False

    db.commit()
    return {"message": "You have been successfully unsubscribed."}


@router.post("/unsubscribe")
async def unsubscribe_by_email(
    unsubscribe_in: SubscriberUnsubscribe, db: Session = Depends(get_db)
):
    """
    Unsubscribe an email via web form.
    """
    subscriber = (
        db.query(Subscriber).filter(Subscriber.email == unsubscribe_in.email).first()
    )

    if not subscriber:
        raise HTTPException(status_code=404, detail="Email not found in our records")

    from datetime import datetime

    subscriber.unsubscribed_at = datetime.utcnow()
    subscriber.confirmed = False

    db.commit()
    return {"message": "You have been successfully unsubscribed."}
