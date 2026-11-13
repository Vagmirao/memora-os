from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.db.models import User
from backend.app.schemas.user import UserCreate, UserResponse


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(
            (User.username == user_data.username)
            | (User.email == user_data.email)
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists.",
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user