from datetime import datetime

from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException

from config import db
from models.permission import CreatePermission, UpdatePermission
from schemas.permission import PermissionEntity, serialize_permissions

router = APIRouter(prefix="/permissions", tags=["Permissions"])

_col = lambda: db.UserDB.permissions


@router.post("/create", status_code=201)
async def create_permission(permission: CreatePermission):
    """Create a new permission."""
    if _col().find_one({"name": permission.name}):
        raise HTTPException(status_code=409, detail="Permission name already exists.")

    payload = permission.dict()
    payload["created_at"] = datetime.utcnow()
    payload["updated_at"] = datetime.utcnow()

    result = _col().insert_one(payload)
    created = _col().find_one({"_id": result.inserted_id})
    return {"message": "Permission created.", "permission": PermissionEntity(created)}


@router.get("/get")
async def get_all_permissions():
    """Retrieve all permissions."""
    return {
        "message": "Permissions retrieved.",
        "permissions": serialize_permissions(_col().find()),
    }


@router.get("/get/{permission_id}")
async def get_permission(permission_id: str):
    """Retrieve a single permission by ID."""
    try:
        perm = _col().find_one({"_id": ObjectId(permission_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid permission ID format.")
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found.")
    return {"message": "Permission found.", "permission": PermissionEntity(perm)}


@router.put("/update/{permission_id}")
async def update_permission(permission_id: str, permission: UpdatePermission):
    """Update a permission."""
    try:
        oid = ObjectId(permission_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid permission ID format.")

    payload = {k: v for k, v in permission.dict().items() if v is not None}
    payload["updated_at"] = datetime.utcnow()

    result = _col().update_one({"_id": oid}, {"$set": payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Permission not found.")

    updated = _col().find_one({"_id": oid})
    return {"message": "Permission updated.", "permission": PermissionEntity(updated)}


@router.delete("/delete/{permission_id}")
async def delete_permission(permission_id: str):
    """Delete a permission."""
    try:
        oid = ObjectId(permission_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid permission ID format.")

    result = _col().delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Permission not found.")
    return {"message": "Permission deleted."}
