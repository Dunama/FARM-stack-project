def ServiceEntity(item) -> dict:
    return {
        "service_id":  str(item["_id"]),
        "name":        item.get("name"),
        "description": item.get("description"),
        "endpoint":    item.get("endpoint"),
        "is_active":   item.get("is_active", True),
        "created_at":  str(item["created_at"]) if item.get("created_at") else None,
        "updated_at":  str(item["updated_at"]) if item.get("updated_at") else None,
    }


def serialize_services(items) -> list:
    return [ServiceEntity(item) for item in items]
