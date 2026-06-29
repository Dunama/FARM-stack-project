from datetime import datetime

from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException

from config import db
from models.service import CreateService, UpdateService
from schemas.service import ServiceEntity, serialize_services

router = APIRouter(prefix="/services", tags=["Services"])

_col = lambda: db.UserDB.services


@router.post("/create", status_code=201)
async def create_service(service: CreateService):
    """Create a new service."""
    if _col().find_one({"name": service.name}):
        raise HTTPException(status_code=409, detail="Service name already exists.")

    payload = service.dict()
    payload["created_at"] = datetime.utcnow()
    payload["updated_at"] = datetime.utcnow()

    result = _col().insert_one(payload)
    created = _col().find_one({"_id": result.inserted_id})
    return {"message": "Service created.", "service": ServiceEntity(created)}


@router.get("/get")
async def get_all_services():
    """Retrieve all services."""
    return {"message": "Services retrieved.", "services": serialize_services(_col().find())}


@router.get("/get/{service_id}")
async def get_service(service_id: str):
    """Retrieve a single service by ID."""
    try:
        service = _col().find_one({"_id": ObjectId(service_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service ID format.")
    if not service:
        raise HTTPException(status_code=404, detail="Service not found.")
    return {"message": "Service found.", "service": ServiceEntity(service)}


@router.put("/update/{service_id}")
async def update_service(service_id: str, service: UpdateService):
    """Update a service."""
    try:
        oid = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service ID format.")

    payload = {k: v for k, v in service.dict().items() if v is not None}
    payload["updated_at"] = datetime.utcnow()

    result = _col().update_one({"_id": oid}, {"$set": payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found.")

    updated = _col().find_one({"_id": oid})
    return {"message": "Service updated.", "service": ServiceEntity(updated)}


@router.delete("/delete/{service_id}")
async def delete_service(service_id: str):
    """Delete a service."""
    try:
        oid = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service ID format.")

    result = _col().delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found.")
    return {"message": "Service deleted."}
