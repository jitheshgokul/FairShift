import {
  GrievanceTicket,
  Industry,
  PayEstimate,
  ShiftRecord,
  Worker,
} from '../types';

const STORAGE_KEY = 'fairshift_demo_data_v2';

export const INITIAL_WORKERS: Worker[] = [
  // Construction Industry Workers
  {
    id: 'w-c1',
    name: 'Murugan K.',
    industry: 'construction',
    role: 'Senior Mason & Plasterer',
    hourlyRate: 110,
    overtimeRate: 165,
    badgeId: 'CN-8942',
    phone: '+91 98401 23451',
    currentSite: 'Metro Tower B - Gate 4',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'w-c2',
    name: 'Rajesh Sharma',
    industry: 'construction',
    role: 'Scaffolding Lead & Rigger',
    hourlyRate: 130,
    overtimeRate: 195,
    badgeId: 'CN-7714',
    phone: '+91 98210 98762',
    currentSite: 'East Flyover Deck #3',
    avatarColor: 'bg-orange-600',
  },
  {
    id: 'w-c3',
    name: 'Selvam R.',
    industry: 'construction',
    role: 'Structural Welder & Cutter',
    hourlyRate: 140,
    overtimeRate: 210,
    badgeId: 'CN-6218',
    phone: '+91 94441 55673',
    currentSite: 'Underground Metro Pier 12',
    avatarColor: 'bg-yellow-700',
  },
  {
    id: 'w-c4',
    name: 'Anjali Devi',
    industry: 'construction',
    role: 'Concrete Pouring Crew',
    hourlyRate: 95,
    overtimeRate: 142.5,
    badgeId: 'CN-5109',
    phone: '+91 97890 11223',
    currentSite: 'Sub-level Basement B2',
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'w-c5',
    name: 'Vikram Singh',
    industry: 'construction',
    role: 'Tower Crane Operator',
    hourlyRate: 160,
    overtimeRate: 240,
    badgeId: 'CN-4389',
    phone: '+91 91760 99884',
    currentSite: 'Central High-Rise Core',
    avatarColor: 'bg-blue-700',
  },

  // College Support Staff
  {
    id: 'w-s1',
    name: 'Lakshmi Narayanan',
    industry: 'college_support',
    role: 'Sanitation & Housekeeping Lead',
    hourlyRate: 95,
    overtimeRate: 142.5,
    badgeId: 'CS-3310',
    phone: '+91 98412 33441',
    currentSite: 'Science Quad & Lab Wing',
    avatarColor: 'bg-teal-700',
  },
  {
    id: 'w-s2',
    name: 'Ramesh Kumar',
    industry: 'college_support',
    role: 'Campus Facilities Electrician',
    hourlyRate: 120,
    overtimeRate: 180,
    badgeId: 'CS-4419',
    phone: '+91 98840 55662',
    currentSite: 'Engineering Hall & Power Substation',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'w-s3',
    name: 'Priya Sundaram',
    industry: 'college_support',
    role: 'Hostel Maintenance Supervisor',
    hourlyRate: 105,
    overtimeRate: 157.5,
    badgeId: 'CS-2198',
    phone: '+91 97901 77883',
    currentSite: 'Girls Hostel Complex #4',
    avatarColor: 'bg-rose-600',
  },
  {
    id: 'w-s4',
    name: 'Mohammad Faizal',
    industry: 'college_support',
    role: 'Groundskeeper & Landscaping',
    hourlyRate: 85,
    overtimeRate: 127.5,
    badgeId: 'CS-1084',
    phone: '+91 98409 66774',
    currentSite: 'Sports Stadium & Botanical Lawn',
    avatarColor: 'bg-green-700',
  },
  {
    id: 'w-s5',
    name: 'Deepa Patel',
    industry: 'college_support',
    role: 'Campus Night Security Guard',
    hourlyRate: 110,
    overtimeRate: 165,
    badgeId: 'CS-5520',
    phone: '+91 99620 44558',
    currentSite: 'Main Gate & Central Library',
    avatarColor: 'bg-slate-700',
  },
];

