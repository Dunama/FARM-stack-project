def RoleEntity(item) -> dict:
    return {
        "role_id":     str(item["_id"]),
        "name":        item.get("name"),
        "description": item.get("description"),
        "is_active":   item.get("is_active", True),
        "created_at":  str(item["created_at"]) if item.get("created_at") else None,
        "updated_at":  str(item["updated_at"]) if item.get("updated_at") else None,
    }


def serialize_roles(items) -> list:
    return [RoleEntity(item) for item in items]
