def AdminGroupEntity(item) -> dict:
    return {
        "group_id":       str(item["_id"]),
        "name":           item.get("name"),
        "description":    item.get("description"),
        "permission_ids": item.get("permission_ids", []),
        "is_active":      item.get("is_active", True),
        "created_at":     str(item["created_at"]) if item.get("created_at") else None,
        "updated_at":     str(item["updated_at"]) if item.get("updated_at") else None,
    }


def serialize_admin_groups(items) -> list:
    return [AdminGroupEntity(item) for item in items]