export const INITIAL_SHIFTS: ShiftRecord[] = [
  // Murugan K. currently active shift (4.5 hours in)
  {
    id: 'shift-101',
    workerId: 'w-c1',
    workerName: 'Murugan K.',
    role: 'Senior Mason & Plasterer',
    industry: 'construction',
    date: '2026-10-26',
    checkInTime: '08:00 AM',
    checkInTimestamp: Date.now() - 4.5 * 3600 * 1000,
    durationMinutes: 270,
    breakMinutes: 30,
    regularHours: 4.0,
    overtimeHours: 0,
    status: 'active',
    basePay: 440,
    overtimePay: 0,
    hazardAllowance: 60,
    shiftAllowance: 0,
    grossPay: 500,
    siteLocation: 'Metro Tower B - Gate 4',
    verifiedByEmployer: false,
  },
  // Rajesh Sharma has been working 9.5 hours (Overtime alert!)
  {
    id: 'shift-102',
    workerId: 'w-c2',
    workerName: 'Rajesh Sharma',
    role: 'Scaffolding Lead & Rigger',
    industry: 'construction',
    date: '2026-10-26',
    checkInTime: '06:30 AM',
    checkInTimestamp: Date.now() - 9.5 * 3600 * 1000,
    durationMinutes: 570,
    breakMinutes: 30,
    regularHours: 8.0,
    overtimeHours: 1.0,
    status: 'active',
    basePay: 1040,
    overtimePay: 195,
    hazardAllowance: 80,
    shiftAllowance: 50,
    grossPay: 1365,
    siteLocation: 'East Flyover Deck #3',
    verifiedByEmployer: false,
  },
  // Selvam R. completed shift yesterday
  {
    id: 'shift-103',
    workerId: 'w-c3',
    workerName: 'Selvam R.',
    role: 'Structural Welder & Cutter',
    industry: 'construction',
    date: '2026-10-25',
    checkInTime: '08:00 AM',
    checkOutTime: '05:30 PM',
    checkInTimestamp: Date.now() - 28 * 3600 * 1000,
    checkOutTimestamp: Date.now() - 19.5 * 3600 * 1000,
    durationMinutes: 510,
    breakMinutes: 30,
    regularHours: 8.0,
    overtimeHours: 0.5,
    status: 'completed',
    basePay: 1120,
    overtimePay: 105,
    hazardAllowance: 70,
    shiftAllowance: 0,
    grossPay: 1295,
    siteLocation: 'Underground Metro Pier 12',
    verifiedByEmployer: true,
  },
  // Lakshmi Narayanan (College Support) active shift 5 hours in
  {
    id: 'shift-201',
    workerId: 'w-s1',
    workerName: 'Lakshmi Narayanan',
    role: 'Sanitation & Housekeeping Lead',
    industry: 'college_support',
    date: '2026-10-26',
    checkInTime: '07:30 AM',
    checkInTimestamp: Date.now() - 5.0 * 3600 * 1000,
    durationMinutes: 300,
    breakMinutes: 30,
    regularHours: 4.5,
    overtimeHours: 0,
    status: 'active',
    basePay: 427.5,
    overtimePay: 0,
    hazardAllowance: 30,
    shiftAllowance: 40,
    grossPay: 497.5,
    siteLocation: 'Science Quad & Lab Wing',
    verifiedByEmployer: false,
  },
  // Ramesh Kumar working overtime (9.0 hours)
  {
    id: 'shift-202',
    workerId: 'w-s2',
    workerName: 'Ramesh Kumar',
    role: 'Campus Facilities Electrician',
    industry: 'college_support',
    date: '2026-10-26',
    checkInTime: '06:00 AM',
    checkInTimestamp: Date.now() - 9.0 * 3600 * 1000,
    durationMinutes: 540,
    breakMinutes: 45,
    regularHours: 8.0,
    overtimeHours: 0.25,
    status: 'active',
    basePay: 960,
    overtimePay: 45,
    hazardAllowance: 40,
    shiftAllowance: 30,
    grossPay: 1075,
    siteLocation: 'Engineering Hall & Power Substation',
    verifiedByEmployer: false,
  },
];

