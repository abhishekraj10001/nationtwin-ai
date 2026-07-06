// NationTwin AI API Integration Client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Stateful client-side mock data fallback (in case backend is offline)
let mockCityState = {
  weather: { temperature: 31.2, humidity: 84.0, wind_speed: 18.5, precipitation: 2.0, condition: "Monsoon Drizzle", uv_index: 8 },
  traffic: { average_speed: 24.5, congestion_level: 42.0, active_incidents: 3, closed_roads: [] as string[] },
  hospitals: { total_beds: 4500, occupied_beds: 3200, icu_occupancy: 71.2, available_ambulances: 85, patient_intake_rate: 48.5 },
  air_quality: { aqi: 108, pm25: 38.4, pm10: 82.1, co2: 485.0, no2: 28.5, main_pollutant: "PM2.5" },
  water: { reservoir_level: 64.8, daily_consumption: 1450.0, water_quality: 89.0, pressure_status: "Normal" },
  energy: { grid_load: 12850.0, capacity: 16000.0, outages: [] as string[], renewable_ratio: 18.5 },
  population: { total_population: 12400000, density: 21000.0, active_citizens: 850000 },
  transport: { trains_active: 128, buses_active: 1240, metro_delay_minutes: 4, passenger_load: 78.5 },
  infrastructure: { bridges_status: 88.5, roads_maintenance_count: 18, active_construction_zones: 45 }
};

