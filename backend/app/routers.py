from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Dict, Any
from datetime import datetime, timedelta
import json

from app.database import (
    get_db, CityStateHistory, AgentStateEntity, PredictionRecord,
    ExplainabilityRecord, SimulationResultEntity, InterventionEntity,
    GraphNodeEntity, GraphEdgeEntity
)
from app.schemas import (
    CityState, AgentState, RiskPrediction, PredictionExplanation,
    SimulationResult, SimulationParams, Intervention, GraphNode, GraphEdge,
    InterventionStatus
)
from app.core.simulation_engine import run_city_simulation

router = APIRouter()

# --- Authentication Router ---

@router.post("/auth/login/google")
def login_google():
    return {
        "status": "success",
        "user": {
            "name": "Alex Mercer",
            "email": "a.mercer@gov.nationtwin.ai",
            "role": "Chief City Planner",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex"
        },
        "token": "mock-google-jwt-token-12345"
    }

@router.post("/auth/login/guest")
def login_guest():
    return {
        "status": "success",
        "user": {
            "name": "Guest Operator",
            "email": "operator@guest.nationtwin.ai",
            "role": "Visitor Mode",
            "avatar": "https://api.dicebear.com/7.x/adventurer/svg?seed=Guest"
        },
        "token": "mock-guest-token-67890"
    }

@router.post("/auth/logout")
def logout():
    return {"status": "success", "message": "Logged out successfully"}


# --- City State Telemetry Router ---

@router.get("/city/state", response_model=CityState)
def get_city_state(db: Session = Depends(get_db)):
    latest = db.exec(select(CityStateHistory).order_by(CityStateHistory.timestamp.desc())).first()
    if not latest:
        raise HTTPException(status_code=404, detail="No city state history found. Did you run seeding?")
    return CityState.parse_raw(latest.data_json)

