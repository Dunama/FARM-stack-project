from typing import Optional
from pydantic import BaseModel


class CreateService(BaseModel):
    name:        str
    description: Optional[str] = None
    endpoint:    Optional[str] = None
    is_active:   bool = True


class UpdateService(BaseModel):
    name:        Optional[str] = None
    description: Optional[str] = None
    endpoint:    Optional[str] = None
    is_active:   Optional[bool] = None
