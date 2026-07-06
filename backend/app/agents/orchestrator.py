import json
import random
import logging
from datetime import datetime
from typing import List
from sqlmodel import Session, select
from app.database import engine, CityStateHistory, AgentStateEntity, PredictionRecord, ExplainabilityRecord
from app.schemas import (
    CityState, WeatherState, TrafficState, HospitalState, AirQualityState,
    WaterState, EnergyState, PopulationState, PublicTransportState, InfrastructureState,
    AgentStatus, RiskType, RiskSeverity
)
from app.core.recommendation_engine import evaluate_and_generate_recommendations

logger = logging.getLogger(__name__)

def run_agent_consensus_cycle():
    """
    Executes a single cycle of the multi-agent system.
    This simulates agents observing the city state, performing analysis,
    updating their individual observations, updating predictions, and generating explanations.
    """
    with Session(engine) as session:
        # 1. Fetch the latest city state
        latest_history = session.exec(
            select(CityStateHistory).order_by(CityStateHistory.timestamp.desc())
        ).first()
        
        if not latest_history:
            logger.warning("No city state found to analyze. Seeding must be run first.")
            return
            
        city_state: CityState = CityState.parse_raw(latest_history.data_json)
        
        # 2. Update individual agent observations based on city state
        agents = session.exec(select(AgentStateEntity)).all()
        agent_dict = {a.name: a for a in agents}
        
        # Simulating execution for each agent
        for agent in agents:
            agent.status = AgentStatus.WORKING.value
            agent.last_execution = datetime.utcnow()
            
        # --- WEATHER AGENT ---
        w_agent = agent_dict.get("Weather Agent")
        if w_agent:
            w = city_state.weather
            w_agent.confidence = 0.95 - (0.05 if w.precipitation > 5.0 else 0.0)
            obs = [
                f"Temperature is stable at {w.temperature}°C with {w.humidity}% humidity.",
                f"Precipitation is currently {w.precipitation}mm with condition '{w.condition}'."
            ]
            if w.precipitation > 10.0:
                obs.append("WARNING: Intense precipitation detected. Monitoring runoff.")
            w_agent.observations_json = json.dumps(obs)
            w_agent.status = AgentStatus.IDLE.value
            
        # --- TRAFFIC AGENT ---
        t_agent = agent_dict.get("Traffic Agent")
        if t_agent:
            t = city_state.traffic
            t_agent.confidence = 0.90 if t.congestion_level < 50 else 0.82
            obs = [
                f"Average road speed is {t.average_speed} km/h.",
                f"Congestion is at {round(t.congestion_level, 1)}%."
            ]
            if len(t.closed_roads) > 0:
                obs.append(f"Arterial blockages: {', '.join(t.closed_roads)}")
            t_agent.observations_json = json.dumps(obs)
            t_agent.status = AgentStatus.IDLE.value

        # --- HOSPITAL AGENT ---
        h_agent = agent_dict.get("Hospital Agent")
        if h_agent:
            h = city_state.hospitals
            h_agent.confidence = 0.94 if h.icu_occupancy < 85 else 0.78
            occ_rate = round((h.occupied_beds / h.total_beds) * 100, 1)
            obs = [
                f"Hospital bed occupancy is at {occ_rate}% ({h.occupied_beds}/{h.total_beds}).",
                f"ICU capacity stands at {round(h.icu_occupancy, 1)}% occupancy.",
                f"Ambulances standby: {h.available_ambulances} units available."
            ]
            if h.icu_occupancy > 90.0:
                obs.append("CRITICAL: ICU beds nearing full saturation.")
            h_agent.observations_json = json.dumps(obs)
            # If hospital shutdown simulation is run
            if h.total_beds > 0 and h.occupied_beds == 0 and h.available_ambulances <= 2:
                h_agent.status = AgentStatus.ERROR.value
                h_agent.confidence = 0.20
            else:
                h_agent.status = AgentStatus.IDLE.value

        # --- ENERGY AGENT ---
        e_agent = agent_dict.get("Energy Agent")
        if e_agent:
            e = city_state.energy
            e_agent.confidence = 0.91 if len(e.outages) == 0 else 0.80
            obs = [
                f"Grid load is {e.grid_load} MW / {e.capacity} MW capacity.",
                f"Renewable energy generation mix is at {e.renewable_ratio}%."
            ]
            if len(e.outages) > 0:
                obs.append(f"Outages detected in: {', '.join(e.outages)}")
            e_agent.observations_json = json.dumps(obs)
            # If power station outage
            if len(e.outages) > 2:
                e_agent.status = AgentStatus.ERROR.value
                e_agent.confidence = 0.35
            else:
                e_agent.status = AgentStatus.IDLE.value

        # --- WATER AGENT ---
        wat_agent = agent_dict.get("Water Agent")
        if wat_agent:
            wat = city_state.water
            wat_agent.confidence = 0.93
            obs = [
                f"Reservoir levels are stable at {round(wat.reservoir_level, 1)}%.",
                f"Water quality index scored {wat.water_quality}/100."
            ]
            wat_agent.observations_json = json.dumps(obs)
            wat_agent.status = AgentStatus.IDLE.value

        # --- POLLUTION AGENT ---
        p_agent = agent_dict.get("Pollution Agent")
        if p_agent:
            p = city_state.air_quality
            p_agent.confidence = 0.89
            obs = [
                f"Air Quality Index (AQI) is {p.aqi} ({p.main_pollutant}).",
                f"Particulate concentrations: PM2.5 = {p.pm25} ug/m3, CO2 = {p.co2} ppm."
            ]
            if p.aqi > 150:
                obs.append("WARNING: Atmospheric stagnation triggering high AQI.")
            p_agent.observations_json = json.dumps(obs)
            p_agent.status = AgentStatus.IDLE.value

        # --- INFRASTRUCTURE AGENT ---
        i_agent = agent_dict.get("Infrastructure Agent")
        if i_agent:
            infra = city_state.infrastructure
            i_agent.confidence = 0.92
            obs = [
                f"Bridges structural health average score: {infra.bridges_status}%.",
                f"Active construction zones: {infra.active_construction_zones} sites."
            ]
            i_agent.observations_json = json.dumps(obs)
            i_agent.status = AgentStatus.IDLE.value

        # --- ECONOMY AGENT ---
        ec_agent = agent_dict.get("Economy Agent")
        if ec_agent:
            # Assesses financial state based on transit load and congestion
            loss_per_congestion = city_state.traffic.congestion_level * 0.05
            ec_agent.confidence = 0.88
            obs = [
                f"Estimated traffic congestion delay costs: ${round(loss_per_congestion, 2)}M daily.",
                f"Public transport passenger load is {city_state.transport.passenger_load}%."
            ]
            ec_agent.observations_json = json.dumps(obs)
            ec_agent.status = AgentStatus.IDLE.value

        # --- SIMULATION AGENT ---
        sim_agent = agent_dict.get("Simulation Agent")
        if sim_agent:
            # Checked if a simulation is active
            sim_agent.confidence = 0.96
            sim_agent.observations_json = json.dumps(["Standby mode. Simulation engine fully synchronized."])
            sim_agent.status = AgentStatus.IDLE.value

        # --- RISK ASSESSMENT AGENT ---
        ra_agent = agent_dict.get("Risk Assessment Agent")
        if ra_agent:
            # Aggregates risks
            ra_agent.confidence = 0.94
            # Look up predictions
            preds = session.exec(select(PredictionRecord)).all()
            high_risks = [p.risk_type for p in preds if p.probability > 0.4]
            obs = [
                f"Analyzed {len(preds)} core risk areas.",
                f"Consolidated municipal risk factor: {int(sum([p.probability for p in preds]) / len(preds) * 100)}%."
            ]
            if high_risks:
                obs.append(f"Elevated risk alert in: {', '.join(high_risks)}")
            else:
                obs.append("All city sectors categorized as Green (low risk).")
            ra_agent.observations_json = json.dumps(obs)
            ra_agent.status = AgentStatus.IDLE.value

        # --- PLANNER AGENT ---
        pl_agent = agent_dict.get("Planner Agent")
        if pl_agent:
            pl_agent.confidence = 0.95
            pl_agent.observations_json = json.dumps([
                "Consensus protocol running successfully.",
                "Orchestrating response pathways for active warnings."
            ])
            pl_agent.status = AgentStatus.IDLE.value

        # --- EXPLAINABILITY AGENT ---
        ex_agent = agent_dict.get("Explainability Agent")
        if ex_agent:
            ex_agent.confidence = 0.97
            ex_agent.observations_json = json.dumps([
                "Synthesized reasoning chains for predictions.",
                "Data audit trail complete and logged."
            ])
            ex_agent.status = AgentStatus.IDLE.value

        # 3. Dynamic Prediction updates based on live telemetry (if not overriden by simulation)
        # This is a basic rule-based risk predictor that acts as our AI Model
        update_predictions_from_state(session, city_state)

        # 4. Generate recommendations based on the predictions
        evaluate_and_generate_recommendations(session)

        # Save all agent updates
        for agent in agents:
            session.add(agent)
            
        session.commit()
        logger.info("Consensus cycle completed.")

