from datetime import datetime

from bson.objectid import ObjectId
from fastapi import APIRouter, HTTPException, Request
from fastapi.routing import APIRoute

from config import db
from schemas.user import UserEntity, serialize_users

router = APIRouter(prefix="/admin", tags=["Admin"])

_users       = lambda: db.UserDB.users
_roles       = lambda: db.UserDB.roles
_groups      = lambda: db.UserDB.admin_groups
_services    = lambda: db.UserDB.services
_permissions = lambda: db.UserDB.permissions


# ── Live route registry ───────────────────────────────────────────────────────

@router.get("/routes")
async def list_routes(request: Request):
    """Return every registered API route so the dashboard can render them live.

    Using request.app instead of importing the app object directly avoids the
    circular import that would occur if admin.py imported from main.py.
    """
    routes = []
    for route in request.app.routes:
        if isinstance(route, APIRoute):
            for method in sorted(route.methods):
                routes.append({
                    "path":        route.path,
                    "method":      method,
                    "name":        route.name,
                    "description": route.description or "",
                    "tags":        route.tags or [],
                })
    routes.sort(key=lambda r: (r["tags"], r["path"], r["method"]))
    return {"routes": routes}


# ── Dashboard stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def admin_stats():
    """Aggregate dashboard statistics across all collections."""
    # Students live in a separate DB from users; both are counted so the
    # dashboard can show a complete picture without separate API calls.
    total_students   = db.StudentDB.students.count_documents({})
    total_users      = _users().count_documents({})
    active_users     = _users().count_documents({"is_active": True})
    inactive_users   = _users().count_documents({"is_active": False})
    verified_users   = _users().count_documents({"verification_status": "verified"})
    pending_users    = _users().count_documents({"verification_status": "pending"})
    suspended_users  = _users().count_documents({"verification_status": "suspended"})
    total_roles      = _roles().count_documents({})
    total_groups     = _groups().count_documents({})
    total_services   = _services().count_documents({})
    total_perms      = _permissions().count_documents({})

    return {
        "message": "Stats retrieved.",
        "stats": {
            "students": total_students,
            "users": {
                "total":    total_users,
                "active":   active_users,
                "inactive": inactive_users,
            },
            "verification": {
                "verified":  verified_users,
                "pending":   pending_users,
                "suspended": suspended_users,
            },
            "roles":       total_roles,
            "groups":      total_groups,
            "services":    total_services,
            "permissions": total_perms,
        },
    }


# ── Filtered user lists ──────────────────────────────────────────────────────

@router.get("/users")
async def admin_list_users():
    """Retrieve all users (admin view)."""
    return {"message": "Users retrieved.", "users": serialize_users(_users().find())}


@router.get("/users/active")
async def admin_active_users():
    """List only active users."""
    return {
        "message": "Active users retrieved.",
        "users": serialize_users(_users().find({"is_active": True})),
    }


@router.get("/users/inactive")
async def admin_inactive_users():
    """List only inactive users."""
    return {
        "message": "Inactive users retrieved.",
        "users": serialize_users(_users().find({"is_active": False})),
    }


@router.get("/users/unverified")
async def admin_unverified_users():
    """List users whose verification_status is pending."""
    return {
        "message": "Unverified users retrieved.",
        "users": serialize_users(_users().find({"verification_status": "pending"})),
    }


@router.get("/users/by-role/{role_id}")
async def admin_users_by_role(role_id: str):
    """List all users belonging to a given role."""
    return {
        "message": f"Users with role {role_id}.",
        "users": serialize_users(_users().find({"role_id": role_id})),
    }


@router.get("/users/by-group/{group_id}")
async def admin_users_by_group(group_id: str):
    """List all users belonging to a given admin group."""
    return {
        "message": f"Users in group {group_id}.",
        "users": serialize_users(_users().find({"admin_group_id": group_id})),
    }


# ── Per-user admin actions ───────────────────────────────────────────────────

@router.patch("/users/{user_id}/toggle-status")
async def admin_toggle_status(user_id: str):
    """Toggle a user's is_active flag."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    user = _users().find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    new_status = not user.get("is_active", True)
    _users().update_one({"_id": oid}, {"$set": {"is_active": new_status, "updated_at": datetime.utcnow()}})

    updated = _users().find_one({"_id": oid})
    return {
        "message": f"User {'activated' if new_status else 'deactivated'} successfully.",
        "user": UserEntity(updated),
    }


@router.patch("/users/{user_id}/verify")
async def admin_verify_user(user_id: str):
    """Mark a user's email as verified and set verification_status to verified."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    result = _users().update_one(
        {"_id": oid},
        {
            "$set": {
                "verification_status": "verified",
                "email_verified_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = _users().find_one({"_id": oid})
    return {"message": "User verified successfully.", "user": UserEntity(updated)}


@router.patch("/users/{user_id}/suspend")
async def admin_suspend_user(user_id: str):
    """Set a user's verification_status to suspended and deactivate account."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    result = _users().update_one(
        {"_id": oid},
        {
            "$set": {
                "verification_status": "suspended",
                "is_active": False,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = _users().find_one({"_id": oid})
    return {"message": "User suspended.", "user": UserEntity(updated)}


@router.patch("/users/{user_id}/assign-role/{role_id}")
async def admin_assign_role(user_id: str, role_id: str):
    """Assign a role to a user."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    if not _roles().find_one({"_id": ObjectId(role_id)}):
        raise HTTPException(status_code=404, detail="Role not found.")

    result = _users().update_one(
        {"_id": oid},
        {"$set": {"role_id": role_id, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = _users().find_one({"_id": oid})
    return {"message": "Role assigned.", "user": UserEntity(updated)}


@router.patch("/users/{user_id}/assign-group/{group_id}")
async def admin_assign_group(user_id: str, group_id: str):
    """Assign an admin group to a user."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    if not _groups().find_one({"_id": ObjectId(group_id)}):
        raise HTTPException(status_code=404, detail="Admin group not found.")

    result = _users().update_one(
        {"_id": oid},
        {"$set": {"admin_group_id": group_id, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = _users().find_one({"_id": oid})
    return {"message": "Admin group assigned.", "user": UserEntity(updated)}


@router.patch("/users/{user_id}/assign-service/{service_id}")
async def admin_assign_service(user_id: str, service_id: str):
    """Assign a service to a user."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    if not _services().find_one({"_id": ObjectId(service_id)}):
        raise HTTPException(status_code=404, detail="Service not found.")

    result = _users().update_one(
        {"_id": oid},
        {"$set": {"service_id": service_id, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = _users().find_one({"_id": oid})
    return {"message": "Service assigned.", "user": UserEntity(updated)}


@router.patch("/users/{user_id}/record-login")
async def admin_record_login(user_id: str):
    """Update a user's last_login_at timestamp."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    result = _users().update_one(
        {"_id": oid},
        {"$set": {"last_login_at": datetime.utcnow(), "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = _users().find_one({"_id": oid})
    return {"message": "Login recorded.", "user": UserEntity(updated)}
