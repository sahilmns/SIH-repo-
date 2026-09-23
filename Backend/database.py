import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# --------------------------------------------------
# Load .env file
# --------------------------------------------------

env_path = Path(__file__).resolve().parent / ".env"

print("Looking for .env at:", env_path)
print(".env exists:", env_path.exists())

load_dotenv(env_path)


# --------------------------------------------------
# Database configuration
# --------------------------------------------------

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")


# --------------------------------------------------
# Debug information
# --------------------------------------------------

print("DB_USER:", DB_USER)
print("DB_HOST:", DB_HOST)
print("DB_PORT:", DB_PORT)
print("DB_NAME:", DB_NAME)


# --------------------------------------------------
# Database URL
# --------------------------------------------------

DATABASE_URL = (
    f"postgresql+psycopg2://"
    f"{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)


# --------------------------------------------------
# SQLAlchemy Engine
# --------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# --------------------------------------------------
# Database Session
# --------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# --------------------------------------------------
# Base class for SQLAlchemy models
# --------------------------------------------------

Base = declarative_base()


# --------------------------------------------------
# FastAPI database dependency
# --------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# --------------------------------------------------
# Test database connection
# --------------------------------------------------

if __name__ == "__main__":

    try:
        with engine.connect() as connection:

            print()
            print("========================================")
            print("PostgreSQL connection successful!")
            print(f"Connected to database: {DB_NAME}")
            print("========================================")

    except Exception as e:

        print()
        print("========================================")
        print("PostgreSQL connection failed!")
        print("========================================")
        print(e)