def update_predictions_from_state(session: Session, city_state: CityState):
    # Only update predictions if they aren't actively elevated by a critical simulation
    # We check if a massive simulation is running by seeing if values are extreme.
    # If precipitation is 0 or low, let's update weather predictions.
    
    # 1. Flood Risk
    flood_pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == RiskType.FLOOD.value)).first()
    if flood_pred and city_state.weather.precipitation < 10.0: # If not in heavy rain simulation
        precip = city_state.weather.precipitation
        prob = min(0.99, 0.05 + (precip / 20.0))
        flood_pred.probability = round(prob, 2)
        flood_pred.severity = RiskSeverity.LOW.value if prob < 0.2 else (RiskSeverity.MEDIUM.value if prob < 0.5 else RiskSeverity.HIGH.value)
        flood_pred.description = "Low flood probability." if prob < 0.2 else "Elevated runoff risk due to rainfall."
        session.add(flood_pred)
        
    # 2. Traffic Risk
    traffic_pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == RiskType.TRAFFIC.value)).first()
    if traffic_pred and len(city_state.traffic.closed_roads) == 0:
        congestion = city_state.traffic.congestion_level
        prob = min(0.99, congestion / 100.0 + 0.05)
        traffic_pred.probability = round(prob, 2)
        traffic_pred.severity = RiskSeverity.LOW.value if prob < 0.3 else (RiskSeverity.MEDIUM.value if prob < 0.7 else RiskSeverity.HIGH.value)
        traffic_pred.description = "Traffic levels are nominal." if prob < 0.3 else "Commuter rush hour slowing primary lanes."
        session.add(traffic_pred)

    # 3. Hospital Overload
    hosp_pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == RiskType.HOSPITAL.value)).first()
    if hosp_pred and city_state.hospitals.icu_occupancy < 85.0:
        icu = city_state.hospitals.icu_occupancy
        prob = min(0.99, (icu / 100.0) * 0.8)
        hosp_pred.probability = round(prob, 2)
        hosp_pred.severity = RiskSeverity.LOW.value if prob < 0.4 else (RiskSeverity.MEDIUM.value if prob < 0.75 else RiskSeverity.HIGH.value)
        hosp_pred.description = "Emergency ward reserves are healthy." if prob < 0.4 else "Inpatient intakes climbing."
        session.add(hosp_pred)

    # 4. Power Outage
    power_pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == RiskType.POWER.value)).first()
    if power_pred and len(city_state.energy.outages) == 0:
        load_ratio = city_state.energy.grid_load / city_state.energy.capacity
        prob = min(0.99, (load_ratio ** 2) * 0.8)
        power_pred.probability = round(prob, 2)
        power_pred.severity = RiskSeverity.LOW.value if prob < 0.3 else (RiskSeverity.MEDIUM.value if prob < 0.7 else RiskSeverity.HIGH.value)
        power_pred.description = "Grid load within design constraints." if prob < 0.3 else "Substation peak loads warning."
        session.add(power_pred)

    # 5. Water Shortage
    water_pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == RiskType.WATER.value)).first()
    if water_pred:
        res = city_state.water.reservoir_level
        prob = min(0.99, max(0.01, (100 - res) / 100.0 - 0.1))
        water_pred.probability = round(prob, 2)
        water_pred.severity = RiskSeverity.LOW.value if prob < 0.2 else (RiskSeverity.MEDIUM.value if prob < 0.6 else RiskSeverity.HIGH.value)
        water_pred.description = "Reservoirs report safe volume heights." if prob < 0.2 else "Reservoir volumes dropping due to low inflow."
        session.add(water_pred)

    # 6. Heatwave
    heat_pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == RiskType.HEATWAVE.value)).first()
    if heat_pred:
        temp = city_state.weather.temperature
        prob = min(0.99, max(0.01, (temp - 20) / 20.0)) if temp > 20 else 0.01
        heat_pred.probability = round(prob, 2)
        heat_pred.severity = RiskSeverity.LOW.value if prob < 0.3 else (RiskSeverity.MEDIUM.value if prob < 0.75 else RiskSeverity.HIGH.value)
        heat_pred.description = "Temperatures within normal comfort levels." if prob < 0.3 else "Heat index rising; potential warning."
        session.add(heat_pred)

    # 7. Air Pollution
    poll_pred = session.exec(select(PredictionRecord).where(PredictionRecord.risk_type == RiskType.POLLUTION.value)).first()
    if poll_pred and city_state.air_quality.aqi < 150:
        aqi = city_state.air_quality.aqi
        prob = min(0.99, aqi / 300.0)
        poll_pred.probability = round(prob, 2)
        poll_pred.severity = RiskSeverity.LOW.value if prob < 0.3 else (RiskSeverity.MEDIUM.value if prob < 0.6 else RiskSeverity.HIGH.value)
        poll_pred.description = "Air quality index is satisfactory." if prob < 0.3 else "Fine particulates concentration increasing."
        session.add(poll_pred)


