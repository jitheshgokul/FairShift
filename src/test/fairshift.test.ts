import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, INITIAL_WORKERS, INITIAL_GRIEVANCES } from '../services/storageService';
import { translations } from '../utils/i18n';
import { Language, Worker, ShiftRecord } from '../types';

describe('FairShift Core Verification Suite', () => {
  beforeEach(() => {
    StorageService.resetDemoData();
  });

  // 1. WORKER ATTENDANCE FLOW
  describe('Attendance & Shift Lifecycle', () => {
    it('creates an active shift upon check-in with correct site and timestamp', () => {
      const worker = INITIAL_WORKERS[0]; // Murugan K. (Construction)
      const site = 'Metro Tower B - Gate 4';
      const shift = StorageService.checkIn(worker, site);

      expect(shift).toBeDefined();
      expect(shift.workerId).toBe(worker.id);
      expect(shift.status).toBe('active');
      expect(shift.siteLocation).toBe(site);
      expect(shift.checkInTimestamp).toBeGreaterThan(0);
      expect(shift.durationMinutes).toBe(0);

      const active = StorageService.getActiveShift(worker.id);
      expect(active?.id).toBe(shift.id);
      expect(active?.status).toBe('active');
    });

    it('toggles break state from active to on_break and back to active with break accumulation', () => {
      const worker = INITIAL_WORKERS[1];
      StorageService.checkIn(worker, 'East Flyover Deck #3');

      // First toggle: transition to on_break
      const paused = StorageService.toggleBreak(worker.id);
      expect(paused?.status).toBe('on_break');

      // Second toggle: resume active work and add 15 minutes break
      const resumed = StorageService.toggleBreak(worker.id);
      expect(resumed?.status).toBe('active');
      expect(resumed?.breakMinutes).toBe(15);
    });

    it('completes shift upon check out, recording checkout timestamp and terminal completed status', () => {
      const worker = INITIAL_WORKERS[2];
      StorageService.checkIn(worker, 'Underground Metro Pier 12');

      // Simulate 4 hours elapsed in persisted state
      const raw = localStorage.getItem('fairshift_demo_data_v2');
      if (raw) {
        const data = JSON.parse(raw);
        const shift = data.shifts.find((s: ShiftRecord) => s.workerId === worker.id && s.status !== 'completed');
        if (shift) {
          shift.checkInTimestamp = Date.now() - 4 * 3600 * 1000;
          localStorage.setItem('fairshift_demo_data_v2', JSON.stringify(data));
        }
      }

      const completed = StorageService.checkOut(worker.id);
      expect(completed).toBeDefined();
      expect(completed?.status).toBe('completed');
      expect(completed?.checkOutTime).toBeDefined();
      expect(completed?.checkOutTimestamp).toBeGreaterThan(0);
      expect(completed?.regularHours).toBeGreaterThanOrEqual(3.9);
      expect(completed?.basePay).toBe(Math.round(completed!.regularHours * worker.hourlyRate));
    });
  });

  // 2. FAIR PAY & 1.5x OVERTIME CALCULATION
  describe('Pay Calculation & Overtime Fairness', () => {
    it('accurately calculates regular pay and 1.5x overtime rate for hours exceeding 8', () => {
      const worker: Worker = {
        id: 'test-worker-1',
        name: 'Kumar Test',
        industry: 'construction',
        role: 'Mason',
        hourlyRate: 100,
        overtimeRate: 150, // 1.5x standard multiplier
        badgeId: 'CN-9999',
        phone: '+91 99999 99999',
        currentSite: 'Site A',
        avatarColor: 'bg-blue-600',
      };

      // 10 hours worked with 0 break = 8 regular + 2 overtime
      const shift: ShiftRecord = {
        id: 'shift-test-1',
        workerId: worker.id,
        workerName: worker.name,
        role: worker.role,
        industry: worker.industry,
        date: '2026-10-27',
        checkInTime: '08:00 AM',
        checkInTimestamp: Date.now() - 10 * 3600 * 1000,
        durationMinutes: 600,
        breakMinutes: 0,
        regularHours: 8,
        overtimeHours: 2,
        status: 'active',
        basePay: 800,
        overtimePay: 300,
        hazardAllowance: 50,
        shiftAllowance: 40,
        grossPay: 1190,
        siteLocation: 'Site A',
        verifiedByEmployer: false,
      };

      const payEstimate = StorageService.calculateLivePay(shift, worker);

      expect(payEstimate.regularHours).toBe(8.0);
      expect(payEstimate.overtimeHours).toBe(10.0 - 8.0);
      expect(payEstimate.basePay).toBe(800); // 8 hrs * 100
      expect(payEstimate.overtimePay).toBe(300); // 2 hrs * 150 (1.5x rate)
      expect(payEstimate.hazardAllowance).toBe(50);
      expect(payEstimate.shiftAllowance).toBe(40);
      expect(payEstimate.grossPay).toBe(800 + 300 + 50 + 40); // 1190
      expect(payEstimate.statutoryDeductions).toBe(Math.round(1190 * 0.12)); // 12% statutory transparency
      expect(payEstimate.estimatedTakeHome).toBe(1190 - Math.round(1190 * 0.12));
    });

    it('correctly deducts break minutes before calculating pay', () => {
      const worker = INITIAL_WORKERS[0]; // Murugan K: hourlyRate 110, overtimeRate 165
      const shift: ShiftRecord = {
        id: 'shift-test-break',
        workerId: worker.id,
        workerName: worker.name,
        role: worker.role,
        industry: worker.industry,
        date: '2026-10-27',
        checkInTime: '08:00 AM',
        checkInTimestamp: Date.now() - 5 * 3600 * 1000, // 5 hours elapsed
        durationMinutes: 300,
        breakMinutes: 60, // 1 hour break -> 4 effective hours
        regularHours: 4,
        overtimeHours: 0,
        status: 'active',
        basePay: 440,
        overtimePay: 0,
        hazardAllowance: 50,
        shiftAllowance: 0,
        grossPay: 490,
        siteLocation: worker.currentSite,
        verifiedByEmployer: false,
      };

      const payEstimate = StorageService.calculateLivePay(shift, worker);
      expect(payEstimate.regularHours).toBe(4.0);
      expect(payEstimate.overtimeHours).toBe(0);
      expect(payEstimate.basePay).toBe(4 * worker.hourlyRate);
    });
  });

  // 3. ANONYMOUS GRIEVANCE SUBMISSION & PRIVACY SANITIZATION
  describe('Grievance Submission & Privacy Guarantee', () => {
    it('generates unguessable tracking IDs starting with FS-', () => {
      const id1 = StorageService.generateSecureTrackingId();
      const id2 = StorageService.generateSecureTrackingId();

      expect(id1).toMatch(/^FS-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
      expect(id2).toMatch(/^FS-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
      expect(id1).not.toBe(id2);
    });

    it('submits anonymous grievance safely and initializes with submitted status', () => {
      const newTicket = StorageService.submitGrievance({
        industry: 'construction',
        category: 'safety_hazard',
        severity: 'critical',
        isAnonymous: true,
        location: 'Pier 4 scaffolding',
        description: 'Safety net is torn.',
      });

      expect(newTicket.id).toMatch(/^FS-/);
      expect(newTicket.status).toBe('submitted');
      expect(newTicket.isAnonymous).toBe(true);
      expect(newTicket.workerName).toBeUndefined();
      expect(newTicket.contactNumber).toBeUndefined();

      // Retrieve via lookup
      const retrieved = StorageService.getGrievanceById(newTicket.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(newTicket.id);
    });

    it('preserves reporter contact info only when anonymous is explicitly false', () => {
      const identifiedTicket = StorageService.submitGrievance({
        industry: 'college_support',
        category: 'unpaid_wages',
        severity: 'high',
        isAnonymous: false,
        workerName: 'Priya S.',
        contactNumber: '+91 97901 77883',
        location: 'Girls Hostel Block 4',
        description: 'Night shift allowance discrepancy.',
      });

      expect(identifiedTicket.isAnonymous).toBe(false);
      expect(identifiedTicket.workerName).toBe('Priya S.');
      expect(identifiedTicket.contactNumber).toBe('+91 97901 77883');
    });
  });

  // 4. PUBLIC TICKET LOOKUP FLOW
  describe('Public Ticket Lookup & Protection', () => {
    it('locates existing tickets case-insensitively and handles whitespace', () => {
      const existing = INITIAL_GRIEVANCES[0]; // FS-1042
      const result = StorageService.getGrievanceById('  fs-1042  ');

      expect(result).toBeDefined();
      expect(result?.id).toBe(existing.id);
      expect(result?.category).toBe(existing.category);
    });

    it('returns undefined for non-existent ticket IDs without throwing errors', () => {
      const nonExistent = StorageService.getGrievanceById('FS-9999-XXXX');
      expect(nonExistent).toBeUndefined();
    });
  });

  // 5. EMPLOYER RESOLUTION & SHIFT VERIFICATION
  describe('Employer Operations & Role Separation', () => {
    it('allows employer to transition grievance status and record notes', () => {
      const ticket = INITIAL_GRIEVANCES[0];
      const updated = StorageService.updateGrievanceStatus(
        ticket.id,
        'action_taken',
        'Repairs ordered immediately'
      );

      expect(updated?.status).toBe('action_taken');
      expect(updated?.employerNote).toBe('Repairs ordered immediately');
    });

    it('verifies a completed worker shift and sets verifiedByEmployer flag', () => {
      const shift = StorageService.getShifts()[0];
      expect(shift.verifiedByEmployer).toBe(false);

      StorageService.verifyShift(shift.id);

      const verified = StorageService.getShifts().find((s) => s.id === shift.id);
      expect(verified?.verifiedByEmployer).toBe(true);
    });
  });

  // 6. MULTILINGUAL SUPPORT PARITY (EN, TA, HI)
  describe('Internationalization (i18n) Parity', () => {
    const requiredKeys = [
      'appName',
      'workerPortal',
      'employerDashboard',
      'checkIn',
      'checkOut',
      'takeBreak',
      'resumeWork',
      'activeShift',
      'onBreak',
      'notCheckedIn',
      'regularRate',
      'overtimeRate',
      'reportTitle',
      'anonymousReport',
      'submitReport',
      'hazard',
      'unpaidWages',
      'missingPPE',
      'sanitationIssue',
      'selectLanguage',
    ] as const;

    const languages: Language[] = ['en', 'ta', 'hi'];

    languages.forEach((lang) => {
      it(`verifies all essential UI keys exist for language: "${lang}"`, () => {
        const dict = translations[lang];
        expect(dict).toBeDefined();
        requiredKeys.forEach((key) => {
          expect(dict[key]).toBeDefined();
          expect(typeof dict[key]).toBe('string');
          expect(dict[key].trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('confirms Tamil and Hindi translations contain localized scripts', () => {
      // Tamil unicode check: [\u0B80-\u0BFF]
      expect(translations.ta.checkIn).toMatch(/[\u0B80-\u0BFF]/);
      // Hindi unicode check: [\u0900-\u097F]
      expect(translations.hi.checkIn).toMatch(/[\u0900-\u097F]/);
    });
  });
});