let mockAgents = [
  { name: "BMC Disaster Agent", role: "Monitors meteorological variables, high tide cycles, water-logging points, and issues flood alerts.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.95, observations: ["Observed heavy accumulation in low-lying Kurla & Hindmata.", "High tide height projected at 4.6m."], recommendations: [] },
  { name: "Traffic Police Agent", role: "Monitors bottleneck points like Western Express Highway, BKC junctions, and coordinates traffic reroutes.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.88, observations: ["Traffic bottleneck detected at WEH near Santacruz.", "Slow moving traffic near Sea Link toll plaza."], recommendations: [] },
  { name: "MahaVitaran Agent", role: "Monitors grid capacity loads and controls emergency load shedding at substations.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.92, observations: ["High load demands from air conditioning units.", "Trombay Grid Substation operating within safety limits."], recommendations: [] },
  { name: "BMC Health Agent", role: "Monitors public ward bed counts, vector-borne outbreaks, and ambulance standby capacities.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.90, observations: ["Bed availability stable across public hospitals (KEM, Sion).", "Vector surveillance active in high density blocks."], recommendations: [] },
  { name: "Hydro Utilities Agent", role: "Monitors reservoir water supply levels at Bhatsa, Tansa, and Vaitarna lakes.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.89, observations: ["Water reservoir capacities are at 64.8%.", "Inflow rates from catchment areas remain moderate."], recommendations: [] },
  { name: "MPCB Air Agent", role: "Monitors dust emissions from BKC construction sites, refineries, and vehicular pollutants.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.91, observations: ["AQI is Moderate (108) with PM2.5 as main pollutant.", "Dust mitigation systems active at BKC metro sites."], recommendations: [] },
  { name: "BEST Transit Agent", role: "Coordinates BEST double-decker bus routes, delays, and suburban local train line statuses.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.94, observations: ["BEST bus load factors are high during evening peak hours.", "Central Line trains running with 4 minute delays."], recommendations: [] },
  { name: "MMRDA Infra Agent", role: "Audits structural health of aging flyovers, coastal road tunnels, and Metro line safety.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.87, observations: ["Structural audit of Worli flyover completed.", "Active construction monitoring on Coastal Road phase 2."], recommendations: [] },
  { name: "Macroeconomics Agent", role: "Calculates commercial loss margins from commuter traffic delays and monsoon grid closures.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.85, observations: ["Monsoon traffic delays calculated to cost ₹12 Crore daily in lost labor.", "Retail business activity in BKC remains resilient."], recommendations: [] },
  { name: "Orchestrator Agent", role: "Coordinates multi-agent consensus protocols and routes task priorities during alerts.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.96, observations: ["All agent channels synchronized.", "No active crisis commands registered."], recommendations: [] },
  { name: "Risk Assessment Agent", role: "Performs mathematical probability calculations of upcoming monsoonal flooding and grid outages.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.93, observations: ["Consolidated city risk factor is 32%.", "Monsoon runoff is primary risk driver."], recommendations: [] },
  { name: "Explainability Agent", role: "Translates model coordinates and agent decisions into clear localized natural language explanations.", status: "idle", last_execution: new Date().toISOString(), confidence: 0.97, observations: ["Explainability database ready.", "Analyzing consensus factors for active predictions."], recommendations: [] }
];

let mockPredictions = [
  { type: "flood_risk", probability: 0.35, confidence: 0.95, severity: "medium", timeline: "Next 6 hours", description: "Water logging risk at Hindmata and Kurla due to high tide overlap." },
  { type: "traffic_congestion", probability: 0.58, confidence: 0.88, severity: "high", timeline: "Next 1 hour", description: "Severe gridlock on Western Express Highway due to metro construction." },
  { type: "hospital_overload", probability: 0.18, confidence: 0.90, severity: "low", timeline: "Next 12 hours", description: "Inpatient counts within safety limits at public hospitals." },
  { type: "power_outage", probability: 0.12, confidence: 0.92, severity: "low", timeline: "Next 6 hours", description: "Grid load stable; high reserves at Trombay." },
  { type: "water_shortage", probability: 0.05, confidence: 0.94, severity: "low", timeline: "Next 15 days", description: "Catchment area rainfall is sustaining reservoir levels." },
  { type: "heatwave", probability: 0.10, confidence: 0.98, severity: "low", timeline: "Next 2 days", description: "Relative humidity high, but temperature below heatwave triggers." },
  { type: "air_pollution", probability: 0.45, confidence: 0.87, severity: "medium", timeline: "Next 24 hours", description: "Elevated particulate dust due to subway construction at BKC." }
];

let mockInterventions = [
  { id: "int_1", title: "Activate BMC Water Pumps", description: "Deploy heavy de-watering pumps at Hindmata and Sion waterlogging spots.", target_risk: "flood_risk", expected_cost: 250000.0, expected_benefit: 15000000.0, confidence: 0.95, impact_score: 92.0, status: "proposed" },
  { id: "int_2", title: "Reroute BEST Bus Channels", description: "Divert BKC bus routes via Coastal Highway links to avoid construction barriers.", target_risk: "traffic_congestion", expected_cost: 50000.0, expected_benefit: 800000.0, confidence: 0.88, impact_score: 74.5, status: "proposed" },
  { id: "int_3", title: "Pre-position NDRF Evacuation Boats", description: "Deploy rescue boats and teams near Kurla residential channels.", target_risk: "flood_risk", expected_cost: 800000.0, expected_benefit: 25000000.0, confidence: 0.92, impact_score: 88.0, status: "proposed" },
  { id: "int_4", title: "Enforce BKC Dust Screen Shields", description: "Issue compliance notifications to wrap constructions in dust containment screens.", target_risk: "air_pollution", expected_cost: 150000.0, expected_benefit: 1200000.0, confidence: 0.85, impact_score: 71.0, status: "proposed" },
  { id: "int_5", title: "Activate Substation Load Shedding", description: "Temporarily route power load from industrial docks to Sion trauma hospitals.", target_risk: "power_outage", expected_cost: 75000.0, expected_benefit: 5000000.0, confidence: 0.94, impact_score: 82.5, status: "proposed" }
];

let mockSimulationsHistory = [] as any[];

// World model graph data (React Flow format nodes/edges)
let mockGraphData = {
  nodes: [
    { id: "weather_node", label: "Colaba Weather Observatory", type: "weather", status: "Normal", metrics: { temp: 31.2, humidity: 84 }, x: 400, y: 50 },
    { id: "traffic_grid", label: "Western Express Highway Grid", type: "traffic", status: "Warning", metrics: { congestion: 42.0, speed: 24.5 }, x: 400, y: 220 },
    { id: "city_hospital", label: "KEM Sion Public Hospital", type: "hospital", status: "Normal", metrics: { beds_occupied: 3200, total_beds: 4500 }, x: 150, y: 380 },
    { id: "power_station", label: "Trombay Energy Hub", type: "power", status: "Normal", metrics: { load: 12850, capacity: 16000 }, x: 650, y: 180 },
    { id: "water_supply", label: "Bhatsa Lake Reservoir", type: "water", status: "Normal", metrics: { level: 64.8 }, x: 150, y: 150 },
    { id: "central_school", label: "BKC International School", type: "school", status: "Normal", metrics: { active_students: 3200 }, x: 650, y: 380 },
    { id: "population_center", label: "Dharavi Residential Grid", type: "population", status: "Normal", metrics: { density: 21000 }, x: 400, y: 440 }
  ],
  edges: [
    { id: "e1", source: "weather_node", target: "traffic_grid", label: "Precipitation slows speeds on", relationship: "affects", weight: 1.5 },
    { id: "e2", source: "weather_node", target: "water_supply", label: "Catchment rain feeds", relationship: "affects", weight: 1.8 },
    { id: "e3", source: "power_station", target: "city_hospital", label: "Sustains electrical lines of", relationship: "supplies", weight: 2.0 },
    { id: "e4", source: "power_station", target: "central_school", label: "Powers BKC school site", relationship: "supplies", weight: 1.0 },
    { id: "e5", source: "water_supply", target: "population_center", label: "Supplies drinking water to", relationship: "supplies", weight: 2.2 },
    { id: "e6", source: "water_supply", target: "city_hospital", label: "Supplies ward clean water to", relationship: "supplies", weight: 1.5 },
    { id: "e7", source: "traffic_grid", target: "population_center", label: "Regulates flow boundaries in", relationship: "monitors", weight: 1.3 },
    { id: "e8", source: "traffic_grid", target: "city_hospital", label: "Coordinates emergency route to", relationship: "affects", weight: 1.6 },
    { id: "e9", source: "power_station", target: "population_center", label: "Powers domestic grid segments", relationship: "supplies", weight: 1.8 },
    { id: "e10", source: "population_center", target: "central_school", label: "Sends students to", relationship: "connects", weight: 1.2 }
  ]
};

// Periodic local simulator to update mock state variables (mimicking backend background thread)
if (typeof window !== 'undefined') {
  setInterval(() => {
    // Generate subtle sensor shifts
    mockCityState.weather.temperature = parseFloat((mockCityState.weather.temperature + (Math.random() - 0.5) * 0.3).toFixed(1));
    mockCityState.weather.humidity = parseFloat(Math.max(50, Math.min(98, mockCityState.weather.humidity + (Math.random() - 0.5) * 1.5)).toFixed(1));
    
    const hour = new Date().getHours();
    const baseCongestion = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20) ? 65 : 35;
    mockCityState.traffic.congestion_level = parseFloat(Math.max(15, Math.min(98, baseCongestion + (Math.random() - 0.5) * 5)).toFixed(1));
    mockCityState.traffic.average_speed = parseFloat(Math.max(8, Math.min(50, 40 - mockCityState.traffic.congestion_level * 0.3)).toFixed(1));
    
    mockCityState.hospitals.occupied_beds = Math.max(2800, Math.min(4300, mockCityState.hospitals.occupied_beds + (Math.random() > 0.5 ? 4 : -4)));
    mockCityState.hospitals.icu_occupancy = parseFloat(((mockCityState.hospitals.occupied_beds / mockCityState.hospitals.total_beds) * 100).toFixed(1));
    
    mockCityState.energy.grid_load = parseFloat(Math.max(9000, Math.min(15800, mockCityState.energy.grid_load + (Math.random() - 0.5) * 150)).toFixed(1));
    mockCityState.energy.renewable_ratio = parseFloat(Math.max(5, Math.min(35, mockCityState.energy.renewable_ratio + (Math.random() - 0.5) * 0.8)).toFixed(1));
    
    mockCityState.air_quality.aqi = Math.max(60, Math.min(220, mockCityState.air_quality.aqi + (Math.random() > 0.5 ? 2 : -2)));
    mockCityState.air_quality.pm25 = parseFloat((mockCityState.air_quality.aqi * 0.35).toFixed(1));

    // Update agent executions
    mockAgents = mockAgents.map(a => ({
      ...a,
      last_execution: new Date().toISOString(),
      confidence: parseFloat(Math.max(0.75, Math.min(0.99, a.confidence + (Math.random() - 0.5) * 0.02)).toFixed(2))
    }));

    // Update predictions mildly
    mockPredictions = mockPredictions.map(p => {
      let prob = p.probability;
      if (p.type === 'traffic_congestion') {
        prob = mockCityState.traffic.congestion_level / 100;
      } else if (p.type === 'hospital_overload') {
        prob = (mockCityState.hospitals.icu_occupancy / 100) * 0.8;
      }
      return {
        ...p,
        probability: parseFloat(Math.max(0.01, Math.min(0.99, prob)).toFixed(2)),
        severity: prob < 0.3 ? 'low' : (prob < 0.75 ? 'medium' : 'high')
      };
    });
  }, 5000);
}

// Helper fetch wrapper
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`Falling back to client-side mock data for: ${endpoint}. Error:`, error);
    return getMockFallback(endpoint, options);
  }
}

// Mock handlers to replicate backend functionality
function getMockFallback(endpoint: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  
  if (endpoint === '/auth/login/google') {
    return {
      status: "success",
      user: { name: "Alex Mercer", email: "a.mercer@gov.nationtwin.ai", role: "Chief City Planner", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex" },
      token: "mock-google-jwt-token-12345"
    };
  }
  
  if (endpoint === '/auth/login/guest') {
    return {
      status: "success",
      user: { name: "Guest Operator", email: "operator@guest.nationtwin.ai", role: "Visitor Mode", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Guest" },
      token: "mock-guest-token-67890"
    };
  }

  if (endpoint === '/city/state') {
    return mockCityState;
  }

  if (endpoint.startsWith('/city/history')) {
    // Generate simulated 24h timeline
    const history = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      history.push({
        timestamp: time.toISOString(),
        weather: { temperature: 20 + Math.sin(i) * 5, precipitation: i === 5 ? 4.2 : 0 },
        traffic: { congestion_level: 25 + Math.sin(i * 1.5) * 15, average_speed: 40 - Math.sin(i * 1.5) * 8 },
        hospitals: { icu_occupancy: 60 + Math.sin(i) * 10 },
        energy: { grid_load: 3000 + Math.cos(i) * 500, capacity: 5000 },
        air_quality: { aqi: 40 + Math.sin(i) * 15 }
      });
    }
    return history;
  }

  if (endpoint === '/agents') {
    return mockAgents;
  }

  if (endpoint.startsWith('/agents/') && endpoint.endsWith('/trigger')) {
    const parts = endpoint.split('/');
    const name = decodeURIComponent(parts[2]);
    const agent = mockAgents.find(a => a.name === name);
    if (agent) {
      agent.status = 'working';
      setTimeout(() => { agent.status = 'idle'; }, 1000);
      agent.observations.unshift(`Manual trigger fired locally at ${new Date().toLocaleTimeString()}`);
      agent.observations = agent.observations.slice(0, 5);
      return { status: "success", agent };
    }
    return { status: "error", message: "Agent not found" };
  }

  if (endpoint === '/predictions') {
    return mockPredictions;
  }

  if (endpoint.startsWith('/predictions/') && endpoint.endsWith('/explain')) {
    const parts = endpoint.split('/');
    const rtype = parts[2];
    const pred = mockPredictions.find(p => p.type === rtype);
    
    return {
      risk_type: rtype,
      data_used: rtype === 'flood_risk' ? ["precipitation", "reservoir_level", "bridges_status"] : ["congestion_level", "active_incidents", "average_speed"],
      reasoning_steps: [
        "1. live telemetry collected from sensors.",
        "2. correlated with standard trigger variables.",
        "3. run agent consensus projection rules."
      ],
      agent_contributions: {
        "Risk Assessment Agent": 30,
        "Weather Agent": rtype === 'flood_risk' ? 50 : 10,
        "Traffic Agent": rtype === 'traffic_congestion' ? 50 : 10,
        "Explainability Agent": 20
      },
      confidence_score: (pred?.confidence || 0.8) * 100,
      uncertainty_factors: ["sensor_jitter", "microclimate_shift"]
    };
  }

  if (endpoint === '/recommendations') {
    return mockInterventions;
  }

  if (endpoint.startsWith('/recommendations/') && endpoint.endsWith('/action')) {
    const parts = endpoint.split('/');
    const iid = parts[2];
    // Find action query param
    const action = endpoint.includes('action=approve') ? 'approved' : (endpoint.includes('action=execute') ? 'executed' : 'rejected');
    const interv = mockInterventions.find(i => i.id === iid);
    if (interv) {
      interv.status = action;
      if (action === 'executed') {
        // lower risk probability
        const pred = mockPredictions.find(p => p.type === interv.target_risk);
        if (pred) {
          pred.probability = parseFloat(Math.max(0.01, pred.probability - 0.25).toFixed(2));
          pred.severity = pred.probability < 0.25 ? 'low' : 'medium';
        }
      }
      return { status: "success", intervention_id: iid, new_status: action };
    }
    return { status: "error", message: "Intervention not found" };
  }

  if (endpoint === '/world-model') {
    return mockGraphData;
  }

  if (endpoint === '/simulations' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    const scenario = body.scenario;
    const intensity = body.intensity || 1.0;

    // Apply simulation impacts to local mocks
    if (scenario === 'increase_rainfall_40') {
      mockCityState.weather.precipitation = 45.0 * intensity;
      mockCityState.weather.condition = 'Monsoon Deluge';
      mockCityState.traffic.congestion_level = Math.min(100, mockCityState.traffic.congestion_level + 45 * intensity);
      mockCityState.water.reservoir_level = Math.min(100, mockCityState.water.reservoir_level + 15 * intensity);
      // elevate predictions
      const pred = mockPredictions.find(p => p.type === 'flood_risk');
      if (pred) {
        pred.probability = parseFloat(Math.min(0.99, 0.92 * intensity).toFixed(2));
        pred.severity = 'critical';
        pred.description = 'Critical monsoonal flooding and tide overlap detected.';
      }
    } else if (scenario === 'road_closure_major') {
      mockCityState.traffic.congestion_level = Math.min(100, mockCityState.traffic.congestion_level + 55 * intensity);
      mockCityState.traffic.average_speed = Math.max(5, mockCityState.traffic.average_speed - 18 * intensity);
      mockCityState.traffic.closed_roads = ["Bandra-Worli Sea Link Grid", "SVP Rd Junction"];
      const pred = mockPredictions.find(p => p.type === 'traffic_congestion');
      if (pred) {
        pred.probability = 0.98;
        pred.severity = 'critical';
        pred.description = 'Western Express Highway gridlocked; Sea Link closed.';
      }
    } else if (scenario === 'power_plant_failure') {
      mockCityState.energy.outages = ["Dharavi Sector 3 Outage", "Sion Trauma Grid"];
      mockCityState.energy.grid_load = Math.max(0, mockCityState.energy.grid_load - 2500 * intensity);
      const pred = mockPredictions.find(p => p.type === 'power_outage');
      if (pred) {
        pred.probability = 0.95;
        pred.severity = 'critical';
        pred.description = 'Trombay power plant relays tripped; blackouts active.';
      }
    }

    const steps = [];
    for (let i = 0; i <= 6; i++) {
      steps.push({
        time_offset_hours: i * 4,
        economic_impact_million_inr: parseFloat((Math.sin(i / 2) * 15 * intensity).toFixed(2)),
        lives_affected: Math.floor(250 * i * intensity),
        infrastructure_damage_million_inr: parseFloat((i * 6.5 * intensity).toFixed(2)),
        recovery_progress: parseFloat(((i / 6) * 100).toFixed(1)),
        severity_level: parseFloat((100 - i * 15).toFixed(1))
      });
    }

    const newSim = {
      id: `sim_local_${Math.floor(Math.random() * 10000)}`,
      scenario,
      timestamp: new Date().toISOString(),
      economic_impact_total: parseFloat((65.0 * intensity).toFixed(2)),
      lives_affected_total: Math.floor(1250 * intensity),
      infrastructure_damage_total: parseFloat((32.8 * intensity).toFixed(2)),
      recovery_time_days: 4.0 * intensity,
      timeline: steps
    };

    mockSimulationsHistory.unshift(newSim);
    return newSim;
  }

  if (endpoint === '/simulations/history') {
    return mockSimulationsHistory;
  }

  throw new Error(`Endpoint not mockable: ${endpoint}`);
}

export const api = {
  // Auth
  loginGoogle: () => fetchAPI('/auth/login/google', { method: 'POST' }),
  loginGuest: () => fetchAPI('/auth/login/guest', { method: 'POST' }),
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
  
  // City Telemetry
  getCityState: () => fetchAPI('/city/state'),
  getCityHistory: (hours = 6) => fetchAPI(`/city/history?hours=${hours}`),
  
  // Agents
  getAgents: () => fetchAPI('/agents'),
  triggerAgent: (name: string) => fetchAPI(`/agents/${encodeURIComponent(name)}/trigger`, { method: 'POST' }),
  
  // Predictions
  getPredictions: () => fetchAPI('/predictions'),
  getPredictionExplain: (riskType: string) => fetchAPI(`/predictions/${riskType}/explain`),
  
  // Simulations
  runSimulation: (scenario: string, intensity = 1.0) => fetchAPI('/simulations', {
    method: 'POST',
    body: JSON.stringify({ scenario, intensity })
  }),
  getSimulationsHistory: () => fetchAPI('/simulations/history'),
  
  // Recommendations
  getRecommendations: () => fetchAPI('/recommendations'),
  executeRecommendation: (id: string, action: 'approve' | 'reject' | 'execute') => 
    fetchAPI(`/recommendations/${id}/action?action=${action}`, { method: 'POST' }),
    
  // World Model
  getWorldModel: () => fetchAPI('/world-model')
};