def generate_synthetic_live_updates():
    """
    Simulates real-time sensors feeding data.
    Jitters the current city state parameters slightly to create a 'living' dashboard.
    """
    with Session(engine) as session:
        latest_history = session.exec(
            select(CityStateHistory).order_by(CityStateHistory.timestamp.desc())
        ).first()
        
        if not latest_history:
            return
            
        city_state: CityState = CityState.parse_raw(latest_history.data_json)
        
        # Marginally modify parameters
        # Weather
        w = city_state.weather
        if w.condition != "Monsoon Deluge": # If storm simulation is not active
            w.temperature = round(w.temperature + random.uniform(-0.2, 0.2), 1)
            w.humidity = round(max(50.0, min(98.0, w.humidity + random.uniform(-1.0, 1.0))), 1)
            w.wind_speed = round(max(2.0, w.wind_speed + random.uniform(-0.5, 0.5)), 1)
            # Change condition sometimes
            if random.random() < 0.02:
                w.condition = random.choice(["Sunny Break", "Overcast Monsoon", "Heavy Drizzle", "Cloudy"])
        
        # Traffic
        t = city_state.traffic
        if len(t.closed_roads) == 0:
            # Mumbai-specific peak congestion ratios
            hour = datetime.utcnow().hour
            base_congestion = 65.0 if (8 <= hour <= 11 or 17 <= hour <= 20) else 35.0
            t.congestion_level = round(max(15.0, min(98.0, base_congestion + random.uniform(-4.0, 4.0))), 1)
            t.average_speed = round(max(8.0, min(50.0, 40.0 - (t.congestion_level * 0.3) + random.uniform(-1.5, 1.5))), 1)
            
        # Hospitals
        h = city_state.hospitals
        h.occupied_beds = int(max(2800, min(h.total_beds - 150, h.occupied_beds + random.choice([-8, -2, 0, 2, 8]))))
        h.icu_occupancy = round(max(55.0, min(95.0, (h.occupied_beds / h.total_beds) * 100 + random.uniform(-0.8, 0.8))), 1)
        h.available_ambulances = int(max(5, min(120, h.available_ambulances + random.choice([-3, -1, 0, 1, 3]))))
        h.patient_intake_rate = round(max(10.0, h.patient_intake_rate + random.uniform(-1.0, 1.0)), 1)
        
        # Air Quality
        a = city_state.air_quality
        if a.aqi < 200: # If road closed/pollution simulation not active
            a.aqi = int(max(60, min(220, a.aqi + random.choice([-4, -2, 0, 2, 4]))))
            a.pm25 = round(a.aqi * 0.35 + random.uniform(-0.5, 0.5), 1)
            a.co2 = round(450.0 + random.uniform(-8.0, 8.0), 1)
            
        # Water
        wat = city_state.water
        wat.reservoir_level = round(max(30.0, min(100.0, wat.reservoir_level + random.uniform(-0.02, 0.02))), 2)
        wat.daily_consumption = round(max(1100.0, wat.daily_consumption + random.uniform(-15.0, 15.0)), 1)
        
        # Energy
        e = city_state.energy
        if len(e.outages) == 0:
            hour = datetime.utcnow().hour
            base_load = 13500.0 if (18 <= hour <= 23) else (10500.0 if (0 <= hour <= 6) else 12000.0)
            e.grid_load = round(max(9000.0, min(e.capacity - 200, base_load + random.uniform(-100, 100))), 1)
            e.renewable_ratio = round(max(5.0, min(35.0, e.renewable_ratio + random.uniform(-0.3, 0.3))), 1)
            
        # Transport
        tr = city_state.transport
        tr.passenger_load = round(max(40.0, min(98.0, tr.passenger_load + random.uniform(-2.5, 2.5))), 1)
        
        # Infrastructure
        infra = city_state.infrastructure
        if random.random() < 0.01:
            infra.roads_maintenance_count = int(max(5, min(35, infra.roads_maintenance_count + random.choice([-2, 2]))))
            
        # Population
        pop = city_state.population
        pop.active_citizens = int(max(200000, min(2500000, pop.active_citizens + random.randint(-15000, 15000))))

        # Save to DB
        updated_history = CityStateHistory(
            timestamp=datetime.utcnow(),
            data_json=city_state.json()
        )
        session.add(updated_history)
        session.commit()
        
        # Run Multi-Agent cycle on top of the new sensor data
        run_agent_consensus_cycle()
