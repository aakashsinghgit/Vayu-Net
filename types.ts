
export interface PollutantMetrics {
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
}

export interface HistoricalDataPoint {
  date: string;
  aqi: number;
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  currentAqi: number;
  metrics: PollutantMetrics;
  history: HistoricalDataPoint[];
  description: string;
}

export interface AnalysisCause {
  factor: string;
  confidence: number; // 0-100
  reasoning: string;
}

export interface AnalysisReport {
  id: string;
  zoneId: string;
  timestamp: string;
  causes: AnalysisCause[];
  summary: string;
  recommendation: string;
  generatedBy?: string;
}

export enum ProjectStatus {
  PENDING_APPROVAL = 'Pending Approval',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}

export type PhaseStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProjectPhase {
  id: string; // Added ID for reliable updates
  name: string;
  description: string;
  actions: string[];
  status: PhaseStatus;
  assignedTo?: string; // Name of the scientist leading this phase
}

export interface InterventionProject {
  id: string;
  zoneId: string;
  title: string;
  status: ProjectStatus;
  basedOnAnalysisId: string;
  phases: ProjectPhase[];
  startDate: string;
  notes: string;
}

export interface City {
  name: string;
  zones: Zone[];
}

export enum AppView {
  HOME = 'Home',
  DASHBOARD = 'Dashboard',
  ANALYSIS = 'Analysis',
  SOLUTIONS = 'Solutions',
  REPORTS = 'Reports',
  FEEDBACK = 'Feedback',
  IT_SUPPORT = 'ItSupport'
}

export type UserRole = 'GUEST' | 'SCIENTIST' | 'CITIZEN';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  title?: string;
}

export interface Feedback {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface AqiRecommendation {
  minAqi: number;
  maxAqi: number;
  title: string;
  advice: string;
  action: string;
  color: string; // 'green' | 'yellow' | 'orange' | 'red' | 'purple'
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedBy: string;
  timestamp: string;
}