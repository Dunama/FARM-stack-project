# schemas help to serialize and deserialize data, and also to validate the data      
# Serialization is the process of converting Python
#  objects (or database documents) into a format that can be easily transmitted or displayed—typically JSON.

def StudentEntities(items) -> dict:
    ''' converts data into json format'''
    return{
        "student_id": str(items["_id"]),  #converts ObjectID to string,
        "fname": items["fname"],
        "lname": items["lname"],
        "age": items["age"],
        "level": items["level"],
        "email": items["email"],
        "gpa": items["gpa"],
        "cgpa": items["cgpa"]         
    }    

def serialize_students(items) -> list:
    return [StudentEntities(item) for item in items]