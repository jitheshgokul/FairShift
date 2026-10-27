export type Industry = 'construction' | 'college_support';
export type Language = 'en' | 'ta' | 'hi';
export type UserRole = 'worker' | 'employer';

export interface Worker {
  id: string;
  name: string;
  industry: Industry;
  role: string;
  hourlyRate: number; // in local currency (e.g., ₹ or $)
  overtimeRate: number; // 1.5x regular
  badgeId: string;
  phone: string;
  currentSite: string;
  avatarColor: string;
}

export type ShiftStatus = 'active' | 'on_break' | 'completed';

export interface ShiftRecord {
  id: string;
  workerId: string;
  workerName: string;
  role: string;
  industry: Industry;
  date: string; // YYYY-MM-DD
  checkInTime: string; // ISO string or time string e.g. 08:00 AM
  checkOutTime?: string;
  checkInTimestamp: number;
  checkOutTimestamp?: number;
  durationMinutes: number;
  breakMinutes: number;
  regularHours: number;
  overtimeHours: number;
  status: ShiftStatus;
  basePay: number;
  overtimePay: number;
  hazardAllowance: number;
  shiftAllowance: number;
  grossPay: number;
  siteLocation: string;
  verifiedByEmployer: boolean;
}

export type GrievanceCategory =
  | 'safety_hazard'
  | 'unpaid_wages'
  | 'excessive_overtime'
  | 'missing_ppe'
  | 'harassment'
  | 'equipment_fault'
  | 'sanitation_issue';

export type GrievanceSeverity = 'low' | 'medium' | 'high' | 'critical';

export type GrievanceStatus =
  | 'submitted'
  | 'in_review'
  | 'action_taken'
  | 'resolved';

export interface GrievanceTicket {
  id: string; // e.g. FS-4921
  industry: Industry;
  category: GrievanceCategory;
  severity: GrievanceSeverity;
  isAnonymous: boolean;
  workerId?: string;
  workerName?: string;
  contactNumber?: string;
  location: string;
  description: string;
  audioDurationSeconds?: number;
  audioTranscript?: string;
  status: GrievanceStatus;
  employerNote?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayEstimate {
  regularHours: number;
  overtimeHours: number;
  regularRate: number;
  overtimeRate: number;
  basePay: number;
  overtimePay: number;
  hazardAllowance: number;
  shiftAllowance: number;
  grossPay: number;
  statutoryDeductions: number; // PF / ESI transparency
  estimatedTakeHome: number;
}