export const INITIAL_GRIEVANCES: GrievanceTicket[] = [
  {
    id: 'FS-1042',
    industry: 'construction',
    category: 'safety_hazard',
    severity: 'critical',
    isAnonymous: true,
    location: 'Tower B, 4th Floor Scaffolding',
    description: 'Scaffolding clamps on the outer edge are loose and swaying in the high wind. Workers asked to stop work until safety ropes and guardrails are double bolted.',
    audioDurationSeconds: 24,
    audioTranscript: 'வணக்கம், டவர் B நான்காவது மாடியில் சாரம் ஆடுகிறது. கிளாம்ப் நட்டு தளர்வாக உள்ளது. உடனடியாக சரிசெய்யவும்.',
    status: 'action_taken',
    employerNote: 'Safety Engineer inspected and halted operations on Level 4. Industrial torque clamps re-tightened. Clearance approved by 11:30 AM.',
    createdAt: '2026-10-26 09:15 AM',
    updatedAt: '2026-10-26 11:45 AM',
  },
  {
    id: 'FS-2089',
    industry: 'construction',
    category: 'unpaid_wages',
    severity: 'high',
    isAnonymous: false,
    workerName: 'Murugan K.',
    contactNumber: '+91 98401 23451',
    location: 'Metro Flyover Casting Yard',
    description: 'Last Saturday shift ended at 9:00 PM (3 hours extra over scheduled 8 hours), but Friday payroll slip only showed regular hours. Overtime allowance missing.',
    audioDurationSeconds: 18,
    audioTranscript: 'Sir, last Saturday night shift 3 hours extra worked was not credited in Friday voucher. Please check log sheet.',
    status: 'in_review',
    employerNote: 'Timekeeper cross-checking gate biometric punches against manual supervisor register.',
    createdAt: '2026-10-25 04:30 PM',
    updatedAt: '2026-10-26 08:20 AM',
  },
  {
    id: 'FS-3105',
    industry: 'college_support',
    category: 'missing_ppe',
    severity: 'high',
    isAnonymous: true,
    location: 'Chemistry Lab Bio-waste Disposal Area',
    description: 'Acid-resistant rubber gloves and heavy duty face shields are out of stock. Support staff handling liquid effluent without chemical protective suits.',
    audioDurationSeconds: 31,
    audioTranscript: 'केमिस्ट्री लैब के पीछे वेस्ट डिस्पोजल के लिए एसिड-प्रूफ ग्लव्स खत्म हो गए हैं। सुरक्षा गियर जल्द उपलब्ध कराएं।',
    status: 'submitted',
    employerNote: undefined,
    createdAt: '2026-10-26 10:00 AM',
    updatedAt: '2026-10-26 10:00 AM',
  },
  {
    id: 'FS-4011',
    industry: 'college_support',
    category: 'sanitation_issue',
    severity: 'medium',
    isAnonymous: true,
    location: 'Hostel Block 3 Ground Floor Restroom',
    description: 'Drinking water dispenser filter is damaged and leaking. Restroom water pump has been tripping since yesterday evening.',
    status: 'resolved',
    employerNote: 'Plumbing contractor replaced the booster pump switch and installed a fresh UV water filter unit.',
    createdAt: '2026-10-24 02:10 PM',
    updatedAt: '2026-10-25 09:00 AM',
  },
];

interface StoredData {
  workers: Worker[];
  shifts: ShiftRecord[];
  grievances: GrievanceTicket[];
  currentWorkerId: Record<Industry, string>;
}

