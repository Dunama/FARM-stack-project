from typing import Optional
from pydantic import BaseModel


class CreateRole(BaseModel):
    name:        str
    description: Optional[str] = None
    is_active:   bool = True


class UpdateRole(BaseModel):
    name:        Optional[str] = None
    description: Optional[str] = None
    is_active:   Optional[bool] = None
