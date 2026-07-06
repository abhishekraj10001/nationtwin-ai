from sqlmodel import Session, select
from app.database import InterventionEntity, PredictionRecord
from app.schemas import RiskType, InterventionStatus
import uuid

def evaluate_and_generate_recommendations(session: Session) -> None:
    # Fetch all active predictions
    predictions = session.exec(select(PredictionRecord)).all()
    
    for pred in predictions:
        prob = pred.probability
        # If risk probability is high, ensure corresponding interventions are proposed and elevated
        if prob > 0.4:
            # Look up interventions matching this risk type
            interventions = session.exec(
                select(InterventionEntity).where(InterventionEntity.target_risk == pred.risk_type)
            ).all()
            
            # If we don't have interventions for this risk, create one dynamically
            if not interventions:
                create_default_intervention_for_risk(session, pred.risk_type, prob)
            else:
                for interv in interventions:
                    # Dynamically adjust impact and benefit when risk is high!
                    interv.confidence = min(0.98, pred.confidence + 0.05)
                    interv.impact_score = min(100.0, float(prob * 100 + 10))
                    # Elevate status back to proposed if it was rejected or executed previously (for the new cycle)
                    if interv.status in [InterventionStatus.REJECTED.value, InterventionStatus.EXECUTED.value]:
                        interv.status = InterventionStatus.PROPOSED.value
                    session.add(interv)
        else:
            # If risk is low, reset/lower some recommendation metrics
            interventions = session.exec(
                select(InterventionEntity).where(InterventionEntity.target_risk == pred.risk_type)
            ).all()
            for interv in interventions:
                if interv.status == InterventionStatus.PROPOSED.value:
                    interv.impact_score = max(10.0, float(prob * 100))
                    session.add(interv)
                    
    session.commit()

def create_default_intervention_for_risk(session: Session, risk_type: str, probability: float):
    iid = f"int_dyn_{uuid.uuid4().hex[:6]}"
    
    if risk_type == RiskType.FLOOD.value:
        title = "Deploy Additional BMC Water Pumps"
        desc = "Deploy high-volume dewatering pumps to low-elevation channels like Kurla and Hindmata."
        cost = 180000.0
        benefit = 8000000.0
    elif risk_type == RiskType.TRAFFIC.value:
        title = "Adjust Western Express Signals"
        desc = "Optimize green signal timings dynamically along detour segments."
        cost = 15000.0
        benefit = 1200000.0
    elif risk_type == RiskType.HOSPITAL.value:
        title = "Establish Temporary Ward Blocks"
        desc = "Activate reserved clinical personnel to manage bed occupancy surges."
        cost = 350000.0
        benefit = 6000000.0
    elif risk_type == RiskType.POWER.value:
        title = "Divert Trombay Grid Output"
        desc = "Divert auxiliary power from industrial grids to Sion trauma wards."
        cost = 50000.0
        benefit = 4500000.0
    elif risk_type == RiskType.WATER.value:
        title = "Initiate Bhatsa Lake Outflow Adjustments"
        desc = "Increase discharge rates to match city supply deficits."
        cost = 120000.0
        benefit = 9000000.0
    elif risk_type == RiskType.HEATWAVE.value:
        title = "Establish Cooling Shelter Hubs"
        desc = "Deploy municipal hydration zones and air-conditioned shelter vehicles."
        cost = 95000.0
        benefit = 3000000.0
    else:  # POLLUTION
        title = "Enforce Construction Pauses at BKC"
        desc = "Mandate a temporary halt to dry excavation at BKC infrastructure projects."
        cost = 650000.0
        benefit = 5000000.0

    interv = InterventionEntity(
        id=iid,
        title=title,
        description=desc,
        target_risk=risk_type,
        expected_cost=cost,
        expected_benefit=benefit,
        confidence=0.85,
        impact_score=probability * 100,
        status=InterventionStatus.PROPOSED.value
    )
    session.add(interv)
