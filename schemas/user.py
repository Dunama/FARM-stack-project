def UserEntity(item) -> dict:
    return {
        "user_id":            str(item["_id"]),
        "role_id":            item.get("role_id"),
        "admin_group_id":     item.get("admin_group_id"),
        "service_id":         item.get("service_id"),
        "permission_id":      item.get("permission_id"),
        "full_name":          item.get("full_name"),
        "email":              item.get("email"),
        "phone":              item.get("phone"),
        "address":            item.get("address"),
        "city":               item.get("city"),
        "state":              item.get("state"),
        "country":            item.get("country"),
        "date_of_birth":      item.get("date_of_birth"),
        "profile_image_url":  item.get("profile_image_url"),
        "nin":                item.get("nin"),
        "specialization":     item.get("specialization"),
        "marketing_consent":  item.get("marketing_consent", False),
        "is_active":          item.get("is_active", True),
        "is_available":       item.get("is_available", True),
        "verification_status": item.get("verification_status", "pending"),
        "email_verified_at":  str(item["email_verified_at"]) if item.get("email_verified_at") else None,
        "created_at":         str(item["created_at"])        if item.get("created_at")        else None,
        "updated_at":         str(item["updated_at"])        if item.get("updated_at")        else None,
        "last_login_at":      str(item["last_login_at"])     if item.get("last_login_at")     else None,
    }


def serialize_users(items) -> list:
    return [UserEntity(item) for item in items]