@router.get("/city/history")
def get_city_history(hours: int = Query(default=6, ge=1, le=72), db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    records = db.exec(
        select(CityStateHistory)
        .where(CityStateHistory.timestamp >= cutoff)
        .order_by(CityStateHistory.timestamp.asc())
    ).all()
    
    # We thin out the records if there are too many (e.g. max 50 points for charting)
    step = max(1, len(records) // 50)
    thinned = records[::step]
    
    history_list = []
    for r in thinned:
        state_dict = json.loads(r.data_json)
        state_dict["timestamp"] = r.timestamp.isoformat()
        history_list.append(state_dict)
        
    return history_list

# --- Multi-Agent Router ---

@router.get("/agents", response_model=List[AgentState])
def get_agents(db: Session = Depends(get_db)):
    entities = db.exec(select(AgentStateEntity)).all()
    result = []
    for e in entities:
        result.append(AgentState(
            name=e.name,
            role=e.role,
            status=e.status,
            last_execution=e.last_execution,
            confidence=e.confidence,
            observations=json.loads(e.observations_json),
            recommendations=json.loads(e.recommendations_json)
        ))
    return result

@router.post("/agents/{agent_name}/trigger")
def trigger_agent(agent_name: str, db: Session = Depends(get_db)):
    agent = db.exec(select(AgentStateEntity).where(AgentStateEntity.name == agent_name)).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found.")
    
    # Simulate a manual rerun
    agent.status = "working"
    agent.last_execution = datetime.utcnow()
    db.add(agent)
    db.commit()
    
    # Reset to idle after execution simulation
    agent.status = "idle"
    obs = json.loads(agent.observations_json)
    obs.insert(0, f"Manual trigger fired by operator at {datetime.utcnow().strftime('%H:%M:%S')}.")
    agent.observations_json = json.dumps(obs[:5]) # keep last 5
    db.add(agent)
    db.commit()
    
    return {
        "status": "success",
        "agent": {
            "name": agent.name,
            "status": agent.status,
            "last_execution": agent.last_execution,
            "observations": json.loads(agent.observations_json)
        }
    }

# --- Predictions & Explainability Router ---

@router.get("/predictions", response_model=List[RiskPrediction])
def get_predictions(db: Session = Depends(get_db)):
    records = db.exec(select(PredictionRecord).order_by(PredictionRecord.timestamp.desc())).all()
    # Return only the most recent prediction for each risk type
    seen_types = set()
    latest_predictions = []
    for r in records:
        if r.risk_type not in seen_types:
            seen_types.add(r.risk_type)
            latest_predictions.append(RiskPrediction(
                type=r.risk_type,
                probability=r.probability,
                confidence=r.confidence,
                severity=r.severity,
                timeline=r.timeline,
                description=r.description
            ))
    return latest_predictions

@router.get("/predictions/{risk_type}/explain", response_model=PredictionExplanation)
def get_prediction_explain(risk_type: str, db: Session = Depends(get_db)):
    record = db.exec(select(ExplainabilityRecord).where(ExplainabilityRecord.risk_type == risk_type)).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"No explanation found for risk type '{risk_type}'")
    return PredictionExplanation(
        risk_type=record.risk_type,
        data_used=json.loads(record.data_used_json),
        reasoning_steps=json.loads(record.reasoning_steps_json),
        agent_contributions=json.loads(record.agent_contributions_json),
        confidence_score=record.confidence_score,
        uncertainty_factors=json.loads(record.uncertainty_factors_json)
    )

# --- Simulation Router ---

@router.post("/simulations", response_model=SimulationResult)
def create_simulation(params: SimulationParams, db: Session = Depends(get_db)):
    try:
        res = run_city_simulation(db, params.scenario, params.intensity)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@router.get("/simulations/history", response_model=List[SimulationResult])
def get_simulation_history(db: Session = Depends(get_db)):
    entities = db.exec(select(SimulationResultEntity).order_by(SimulationResultEntity.timestamp.desc())).all()
    results = []
    for e in entities:
        results.append(SimulationResult(
            id=e.id,
            scenario=e.scenario,
            timestamp=e.timestamp,
            economic_impact_total=e.economic_impact_total,
            lives_affected_total=e.lives_affected_total,
            infrastructure_damage_total=e.infrastructure_damage_total,
            recovery_time_days=e.recovery_time_days,
            timeline=json.loads(e.timeline_json)
        ))
    return results

# --- AI Recommendations Router ---

@router.get("/recommendations", response_model=List[Intervention])
def get_recommendations(db: Session = Depends(get_db)):
    entities = db.exec(select(InterventionEntity)).all()
    result = []
    for e in entities:
        result.append(Intervention(
            id=e.id,
            title=e.title,
            description=e.description,
            target_risk=e.target_risk,
            expected_cost=e.expected_cost,
            expected_benefit=e.expected_benefit,
            confidence=e.confidence,
            impact_score=e.impact_score,
            status=e.status
        ))
    return result

@router.post("/recommendations/{intervention_id}/action")
def update_recommendation_status(intervention_id: str, action: str = Query(..., regex="^(approve|reject|execute)$"), db: Session = Depends(get_db)):
    interv = db.exec(select(InterventionEntity).where(InterventionEntity.id == intervention_id)).first()
    if not interv:
        raise HTTPException(status_code=404, detail=f"Intervention '{intervention_id}' not found.")
    
    if action == "approve":
        interv.status = InterventionStatus.APPROVED.value
    elif action == "reject":
        interv.status = InterventionStatus.REJECTED.value
    elif action == "execute":
        interv.status = InterventionStatus.EXECUTED.value
        # If we execute an intervention, it should lower the corresponding risk prediction!
        pred = db.exec(select(PredictionRecord).where(PredictionRecord.risk_type == interv.target_risk)).first()
        if pred:
            pred.probability = round(max(0.01, pred.probability - 0.25), 2)
            pred.severity = "low" if pred.probability < 0.2 else "medium"
            db.add(pred)
            
    db.add(interv)
    db.commit()
    
    return {
        "status": "success",
        "intervention_id": intervention_id,
        "new_status": interv.status
    }

# --- World Model Graph Router ---

@router.get("/world-model")
def get_world_model(db: Session = Depends(get_db)):
    nodes = db.exec(select(GraphNodeEntity)).all()
    edges = db.exec(select(GraphEdgeEntity)).all()
    
    node_list = []
    for n in nodes:
        node_list.append({
            "id": n.id,
            "label": n.label,
            "type": n.type,
            "status": n.status,
            "metrics": json.loads(n.metrics_json),
            "x": n.x,
            "y": n.y
        })
        
    edge_list = []
    for e in edges:
        edge_list.append({
            "id": e.id,
            "source": e.source,
            "target": e.target,
            "label": e.label,
            "relationship": e.relationship,
            "weight": e.weight
        })
        
    return {
        "nodes": node_list,
        "edges": edge_list
    }
