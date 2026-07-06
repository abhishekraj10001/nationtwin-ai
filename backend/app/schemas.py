from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

# --- City State Sub-Models ---

class WeatherState(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Humidity percentage (0-100)")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    precipitation: float = Field(..., description="Precipitation in mm")
    condition: str = Field(..., description="Weather condition (e.g. Sunny, Rainy, Stormy)")
    uv_index: int = Field(..., description="UV Index (0-11+)")

class TrafficState(BaseModel):
    average_speed: float = Field(..., description="Average traffic speed in km/h")
    congestion_level: float = Field(..., description="Congestion level percentage (0-100)")
    active_incidents: int = Field(..., description="Number of active traffic incidents")
    closed_roads: List[str] = Field(default_factory=list, description="List of closed roads/streets")

class HospitalState(BaseModel):
    total_beds: int = Field(..., description="Total hospital bed capacity")
    occupied_beds: int = Field(..., description="Number of occupied beds")
    icu_occupancy: float = Field(..., description="ICU occupancy percentage (0-100)")
    available_ambulances: int = Field(..., description="Number of available ambulances")
    patient_intake_rate: float = Field(..., description="Patients admitted per hour")

class AirQualityState(BaseModel):
    aqi: int = Field(..., description="Air Quality Index (0-500)")
    pm25: float = Field(..., description="PM2.5 concentration in ug/m3")
    pm10: float = Field(..., description="PM10 concentration in ug/m3")
    co2: float = Field(..., description="CO2 concentration in ppm")
    no2: float = Field(..., description="NO2 concentration in ppb")
    main_pollutant: str = Field(..., description="Main pollutant responsible for AQI")

class WaterState(BaseModel):
    reservoir_level: float = Field(..., description="Water reservoir level percentage (0-100)")
    daily_consumption: float = Field(..., description="Daily water consumption in million liters")
    water_quality: float = Field(..., description="Water quality score (0-100)")
    pressure_status: str = Field(..., description="Water network pressure status (Normal, Low, High)")

class EnergyState(BaseModel):
    grid_load: float = Field(..., description="Current grid load in Megawatts (MW)")
    capacity: float = Field(..., description="Total grid capacity in Megawatts (MW)")
    outages: List[str] = Field(default_factory=list, description="Areas experiencing power outages")
    renewable_ratio: float = Field(..., description="Percentage of energy generated from renewables")

class PopulationState(BaseModel):
    total_population: int = Field(..., description="Total estimated city population")
    density: float = Field(..., description="Population density in people/km2")
    active_citizens: int = Field(..., description="Number of citizens active in transit/public areas")

class PublicTransportState(BaseModel):
    trains_active: int = Field(..., description="Number of trains currently running")
    buses_active: int = Field(..., description="Number of buses currently running")
    metro_delay_minutes: int = Field(..., description="Average delay in minutes")
    passenger_load: float = Field(..., description="Public transport load factor percentage (0-100)")

class InfrastructureState(BaseModel):
    bridges_status: float = Field(..., description="Average structural health score of bridges (0-100)")
    roads_maintenance_count: int = Field(..., description="Number of active road maintenance zones")
    active_construction_zones: int = Field(..., description="Number of active construction sites")

# --- Consolidated City State ---

class CityState(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    weather: WeatherState
    traffic: TrafficState
    hospitals: HospitalState
    air_quality: AirQualityState
    water: WaterState
    energy: EnergyState
    population: PopulationState
    transport: PublicTransportState
    infrastructure: InfrastructureState

# --- Multi-Agent System ---

class AgentStatus(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    ERROR = "error"

class AgentState(BaseModel):
    name: str = Field(..., description="Name of the Agent (e.g. Weather Agent)")
    role: str = Field(..., description="Functional role of the agent")
    status: AgentStatus = Field(default=AgentStatus.IDLE)
    last_execution: datetime = Field(default_factory=datetime.utcnow)
    confidence: float = Field(..., description="Agent confidence score (0.0 - 1.0)")
    observations: List[str] = Field(default_factory=list, description="Current agent observations")
    recommendations: List[str] = Field(default_factory=list, description="Recommended interventions proposed by agent")

# --- Predictions & Explainability ---

class RiskSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskType(str, Enum):
    FLOOD = "flood_risk"
    TRAFFIC = "traffic_congestion"
    HOSPITAL = "hospital_overload"
    POWER = "power_outage"
    WATER = "water_shortage"
    HEATWAVE = "heatwave"
    POLLUTION = "air_pollution"

class RiskPrediction(BaseModel):
    type: RiskType
    probability: float = Field(..., description="Risk probability (0.0 - 1.0)")
    confidence: float = Field(..., description="Confidence of the prediction (0.0 - 1.0)")
    severity: RiskSeverity
    timeline: str = Field(..., description="Timeline of risk occurrence (e.g. 'Next 6 hours')")
    description: str = Field(..., description="Summary of the prediction")

class PredictionExplanation(BaseModel):
    risk_type: RiskType
    data_used: List[str] = Field(default_factory=list, description="List of city state variables analyzed")
    reasoning_steps: List[str] = Field(default_factory=list, description="Reasoning path used by the agent")
    agent_contributions: Dict[str, float] = Field(default_factory=dict, description="Percentage of contribution from each agent")
    confidence_score: float = Field(..., description="Confidence percentage (0-100)")
    uncertainty_factors: List[str] = Field(default_factory=list, description="Variables causing prediction uncertainty")

# --- Simulation Engine ---

class SimulationScenario(str, Enum):
    RAIN = "increase_rainfall_40"
    ROAD_CLOSE = "road_closure_major"
    POWER_FAILURE = "power_plant_failure"
    HOSPITAL_SHUTDOWN = "hospital_shutdown"
    FESTIVAL = "festival_crowd"
    PANDEMIC = "pandemic_outbreak"

class SimulationParams(BaseModel):
    scenario: SimulationScenario
    intensity: float = Field(default=1.0, description="Multiplier for severity of scenario (0.1 - 2.0)")

class SimulationStep(BaseModel):
    time_offset_hours: int
    economic_impact_million_inr: float
    lives_affected: int
    infrastructure_damage_million_inr: float
    recovery_progress: float = Field(..., description="Percentage of system recovery (0-100)")
    severity_level: float = Field(..., description="Computed severity factor (0-100)")

class SimulationResult(BaseModel):
    id: str
    scenario: SimulationScenario
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    economic_impact_total: float = Field(..., description="Total cost in Million INR")
    lives_affected_total: int
    infrastructure_damage_total: float = Field(..., description="Total property damage in Million INR")
    recovery_time_days: float
    timeline: List[SimulationStep] = Field(default_factory=list)

# --- Recommendations Engine ---

class InterventionStatus(str, Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    EXECUTED = "executed"
    REJECTED = "rejected"

class Intervention(BaseModel):
    id: str
    title: str
    description: str
    target_risk: RiskType
    expected_cost: float = Field(..., description="Cost of action in INR")
    expected_benefit: float = Field(..., description="Economic/human benefit in INR")
    confidence: float = Field(..., description="Orchestrator confidence (0.0 - 1.0)")
    impact_score: float = Field(..., description="Overall score rating (0-100)")
    status: InterventionStatus = Field(default=InterventionStatus.PROPOSED)

# --- World Model Graph ---

class GraphNodeType(str, Enum):
    WEATHER = "weather"
    TRAFFIC = "traffic"
    HOSPITAL = "hospital"
    POWER = "power"
    WATER = "water"
    SCHOOL = "school"
    POPULATION = "population"

class GraphNode(BaseModel):
    id: str
    label: str
    type: GraphNodeType
    status: str  # e.g., Normal, Overloaded, Outage, Warning
    metrics: Dict[str, Any] = Field(default_factory=dict)
    x: float
    y: float

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relationship: str  # e.g. "supplies", "affects", "monitors"
    weight: float = Field(default=1.0)
