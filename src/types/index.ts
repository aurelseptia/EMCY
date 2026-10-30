export type UserRole = 'ob' | 'pj_sarpras' | 'ketua_sarpras';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type AssetStatus = 'good' | 'needs_repair' | 'broken';

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string; // 'Bangku/Meja' | 'Elektronik' | 'Transportasi' | 'Lainnya' | 'Meubel'
  location: string;
  status: AssetStatus;
  notes?: string;
  photoUrl?: string;
  lastInspectionAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface ChecklistTemplate {
  id: string;
  name: string;
  assetCategory: string;
  frequency: FrequencyType;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChecklistItem {
  id: string;
  templateId: string;
  question: string;
  orderNumber: number;
  isRequired: boolean;
  createdAt: string;
}

export type ScheduleStatus = 'pending' | 'in_progress' | 'completed' | 'late';

export interface InspectionSchedule {
  id: string;
  assetId: string;
  templateId: string;
  assignedTo?: string; // ob uid
  assignedToName?: string;
  dueDate: string;
  frequency: FrequencyType;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt?: string;
}

export type InspectionStatus = 'draft' | 'submitted' | 'verified';

export interface Inspection {
  id: string;
  scheduleId?: string;
  assetId: string;
  assetCode?: string;
  assetName?: string;
  assetLocation?: string;
  assetCategory?: string;
  templateId?: string;
  templateName?: string;
  obId: string;
  obName: string;
  startedAt: string;
  submittedAt?: string;
  status: InspectionStatus;
  overallStatus: AssetStatus;
  notes?: string;
  synced: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ItemResultStatus = 'pass' | 'needs_repair' | 'broken';
export type FollowUpStatus = 'waiting' | 'in_progress' | 'done';

export interface InspectionResult {
  id: string;
  inspectionId: string;
  checklistItemId: string;
  question: string;
  result: ItemResultStatus;
  note?: string;
  photoUrl?: string; // base64 or storage url
  followUpStatus?: FollowUpStatus;
  followUpNote?: string;
  followUpDate?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MaintenanceFollowUp {
  id: string;
  inspectionResultId?: string;
  inspectionId?: string;
  assetId: string;
  assetName: string;
  assetLocation?: string;
  issueDescription: string;
  followUpNote: string;
  status: FollowUpStatus; // 'waiting' | 'in_progress' | 'done'
  followUpDate: string;
  pjId: string;
  pjName: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReportStatus = 'draft' | 'submitted' | 'approved';

export interface Report {
  id: string;
  title: string;
  period: string;
  inspectionIds: string[];
  goodCount?: number;
  needsRepairCount?: number;
  brokenCount?: number;
  totalAssetsCount?: number;
  createdBy: string; // pj uid
  createdByName: string;
  approvedBy?: string; // ketua uid
  approvedByName?: string;
  reportStatus: ReportStatus;
  summary: string;
  recommendations?: string;
  forwardedToPrincipalAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'inspections' | 'inspectionResults' | 'assets' | 'reports' | 'checklistTemplates' | 'inspectionSchedules' | 'maintenanceFollowUps';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}
