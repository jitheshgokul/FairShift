import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  CalendarCheck,
  Download,
  Flame,
  HardHat,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  GrievanceStatus,
  GrievanceTicket,
  Industry,
  Language,
  ShiftRecord,
  Worker,
} from '../../types';
import { translations } from '../../utils/i18n';
import { EmployerKPIOverview } from './EmployerKPIOverview';
import { EmployerAttendanceTable } from './EmployerAttendanceTable';
import { EmployerGrievanceHub } from './EmployerGrievanceHub';
import { EmployerPayAnalytics } from './EmployerPayAnalytics';

interface EmployerDashboardProps {
  industry: Industry;
  language: Language;
  workers: Worker[];
  shifts: ShiftRecord[];
  grievances: GrievanceTicket[];
  onVerifyShift: (shiftId: string) => void;
  onUpdateGrievanceStatus: (
    ticketId: string,
    status: GrievanceStatus,
    employerNote?: string
  ) => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  industry,
  language,
  workers,
  shifts,
  grievances,
  onVerifyShift,
  onUpdateGrievanceStatus,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'attendance' | 'grievances' | 'payroll'>('attendance');

  // Filter items by current industry
  const industryWorkers = workers.filter((w) => w.industry === industry);
  const industryShifts = shifts.filter((s) => s.industry === industry);
  const industryGrievances = grievances.filter((g) => g.industry === industry);

  return (
    <div className="space-y-6">
      {/* Dashboard Header Bar */}
      <div className="bg-white rounded-2xl border border-[#DDE2D7] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#22645B]">
              {industry === 'construction' ? t.constructionIndustry : t.collegeIndustry}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">
              Compliance & Operations
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#123B35] font-heading mt-0.5">
            {t.workforceOverview}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.overviewSubtitle}
          </p>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EFF1EB] rounded-xl border border-[#DDE2D7] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#123B35] text-white shadow-xs'
                : 'text-[#123B35] hover:bg-[#DDE2D7]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grievances')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer ${
              activeTab === 'grievances'
                ? 'bg-[#123B35] text-white shadow-xs'
                : 'text-[#123B35] hover:bg-[#DDE2D7]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Grievances</span>
            {industryGrievances.filter((g) => g.status !== 'resolved').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {industryGrievances.filter((g) => g.status !== 'resolved').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-[#123B35] text-white shadow-xs'
                : 'text-[#123B35] hover:bg-[#DDE2D7]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>Payroll</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <EmployerKPIOverview
        workers={industryWorkers}
        shifts={industryShifts}
        grievances={industryGrievances}
        language={language}
      />

      {/* Tab 1: Attendance Roster */}
      {activeTab === 'attendance' && (
        <EmployerAttendanceTable
          workers={industryWorkers}
          shifts={industryShifts}
          language={language}
          onVerifyShift={onVerifyShift}
        />
      )}

      {/* Tab 2: Grievance Management Hub */}
      {activeTab === 'grievances' && (
        <EmployerGrievanceHub
          grievances={industryGrievances}
          language={language}
          onUpdateStatus={onUpdateGrievanceStatus}
        />
      )}

      {/* Tab 3: Payroll & Overtime Analytics */}
      {activeTab === 'payroll' && (
        <EmployerPayAnalytics
          workers={industryWorkers}
          shifts={industryShifts}
          language={language}
        />
      )}
    </div>
  );
};
