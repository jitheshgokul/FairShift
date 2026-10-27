import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Language, ShiftRecord, Worker } from '../../types';
import { translations } from '../../utils/i18n';

interface WorkerAttendanceCardProps {
  worker: Worker;
  activeShift?: ShiftRecord;
  language: Language;
  onCheckIn: (location: string) => void;
  onCheckOut: () => void;
  onToggleBreak: () => void;
}

export const WorkerAttendanceCard: React.FC<WorkerAttendanceCardProps> = ({
  worker,
  activeShift,
  language,
  onCheckIn,
  onCheckOut,
  onToggleBreak,
}) => {
  const t = translations[language];
  const [selectedLocation, setSelectedLocation] = useState(worker.currentSite);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Industry-specific location presets
  const constructionLocations = [
    'Metro Tower B - Gate 4',
    'East Flyover Deck #3',
    'Underground Metro Pier 12',
    'Sub-level Basement B2',
    'Central High-Rise Core',
  ];

  const collegeLocations = [
    'Science Quad & Lab Wing',
    'Engineering Hall & Power Substation',
    'Girls Hostel Complex #4',
    'Sports Stadium & Botanical Lawn',
    'Main Gate & Central Library',
  ];

  const locations =
    worker.industry === 'construction' ? constructionLocations : collegeLocations;

  // Live timer for active shift
  useEffect(() => {
    if (!activeShift || activeShift.status === 'completed') {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - activeShift.checkInTimestamp) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isCheckedIn = !!activeShift && activeShift.status !== 'completed';
  const isOnBreak = activeShift?.status === 'on_break';
  const hoursWorked = elapsedSeconds / 3600;
  const isOvertimeRisk = hoursWorked >= 8.0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      {/* Top Worker Profile & Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-14 h-14 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-md ${worker.avatarColor}`}
          >
            {worker.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                {worker.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {worker.badgeId}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              {worker.role}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isCheckedIn ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                isOnBreak
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isOvertimeRisk
                  ? 'bg-orange-100 text-orange-900 border border-orange-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnBreak
                    ? 'bg-amber-600'
                    : isOvertimeRisk
                    ? 'bg-orange-600 animate-ping'
                    : 'bg-emerald-600'
                }`}
              />
              <span>
                {isOnBreak
                  ? t.onBreak
                  : isOvertimeRisk
                  ? `${t.activeShift} (Overtime)`
                  : t.activeShift}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>{t.notCheckedIn}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Shift Timer & Punch Zone */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Timer & Location */}
        <div className="space-y-4 flex-1">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.elapsedTime}
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                {isCheckedIn ? formatTimer(elapsedSeconds) : '00:00:00'}
              </div>
              {isCheckedIn && (
                <span className="text-sm font-semibold text-slate-500">
                  {activeShift?.checkInTime && `${t.shiftStartedAt}: ${activeShift.checkInTime}`}
                </span>
              )}
            </div>
          </div>

          {/* Location Selector */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {t.selectSite}
              </span>
            </label>
            {isCheckedIn ? (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-medium border border-slate-200">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">{activeShift?.siteLocation || selectedLocation}</span>
              </div>
            ) : (
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label={t.selectSite}
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Right: Big Tactile Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[240px]">
          {!isCheckedIn ? (
            <button
              type="button"
              onClick={() => onCheckIn(selectedLocation)}
              className="w-full min-h-[58px] px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{t.checkIn}</span>
            </button>
          ) : (
            <>
              {/* Check Out Button */}
              <button
                type="button"
                onClick={onCheckOut}
                className="w-full min-h-[58px] px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
              >
                <Square className="w-6 h-6 fill-current" />
                <span>{t.checkOut}</span>
              </button>

              {/* Break Toggle Button */}
              <button
                type="button"
                onClick={onToggleBreak}
                className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isOnBreak
                    ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>{isOnBreak ? t.resumeWork : t.takeBreak}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overtime Notice if exceeding 8 hours */}
      {isOvertimeRisk && isCheckedIn && (
        <div className="mt-2 p-3.5 rounded-2xl bg-orange-50 border border-orange-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-950">
            <span className="font-bold">{t.overtimeExceeded}. </span>
            <span>Additional time paid at 1.5x (₹{worker.overtimeRate}/hr).</span>
          </div>
        </div>
      )}

      {/* Hourly Rate Transparency Pill */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              {t.regularRate}: <strong className="text-slate-900 font-bold tabular-nums">₹{worker.hourlyRate}/hr</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>
              {t.overtimeRate}: <strong className="text-slate-900 font-bold tabular-nums">₹{worker.overtimeRate}/hr</strong>
            </span>
          </div>
        </div>
        <div className="text-slate-500 font-medium">
          {worker.industry === 'construction' ? 'Daily Safety Allowance: ₹50' : 'Campus Support Allowance: ₹25'}
        </div>
      </div>
    </div>
  );
};
