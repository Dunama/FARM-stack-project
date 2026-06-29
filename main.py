from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.student     import router as student_router
from routers.user        import router as user_router
from routers.role        import router as role_router
from routers.admin_group import router as admin_group_router
from routers.service     import router as service_router
from routers.permission  import router as permission_router
from routers.admin       import router as admin_router

app = FastAPI(
    title="FARM Stack API",
    description="Student & User management API with admin features.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Legacy student endpoints (kept for backwards compatibility)
app.include_router(student_router)

# User management
app.include_router(user_router)
app.include_router(role_router)
app.include_router(admin_group_router)
app.include_router(service_router)
app.include_router(permission_router)

# Admin operations
app.include_router(admin_router)
