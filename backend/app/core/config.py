from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SIH Inspection Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE"  # Use openssl rand -hex 32
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days

    # PostgreSQL Database URL
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/sih_db"

    # External API Keys
    EXTERNAL_API_URL: str = "https://api.external-service.com/v1"
    EXTERNAL_API_KEY: str = "your_external_api_key"

    class Config:
        env_file = ".env"

settings = Settings()