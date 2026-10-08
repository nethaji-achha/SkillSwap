import logging
from typing import Optional, Any

try:
    from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
    HAS_MOTOR = True
except ImportError:
    AsyncIOMotorClient = Any  # type: ignore
    AsyncIOMotorDatabase = Any  # type: ignore
    HAS_MOTOR = False

from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDBManager:
    client: Optional[Any] = None
    db: Optional[Any] = None

mongodb_manager = MongoDBManager()

async def connect_to_mongo():
    """
    Initialize asynchronous MongoDB connection pool.
    """
    if not HAS_MOTOR:
        logger.info("Motor package not installed. Skipping MongoDB connection.")
        return
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
        mongodb_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=3000,
            maxPoolSize=50,
            minPoolSize=5
        )
        mongodb_manager.db = mongodb_manager.client[settings.MONGODB_DB_NAME]
        
        # Test the connection
        await mongodb_manager.client.admin.command("ping")
        logger.info(f"Connected successfully to MongoDB database: {settings.MONGODB_DB_NAME}")
        
        # Ensure indexes for key collections
        await _create_indexes(mongodb_manager.db)
    except Exception as exc:
        logger.warning(
            f"MongoDB connection failed ({exc}). App will run in fallback mode for MongoDB features."
        )

async def close_mongo_connection():
    """
    Close MongoDB client connection pool on app shutdown.
    """
    if mongodb_manager.client is not None:
        logger.info("Closing MongoDB connection...")
        mongodb_manager.client.close()
        logger.info("MongoDB connection closed.")

async def _create_indexes(db: AsyncIOMotorDatabase):
    """
    Ensure efficient indexes for high-frequency queries.
    """
    try:
        # Chat Messages indexes
        await db["chat_messages"].create_index([("conversation_id", 1), ("created_at", 1)])
        await db["chat_messages"].create_index([("receiver_id", 1), ("is_read", 1)])
        
        # AI Roadmaps & Mentor Chats
        await db["ai_roadmaps"].create_index([("user_id", 1), ("created_at", -1)])
        await db["ai_chat_history"].create_index([("user_id", 1), ("created_at", -1)])
        
        # Session Summaries & Assessments
        await db["session_summaries"].create_index([("session_id", 1)], unique=True)
        await db["assessment_attempts"].create_index([("user_id", 1), ("skill_slug", 1)])
        
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning(f"Error creating MongoDB indexes: {e}")

async def get_mongo_db() -> Optional[AsyncIOMotorDatabase]:
    """
    FastAPI dependency for accessing the MongoDB database instance.
    """
    return mongodb_manager.db
