from models.student import Student
from fastapi import APIRouter
from config import db
from schemas.student import StudentEntities, serialize_students
from bson.objectid import ObjectId

# init the router for students
router = APIRouter(prefix="/students")

@router.post("/create")
async def post_student(student: Student):
    ''' to create a student  '''
    db.StudentDB.students.insert_one(student.dict())
    return {"message": "Student created successfully"}  

@router.get("/get/{student_id}")
async def get_single_student(student_id: str):
    ''' To get a single student using their ID '''
    try:
        student = db.StudentDB.students.find_one({"_id": ObjectId(student_id)})
        if student:     
            return {"message": "student found",
                    "student": StudentEntities(student)}
        else:
            return {"message": "Student not found"}
    except Exception as e:
        return {"message": "An error occurred while fetching the student",
                "error": str(e)}
    
@router.get("/get")
async def get_all_students():
    '''to get all students in DB'''
    students = db.StudentDB.students.find()
    return {"message": "students found",
            "students": serialize_students(students)}

@router.put("/update/{student_id}")
async def update_student(student_id: str, student: Student):
    ''' To update a student using their ID '''
    try:
        result = db.StudentDB.students.update_one(
            {"_id": ObjectId(student_id)},
            {"$set": student.dict()}
        )
        if result.modified_count > 0:
            updated_student = db.StudentDB.students.find_one({"_id": ObjectId(student_id)})
            return {"message": "student updated successfully",
                    "student": StudentEntities(updated_student)}
        else:
            return {"message": "Student not found"}
    except Exception as e:
        return {"message": "An error occurred while updating the student",
                "error": str(e)}

@router.delete("/delete/{student_id}")
async def delete_student(student_id: str):
    ''' To delete a student using their ID '''
    try:
        result = db.StudentDB.students.delete_one({"_id": ObjectId(student_id)})
        if result.deleted_count > 0:
            return {"message": "student deleted successfully"}
        else:
            return {"message": "Student not found"}
    except Exception as e:
        return {"message": "An error occurred while deleting the student",
                "error": str(e)}