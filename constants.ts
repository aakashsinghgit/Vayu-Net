
import { City, ProjectStatus, Zone, InterventionProject, AnalysisReport } from './types';

// Helper to get a date string relative to today
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const MOCK_CITIES: City[] = [
  {
    name: 'Pune',
    zones: [
      {
        id: 'pn-01',
        name: 'Kothrud',
        city: 'Pune',
        description: 'Residential and educational hub with high traffic density.',
        currentAqi: 156,
        metrics: { pm25: 65, pm10: 140, no2: 45, o3: 30 },
        history: [
          { date: daysAgo(6), aqi: 140 },
          { date: daysAgo(5), aqi: 145 },
          { date: daysAgo(4), aqi: 150 },
          { date: daysAgo(3), aqi: 160 },
          { date: daysAgo(2), aqi: 155 },
          { date: daysAgo(1), aqi: 158 },
          { date: daysAgo(0), aqi: 156 },
        ]
      },
      {
        id: 'pn-02',
        name: 'Baner',
        city: 'Pune',
        description: 'Rapidly developing IT corridor with heavy construction activity.',
        currentAqi: 210,
        metrics: { pm25: 85, pm10: 190, no2: 55, o3: 35 },
        history: [
          { date: daysAgo(6), aqi: 180 },
          { date: daysAgo(5), aqi: 195 },
          { date: daysAgo(4), aqi: 200 },
          { date: daysAgo(3), aqi: 215 },
          { date: daysAgo(2), aqi: 210 },
          { date: daysAgo(1), aqi: 205 },
          { date: daysAgo(0), aqi: 210 },
        ]
      },
      {
        id: 'pn-03',
        name: 'Deccan Gymkhana',
        city: 'Pune',
        description: 'Central commercial area with old tree cover but high vehicle emission.',
        currentAqi: 112,
        metrics: { pm25: 45, pm10: 100, no2: 60, o3: 25 },
        history: [
          { date: daysAgo(6), aqi: 95 },
          { date: daysAgo(5), aqi: 100 },
          { date: daysAgo(4), aqi: 110 },
          { date: daysAgo(3), aqi: 120 },
          { date: daysAgo(2), aqi: 115 },
          { date: daysAgo(1), aqi: 108 },
          { date: daysAgo(0), aqi: 112 },
        ]
      }
    ]
  },
  {
    name: 'Delhi',
    zones: [
      {
        id: 'dl-01',
        name: 'Anand Vihar',
        city: 'Delhi',
        description: 'Transport hub with bus terminal and industrial proximity.',
        currentAqi: 380,
        metrics: { pm25: 220, pm10: 410, no2: 90, o3: 40 },
        history: [
          { date: daysAgo(6), aqi: 350 },
          { date: daysAgo(5), aqi: 360 },
          { date: daysAgo(4), aqi: 390 },
          { date: daysAgo(3), aqi: 400 },
          { date: daysAgo(2), aqi: 385 },
          { date: daysAgo(1), aqi: 375 },
          { date: daysAgo(0), aqi: 380 },
        ]
      }
    ]
  }
];

export const MOCK_ANALYSES: AnalysisReport[] = [
  {
    id: 'an-1',
    zoneId: 'pn-02',
    timestamp: daysAgo(0).replace(/T.*/, 'T10:00:00Z'), // Today
    summary: 'High particulate matter detected consistent with ongoing metro construction and road dust resuspension.',
    recommendation: 'Immediate dust suppression required.',
    generatedBy: 'Dr. A. Sharma',
    causes: [
      { factor: 'Construction Dust', confidence: 85, reasoning: 'PM10 levels are disproportionately high compared to PM2.5.' },
      { factor: 'Vehicular Traffic', confidence: 45, reasoning: 'NO2 levels are moderate.' },
      { factor: 'Waste Burning', confidence: 15, reasoning: 'No significant spike in organic markers.' }
    ]
  },
  {
    id: 'an-4',
    zoneId: 'dl-01',
    timestamp: daysAgo(2).replace(/T.*/, 'T08:00:00Z'), // 2 days ago
    summary: 'Critical levels of PM2.5 indicating potential crop residue burning combined with local transport emissions.',
    recommendation: 'Enforce GRAP Stage 3 restrictions immediately.',
    generatedBy: 'Dr. A. Sharma',
    causes: [
      { factor: 'Stubble Burning', confidence: 90, reasoning: 'Satellite fire counts high in neighboring states.' },
      { factor: 'Transport', confidence: 60, reasoning: 'Bus terminal activity remains high.' }
    ]
  },
  {
    id: 'an-3',
    zoneId: 'pn-01',
    timestamp: daysAgo(5).replace(/T.*/, 'T14:00:00Z'), // 5 days ago
    summary: 'Elevated Ozone levels detected in Kothrud due to high solar radiation and vehicular precursors.',
    recommendation: 'Issue advisory for outdoor sports activities.',
    generatedBy: 'J. Doe',
    causes: [
      { factor: 'Ozone Formation', confidence: 80, reasoning: 'High temperature and NOx presence.' },
      { factor: 'Industrial Emissions', confidence: 20, reasoning: 'Wind direction does not support industrial drift.' }
    ]
  },
  {
    id: 'an-2',
    zoneId: 'pn-02',
    timestamp: daysAgo(45).replace(/T.*/, 'T09:30:00Z'), // 45 days ago (Should be filtered out of "Recent")
    summary: 'Moderate AQI levels observed. Spike in NO2 suggests traffic congestion during morning peak hours.',
    recommendation: 'Traffic diversion plan for peak hours.',
    generatedBy: 'System AI',
    causes: [
      { factor: 'Vehicular Traffic', confidence: 75, reasoning: 'Elevated NO2 and CO levels correlated with rush hour.' },
      { factor: 'Meteorology', confidence: 30, reasoning: 'Low wind speed causing pollutant accumulation.' }
    ]
  }
];

