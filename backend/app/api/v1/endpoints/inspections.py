from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.external_api import call_external_analysis_api

router = APIRouter()

@router.post("/new")
async def create_new_inspection(payload: dict, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Call External API
        api_result = await call_external_analysis_api(payload)
        
        # 2. Process data for frontend JSON response
        response_data = {
            "status": "success",
            "inspection_data": payload,
            "analysis": api_result,
            "compliance": {
                "is_compliant": api_result.get("is_compliant", True),
                "score": api_result.get("score", 100)
            }
        }
        
        # 3. Save to database (optional step based on requirements)
        
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing inspection: {str(e)}"
        )