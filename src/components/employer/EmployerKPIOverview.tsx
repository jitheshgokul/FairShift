import React from 'react';
import {
  AlertTriangle,
  Clock,
  Flame,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { GrievanceTicket, Language, ShiftRecord, Worker } from '../../types';
import { translations } from '../../utils/i18n';

interface EmployerKPIOverviewProps {
  workers: Worker[];
  shifts: ShiftRecord[];
  grievances: GrievanceTicket[];
  language: Language;
}

export const EmployerKPIOverview: React.FC<EmployerKPIOverviewProps> = ({
  workers,
  shifts,
  grievances,
  language,
}) => {
  const t = translations[language];

  // Active workers currently checked in
  const activeShifts = shifts.filter((s) => s.status !== 'completed');
  const totalHoursToday = shifts.reduce(
    (acc, s) => acc + s.regularHours + s.overtimeHours,
    0
  );

  // Overtime alerts (shifts exceeding 8h or active shifts that started > 8h ago)
  const overtimeShifts = shifts.filter((s) => {
    if (s.overtimeHours > 0) return true;
    if (s.status !== 'completed') {
      const hours = (Date.now() - s.checkInTimestamp) / (3600 * 1000);
      return hours >= 8.0;
    }
    return false;
  });

  // Open unresolved grievances
  const openGrievances = grievances.filter((g) => g.status !== 'resolved');
  const criticalGrievances = openGrievances.filter((g) => g.severity === 'critical');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Active Workers */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.activeWorkersNow}
          </span>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
            {activeShifts.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            / {workers.length} registered
          </span>
        </div>
        <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active on site</span>
        </div>
      </div>

      {/* Metric 2: Total Hours */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.totalHoursToday}
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
            {totalHoursToday.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 font-medium">hours</span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Total recorded hours
        </div>
      </div>

      {/* Metric 3: Overtime & Fatigue Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.overtimeAlertsCount}
          </span>
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold font-mono tabular-nums ${
              overtimeShifts.length > 0 ? 'text-orange-600' : 'text-slate-900'
            }`}
          >
            {overtimeShifts.length}
          </span>
          <span className="text-xs text-slate-500 font-medium">shifts &gt; 8h</span>
        </div>
        <div className="mt-2 text-xs text-orange-700 font-medium">
          {overtimeShifts.length > 0
            ? '1.5x overtime applied'
            : 'Within standard hours'}
        </div>
      </div>

      {/* Metric 4: Open Grievances */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.openGrievancesCount}
          </span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold font-mono tabular-nums ${
              openGrievances.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {openGrievances.length}
          </span>
          {criticalGrievances.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {criticalGrievances.length} Critical
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Pending investigation
        </div>
      </div>
    </div>
  );
};
