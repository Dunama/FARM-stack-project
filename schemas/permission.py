def PermissionEntity(item) -> dict:
    return {
        "permission_id": str(item["_id"]),
        "name":          item.get("name"),
        "resource":      item.get("resource"),
        "action":        item.get("action"),
        "description":   item.get("description"),
        "created_at":    str(item["created_at"]) if item.get("created_at") else None,
        "updated_at":    str(item["updated_at"]) if item.get("updated_at") else None,
    }


def serialize_permissions(items) -> list:
    return [PermissionEntity(item) for item in items]
