from typing import Optional

from pydantic import BaseModel

class Student(BaseModel):
    student_id: Optional[str] = None
    fname: str
    lname: str
    age: int
    level: str
    email: str
    gpa: float
    cgpa: float
