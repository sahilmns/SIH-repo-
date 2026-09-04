from fastapi import APIRouter
from app.api.v1.endpoints import auth, inspections

api_router = APIRouter()

# Register sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])