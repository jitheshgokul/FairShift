import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  History,
  ShieldCheck,
} from 'lucide-react';
import { Language, ShiftRecord, Worker } from '../../types';
import { translations } from '../../utils/i18n';

interface WorkerShiftHistoryProps {
  worker: Worker;
  shifts: ShiftRecord[];
  language: Language;
}

export const WorkerShiftHistory: React.FC<WorkerShiftHistoryProps> = ({
  worker,
  shifts,
  language,
}) => {
  const t = translations[language];

  // Filter shifts for this worker
  const workerShifts = shifts.filter((s) => s.workerId === worker.id);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {t.shiftHistoryTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified daily shift receipts and overtime records
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {workerShifts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No completed shifts recorded yet for this worker.
          </div>
        ) : (
          workerShifts.map((shift) => (
            <div
              key={shift.id}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {shift.date}
                  </span>
                  <span className="text-xs text-slate-500">
                    {shift.checkInTime} — {shift.checkOutTime || 'Active Now'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    Location: <strong>{shift.siteLocation}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Regular: <strong className="font-mono tabular-nums">{shift.regularHours}h</strong>
                  </span>
                  {shift.overtimeHours > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-orange-700 font-bold">
                        OT: <strong className="font-mono tabular-nums">{shift.overtimeHours}h</strong> (1.5x)
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Pay</span>
                  <span className="text-base font-extrabold font-mono tabular-nums text-slate-900">
                    ₹{shift.grossPay.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center">
                  {shift.verifiedByEmployer ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.verified}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.pendingVerification}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
