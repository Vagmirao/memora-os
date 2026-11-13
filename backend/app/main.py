from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.db.database import engine, get_db
from backend.app.api.users import router as users_router
from backend.app.api.events import router as events_router
from backend.app.api.memories import router as memories_router

app = FastAPI(
    title="Memora API",
    description="Backend API for the Memora cognitive memory system.",
    version="0.1.0",
)

app.include_router(users_router)
app.include_router(events_router)
app.include_router(memories_router)

@app.get("/")
async def root():
    return {
        "system": "MEMORA",
        "status": "online",
        "version": "0.1.0",
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "memora-api",
    }


@app.get("/api/health/database")
async def database_health_check():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT current_database(), current_user")
            )

            database_name, username = result.fetchone()

        return {
            "status": "healthy",
            "database": database_name,
            "user": username,
        }

    except Exception as error:
        return {
            "status": "unhealthy",
            "error": str(error),
        }
@app.get("/api/health/database-session")
def database_session_health_check(
    db: Session = Depends(get_db),
):
    result = db.execute(
        text("SELECT current_database(), current_user")
    )

    database_name, username = result.fetchone()

    return {
        "status": "healthy",
        "database": database_name,
        "user": username,
        "session": "active",
    }