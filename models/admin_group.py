from typing import Optional, List
from pydantic import BaseModel


class CreateAdminGroup(BaseModel):
    name:           str
    description:    Optional[str] = None
    permission_ids: List[str] = []
    is_active:      bool = True


class UpdateAdminGroup(BaseModel):
    name:           Optional[str] = None
    description:    Optional[str] = None
    permission_ids: Optional[List[str]] = None
    is_active:      Optional[bool] = None
