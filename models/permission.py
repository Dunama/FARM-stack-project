from typing import Optional
from pydantic import BaseModel


class CreatePermission(BaseModel):
    name:        str
    resource:    str
    action:      str
    description: Optional[str] = None


class UpdatePermission(BaseModel):
    name:        Optional[str] = None
    resource:    Optional[str] = None
    action:      Optional[str] = None
    description: Optional[str] = None
