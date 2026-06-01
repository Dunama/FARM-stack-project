from pydantic import BaseModel
# from bson import ObjectId   

class Student(BaseModel):
    student_id: str
    fname: str
    lname: str
    age: int
    level: str
    email: str
    gpa: float
    cgpa: float
