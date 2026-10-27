import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Briefcase,
  CheckCircle2,
  Database,
  Lock,
  Scale,
  Shield,
  UserCheck,
  X,
} from 'lucide-react';
import {
  GrievanceStatus,
  GrievanceTicket,
  Industry,
  Language,
  ShiftRecord,
  UserRole,
  Worker,
} from './types';
import { translations } from './utils/i18n';
import { StorageService } from './services/storageService';
import { FirestoreService } from './services/firestoreService';
import { testFirestoreConnection } from './firebase/config';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { EmployerDashboard } from './components/employer/EmployerDashboard';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('worker');
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [hasSelectedGuestDemo, setHasSelectedGuestDemo] = useState<boolean>(false);

  const [currentIndustry, setCurrentIndustry] = useState<Industry>('construction');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Firebase auth state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Loaded application state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [grievances, setGrievances] = useState<GrievanceTicket[]>([]);
  const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reload data from Firestore with local fallback
  const refreshData = async () => {
    try {
      const allWorkers = await FirestoreService.getWorkers();
      const allShifts = await FirestoreService.getShifts();
      const allGrievances = await FirestoreService.getGrievances();
      const activeWorker =
        allWorkers.find((w) => w.id === StorageService.getCurrentWorker(currentIndustry).id) ||
        StorageService.getCurrentWorker(currentIndustry);

      setWorkers(allWorkers);
      setShifts(allShifts);
      setGrievances(allGrievances);
      setCurrentWorker(activeWorker);
    } catch (e) {
      console.warn('Refresh error:', e);
    }
  };

  useEffect(() => {
    // Test Firestore connection on boot
    testFirestoreConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });

    // Seed Firestore with baseline workers/shifts/grievances if empty
    FirestoreService.initializeFirestoreData().then(() => {
      refreshData();
    });

    // Subscribe to Firebase Auth and resolve authoritative user role
    const unsubAuth = FirestoreService.subscribeAuth(async (user) => {
      setAuthUser(user);
      if (user) {
        const isAdmin = await FirestoreService.checkIsAdmin(user);
        setIsUserAdmin(isAdmin);
        setCurrentRole(isAdmin ? 'employer' : 'worker');
      } else {
        setIsUserAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => {
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    refreshData();

    // Subscribe to realtime grievance updates for current industry
    const unsubGrievances = FirestoreService.subscribeGrievances(
      currentIndustry,
      (updatedTickets) => {
        setGrievances(updatedTickets);
      }
    );

    return () => {
      unsubGrievances();
    };
  }, [currentIndustry]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSignInGoogle = async () => {
    try {
      const user = await FirestoreService.loginWithGoogle();
      if (user) {
        const isAdmin = await FirestoreService.checkIsAdmin(user);
        setIsUserAdmin(isAdmin);
        setCurrentRole(isAdmin ? 'employer' : 'worker');
        showToast(`Signed in as ${user.displayName || user.email}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Google sign-in cancelled or popup was closed');
    }
  };

  const handleSignOut = async () => {
    await FirestoreService.logout();
    setAuthUser(null);
    setIsUserAdmin(false);
    setHasSelectedGuestDemo(false);
    setCurrentRole('worker');
    showToast('Signed out of Firebase');
  };

  const handleIndustryChange = (ind: Industry) => {
    setCurrentIndustry(ind);
    const newWorker = StorageService.getCurrentWorker(ind);
    setCurrentWorker(newWorker);
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const handleWorkerChange = (workerId: string) => {
    StorageService.setCurrentWorker(currentIndustry, workerId);
    const w = workers.find((item) => item.id === workerId);
    if (w) setCurrentWorker(w);
  };

  const handleCheckIn = async (location: string) => {
    if (!currentWorker) return;
    await FirestoreService.checkIn(currentWorker, location);
    await refreshData();
    showToast(translations[currentLanguage].checkInSuccess);
  };

  const handleCheckOut = async () => {
    if (!currentWorker) return;
    await FirestoreService.checkOut(currentWorker.id);
    await refreshData();
    showToast(translations[currentLanguage].checkOutSuccess);
  };

  const handleToggleBreak = async () => {
    if (!currentWorker) return;
    const updated = await FirestoreService.toggleBreak(currentWorker.id);
    await refreshData();
    if (updated?.status === 'on_break') {
      showToast(translations[currentLanguage].breakStartSuccess);
    } else {
      showToast(translations[currentLanguage].breakEndSuccess);
    }
  };

  const handleSubmitGrievance = (
    ticket: Omit<GrievanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    // Submit to Firestore asynchronously while returning immediate ticket with consistent tracking ID
    const localCreated = StorageService.submitGrievance(ticket);
    FirestoreService.submitGrievance(ticket, localCreated).then(() => {
      refreshData();
    });
    showToast(`Report filed! Tracking ID: ${localCreated.id}`);
    return localCreated;
  };

  const handleUpdateGrievanceStatus = async (
    ticketId: string,
    status: GrievanceStatus,
    employerNote?: string
  ) => {
    await FirestoreService.updateGrievanceStatus(ticketId, status, employerNote);
    await refreshData();
    showToast(`Ticket ${ticketId} updated to "${status.replace('_', ' ')}"!`);
  };

  const handleVerifyShift = async (shiftId: string) => {
    await FirestoreService.verifyShift(shiftId);
    await refreshData();
    showToast('Shift verified and persisted to Cloud Firestore.');
  };

  const handleResetDemo = () => {
    StorageService.resetDemoData();
    refreshData();
    showToast(translations[currentLanguage].demoDataResetDone);
  };

  // 1. Authentication resolution loading state: Prevents UI flicker or displaying worker portal to admins
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#123B35] flex items-center justify-center text-white mb-4 animate-pulse shadow-xl shadow-[#123B35]/20">
          <Scale className="w-7 h-7 text-emerald-300" />
        </div>
        <h2 className="text-xl font-extrabold text-[#123B35] tracking-tight font-heading">
          FairShift
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Resolving secure credentials & role permissions...
        </p>
      </div>
    );
  }

  // 2. Fresh visit unauthenticated screen: Dedicated Welcome / Login screen
  if (!authUser && !hasSelectedGuestDemo) {
    return (
      <WelcomeScreen
        language={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onSignInGoogle={handleSignInGoogle}
        onContinueAsGuest={() => {
          setHasSelectedGuestDemo(true);
          setIsUserAdmin(false);
          setCurrentRole('worker');
        }}
        currentIndustry={currentIndustry}
        onIndustryChange={handleIndustryChange}
      />
    );
  }

  // 3. Authenticated / Demo Dashboard View
  const t = translations[currentLanguage];
  const industryWorkers = workers.filter((w) => w.industry === currentIndustry);
  const effectiveWorkerId =
    authUser && !isUserAdmin ? authUser.uid : currentWorker?.id;
  const activeShift = effectiveWorkerId
    ? StorageService.getActiveShift(effectiveWorkerId) ||
      (currentWorker ? StorageService.getActiveShift(currentWorker.id) : undefined)
    : undefined;

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#123B35] flex flex-col font-sans selection:bg-[#123B35] selection:text-white">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#123B35] focus:text-white focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-emerald-400 font-bold text-xs"
      >
        Skip to main content
      </a>

      {/* Top Bar Header */}
      {currentWorker && (
        <Header
          currentRole={currentRole}
          isUserAdmin={isUserAdmin}
          currentIndustry={currentIndustry}
          onIndustryChange={handleIndustryChange}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          currentWorker={currentWorker}
          availableWorkers={industryWorkers}
          onWorkerChange={handleWorkerChange}
          onResetDemo={handleResetDemo}
          authUser={authUser}
          onSignInGoogle={handleSignInGoogle}
          onSignOut={handleSignOut}
          onNavigateWelcome={() => {
            setHasSelectedGuestDemo(false);
          }}
        />
      )}

      {/* Cloud Firestore & Firebase Auth Persistence Banner */}
      <aside
        aria-label="Database status"
        className="bg-[#123B35] text-white px-4 py-2.5 text-xs border-b border-[#2D7B70]/40 shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="font-bold text-emerald-200">
              Cloud Firestore & Firebase Auth:
            </span>
            <span className="text-white/90">
              Attendance records, fair overtime pay & grievance reports live in{' '}
              <code className="text-emerald-200 font-mono text-[11px] bg-black/30 px-1.5 py-0.5 rounded border border-emerald-400/20">
                ai-studio-fairshift-81c99086-42db-408b-84d6-d56bcfe537b1
              </code>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-[11px]">
            {authUser ? (
              <span className="bg-emerald-950/80 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded-md font-semibold">
                ✓ {isUserAdmin ? 'Supervisor / Employer Access' : 'Worker Portal'} ({authUser.email})
              </span>
            ) : (
              <span className="bg-amber-950/80 text-amber-200 border border-amber-600/50 px-2 py-0.5 rounded-md font-medium">
                Guest / Demo Mode (Anonymous reporting enabled)
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none">
        {currentRole === 'worker' && currentWorker ? (
          <WorkerPortal
            worker={currentWorker}
            industry={currentIndustry}
            language={currentLanguage}
            activeShift={activeShift}
            allShifts={shifts}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onToggleBreak={handleToggleBreak}
            onSubmitGrievance={handleSubmitGrievance}
          />
        ) : (
          <EmployerDashboard
            industry={currentIndustry}
            language={currentLanguage}
            workers={workers}
            shifts={shifts}
            grievances={grievances}
            onVerifyShift={handleVerifyShift}
            onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
          />
        )}
      </main>

      {/* Toast Notification with Live Region for Screen Readers */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#123B35] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#2D7B70] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-slate-300 hover:text-white ml-1 cursor-pointer p-1 rounded-md focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[#DDE2D7] bg-white py-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#123B35]" />
            <span className="font-bold text-[#123B35] font-heading">FairShift</span>
            <span>·</span>
            <span>Fair Work, Transparent Pay & Worker Wellbeing</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>English · தமிழ் · हिन्दी</span>
            <span>·</span>
            <span>Construction & College Support Sectors</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
