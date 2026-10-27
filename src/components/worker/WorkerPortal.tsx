import React, { useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  FileSearch,
  HardHat,
  History,
  MessageSquare,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import {
  GrievanceTicket,
  Industry,
  Language,
  ShiftRecord,
  Worker,
} from '../../types';
import { translations } from '../../utils/i18n';
import { WorkerAttendanceCard } from './WorkerAttendanceCard';
import { WorkerPayBreakdown } from './WorkerPayBreakdown';
import { WorkerGrievanceForm } from './WorkerGrievanceForm';
import { WorkerTicketLookup } from './WorkerTicketLookup';
import { WorkerShiftHistory } from './WorkerShiftHistory';

interface WorkerPortalProps {
  worker: Worker;
  industry: Industry;
  language: Language;
  activeShift?: ShiftRecord;
  allShifts: ShiftRecord[];
  onCheckIn: (location: string) => void;
  onCheckOut: () => void;
  onToggleBreak: () => void;
  onSubmitGrievance: (
    ticket: Omit<GrievanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => GrievanceTicket;
}

export const WorkerPortal: React.FC<WorkerPortalProps> = ({
  worker,
  industry,
  language,
  activeShift,
  allShifts,
  onCheckIn,
  onCheckOut,
  onToggleBreak,
  onSubmitGrievance,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'shift' | 'report' | 'lookup' | 'history'>('shift');
  const [initialLookupId, setInitialLookupId] = useState<string>('');

  const handleViewTicketFromSubmit = (ticketId: string) => {
    setInitialLookupId(ticketId);
    setActiveTab('lookup');
  };

  return (
    <div className="space-y-6">
      {/* Worker Greeting & Quick Navigation Strip */}
      <div className="bg-white rounded-2xl border border-[#DDE2D7] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#22645B]">
            {industry === 'construction' ? t.constructionIndustry : t.collegeIndustry}
          </span>
          <h1 className="text-2xl font-extrabold text-[#123B35] font-heading mt-0.5">
            {t.workerGreeting}, {worker.name}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {worker.role} · {worker.badgeId} · {worker.currentSite}
          </p>
        </div>

        {/* Worker Navigation Tabs */}
        <nav aria-label="Worker Portal Navigation">
          <div role="tablist" aria-label="Worker Portal Tabs" className="flex items-center gap-1.5 p-1 bg-[#EFF1EB] rounded-xl border border-[#DDE2D7] overflow-x-auto">
            <button
              id="tab-shift"
              role="tab"
              aria-selected={activeTab === 'shift'}
              aria-controls="panel-shift"
              type="button"
              onClick={() => setActiveTab('shift')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none ${
                activeTab === 'shift'
                  ? 'bg-[#123B35] text-white shadow-xs'
                  : 'text-[#123B35] hover:bg-[#DDE2D7]'
              }`}
            >
              <UserCheck className="w-4 h-4" aria-hidden="true" />
              <span>Shift & Pay</span>
            </button>

            <button
              id="tab-report"
              role="tab"
              aria-selected={activeTab === 'report'}
              aria-controls="panel-report"
              type="button"
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none ${
                activeTab === 'report'
                  ? 'bg-[#123B35] text-white shadow-xs'
                  : 'text-[#123B35] hover:bg-[#DDE2D7]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>Report Hazard</span>
            </button>

            <button
              id="tab-lookup"
              role="tab"
              aria-selected={activeTab === 'lookup'}
              aria-controls="panel-lookup"
              type="button"
              onClick={() => setActiveTab('lookup')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none ${
                activeTab === 'lookup'
                  ? 'bg-[#123B35] text-white shadow-xs'
                  : 'text-[#123B35] hover:bg-[#DDE2D7]'
              }`}
            >
              <FileSearch className="w-4 h-4" aria-hidden="true" />
              <span>Track Ticket</span>
            </button>

            <button
              id="tab-history"
              role="tab"
              aria-selected={activeTab === 'history'}
              aria-controls="panel-history"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none ${
                activeTab === 'history'
                  ? 'bg-[#123B35] text-white shadow-xs'
                  : 'text-[#123B35] hover:bg-[#DDE2D7]'
              }`}
            >
              <History className="w-4 h-4" aria-hidden="true" />
              <span>Receipts</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Tab 1: Attendance Check-In & Live Pay Breakdown */}
      {activeTab === 'shift' && (
        <div id="panel-shift" role="tabpanel" aria-labelledby="tab-shift" className="space-y-6">
          <WorkerAttendanceCard
            worker={worker}
            activeShift={activeShift}
            language={language}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
            onToggleBreak={onToggleBreak}
          />

          <WorkerPayBreakdown
            worker={worker}
            activeShift={activeShift}
            language={language}
          />
        </div>
      )}

      {/* Tab 2: Safety & Grievance Reporting */}
      {activeTab === 'report' && (
        <div id="panel-report" role="tabpanel" aria-labelledby="tab-report">
          <WorkerGrievanceForm
            worker={worker}
            industry={industry}
            language={language}
            onSubmitGrievance={onSubmitGrievance}
            onViewTicket={handleViewTicketFromSubmit}
          />
        </div>
      )}

      {/* Tab 3: Track Existing Ticket */}
      {activeTab === 'lookup' && (
        <div id="panel-lookup" role="tabpanel" aria-labelledby="tab-lookup">
          <WorkerTicketLookup
            language={language}
            initialTicketId={initialLookupId}
          />
        </div>
      )}

      {/* Tab 4: Shift Receipts History */}
      {activeTab === 'history' && (
        <div id="panel-history" role="tabpanel" aria-labelledby="tab-history">
          <WorkerShiftHistory
            worker={worker}
            shifts={allShifts}
            language={language}
          />
        </div>
      )}
    </div>
  );
};
