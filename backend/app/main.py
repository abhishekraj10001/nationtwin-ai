import logging
import threading
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import init_db
from app.seed import seed_initial_data
from app.agents.orchestrator import generate_synthetic_live_updates
from app.routers import router as api_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# Background thread control
stop_event = threading.Event()

def sensor_simulation_loop():
    """
    Background worker loop that runs every few seconds
    to simulate real-time city telemetry and trigger agent consensus cycles.
    """
    logger.info("Starting real-time city telemetry simulation loop...")
    while not stop_event.is_set():
        try:
            generate_synthetic_live_updates()
        except Exception as e:
            logger.error(f"Error in sensor simulation loop: {e}")
        # Sleep for the configured update interval
        time.sleep(settings.UPDATE_INTERVAL_SECONDS)
    logger.info("Sensor simulation loop stopped.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("NationTwin AI Backend starting up...")
    init_db()
    try:
        seed_initial_data()
    except Exception as e:
        logger.error(f"Failed to seed initial data: {e}")
        
    # Start background sensor simulation thread
    thread = threading.Thread(target=sensor_simulation_loop, daemon=True)
    thread.start()
    
    yield
    
    # Shutdown tasks
    logger.info("NationTwin AI Backend shutting down...")
    stop_event.set()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev/sandbox environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "timestamp": time.time(),
        "mock_mode": settings.MOCK_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
