import json
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.database import (
    engine, CityStateHistory, AgentStateEntity, PredictionRecord,
    ExplainabilityRecord, InterventionEntity, GraphNodeEntity, GraphEdgeEntity
)
from app.schemas import (
    WeatherState, TrafficState, HospitalState, AirQualityState, WaterState,
    EnergyState, PopulationState, PublicTransportState, InfrastructureState,
    CityState, AgentStatus, RiskSeverity, RiskType, InterventionStatus
)

def seed_initial_data():
    with Session(engine) as session:
        # Check if already seeded
        if session.exec(select(AgentStateEntity)).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding initial localized Mumbai data...")

        # 1. Seed Initial City State History
        initial_weather = WeatherState(
            temperature=31.2, humidity=84.0, wind_speed=18.5, precipitation=2.0, condition="Monsoon Drizzle", uv_index=8
        )
        initial_traffic = TrafficState(
            average_speed=24.5, congestion_level=42.0, active_incidents=3, closed_roads=[]
        )
        initial_hospitals = HospitalState(
            total_beds=4500, occupied_beds=3200, icu_occupancy=71.2, available_ambulances=85, patient_intake_rate=48.5
        )
        initial_air_quality = AirQualityState(
            aqi=108, pm25=38.4, pm10=82.1, co2=485.0, no2=28.5, main_pollutant="PM2.5"
        )
        initial_water = WaterState(
            reservoir_level=64.8, daily_consumption=1450.0, water_quality=89.0, pressure_status="Normal"
        )
        initial_energy = EnergyState(
            grid_load=12850.0, capacity=16000.0, outages=[], renewable_ratio=18.5
        )
        initial_population = PopulationState(
            total_population=12400000, density=21000.0, active_citizens=850000
        )
        initial_transport = PublicTransportState(
            trains_active=128, buses_active=1240, metro_delay_minutes=4, passenger_load=78.5
        )
        initial_infrastructure = InfrastructureState(
            bridges_status=88.5, roads_maintenance_count=18, active_construction_zones=45
        )

        initial_city_state = CityState(
            weather=initial_weather,
            traffic=initial_traffic,
            hospitals=initial_hospitals,
            air_quality=initial_air_quality,
            water=initial_water,
            energy=initial_energy,
            population=initial_population,
            transport=initial_transport,
            infrastructure=initial_infrastructure
        )

        state_history = CityStateHistory(
            timestamp=datetime.utcnow(),
            data_json=initial_city_state.json()
        )
        session.add(state_history)

        # 2. Seed 12 Mumbai Localized Agents
        agents = [
            ("BMC Disaster Agent", "Monitors meteorological variables, high tide cycles, water-logging points, and issues flood alerts.", 0.95, ["Observed heavy accumulation in low-lying Kurla & Hindmata.", "High tide height projected at 4.6m."]),
            ("Traffic Police Agent", "Monitors bottleneck points like Western Express Highway, BKC junctions, and coordinates traffic reroutes.", 0.88, ["Traffic bottleneck detected at WEH near Santacruz.", "Slow moving traffic near Sea Link toll plaza."]),
            ("MahaVitaran Agent", "Monitors grid capacity loads and controls emergency load shedding at substations.", 0.92, ["High load demands from air conditioning units.", "Trombay Grid Substation operating within safety limits."]),
            ("BMC Health Agent", "Monitors public ward bed counts, vector-borne outbreaks, and ambulance standby capacities.", 0.90, ["Bed availability stable across public hospitals (KEM, Sion).", "Vector surveillance active in high density blocks."]),
            ("Hydro Utilities Agent", "Monitors reservoir water supply levels at Bhatsa, Tansa, and Vaitarna lakes.", 0.89, ["Water reservoir capacities are at 64.8%.", "Inflow rates from catchment areas remain moderate."]),
            ("MPCB Air Agent", "Monitors dust emissions from BKC construction sites, refineries, and vehicular pollutants.", 0.91, ["AQI is Moderate (108) with PM2.5 as main pollutant.", "Dust mitigation systems active at BKC metro sites."]),
            ("BEST Transit Agent", "Coordinates BEST double-decker bus routes, delays, and suburban local train line statuses.", 0.94, ["BEST bus load factors are high during evening peak hours.", "Central Line trains running with 4 minute delays."]),
            ("MMRDA Infra Agent", "Audits structural health of aging flyovers, coastal road tunnels, and Metro line safety.", 0.87, ["Structural audit of Worli flyover completed.", "Active construction monitoring on Coastal Road phase 2."]),
            ("Macroeconomics Agent", "Calculates commercial loss margins from commuter traffic delays and monsoon grid closures.", 0.85, ["Monsoon traffic delays calculated to cost ₹12 Crore daily in lost labor.", "Retail business activity in BKC remains resilient."]),
            ("Orchestrator Agent", "Coordinates multi-agent consensus protocols and routes task priorities during alerts.", 0.96, ["All agent channels synchronized.", "No active crisis commands registered."]),
            ("Risk Assessment Agent", "Performs mathematical probability calculations of upcoming monsoonal flooding and grid outages.", 0.93, ["Consolidated city risk factor is 32%.", "Monsoon runoff is primary risk driver."]),
            ("Explainability Agent", "Translates model coordinates and agent decisions into clear localized natural language explanations.", 0.97, ["Audit trails compiled.", "Consensus factors logged."])
        ]

        for name, role, confidence, obs in agents:
            agent = AgentStateEntity(
                name=name,
                role=role,
                status=AgentStatus.IDLE.value,
                last_execution=datetime.utcnow(),
                confidence=confidence,
                observations_json=json.dumps(obs),
                recommendations_json=json.dumps([])
            )
            session.add(agent)

        # 3. Seed Predictions and Explainability
        predictions = [
            (RiskType.FLOOD.value, 0.35, 0.95, RiskSeverity.MEDIUM.value, "Next 6 hours", "Water logging risk at Hindmata and Kurla due to high tide overlap."),
            (RiskType.TRAFFIC.value, 0.58, 0.88, RiskSeverity.HIGH.value, "Next 1 hour", "Severe gridlock on Western Express Highway due to metro construction."),
            (RiskType.HOSPITAL.value, 0.18, 0.90, RiskSeverity.LOW.value, "Next 12 hours", "Inpatient counts within safety limits at public hospitals."),
            (RiskType.POWER.value, 0.12, 0.92, RiskSeverity.LOW.value, "Next 6 hours", "Grid load stable; high reserves at Trombay."),
            (RiskType.WATER.value, 0.05, 0.94, RiskSeverity.LOW.value, "Next 15 days", "Catchment area rainfall is sustaining reservoir levels."),
            (RiskType.HEATWAVE.value, 0.10, 0.98, RiskSeverity.LOW.value, "Next 2 days", "Relative humidity high, but temperature below heatwave triggers."),
            (RiskType.POLLUTION.value, 0.45, 0.87, RiskSeverity.MEDIUM.value, "Next 24 hours", "Elevated particulate dust due to subway construction at BKC.")
        ]

        for rtype, prob, conf, sev, timeline, desc in predictions:
            prediction = PredictionRecord(
                risk_type=rtype,
                probability=prob,
                confidence=conf,
                severity=sev,
                timeline=timeline,
                description=desc,
                timestamp=datetime.utcnow()
            )
            session.add(prediction)

            # Generate explanation matching the Mumbai layout
            explanation = ExplainabilityRecord(
                risk_type=rtype,
                data_used_json=json.dumps(["precipitation", "high_tide_height", "drainage_discharge"] if rtype == "flood_risk" else ["active_constructions", "lane_closures", "speed_telemetry"]),
                reasoning_steps_json=json.dumps([
                    "1. Monitored rainfall levels at Mumbai sensors.",
                    "2. Checked high tide predictions from BMC coastal stations.",
                    "3. Calculated drainage discharge capacities during peak tide overlap."
                ] if rtype == "flood_risk" else [
                    "1. Tracked speed sensors along WEH and Link Road.",
                    "2. Audited construction barriers narrowing lanes near Santacruz.",
                    "3. Simulated traffic diversion loads."
                ]),
                agent_contributions_json=json.dumps({
                    "BMC Disaster Agent": 65.0 if rtype == "flood_risk" else 10.0,
                    "Traffic Police Agent": 60.0 if rtype == "traffic_congestion" else 10.0,
                    "Risk Assessment Agent": 25.0,
                }),
                confidence_score=conf * 100,
                uncertainty_factors_json=json.dumps(["monsoon_intensity_fluctuation" if rtype == "flood_risk" else "sudden_vehicle_breakdowns"])
            )
            session.add(explanation)

        # 4. Seed Proposed Interventions (in INR / Indian Rupees)
        interventions = [
            ("int_1", "Activate BMC Water Pumps", "Deploy heavy de-watering pumps at Hindmata and Sion waterlogging spots.", RiskType.FLOOD.value, 250000.0, 15000000.0, 0.95, 92.0, InterventionStatus.PROPOSED.value),
            ("int_2", "Reroute BEST Bus Channels", "Divert BKC bus routes via Coastal Highway links to avoid construction barriers.", RiskType.TRAFFIC.value, 50000.0, 800000.0, 0.88, 74.5, InterventionStatus.PROPOSED.value),
            ("int_3", "Pre-position NDRF Evacuation Boats", "Deploy rescue boats and teams near Kurla residential channels.", RiskType.FLOOD.value, 800000.0, 25000000.0, 0.92, 88.0, InterventionStatus.PROPOSED.value),
            ("int_4", "Enforce BKC Dust Screen Shields", "Issue compliance notifications to wrap constructions in dust containment screens.", RiskType.POLLUTION.value, 150000.0, 1200000.0, 0.85, 71.0, InterventionStatus.PROPOSED.value),
            ("int_5", "Activate Substation Load Shedding", "Temporarily route power load from industrial docks to Sion trauma hospitals.", RiskType.POWER.value, 75000.0, 5000000.0, 0.94, 82.5, InterventionStatus.PROPOSED.value)
        ]

        for iid, title, desc, trisk, cost, ben, conf, score, status in interventions:
            interv = InterventionEntity(
                id=iid,
                title=title,
                description=desc,
                target_risk=trisk,
                expected_cost=cost,
                expected_benefit=ben,
                confidence=conf,
                impact_score=score,
                status=status
            )
            session.add(interv)

        # 5. Seed World Model Graph (Mumbai Geographic Map Center: 19.0330, 72.8540)
        # We align React Flow nodes with Mumbai infrastructure entities
        nodes = [
            ("weather_node", "Colaba Weather Observatory", "weather", "Normal", {"temp": 31.2, "humidity": 84}, 400.0, 100.0),
            ("traffic_grid", "Western Express Highway Grid", "traffic", "Warning", {"congestion": 42.0, "speed": 24.5}, 400.0, 300.0),
            ("city_hospital", "KEM Sion Public Hospital", "hospital", "Normal", {"beds_occupied": 3200, "total_beds": 4500}, 200.0, 450.0),
            ("power_station", "Trombay Energy Hub", "power", "Normal", {"load": 12850, "capacity": 16000}, 600.0, 250.0),
            ("water_supply", "Bhatsa Lake Reservoir", "water", "Normal", {"level": 64.8}, 200.0, 200.0),
            ("central_school", "BKC International School", "school", "Normal", {"active_students": 3200}, 600.0, 450.0),
            ("population_center", "Dharavi Residential Grid", "population", "Normal", {"density": 21000}, 400.0, 520.0)
        ]

        for nid, label, ntype, status, metrics, x, y in nodes:
            node = GraphNodeEntity(
                id=nid,
                label=label,
                type=ntype,
                status=status,
                metrics_json=json.dumps(metrics),
                x=x,
                y=y
            )
            session.add(node)

        edges = [
            ("e1", "weather_node", "traffic_grid", "Precipitation slows speeds on", "affects", 1.5),
            ("e2", "weather_node", "water_supply", "Catchment rain feeds", "affects", 1.8),
            ("e3", "power_station", "city_hospital", "Sustains electrical lines of", "supplies", 2.0),
            ("e4", "power_station", "central_school", "Powers BKC school site", "supplies", 1.0),
            ("e5", "water_supply", "population_center", "Supplies drinking water to", "supplies", 2.2),
            ("e6", "water_supply", "city_hospital", "Supplies ward clean water to", "supplies", 1.5),
            ("e7", "traffic_grid", "population_center", "Regulates flow boundaries in", "monitors", 1.3),
            ("e8", "traffic_grid", "city_hospital", "Coordinates ambulance route access", "affects", 1.6),
            ("e9", "power_station", "population_center", "Powers domestic grid segments", "supplies", 1.8),
            ("e10", "population_center", "central_school", "Sends pupils to", "connects", 1.2)
        ]

        for eid, src, tgt, label, rel, weight in edges:
            edge = GraphEdgeEntity(
                id=eid,
                source=src,
                target=tgt,
                label=label,
                relationship=rel,
                weight=weight
            )
            session.add(edge)

        session.commit()
        print("Mumbai seed complete!")

if __name__ == "__main__":
    init_db()
    seed_initial_data()
