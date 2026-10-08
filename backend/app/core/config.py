import os
from typing import List
from pydantic_settings import BaseSettings

def get_default_db_url() -> str:
    db = os.getenv("DATABASE_URL")
    if db:
        if db.startswith("postgres://"):
            return db.replace("postgres://", "postgresql://", 1)
        return db
    # On Vercel / serverless lambda, the root filesystem is read-only except /tmp
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return "sqlite:////tmp/skillswap.db"
    return "sqlite:///./skillswap.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "skill-swap")
    PROJECT_ID: str = os.getenv("PROJECT_ID", "6ac7709ac8a34010060c5a71")
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database
    DATABASE_URL: str = get_default_db_url()
    MONGODB_URL: str = os.getenv("MONGODB_URL") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017/skillswap"
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "skillswap")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-skillswap-jwt-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://skillswap.app",
    ]
    
    # Razorpay Payment Integration
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholder")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rzp_secret_placeholder")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "rzp_webhook_secret_placeholder")
    PAYMENT_MODE: str = os.getenv("PAYMENT_MODE", "test")
    
    # AI Engine - Google Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        case_sensitive = True
        env_file = (".env", ".env.local")
        extra = "ignore"


settings = Settings()
