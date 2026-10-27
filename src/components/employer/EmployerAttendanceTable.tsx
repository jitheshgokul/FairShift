import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Language, ShiftRecord, Worker } from '../../types';
import { translations } from '../../utils/i18n';

interface EmployerAttendanceTableProps {
  workers: Worker[];
  shifts: ShiftRecord[];
  language: Language;
  onVerifyShift: (shiftId: string) => void;
}

export const EmployerAttendanceTable: React.FC<EmployerAttendanceTableProps> = ({
  workers,
  shifts,
  language,
  onVerifyShift,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Unique locations from workers
  const locations = Array.from(new Set(workers.map((w) => w.currentSite)));

  // Map each worker with their latest shift
  const workerRows = workers.map((worker) => {
    const shift = shifts.find((s) => s.workerId === worker.id);
    let hours = 0;
    let overtime = 0;
    let isActive = false;
    let isOnBreak = false;
    let pay = 0;

    if (shift) {
      isActive = shift.status !== 'completed';
      isOnBreak = shift.status === 'on_break';
      if (isActive) {
        const elapsedHrs = (Date.now() - shift.checkInTimestamp) / (3600 * 1000);
        hours = Math.min(8, Math.max(0, elapsedHrs));
        overtime = Math.max(0, elapsedHrs - 8);
        pay = Math.round(
          hours * worker.hourlyRate +
            overtime * worker.overtimeRate +
            shift.hazardAllowance +
            shift.shiftAllowance
        );
      } else {
        hours = shift.regularHours;
        overtime = shift.overtimeHours;
        pay = shift.grossPay;
      }
    }

    return {
      worker,
      shift,
      hours: Number(hours.toFixed(1)),
      overtime: Number(overtime.toFixed(1)),
      isActive,
      isOnBreak,
      pay,
    };
  });

  const filteredRows = workerRows.filter(({ worker, shift }) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      worker.name.toLowerCase().includes(term) ||
      worker.badgeId.toLowerCase().includes(term) ||
      worker.role.toLowerCase().includes(term);

    const matchesLocation =
      selectedLocation === 'all' ||
      worker.currentSite === selectedLocation ||
      shift?.siteLocation === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {t.attendanceRoster}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Workforce punch times, overtime, and verification
          </p>
        </div>

        {/* Search & Location Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchWorker}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              aria-label="Filter Location"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">{t.allLocations}</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">{t.workerCol}</th>
              <th className="py-3 px-3">{t.locationCol}</th>
              <th className="py-3 px-3">{t.checkInCol}</th>
              <th className="py-3 px-3">{t.hoursCol}</th>
              <th className="py-3 px-3">{t.estimatedPayCol}</th>
              <th className="py-3 px-3">{t.statusCol}</th>
              <th className="py-3 px-3 text-right">{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map(({ worker, shift, hours, overtime, isActive, isOnBreak, pay }) => {
              const hasOvertime = overtime > 0;
              const hasFatigueRisk = hours + overtime >= 9.5;

              return (
                <tr
                  key={worker.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Worker & Role */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 ${worker.avatarColor}`}
                      >
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {worker.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{worker.role}</span>
                          <span>·</span>
                          <span className="font-mono">{worker.badgeId}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px] font-medium">
                        {shift?.siteLocation || worker.currentSite}
                      </span>
                    </div>
                  </td>

                  {/* Check-In */}
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {shift?.checkInTime ? (
                      <span className="font-semibold">{shift.checkInTime}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Hours (Regular / Overtime) */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 font-mono tabular-nums text-slate-900 font-bold">
                        <span>{hours}h regular</span>
                      </div>
                      {hasOvertime && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 self-start">
                          <AlertTriangle className="w-3 h-3 text-orange-600 shrink-0" />
                          <span>+{overtime}h OT (1.5x)</span>
                        </div>
                      )}
                      {hasFatigueRisk && (
                        <span className="text-[10px] text-rose-700 font-semibold">
                          ⚠️ Exceeded 9.5h
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Estimated Pay */}
                  <td className="py-3.5 px-3 font-mono tabular-nums font-bold text-slate-900 text-sm">
                    {pay > 0 ? `₹${pay.toLocaleString()}` : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    {isActive ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOnBreak
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnBreak ? 'bg-amber-600' : 'bg-emerald-600 animate-pulse'
                          }`}
                        />
                        <span>{isOnBreak ? t.onBreak : t.activeShift}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Off Shift</span>
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right">
                    {shift && shift.verifiedByEmployer ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.verified}</span>
                      </span>
                    ) : shift ? (
                      <button
                        type="button"
                        onClick={() => onVerifyShift(shift.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {t.markVerified}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
