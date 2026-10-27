import React from 'react';
import { User } from 'firebase/auth';
import {
  Briefcase,
  Building2,
  Globe2,
  HardHat,
  LogIn,
  LogOut,
  RotateCcw,
  Scale,
  Shield,
  UserCheck,
} from 'lucide-react';
import { Industry, Language, UserRole, Worker } from '../types';
import { translations } from '../utils/i18n';

interface HeaderProps {
  currentRole: UserRole;
  isUserAdmin: boolean;
  currentIndustry: Industry;
  onIndustryChange: (industry: Industry) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentWorker: Worker;
  availableWorkers: Worker[];
  onWorkerChange: (workerId: string) => void;
  onResetDemo: () => void;
  authUser: User | null;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onNavigateWelcome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  isUserAdmin,
  currentIndustry,
  onIndustryChange,
  currentLanguage,
  onLanguageChange,
  currentWorker,
  availableWorkers,
  onWorkerChange,
  onResetDemo,
  authUser,
  onSignInGoogle,
  onSignOut,
  onNavigateWelcome,
}) => {
  const t = translations[currentLanguage];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DDE2D7] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateWelcome}
              aria-label="FairShift home, return to welcome screen"
              className="flex items-center gap-3 text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:ring-offset-2 focus-visible:outline-none rounded-xl p-1"
              title="Return to Welcome Screen"
            >
              <div className="w-10 h-10 rounded-xl bg-[#123B35] flex items-center justify-center text-white shadow-md shadow-[#123B35]/20 group-hover:bg-[#1A524A] transition-all">
                <Scale className="w-5 h-5 text-emerald-300" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-[#123B35] font-heading">
                    FairShift
                  </span>
                  {/* Verified Role Badge */}
                  {isUserAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#123B35] text-white shadow-xs">
                      <Briefcase className="w-3 h-3 text-emerald-300" aria-hidden="true" />
                      <span>{t.employerDashboard}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF2F0] text-[#123B35] border border-[#2D7B70]/30">
                      <UserCheck className="w-3 h-3 text-[#22645B]" aria-hidden="true" />
                      <span>{t.workerPortal}</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Industry Switcher */}
          <nav aria-label="Industry Sector Selection" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-1 bg-[#EFF1EB] rounded-xl border border-[#DDE2D7]" role="group" aria-label="Select industry sector">
              <button
                type="button"
                onClick={() => onIndustryChange('construction')}
                aria-pressed={currentIndustry === 'construction'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[34px] focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none ${
                  currentIndustry === 'construction'
                    ? 'bg-[#123B35] text-white shadow-xs font-bold'
                    : 'text-[#123B35] hover:text-black'
                }`}
                title={t.constructionIndustry}
              >
                <HardHat className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                <span className="hidden sm:inline">{t.constructionIndustry}</span>
                <span className="sm:hidden">Construction</span>
              </button>
              <button
                type="button"
                onClick={() => onIndustryChange('college_support')}
                aria-pressed={currentIndustry === 'college_support'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[34px] focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none ${
                  currentIndustry === 'college_support'
                    ? 'bg-[#123B35] text-white shadow-xs font-bold'
                    : 'text-[#123B35] hover:text-black'
                }`}
                title={t.collegeIndustry}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
                <span className="hidden sm:inline">{t.collegeIndustry}</span>
                <span className="sm:hidden">College Staff</span>
              </button>
            </div>
          </nav>

          {/* Zone 3: Language, Profile Switcher & Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Selector */}
            <div className="relative flex items-center bg-[#EFF1EB] rounded-xl px-2 py-1 border border-[#DDE2D7]">
              <Globe2 className="w-3.5 h-3.5 text-[#123B35] mr-1.5 shrink-0" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                aria-label={t.selectLanguage}
                className="bg-transparent text-xs font-semibold text-[#123B35] focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* In Worker Mode: Persona Switcher */}
            {currentRole === 'worker' && availableWorkers.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-[#EFF1EB] px-2.5 py-1 rounded-xl border border-[#DDE2D7]">
                <div
                  className={`w-5 h-5 rounded-md text-white flex items-center justify-center font-bold text-[10px] ${currentWorker.avatarColor}`}
                >
                  {currentWorker.name.charAt(0)}
                </div>
                <select
                  value={currentWorker.id}
                  onChange={(e) => onWorkerChange(e.target.value)}
                  aria-label="Switch Worker Profile"
                  className="bg-transparent text-xs font-semibold text-[#123B35] focus:outline-none cursor-pointer"
                >
                  {availableWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Firebase Auth Session & Sign Out */}
            {authUser ? (
              <div className="flex items-center gap-2 bg-[#EBF2F0] px-2.5 py-1 rounded-xl border border-[#2D7B70]/30">
                {authUser.photoURL ? (
                  <img
                    src={authUser.photoURL}
                    alt={authUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-[#123B35]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#123B35] text-white text-[10px] font-bold flex items-center justify-center">
                    {authUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden xl:block text-left text-[11px] leading-tight">
                  <span className="font-bold text-[#123B35] block truncate max-w-[120px]">
                    {authUser.displayName || authUser.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-[#22645B] font-semibold">
                    {isUserAdmin ? 'Verified Supervisor' : 'Worker'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="p-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer ml-1 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:outline-none rounded-md"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignInGoogle}
                aria-label="Sign in with Google"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#123B35] hover:bg-[#1A524A] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer min-h-[34px] focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Google Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={onResetDemo}
              aria-label={t.resetDemoData}
              title={t.resetDemoData}
              className="p-2 rounded-xl text-slate-500 hover:text-[#123B35] hover:bg-[#EFF1EB] active:scale-95 transition-all min-w-[34px] min-h-[34px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
