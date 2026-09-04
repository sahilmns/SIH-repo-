import httpx
from app.core.config import settings

async def call_external_analysis_api(payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{settings.EXTERNAL_API_URL}/analyze",
            json=payload,
            headers={"Authorization": f"Bearer {settings.EXTERNAL_API_KEY}"}
        )
        response.raise_for_status()
        return response.json()