from routers.student import router as student_router
from fastapi import FastAPI 
app = FastAPI()



app.include_router(student_router)