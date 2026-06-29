import secrets
from datetime import datetime

from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException

from config import db
from models.user import CreateUser, UpdateUser
from schemas.user import UserEntity, serialize_users

router = APIRouter(prefix="/users", tags=["Users"])

_col = lambda: db.UserDB.users


# ── Create ──────────────────────────────────────────────────────────────────

@router.post("/create", status_code=201)
async def create_user(user: CreateUser):
    """Create a new user record."""
    if _col().find_one({"email": user.email}):
        raise HTTPException(status_code=409, detail="Email already registered.")

    payload = {k: v for k, v in user.dict().items() if v is not None}
    payload["verification_token"] = secrets.token_urlsafe(32)
    payload["created_at"] = datetime.utcnow()
    payload["updated_at"] = datetime.utcnow()

    result = _col().insert_one(payload)
    created = _col().find_one({"_id": result.inserted_id})
    return {"message": "User created successfully.", "user": UserEntity(created)}


# ── Read all ─────────────────────────────────────────────────────────────────

@router.get("/get")
async def get_all_users():
    """Retrieve all user records."""
    return {"message": "Users retrieved.", "users": serialize_users(_col().find())}


# ── Read one ─────────────────────────────────────────────────────────────────

@router.get("/get/{user_id}")
async def get_user(user_id: str):
    """Retrieve a single user by ID."""
    try:
        user = _col().find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User found.", "user": UserEntity(user)}


# ── Update ────────────────────────────────────────────────────────────────────

@router.put("/update/{user_id}")
async def update_user(user_id: str, user: UpdateUser):
    """Update an existing user record."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    payload = {k: v for k, v in user.dict().items() if v is not None}
    payload["updated_at"] = datetime.utcnow()

    result = _col().update_one({"_id": oid}, {"$set": payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = _col().find_one({"_id": oid})
    return {"message": "User updated successfully.", "user": UserEntity(updated)}


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/delete/{user_id}")
async def delete_user(user_id: str):
    """Permanently delete a user record."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    result = _col().delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User deleted successfully."}
