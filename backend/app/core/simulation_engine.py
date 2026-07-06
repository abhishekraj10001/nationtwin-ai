import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlmodel import Session, select
from app.schemas import SimulationScenario, SimulationStep, SimulationResult, RiskType
from app.database import SimulationResultEntity, CityStateHistory, PredictionRecord, ExplainabilityRecord, GraphNodeEntity
import json

def run_city_simulation(session: Session, scenario: SimulationScenario, intensity: float = 1.0) -> SimulationResult:
    # Generate unique ID for this simulation run
    sim_id = f"sim_{uuid.uuid4().hex[:8]}"
    
    # We will compute a timeline of steps (offset in hours)
    steps: List[SimulationStep] = []
    
    economic_impact_total = 0.0
    lives_affected_total = 0
    infrastructure_damage_total = 0.0
    recovery_time_days = 0.0
    
    # Configure simulation models based on scenario
    if scenario == SimulationScenario.RAIN:
        # Monsoon Deluge simulation (Heavy water-logging)
        recovery_time_days = 4.0 * intensity
        time_offsets = [0, 2, 6, 12, 24, 48, 72]
        
        for hour in time_offsets:
            if hour <= 12:
                severity = (hour / 12) * 100 * intensity
            else:
                severity = max(0.0, 100 - ((hour - 12) / (72 - 12)) * 100) * intensity
                
            econ = round(15.0 * (severity / 10) * intensity, 2)  # ₹ Millions
            lives = int(350 * (severity / 10) * intensity) if hour > 2 else 0
            infra = round(8.5 * (severity / 10) * intensity, 2) if hour > 6 else 0.0
            rec = round(min(100.0, (hour / 72) * 100), 1)
            
            steps.append(SimulationStep(
                time_offset_hours=hour,
                economic_impact_million_inr=econ,
                lives_affected=lives,
                infrastructure_damage_million_inr=infra,
                recovery_progress=rec,
                severity_level=round(severity, 1)
            ))
            
            economic_impact_total += econ
            lives_affected_total = max(lives_affected_total, lives)
            infrastructure_damage_total += infra

    elif scenario == SimulationScenario.ROAD_CLOSE:
        # Bandra-Worli Sea Link closure gridlock simulation
        recovery_time_days = 1.0 * intensity
        time_offsets = [0, 1, 3, 6, 12, 24, 36]
        
        for hour in time_offsets:
            severity = max(5.0, 95 - (hour / 36) * 90) * intensity
            econ = round(4.5 * (severity / 10) * intensity, 2)
            lives = 0
            infra = round(0.15 * intensity, 2)
            rec = round(min(100.0, (hour / 36) * 100), 1)
            
            steps.append(SimulationStep(
                time_offset_hours=hour,
                economic_impact_million_inr=econ,
                lives_affected=lives,
                infrastructure_damage_million_inr=infra,
                recovery_progress=rec,
                severity_level=round(severity, 1)
            ))
            
            economic_impact_total += econ
            lives_affected_total = max(lives_affected_total, lives)
            infrastructure_damage_total += infra

    elif scenario == SimulationScenario.POWER_FAILURE:
        # Trombay Substation Trip simulation
        recovery_time_days = 2.0 * intensity
        time_offsets = [0, 2, 4, 8, 12, 24, 48]
        
        for hour in time_offsets:
            if hour == 0:
                severity = 100.0 * intensity
            elif hour <= 4:
                severity = 85.0 * intensity
            else:
                severity = max(0.0, 85 - ((hour - 4) / 44) * 85) * intensity
                
            econ = round(22.0 * (severity / 10) * intensity, 2)
            lives = int(450 * (severity / 20) * intensity)
            infra = round(6.2 * intensity, 2)
            rec = round(min(100.0, (hour / 48) * 100), 1)
            
            steps.append(SimulationStep(
                time_offset_hours=hour,
                economic_impact_million_inr=econ,
                lives_affected=lives,
                infrastructure_damage_million_inr=infra,
                recovery_progress=rec,
                severity_level=round(severity, 1)
            ))
            
            economic_impact_total += econ
            lives_affected_total = max(lives_affected_total, lives)
            infrastructure_damage_total += infra

    elif scenario == SimulationScenario.HOSPITAL_SHUTDOWN:
        # Sion Hospital IT outage / lockout simulation
        recovery_time_days = 2.5 * intensity
        time_offsets = [0, 4, 8, 16, 24, 48, 72]
        
        for hour in time_offsets:
            severity = max(10.0, 95 - (hour / 72) * 85) * intensity
            econ = round(8.0 * (severity / 10) * intensity, 2)
            lives = int(180 * (severity / 10) * intensity)
            infra = round(1.2 * intensity, 2)
            rec = round(min(100.0, (hour / 72) * 100), 1)
            
            steps.append(SimulationStep(
                time_offset_hours=hour,
                economic_impact_million_inr=econ,
                lives_affected=lives,
                infrastructure_damage_million_inr=infra,
                recovery_progress=rec,
                severity_level=round(severity, 1)
            ))
            
            economic_impact_total += econ
            lives_affected_total = max(lives_affected_total, lives)
            infrastructure_damage_total += infra

    elif scenario == SimulationScenario.FESTIVAL:
        # Ganesh Utsav crowd surge simulation
        recovery_time_days = 1.5 * intensity
        time_offsets = [0, 6, 12, 18, 24, 30, 36]
        
        for hour in time_offsets:
            if hour <= 18:
                severity = (hour / 18) * 85 * intensity
            else:
                severity = max(0.0, 85 - ((hour - 18) / 18) * 85) * intensity
                
            econ = round(-12.5 * (severity / 10) * intensity, 2)  # Positive tourism revenue represented as negative cost
            lives = int(45 * (severity / 20) * intensity)
            infra = round(0.5 * intensity, 2)
            rec = round(min(100.0, (hour / 36) * 100), 1)
            
            steps.append(SimulationStep(
                time_offset_hours=hour,
                economic_impact_million_inr=econ,
                lives_affected=lives,
                infrastructure_damage_million_inr=infra,
                recovery_progress=rec,
                severity_level=round(severity, 1)
            ))
            
            economic_impact_total += econ
            lives_affected_total = max(lives_affected_total, lives)
            infrastructure_damage_total += infra

    else:  # PANDEMIC
        # Dharavi infectious disease outbreak control
        recovery_time_days = 20.0 * intensity
        time_offsets = [0, 48, 120, 240, 360, 540, 720]
        
        for hour in time_offsets:
            if hour <= 360:
                severity = (hour / 360) * 100 * intensity
            else:
                severity = max(0.0, 100 - ((hour - 360) / 360) * 100) * intensity
                
            econ = round(45.0 * (severity / 10) * intensity, 2)
            lives = int(1200 * (severity / 10) * intensity)
            infra = round(2.5 * intensity, 2)
            rec = round(min(100.0, (hour / 720) * 100), 1)
            
            steps.append(SimulationStep(
                time_offset_hours=hour,
                economic_impact_million_inr=econ,
                lives_affected=lives,
                infrastructure_damage_million_inr=infra,
                recovery_progress=rec,
                severity_level=round(severity, 1)
            ))
            
            economic_impact_total += econ
            lives_affected_total = max(lives_affected_total, lives)
            infrastructure_damage_total += infra
            
    # Round totals
    economic_impact_total = round(economic_impact_total, 2)
    infrastructure_damage_total = round(infrastructure_damage_total, 2)

    # Save to database
    sim_entity = SimulationResultEntity(
        id=sim_id,
        scenario=scenario.value,
        timestamp=datetime.utcnow(),
        economic_impact_total=economic_impact_total,
        lives_affected_total=lives_affected_total,
        infrastructure_damage_total=infrastructure_damage_total,
        recovery_time_days=recovery_time_days,
        timeline_json=json.dumps([s.dict() for s in steps])
    )
    
    session.add(sim_entity)
    session.commit()
    
    # Apply impact to the active city state & predictions to reflect simulation changes!
    modify_active_city_state_by_simulation(session, scenario, intensity)
    
    return SimulationResult(
        id=sim_id,
        scenario=scenario,
        timestamp=sim_entity.timestamp,
        economic_impact_total=economic_impact_total,
        lives_affected_total=lives_affected_total,
        infrastructure_damage_total=infrastructure_damage_total,
        recovery_time_days=recovery_time_days,
        timeline=steps
    )