export const MOCK_PROJECTS: InterventionProject[] = [
  {
    id: 'prj-1',
    zoneId: 'pn-02',
    title: 'Baner Metro Corridor Dust Control',
    status: ProjectStatus.IN_PROGRESS,
    basedOnAnalysisId: 'an-1',
    startDate: daysAgo(1),
    notes: 'Coordinating with Metro Authority for sprinkler deployment.',
    phases: [
      {
        id: 'ph-1',
        name: 'Phase 1: Immediate',
        description: 'Suppress airborne dust within 48 hours.',
        actions: ['Deploy mist cannons at 3 sites', 'Cover debris piles', 'Increase road sweeping frequency'],
        status: 'COMPLETED',
        assignedTo: 'Dr. A. Sharma'
      },
      {
        id: 'ph-2',
        name: 'Phase 2: Scaling',
        description: 'Sustain lower PM10 for 2 weeks.',
        actions: ['Install permanent green barriers', 'Route diversion for heavy trucks'],
        status: 'IN_PROGRESS',
        assignedTo: 'Dr. A. Sharma'
      },
      {
        id: 'ph-3',
        name: 'Phase 3: Long-term',
        description: 'Policy changes for construction permits.',
        actions: ['Mandatory wet suppression for all new permits', 'IoT sensor grid expansion'],
        status: 'PENDING',
      }
    ]
  },
  {
    id: 'prj-2',
    zoneId: 'pn-01',
    title: 'Kothrud Green Buffer Zone Implementation',
    status: ProjectStatus.COMPLETED,
    basedOnAnalysisId: 'an-3',
    startDate: '2023-01-15',
    notes: 'Successfully installed vertical gardens and roadside planters to absorb NOx.',
    phases: [
      {
        id: 'ph-2-1',
        name: 'Phase 1: Pilot',
        description: 'Test planting on Paud Road.',
        actions: ['Identify native species', 'Plant 500 saplings'],
        status: 'COMPLETED',
        assignedTo: 'J. Doe'
      },
      {
        id: 'ph-2-2',
        name: 'Phase 2: Completion',
        description: 'Full coverage of major arterial roads.',
        actions: ['Expansion to Karve Road', 'Maintenance handover to PMC'],
        status: 'COMPLETED',
        assignedTo: 'J. Doe'
      }
    ]
  },
  {
    id: 'prj-3',
    zoneId: 'dl-01',
    title: 'Anand Vihar Smog Tower Pilot',
    status: ProjectStatus.PENDING_APPROVAL,
    basedOnAnalysisId: 'an-4',
    startDate: daysAgo(0),
    notes: 'Proposed installation of 2 experimental smog towers.',
    phases: [
      {
        id: 'ph-3-1',
        name: 'Phase 1: Installation',
        description: 'Site acquisition and setup.',
        actions: ['Clear land near terminal', 'Power grid connection'],
        status: 'PENDING'
      },
      {
        id: 'ph-3-2',
        name: 'Phase 2: Testing',
        description: 'Run at 50% capacity.',
        actions: ['Monitor PM levels', 'Adjust fan speed'],
        status: 'PENDING'
      }
    ]
  }
];