export class StorageService {
  private static loadData(): StoredData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    const initial: StoredData = {
      workers: INITIAL_WORKERS,
      shifts: INITIAL_SHIFTS,
      grievances: INITIAL_GRIEVANCES,
      currentWorkerId: {
        construction: 'w-c1',
        college_support: 'w-s1',
      },
    };
    StorageService.saveData(initial);
    return initial;
  }

  private static saveData(data: StoredData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  static getWorkers(industry?: Industry): Worker[] {
    const data = StorageService.loadData();
    if (!industry) return data.workers;
    return data.workers.filter((w) => w.industry === industry);
  }

  static getCurrentWorker(industry: Industry): Worker {
    const data = StorageService.loadData();
    const id = data.currentWorkerId[industry] || (industry === 'construction' ? 'w-c1' : 'w-s1');
    return data.workers.find((w) => w.id === id) || data.workers.find((w) => w.industry === industry) || data.workers[0];
  }

  static setCurrentWorker(industry: Industry, workerId: string): void {
    const data = StorageService.loadData();
    data.currentWorkerId[industry] = workerId;
    StorageService.saveData(data);
  }

  static getShifts(industry?: Industry): ShiftRecord[] {
    const data = StorageService.loadData();
    if (!industry) return data.shifts;
    return data.shifts.filter((s) => s.industry === industry);
  }

  static getActiveShift(workerId: string): ShiftRecord | undefined {
    const data = StorageService.loadData();
    return data.shifts.find((s) => s.workerId === workerId && s.status !== 'completed');
  }

  static checkIn(worker: Worker, siteLocation?: string): ShiftRecord {
    const data = StorageService.loadData();
    // Finish any prior active shift
    data.shifts.forEach((s) => {
      if (s.workerId === worker.id && s.status !== 'completed') {
        s.status = 'completed';
        s.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        s.checkOutTimestamp = Date.now();
      }
    });

    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    const newShift: ShiftRecord = {
      id: `shift-${Date.now()}`,
      workerId: worker.id,
      workerName: worker.name,
      role: worker.role,
      industry: worker.industry,
      date: todayStr,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkInTimestamp: now,
      durationMinutes: 0,
      breakMinutes: 0,
      regularHours: 0,
      overtimeHours: 0,
      status: 'active',
      basePay: 0,
      overtimePay: 0,
      hazardAllowance: worker.industry === 'construction' ? 50 : 25,
      shiftAllowance: 0,
      grossPay: worker.industry === 'construction' ? 50 : 25,
      siteLocation: siteLocation || worker.currentSite,
      verifiedByEmployer: false,
    };

    data.shifts.unshift(newShift);
    StorageService.saveData(data);
    return newShift;
  }

  static toggleBreak(workerId: string): ShiftRecord | undefined {
    const data = StorageService.loadData();
    const shift = data.shifts.find((s) => s.workerId === workerId && s.status !== 'completed');
    if (!shift) return undefined;

    if (shift.status === 'active') {
      shift.status = 'on_break';
    } else if (shift.status === 'on_break') {
      shift.status = 'active';
      shift.breakMinutes += 15; // increment break time
    }

    StorageService.saveData(data);
    return shift;
  }

  static checkOut(workerId: string): ShiftRecord | undefined {
    const data = StorageService.loadData();
    const shift = data.shifts.find((s) => s.workerId === workerId && s.status !== 'completed');
    if (!shift) return undefined;

    const now = Date.now();
    const elapsedMinutes = Math.max(15, Math.round((now - shift.checkInTimestamp) / 60000));
    shift.durationMinutes = elapsedMinutes;
    shift.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    shift.checkOutTimestamp = now;
    shift.status = 'completed';

    // Calculate pay
    const effectiveHours = Math.max(0, (elapsedMinutes - shift.breakMinutes) / 60);
    const worker = data.workers.find((w) => w.id === workerId);
    const regularRate = worker ? worker.hourlyRate : 100;
    const overtimeRate = worker ? worker.overtimeRate : 150;

    const regularHours = Math.min(8, effectiveHours);
    const overtimeHours = Math.max(0, effectiveHours - 8);

    shift.regularHours = Number(regularHours.toFixed(2));
    shift.overtimeHours = Number(overtimeHours.toFixed(2));
    shift.basePay = Math.round(regularHours * regularRate);
    shift.overtimePay = Math.round(overtimeHours * overtimeRate);
    shift.grossPay = shift.basePay + shift.overtimePay + shift.hazardAllowance + shift.shiftAllowance;

    StorageService.saveData(data);
    return shift;
  }

  static calculateLivePay(shift: ShiftRecord, worker: Worker): PayEstimate {
    const now = Date.now();
    const elapsedMinutes = Math.max(1, Math.round((now - shift.checkInTimestamp) / 60000));
    const effectiveMinutes = Math.max(0, elapsedMinutes - shift.breakMinutes);
    const effectiveHours = effectiveMinutes / 60;

    const regularHours = Math.min(8, effectiveHours);
    const overtimeHours = Math.max(0, effectiveHours - 8);

    const basePay = Math.round(regularHours * worker.hourlyRate);
    const overtimePay = Math.round(overtimeHours * worker.overtimeRate);
    const hazardAllowance = shift.hazardAllowance || (worker.industry === 'construction' ? 50 : 25);
    const shiftAllowance = shift.shiftAllowance || (effectiveHours > 8 ? 40 : 0);
    const grossPay = basePay + overtimePay + hazardAllowance + shiftAllowance;
    const statutoryDeductions = Math.round(grossPay * 0.12);
    const estimatedTakeHome = Math.max(0, grossPay - statutoryDeductions);

    return {
      regularHours: Number(regularHours.toFixed(1)),
      overtimeHours: Number(overtimeHours.toFixed(1)),
      regularRate: worker.hourlyRate,
      overtimeRate: worker.overtimeRate,
      basePay,
      overtimePay,
      hazardAllowance,
      shiftAllowance,
      grossPay,
      statutoryDeductions,
      estimatedTakeHome,
    };
  }

  static getGrievances(industry?: Industry): GrievanceTicket[] {
    const data = StorageService.loadData();
    if (!industry) return data.grievances;
    return data.grievances.filter((g) => g.industry === industry);
  }

  static getGrievanceById(id: string): GrievanceTicket | undefined {
    const data = StorageService.loadData();
    const cleanId = id.trim().toUpperCase();
    return data.grievances.find((g) => g.id.toUpperCase() === cleanId);
  }

  static generateSecureTrackingId(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    let id = 'FS-';
    for (let i = 0; i < 8; i++) {
      if (i === 4) id += '-';
      id += chars[array[i] % chars.length];
    }
    return id;
  }

  static submitGrievance(ticket: Omit<GrievanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): GrievanceTicket {
    const data = StorageService.loadData();
    const id = StorageService.generateSecureTrackingId();
    const nowStr = new Date().toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    const newTicket: GrievanceTicket = {
      ...ticket,
      id,
      status: 'submitted',
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    data.grievances.unshift(newTicket);
    StorageService.saveData(data);
    return newTicket;
  }

  static updateGrievanceStatus(
    id: string,
    status: GrievanceTicket['status'],
    employerNote?: string
  ): GrievanceTicket | undefined {
    const data = StorageService.loadData();
    const ticket = data.grievances.find((g) => g.id === id);
    if (!ticket) return undefined;

    ticket.status = status;
    if (employerNote !== undefined) {
      ticket.employerNote = employerNote;
    }
    ticket.updatedAt = new Date().toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    if (status === 'resolved') {
      ticket.resolvedAt = ticket.updatedAt;
    }

    StorageService.saveData(data);
    return ticket;
  }

  static verifyShift(shiftId: string): void {
    const data = StorageService.loadData();
    const shift = data.shifts.find((s) => s.id === shiftId);
    if (shift) {
      shift.verifiedByEmployer = true;
      StorageService.saveData(data);
    }
  }

  static resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEY);
    StorageService.loadData();
  }
}
