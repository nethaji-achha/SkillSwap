import logging
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure root and backend directory are in sys.path for Vercel serverless / container execution
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
for p in (str(ROOT_DIR), str(BASE_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.db.init_db import init_db
from backend.app.db.mongodb import connect_to_mongo, close_mongo_connection

logger = logging.getLogger(__name__)

# API Routers
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.users import router as users_router
from backend.app.api.v1.skills import router as skills_router
from backend.app.api.v1.wallet import router as wallet_router
from backend.app.api.v1.payments import router as payments_router
from backend.app.api.v1.subscriptions import router as subscriptions_router
from backend.app.api.v1.sessions import router as sessions_router
from backend.app.api.v1.reviews import router as reviews_router
from backend.app.api.v1.matches import router as matches_router
from backend.app.api.v1.messages import router as messages_router
from backend.app.api.v1.ai import router as ai_router
from backend.app.api.v1.notifications import router as notifications_router
from backend.app.api.v1.admin import router as admin_router


# ---------------------------------------------------------
# DATABASE STARTUP
# ---------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.
    Initializes SQL & MongoDB connections when the API starts.
    """
    uploads_path = os.path.join(os.path.dirname(__file__), "uploads", "avatars")
    os.makedirs(uploads_path, exist_ok=True)
    
    # 1. Initialize Relational Database (SQLAlchemy)
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("SQL database initialized successfully")
    except Exception:
        logger.exception("SQL database initialization failed")
        raise
    finally:
        db.close()

    # 2. Initialize Document Database (MongoDB)
    await connect_to_mongo()

    yield

    # Teardown
    await close_mongo_connection()
    logger.info("Skill Swap API shutting down")



# ---------------------------------------------------------
# FASTAPI APPLICATION
# ---------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-grade API for Skill Swap — "
        "Teach what you know. Learn what you want."
    ),
    lifespan=lifespan,
)

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

API_PREFIX = "/api/v1"

app.include_router(
    auth_router,
    prefix=API_PREFIX,
)

app.include_router(
    users_router,
    prefix=API_PREFIX,
)

app.include_router(
    skills_router,
    prefix=API_PREFIX,
)

app.include_router(
    wallet_router,
    prefix=API_PREFIX,
)

app.include_router(
    payments_router,
    prefix=API_PREFIX,
)

app.include_router(
    subscriptions_router,
    prefix=API_PREFIX,
)

app.include_router(
    sessions_router,
    prefix=API_PREFIX,
)

app.include_router(
    reviews_router,
    prefix=API_PREFIX,
)

app.include_router(
    matches_router,
    prefix=API_PREFIX,
)

app.include_router(
    messages_router,
    prefix=API_PREFIX,
)

app.include_router(
    ai_router,
    prefix=API_PREFIX,
)

app.include_router(
    notifications_router,
    prefix=API_PREFIX,
)

app.include_router(
    admin_router,
    prefix=API_PREFIX,
)


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get(
    "/health",
    tags=["Health"],
)
@app.get(
    "/api/health",
    tags=["Health"],
)
@app.get(
    "/api/v1/health",
    tags=["Health"],
)
def health_check():
    """
    Check whether the Skill Swap API is running.
    """
    return {
        "status": "healthy",
        "service": "Skill Swap API",
        "version": settings.VERSION,
        "payment_mode": settings.PAYMENT_MODE,
    }


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get(
    "/",
    tags=["Health"],
)
def root():
    return {
        "message": "Welcome to Skill Swap API",
        "service": "Skill Swap",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
    }


# ---------------------------------------------------------
# LOCAL DEVELOPMENT
# ---------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )