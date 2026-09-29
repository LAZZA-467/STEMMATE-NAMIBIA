export type UserRole = 'Teacher' | 'Custodian' | 'Manager' | 'Administrator';

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'uploading' | 'conflict' | 'draft' | 'offline' | 'paused';

export interface MaterialItem {
  id: string;
  name: string;
  availableCount: number;
  unit?: string;
  status: 'available' | 'low' | 'out';
  statusText: string;
}

export interface Activity {
  id: string;
  title: string;
  durationMinutes: number;
  level: string;
  topic: string;
  description: string;
  materialsSummary: string;
  kitRequired?: string;
  isOfflineReady: boolean;
  safetyAlert: string;
  inclusionPrompt: string;
  materials: MaterialItem[];
  tags: string[];
}

export interface PlanStep {
  id: string;
  stepNumber: number;
  title: string;
  durationMinutes: number;
  materialsText: string;
  safetyAlert?: string;
  inclusionPrompt?: string;
}

export interface SessionPlan {
  id: string;
  title: string;
  dateString: string;
  durationMinutes: number;
  groupAllocation: string;
  groupSizeCount?: number;
  startTime?: string;
  stationLocation: string;
  status: 'synced' | 'uploading' | 'pending' | 'conflict' | 'draft';
  uploadProgress?: number;
  activityId: string;
  templateUsed?: string;
  completedStepIds?: string[];
  steps: PlanStep[];
}

export interface KitItem {
  id: string;
  boxNumber: string;
  name: string;
  location: string;
  status: 'available' | 'in-use' | 'low-stock' | 'scheduled';
  availableUnits: number;
  totalUnits: number;
  nextScheduled: string;
  category: string;
  contents?: string[];
  note?: string;
}

export interface KitRequest {
  id: string;
  kitId: string;
  boxNumber: string;
  kitName: string;
  facilitator: string;
  facilitatorRole: UserRole;
  planTitle: string;
  dateNeeded: string;
  returnDue: string;
  status: 'requested' | 'checked-out' | 'overdue' | 'returned';
}

export interface PlanFilter {
  topic: string;
  grade: string;
  duration: string;
  materials: string[];
}

export interface TemplateDefinition {
  label: string;
  defaultDuration: number;
  steps: PlanStep[];
}

export interface RemotePlanEdit {
  title: string;
  durationMinutes: number;
  editedOn: string;
  editedAt: string;
}
