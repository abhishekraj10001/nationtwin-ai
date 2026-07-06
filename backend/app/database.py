import os
import json
import logging
from typing import Generator, Dict, Any, List, Optional
import threading
from datetime import datetime

from sqlmodel import SQLModel, create_engine, Session, select, Field
from app.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Relational Database Setup (SQLite/PostgreSQL) ---

# We use SQLite by default or when database connection details fail,
# or when MOCK_MODE is enabled to ensure zero-setup running.
if settings.MOCK_MODE:
    # Use SQLite file in the workspace
    sqlite_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nationtwin.db")
    DATABASE_URL = f"sqlite:///{sqlite_db_path}"
    # SQLite requires special connect args for threading
    connect_args = {"check_same_thread": False}
else:
    DATABASE_URL = settings.database_url
    connect_args = {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    logger.info("Relational database initialized successfully.")

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

# --- DB Models (SQLModel) ---

class CityStateHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    data_json: str = Field(..., description="JSON string representation of CityState")

class AgentStateEntity(SQLModel, table=True):
    name: str = Field(primary_key=True)
    role: str
    status: str
    last_execution: datetime
    confidence: float
    observations_json: str
    recommendations_json: str

class PredictionRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    risk_type: str = Field(index=True)
    probability: float
    confidence: float
    severity: str
    timeline: str
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ExplainabilityRecord(SQLModel, table=True):
    risk_type: str = Field(primary_key=True)
    data_used_json: str
    reasoning_steps_json: str
    agent_contributions_json: str
    confidence_score: float
    uncertainty_factors_json: str

class SimulationResultEntity(SQLModel, table=True):
    id: str = Field(primary_key=True)
    scenario: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    economic_impact_total: float
    lives_affected_total: int
    infrastructure_damage_total: float
    recovery_time_days: float
    timeline_json: str

class InterventionEntity(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    description: str
    target_risk: str
    expected_cost: float
    expected_benefit: float
    confidence: float
    impact_score: float
    status: str

class GraphNodeEntity(SQLModel, table=True):
    id: str = Field(primary_key=True)
    label: str
    type: str
    status: str
    metrics_json: str
    x: float
    y: float

class GraphEdgeEntity(SQLModel, table=True):
    id: str = Field(primary_key=True)
    source: str
    target: str
    label: str
    relationship: str
    weight: float

# --- Mock Redis Key-Value Store ---

class MockRedis:
    def __init__(self):
        self._store: Dict[str, str] = {}
        self._lock = threading.Lock()

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        with self._lock:
            self._store[key] = str(value)
            # Expiry is ignored in the simple mock for simplicity
            return True

    def get(self, key: str) -> Optional[str]:
        with self._lock:
            return self._store.get(key)

    def delete(self, key: str) -> bool:
        with self._lock:
            if key in self._store:
                del self._store[key]
                return True
            return False

# Initialize Redis Mock
mock_redis_client = MockRedis()

def get_redis():
    if settings.MOCK_MODE:
        return mock_redis_client
    try:
        import redis
        client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        client.ping()
        return client
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}. Falling back to mock Redis.")
        return mock_redis_client

# --- Mock Neo4j Graph Database ---

class MockNeo4jSession:
    def __init__(self, entities: List[GraphNodeEntity], relations: List[GraphEdgeEntity]):
        self.nodes = entities
        self.edges = relations

    def run(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> Any:
        # Simple parser for mock Cypher queries used in world model
        query_upper = query.upper()
        if "MATCH (N:NODE)" in query_upper or "MATCH (N)" in query_upper:
            # Return list of nodes
            class MockNodeRecord:
                def __init__(self, node):
                    self._node = node
                def data(self):
                    return {
                        "n": {
                            "id": self._node.id,
                            "label": self._node.label,
                            "type": self._node.type,
                            "status": self._node.status,
                            "metrics": json.loads(self._node.metrics_json),
                            "x": self._node.x,
                            "y": self._node.y
                        }
                    }
            return [MockNodeRecord(n) for n in self.nodes]
        elif "MATCH" in query_upper and "RELATION" in query_upper:
            # Return list of edges
            class MockEdgeRecord:
                def __init__(self, edge):
                    self._edge = edge
                def data(self):
                    return {
                        "r": {
                            "id": self._edge.id,
                            "source": self._edge.source,
                            "target": self._edge.target,
                            "label": self._edge.label,
                            "relationship": self._edge.relationship,
                            "weight": self._edge.weight
                        }
                    }
            return [MockEdgeRecord(e) for e in self.edges]
        return []

class MockNeo4jDriver:
    def __init__(self):
        self._lock = threading.Lock()

    def session(self, **kwargs) -> MockNeo4jSession:
        # Fetch directly from SQLModel to keep graph in sync
        with Session(engine) as session:
            nodes = session.exec(select(GraphNodeEntity)).all()
            edges = session.exec(select(GraphEdgeEntity)).all()
        return MockNeo4jSession(nodes, edges)

    def close(self):
        pass

mock_neo4j_driver = MockNeo4jDriver()

def get_neo4j():
    if settings.MOCK_MODE:
        return mock_neo4j_driver
    try:
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        driver.verify_connectivity()
        return driver
    except Exception as e:
        logger.warning(f"Failed to connect to Neo4j: {e}. Falling back to mock Neo4j driver.")
        return mock_neo4j_driver
