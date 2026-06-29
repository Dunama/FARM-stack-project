from datetime import datetime

from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException

from config import db
from models.admin_group import CreateAdminGroup, UpdateAdminGroup
from schemas.admin_group import AdminGroupEntity, serialize_admin_groups

router = APIRouter(prefix="/admin-groups", tags=["Admin Groups"])

_col = lambda: db.UserDB.admin_groups


@router.post("/create", status_code=201)
async def create_admin_group(group: CreateAdminGroup):
    """Create a new admin group."""
    if _col().find_one({"name": group.name}):
        raise HTTPException(status_code=409, detail="Group name already exists.")

    payload = group.dict()
    payload["created_at"] = datetime.utcnow()
    payload["updated_at"] = datetime.utcnow()

    result = _col().insert_one(payload)
    created = _col().find_one({"_id": result.inserted_id})
    return {"message": "Admin group created.", "group": AdminGroupEntity(created)}


@router.get("/get")
async def get_all_admin_groups():
    """Retrieve all admin groups."""
    return {"message": "Groups retrieved.", "groups": serialize_admin_groups(_col().find())}


@router.get("/get/{group_id}")
async def get_admin_group(group_id: str):
    """Retrieve a single admin group by ID."""
    try:
        group = _col().find_one({"_id": ObjectId(group_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid group ID format.")
    if not group:
        raise HTTPException(status_code=404, detail="Admin group not found.")
    return {"message": "Group found.", "group": AdminGroupEntity(group)}


@router.put("/update/{group_id}")
async def update_admin_group(group_id: str, group: UpdateAdminGroup):
    """Update an admin group."""
    try:
        oid = ObjectId(group_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid group ID format.")

    payload = {k: v for k, v in group.dict().items() if v is not None}
    payload["updated_at"] = datetime.utcnow()

    result = _col().update_one({"_id": oid}, {"$set": payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Admin group not found.")

    updated = _col().find_one({"_id": oid})
    return {"message": "Group updated.", "group": AdminGroupEntity(updated)}


@router.delete("/delete/{group_id}")
async def delete_admin_group(group_id: str):
    """Delete an admin group."""
    try:
        oid = ObjectId(group_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid group ID format.")

    result = _col().delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin group not found.")
    return {"message": "Admin group deleted."}
