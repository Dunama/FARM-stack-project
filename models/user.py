from typing import Optional
from pydantic import BaseModel
from enum import Enum


class VerificationStatus(str, Enum):
    pending   = "pending"
    verified  = "verified"
    rejected  = "rejected"
    suspended = "suspended"


class CreateUser(BaseModel):
    role_id:           Optional[str] = None
    admin_group_id:    Optional[str] = None
    service_id:        Optional[str] = None
    permission_id:     Optional[str] = None
    full_name:         str
    email:             str
    password_hash:     Optional[str] = None
    phone:             Optional[str] = None
    address:           Optional[str] = None
    city:              Optional[str] = None
    state:             Optional[str] = None
    country:           Optional[str] = None
    date_of_birth:     Optional[str] = None
    profile_image_url: Optional[str] = None
    nin:               Optional[str] = None
    specialization:    Optional[str] = None
    marketing_consent: bool = False
    is_active:         bool = True
    is_available:      bool = True
    verification_status: VerificationStatus = VerificationStatus.pending


class UpdateUser(BaseModel):
    role_id:           Optional[str] = None
    admin_group_id:    Optional[str] = None
    service_id:        Optional[str] = None
    permission_id:     Optional[str] = None
    full_name:         Optional[str] = None
    email:             Optional[str] = None
    phone:             Optional[str] = None
    address:           Optional[str] = None
    city:              Optional[str] = None
    state:             Optional[str] = None
    country:           Optional[str] = None
    date_of_birth:     Optional[str] = None
    profile_image_url: Optional[str] = None
    nin:               Optional[str] = None
    specialization:    Optional[str] = None
    marketing_consent: Optional[bool] = None
    is_active:         Optional[bool] = None
    is_available:      Optional[bool] = None
    verification_status: Optional[VerificationStatus] = None