def modify_active_city_state_by_simulation(session: Session, scenario: SimulationScenario, intensity: float):
    # Fetch the most recent city state history
    latest_history = session.exec(
        select(CityStateHistory).order_by(CityStateHistory.timestamp.desc())
    ).first()
    
    if not latest_history:
        return
        
    city_state_data = json.loads(latest_history.data_json)
    
    # Apply changes to variables
    if scenario == SimulationScenario.RAIN:
        city_state_data["weather"]["precipitation"] = round(45.0 * intensity, 1)
        city_state_data["weather"]["condition"] = "Monsoon Deluge"
        city_state_data["traffic"]["congestion_level"] = min(100.0, city_state_data["traffic"]["congestion_level"] + 45 * intensity)
        city_state_data["traffic"]["average_speed"] = max(5.0, city_state_data["traffic"]["average_speed"] - 20 * intensity)
        city_state_data["water"]["reservoir_level"] = min(100.0, city_state_data["water"]["reservoir_level"] + 15.0 * intensity)
        
        update_predictions_under_simulation(session, RiskType.FLOOD, 0.92 * intensity, "critical", "Next 1 hour", "Monsoon rainfall overlap with high tide threatening low-lying blocks.")
        update_node_status(session, "water_supply", "Warning", {"level": city_state_data["water"]["reservoir_level"]})

    elif scenario == SimulationScenario.ROAD_CLOSE:
        city_state_data["traffic"]["congestion_level"] = min(100.0, city_state_data["traffic"]["congestion_level"] + 55 * intensity)
        city_state_data["traffic"]["average_speed"] = max(5.0, city_state_data["traffic"]["average_speed"] - 18 * intensity)
        city_state_data["traffic"]["closed_roads"] = ["Bandra-Worli Sea Link Grid", "Sardar Vallabhbhai Patel Rd Gate"]
        
        update_predictions_under_simulation(session, RiskType.TRAFFIC, 0.98 * intensity, "critical", "Immediate", "Bandra-Worli Sea Link lane closed. Heavy spillover on WEH.")
        update_node_status(session, "traffic_grid", "Overloaded", {"congestion": city_state_data["traffic"]["congestion_level"]})

    elif scenario == SimulationScenario.POWER_FAILURE:
        city_state_data["energy"]["outages"] = ["Dharavi Sector 3", "Sion Trauma Center East Grid"]
        city_state_data["energy"]["grid_load"] = max(0.0, city_state_data["energy"]["grid_load"] - 2500 * intensity)
        city_state_data["hospitals"]["icu_occupancy"] = min(100.0, city_state_data["hospitals"]["icu_occupancy"] + 12 * intensity)
        
        update_predictions_under_simulation(session, RiskType.POWER, 0.95 * intensity, "critical", "Immediate", "Trombay transformer trip. Secondary relays overloaded.")
        update_node_status(session, "power_station", "Outage", {"load": city_state_data["energy"]["grid_load"]})

    elif scenario == SimulationScenario.HOSPITAL_SHUTDOWN:
        city_state_data["hospitals"]["occupied_beds"] = int(city_state_data["hospitals"]["occupied_beds"] * 0.4)
        city_state_data["hospitals"]["icu_occupancy"] = 0.0
        city_state_data["hospitals"]["available_ambulances"] = 5
        
        update_predictions_under_simulation(session, RiskType.HOSPITAL, 0.99 * intensity, "critical", "Immediate", "Sion Hospital network shut down. Outpatients diverted to KEM.")
        update_node_status(session, "city_hospital", "Outage", {"beds_occupied": 0, "status": "Diverting"})

    elif scenario == SimulationScenario.FESTIVAL:
        city_state_data["population"]["active_citizens"] = int(city_state_data["population"]["active_citizens"] * 3.0 * intensity)
        city_state_data["traffic"]["congestion_level"] = min(100.0, city_state_data["traffic"]["congestion_level"] + 35 * intensity)
        city_state_data["transport"]["passenger_load"] = min(100.0, city_state_data["transport"]["passenger_load"] + 20 * intensity)
        
        update_predictions_under_simulation(session, RiskType.TRAFFIC, 0.85 * intensity, "high", "Next 2 hours", "Ganesh Chaturthi procession crowds congesting main lines.")
        update_node_status(session, "population_center", "Overloaded", {"active_citizens": city_state_data["population"]["active_citizens"]})

    elif scenario == SimulationScenario.PANDEMIC:
        city_state_data["hospitals"]["occupied_beds"] = min(city_state_data["hospitals"]["total_beds"], int(city_state_data["hospitals"]["occupied_beds"] + 800 * intensity))
        city_state_data["hospitals"]["icu_occupancy"] = min(100.0, city_state_data["hospitals"]["icu_occupancy"] + 22 * intensity)
        city_state_data["population"]["active_citizens"] = int(city_state_data["population"]["active_citizens"] * 0.35)
        
        update_predictions_under_simulation(session, RiskType.HOSPITAL, 0.94 * intensity, "critical", "Next 24 hours", "Outbreak cluster spreading in dense residential blocks.")
        update_node_status(session, "city_hospital", "Overloaded", {"icu_occupancy": city_state_data["hospitals"]["icu_occupancy"]})

    # Save modified state back as a new history record
    new_history = CityStateHistory(
        timestamp=datetime.utcnow(),
        data_json=json.dumps(city_state_data)
    )
    session.add(new_history)
    session.commit()

def update_predictions_under_simulation(session: Session, risk_type: RiskType, probability: float, severity: str, timeline: str, description: str):
    pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == risk_type.value)).first()
    if pred:
        pred.probability = probability
        pred.confidence = 0.95
        pred.severity = severity
        pred.timeline = timeline
        pred.description = description
        session.add(pred)
        
        # update explainability
        exp = session.exec(select(ExplainabilityRecord).where(ExplainabilityRecord.risk_type == risk_type.value)).first()
        if exp:
            exp.reasoning_steps_json = json.dumps([
                f"1. Simulation engine altered city telemetry for {risk_type.value}.",
                "2. System state threshold values breached.",
                "3. Machine learning models projected high confidence outcome cascade."
            ])
            exp.confidence_score = 95.0
            session.add(exp)

def update_node_status(session: Session, node_id: str, status: str, metrics: Dict[str, Any]):
    node = session.exec(select(GraphNodeEntity).where(GraphNodeEntity.id == node_id)).first()
    if node:
        node.status = status
        curr_metrics = json.loads(node.metrics_json)
        curr_metrics.update(metrics)
        node.metrics_json = json.dumps(curr_metrics)
        session.add(node)
