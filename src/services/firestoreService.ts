import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase/config';
import {
  GrievanceStatus,
  GrievanceTicket,
  Industry,
  ShiftRecord,
  Worker,
} from '../types';
import {
  INITIAL_GRIEVANCES,
  INITIAL_SHIFTS,
  INITIAL_WORKERS,
  StorageService,
} from './storageService';

const WORKERS_COL = 'workers';
const SHIFTS_COL = 'shifts';
const GRIEVANCES_COL = 'grievances';
const GRIEVANCE_STATUS_COL = 'grievance_status';

export class FirestoreService {
  /**
   * Authentication methods
   */
  static async loginWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.warn('Google sign in error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.warn('Logout error:', error);
    }
  }

  static subscribeAuth(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Seed baseline workers and sample records into Firestore if empty
   */
  static async initializeFirestoreData(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, WORKERS_COL));
      if (snap.empty) {
        // Seed initial workers
        for (const worker of INITIAL_WORKERS) {
          await setDoc(doc(db, WORKERS_COL, worker.id), worker);
        }
        // Seed initial shifts
        for (const shift of INITIAL_SHIFTS) {
          await setDoc(doc(db, SHIFTS_COL, shift.id), shift);
        }
        // Seed initial grievances and public status projections
        for (const g of INITIAL_GRIEVANCES) {
          await setDoc(doc(db, GRIEVANCES_COL, g.id), g);
          await setDoc(doc(db, GRIEVANCE_STATUS_COL, g.id), {
            id: g.id,
            category: g.category,
            severity: g.severity,
            status: g.status,
            isAnonymous: g.isAnonymous,
            employerNote: g.employerNote || null,
            createdAt: g.createdAt,
            updatedAt: g.updatedAt,
            resolvedAt: g.resolvedAt || null,
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bootstrap');
    }
  }

  /**
   * Get all workers from Firestore with fallback to LocalStorage
   */
  static async getWorkers(industry?: Industry): Promise<Worker[]> {
    try {
      const q = industry
        ? query(collection(db, WORKERS_COL), where('industry', '==', industry))
        : collection(db, WORKERS_COL);
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Worker);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, WORKERS_COL);
    }
    return StorageService.getWorkers(industry);
  }

  /**
   * Get shifts from Firestore with fallback to LocalStorage
   */
  static async getShifts(industry?: Industry): Promise<ShiftRecord[]> {
    try {
      const currentUid = auth.currentUser?.uid;
      const isSuperUser = auth.currentUser?.email === 'jitheshg111@gmail.com';
      let q;
      if (isSuperUser) {
        q = industry
          ? query(collection(db, SHIFTS_COL), where('industry', '==', industry))
          : collection(db, SHIFTS_COL);
      } else if (currentUid) {
        q = query(collection(db, SHIFTS_COL), where('workerId', '==', currentUid));
      } else {
        return StorageService.getShifts(industry);
      }
      const snap = await getDocs(q);
      if (!snap.empty) {
        const shifts = snap.docs.map((d) => d.data() as ShiftRecord);
        // Sort newest first
        return shifts.sort((a, b) => (b.checkInTimestamp || 0) - (a.checkInTimestamp || 0));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, SHIFTS_COL);
    }
    return StorageService.getShifts(industry);
  }

  /**
   * Save or update shift in Firestore
   */
  static async saveShift(shift: ShiftRecord): Promise<void> {
    // Also save to StorageService so UI immediately reflects
    try {
      await setDoc(doc(db, SHIFTS_COL, shift.id), shift, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${SHIFTS_COL}/${shift.id}`);
    }
  }

  /**
   * Check in a worker and persist to Firestore
   */
  static async checkIn(worker: Worker, siteLocation?: string): Promise<ShiftRecord> {
    const currentUid = auth.currentUser?.uid;
    const isSuperUser = auth.currentUser?.email === 'jitheshg111@gmail.com';
    const effectiveWorker = currentUid && !isSuperUser ? { ...worker, id: currentUid } : worker;
    const shift = StorageService.checkIn(effectiveWorker, siteLocation);
    await FirestoreService.saveShift(shift);
    return shift;
  }

  /**
   * Check out a worker and persist to Firestore
   */
  /**
   * Check out a worker and persist to Firestore
   */
  static async checkOut(workerId: string): Promise<ShiftRecord | undefined> {
    const currentUid = auth.currentUser?.uid;
    const isSuperUser = auth.currentUser?.email === 'jitheshg111@gmail.com';
    const effectiveId = currentUid && !isSuperUser ? currentUid : workerId;
    const shift = StorageService.checkOut(effectiveId);
    if (shift) {
      if (isSuperUser) {
        // Admins can write all calculated fields directly
        await FirestoreService.saveShift(shift);
      } else {
        // Non-admin workers can only record completion and elapsed time in Firestore.
        // Protected pay fields (basePay, overtimePay, grossPay) remain immutable in Firestore
        // until verified by an employer/admin or computed by a trusted backend.
        try {
          await updateDoc(doc(db, SHIFTS_COL, shift.id), {
            status: 'completed',
            checkOutTime: shift.checkOutTime,
            checkOutTimestamp: shift.checkOutTimestamp,
            durationMinutes: shift.durationMinutes,
            breakMinutes: shift.breakMinutes,
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `${SHIFTS_COL}/${shift.id}`);
        }
      }
    }
    return shift;
  }

  /**
   * Toggle break state
   */
  static async toggleBreak(workerId: string): Promise<ShiftRecord | undefined> {
    const currentUid = auth.currentUser?.uid;
    const isSuperUser = auth.currentUser?.email === 'jitheshg111@gmail.com';
    const effectiveId = currentUid && !isSuperUser ? currentUid : workerId;
    const shift = StorageService.toggleBreak(effectiveId);
    if (shift) {
      if (isSuperUser) {
        await FirestoreService.saveShift(shift);
      } else {
        try {
          await updateDoc(doc(db, SHIFTS_COL, shift.id), {
            status: shift.status,
            breakMinutes: shift.breakMinutes,
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `${SHIFTS_COL}/${shift.id}`);
        }
      }
    }
    return shift;
  }

  /**
   * Verify a shift as employer: updates verification flag and persists authoritative pay calculation
   */
  static async verifyShift(shiftId: string): Promise<void> {
    StorageService.verifyShift(shiftId);
    try {
      const allShifts = StorageService.getShifts();
      const shift = allShifts.find((s) => s.id === shiftId);
      const updatePayload: Record<string, any> = {
        verifiedByEmployer: true,
        updatedAt: new Date().toISOString(),
      };
      if (shift) {
        updatePayload.regularHours = shift.regularHours;
        updatePayload.overtimeHours = shift.overtimeHours;
        updatePayload.basePay = shift.basePay;
        updatePayload.overtimePay = shift.overtimePay;
        updatePayload.grossPay = shift.grossPay;
      }
      await updateDoc(doc(db, SHIFTS_COL, shiftId), updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${SHIFTS_COL}/${shiftId}`);
    }
  }

  /**
   * Submit Grievance: Atomically saves full confidential document to 'grievances'
   * and public status projection to 'grievance_status' in a single write batch.
   * Ensures that anonymous tickets contain zero reporter identity fields.
   */
  static async submitGrievance(
    ticket: Omit<GrievanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    existingTicket?: GrievanceTicket
  ): Promise<GrievanceTicket> {
    const created = existingTicket || StorageService.submitGrievance(ticket);
    try {
      const batch = writeBatch(db);

      // 1. Full document (restricted to supervisor and reporter)
      const grievancePayload: Record<string, any> = { ...created };
      grievancePayload.status = 'submitted';
      delete grievancePayload.employerNote;
      delete grievancePayload.resolvedAt;

      // Strict privacy sanitation: ensure anonymous reports contain no identity fields
      if (grievancePayload.isAnonymous) {
        delete grievancePayload.workerId;
        delete grievancePayload.workerName;
        delete grievancePayload.contactNumber;
        delete grievancePayload.email;
        delete grievancePayload.reporterEmail;
        delete grievancePayload.reporterName;
      }

      const grievanceRef = doc(db, GRIEVANCES_COL, created.id);
      batch.set(grievanceRef, grievancePayload);

      // 2. Safe status projection (public tracking without sensitive details)
      const statusRef = doc(db, GRIEVANCE_STATUS_COL, created.id);
      batch.set(statusRef, {
        id: created.id,
        category: created.category,
        severity: created.severity,
        status: 'submitted',
        isAnonymous: created.isAnonymous,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });

      // Atomically commit both writes
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${GRIEVANCES_COL}/${created.id}`);
    }
    return created;
  }

  /**
   * Get grievance by Tracking ID:
   * First tries the safe public status projection 'grievance_status',
   * and if authorized, loads the full report from 'grievances'.
   */
  static async getGrievanceById(id: string): Promise<GrievanceTicket | undefined> {
    const cleanId = id.trim().toUpperCase();
    try {
      // 1. Try public status projection (safe for any anonymous reporter holding ticket ID)
      const statusSnap = await getDoc(doc(db, GRIEVANCE_STATUS_COL, cleanId));
      if (statusSnap.exists()) {
        const statusData = statusSnap.data();

        // 2. Try fetching full document if current user is admin/owner
        try {
          const fullSnap = await getDoc(doc(db, GRIEVANCES_COL, cleanId));
          if (fullSnap.exists()) {
            return fullSnap.data() as GrievanceTicket;
          }
        } catch {
          // Normal: non-admin holding tracking ID cannot read full document
        }

        // Return status projection mapped into GrievanceTicket
        return {
          id: statusData.id || cleanId,
          industry: 'construction',
          category: statusData.category || 'safety_hazard',
          severity: statusData.severity || 'high',
          isAnonymous: statusData.isAnonymous !== false,
          location: 'Reported Location (Protected for Privacy)',
          description: 'Incident details are protected to guarantee reporter confidentiality. Tracking status and supervisor notes are displayed below.',
          status: statusData.status || 'submitted',
          employerNote: statusData.employerNote || undefined,
          createdAt: statusData.createdAt || '',
          updatedAt: statusData.updatedAt || '',
          resolvedAt: statusData.resolvedAt || undefined,
        } as GrievanceTicket;
      }

      // If status doc doesn't exist, try direct get in case created earlier
      const fullSnap = await getDoc(doc(db, GRIEVANCES_COL, cleanId));
      if (fullSnap.exists()) {
        return fullSnap.data() as GrievanceTicket;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${GRIEVANCE_STATUS_COL}/${cleanId}`);
    }
    return StorageService.getGrievanceById(cleanId);
  }

  /**
   * Get all grievances (strictly supervisor / admin only)
   */
  static async getGrievances(industry?: Industry): Promise<GrievanceTicket[]> {
    try {
      const q = industry
        ? query(collection(db, GRIEVANCES_COL), where('industry', '==', industry))
        : collection(db, GRIEVANCES_COL);
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as GrievanceTicket);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, GRIEVANCES_COL);
    }
    return StorageService.getGrievances(industry);
  }

  /**
   * Update grievance status and supervisor response note
   * Updates both full document and safe status projection in Firestore
   */
  static async updateGrievanceStatus(
    ticketId: string,
    status: GrievanceStatus,
    employerNote?: string
  ): Promise<GrievanceTicket | undefined> {
    const updated = StorageService.updateGrievanceStatus(ticketId, status, employerNote);
    try {
      const payload: Record<string, any> = {
        status,
        updatedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      };
      if (employerNote !== undefined) {
        payload.employerNote = employerNote;
      }
      if (status === 'resolved') {
        payload.resolvedAt = payload.updatedAt;
      }

      // Update both full document and status projection atomically via batch
      const batch = writeBatch(db);
      batch.update(doc(db, GRIEVANCES_COL, ticketId), payload);
      batch.set(doc(db, GRIEVANCE_STATUS_COL, ticketId), {
        id: ticketId,
        ...payload,
      }, { merge: true });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${GRIEVANCES_COL}/${ticketId}`);
    }
    return updated;
  }

  /**
   * Realtime listener for grievances
   */
  static subscribeGrievances(
    industry: Industry,
    callback: (tickets: GrievanceTicket[]) => void
  ) {
    try {
      const q = query(collection(db, GRIEVANCES_COL), where('industry', '==', industry));
      return onSnapshot(
        q,
        (snapshot) => {
          const tickets = snapshot.docs.map((d) => d.data() as GrievanceTicket);
          if (tickets.length > 0) {
            callback(tickets);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, GRIEVANCES_COL);
        }
      );
    } catch {
      return () => {};
    }
  }

  /**
   * Determine if the user is an authorized administrator / supervisor.
   * Authoritative check matching firestore.rules:
   * 1. Verified bootstrap admin email: jitheshg111@gmail.com
   * 2. Presence in the /admins/{uid} collection in Cloud Firestore.
   */
  static async checkIsAdmin(user: User | null): Promise<boolean> {
    if (!user) return false;
    // Check bootstrap admin account
    if (user.email === 'jitheshg111@gmail.com') {
      return true;
    }
    // Check Firestore /admins/{uid} collection whitelist
    try {
      const adminSnap = await getDoc(doc(db, 'admins', user.uid));
      return adminSnap.exists();
    } catch {
      return false;
    }
  }
}
