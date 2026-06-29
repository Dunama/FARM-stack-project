from datetime import datetime

from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException

from config import db
from models.role import CreateRole, UpdateRole
from schemas.role import RoleEntity, serialize_roles

router = APIRouter(prefix="/roles", tags=["Roles"])

_col = lambda: db.UserDB.roles


@router.post("/create", status_code=201)
async def create_role(role: CreateRole):
    """Create a new role."""
    if _col().find_one({"name": role.name}):
        raise HTTPException(status_code=409, detail="Role name already exists.")

    payload = role.dict()
    payload["created_at"] = datetime.utcnow()
    payload["updated_at"] = datetime.utcnow()

    result = _col().insert_one(payload)
    created = _col().find_one({"_id": result.inserted_id})
    return {"message": "Role created.", "role": RoleEntity(created)}


@router.get("/get")
async def get_all_roles():
    """Retrieve all roles."""
    return {"message": "Roles retrieved.", "roles": serialize_roles(_col().find())}


@router.get("/get/{role_id}")
async def get_role(role_id: str):
    """Retrieve a single role by ID."""
    try:
        role = _col().find_one({"_id": ObjectId(role_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid role ID format.")
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    return {"message": "Role found.", "role": RoleEntity(role)}


@router.put("/update/{role_id}")
async def update_role(role_id: str, role: UpdateRole):
    """Update a role."""
    try:
        oid = ObjectId(role_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid role ID format.")

    payload = {k: v for k, v in role.dict().items() if v is not None}
    payload["updated_at"] = datetime.utcnow()

    result = _col().update_one({"_id": oid}, {"$set": payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Role not found.")

    updated = _col().find_one({"_id": oid})
    return {"message": "Role updated.", "role": RoleEntity(updated)}


@router.delete("/delete/{role_id}")
async def delete_role(role_id: str):
    """Delete a role."""
    try:
        oid = ObjectId(role_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid role ID format.")

    result = _col().delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Role not found.")
    return {"message": "Role deleted."}
