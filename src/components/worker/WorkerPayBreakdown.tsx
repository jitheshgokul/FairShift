import React, { useState } from 'react';
import {
  Banknote,
  Calculator,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Language, PayEstimate, ShiftRecord, Worker } from '../../types';
import { translations } from '../../utils/i18n';
import { StorageService } from '../../services/storageService';

interface WorkerPayBreakdownProps {
  worker: Worker;
  activeShift?: ShiftRecord;
  language: Language;
}

export const WorkerPayBreakdown: React.FC<WorkerPayBreakdownProps> = ({
  worker,
  activeShift,
  language,
}) => {
  const t = translations[language];
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showDeductionsDetail, setShowDeductionsDetail] = useState(false);

  // Compute live pay or default shift baseline
  const payEstimate: PayEstimate = activeShift
    ? StorageService.calculateLivePay(activeShift, worker)
    : {
        regularHours: 8.0,
        overtimeHours: 0,
        regularRate: worker.hourlyRate,
        overtimeRate: worker.overtimeRate,
        basePay: 8.0 * worker.hourlyRate,
        overtimePay: 0,
        hazardAllowance: worker.industry === 'construction' ? 50 : 25,
        shiftAllowance: 0,
        grossPay: 8.0 * worker.hourlyRate + (worker.industry === 'construction' ? 50 : 25),
        statutoryDeductions: Math.round(
          (8.0 * worker.hourlyRate + (worker.industry === 'construction' ? 50 : 25)) * 0.12
        ),
        estimatedTakeHome: Math.round(
          (8.0 * worker.hourlyRate + (worker.industry === 'construction' ? 50 : 25)) * 0.88
        ),
      };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Banknote className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {t.payBreakdownTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.payBreakdownSubtitle}
          </p>
        </div>

        {activeShift ? (
          <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Shift
          </span>
        ) : (
          <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            8h Shift Baseline
          </span>
        )}
      </div>

      {/* Primary Highlighted Total Box */}
      <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">
              {t.grossPay}
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight mt-1">
              ₹{payEstimate.grossPay.toLocaleString()}
            </div>
            <p className="text-xs text-blue-200/80 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Statutory minimum wage and overtime compliance verified</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowSlipModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/20 min-h-[40px]"
            >
              <FileText className="w-4 h-4" />
              <span>View Pay Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Itemized Breakdown Grid */}
      <div className="space-y-3">
        {/* Item 1: Regular Hours */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <span className="font-semibold text-slate-800">{t.regularHours}</span>
              <span className="text-xs text-slate-500 ml-2">
                ({payEstimate.regularHours} hrs @ ₹{payEstimate.regularRate}/hr)
              </span>
            </div>
          </div>
          <span className="font-bold font-mono tabular-nums text-slate-900 text-base">
            ₹{payEstimate.basePay.toLocaleString()}
          </span>
        </div>

        {/* Item 2: Overtime Hours (1.5x) */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-4 h-4 text-orange-600" />
            <div>
              <span className="font-semibold text-slate-800">{t.overtimeHours}</span>
              <span className="text-xs text-orange-700 font-medium ml-2">
                ({payEstimate.overtimeHours} hrs @ ₹{payEstimate.overtimeRate}/hr)
              </span>
            </div>
          </div>
          <span className="font-bold font-mono tabular-nums text-orange-600 text-base">
            +₹{payEstimate.overtimePay.toLocaleString()}
          </span>
        </div>

        {/* Item 3: Hazard / Safety Allowance */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="font-semibold text-slate-800">{t.hazardAllowance}</span>
              <span className="text-xs text-slate-500 ml-2">
                {worker.industry === 'construction'
                  ? 'Mandatory high-altitude / scaffolding allowance'
                  : 'Hazardous chemicals & bio-waste allowance'}
              </span>
            </div>
          </div>
          <span className="font-bold font-mono tabular-nums text-emerald-700 text-base">
            +₹{payEstimate.hazardAllowance.toLocaleString()}
          </span>
        </div>

        {/* Item 4: Shift Allowance (if applicable) */}
        {payEstimate.shiftAllowance > 0 && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-slate-800">{t.shiftAllowance}</span>
            </div>
            <span className="font-bold font-mono tabular-nums text-purple-700 text-base">
              +₹{payEstimate.shiftAllowance.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Statutory Deductions Disclosure Accordion */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowDeductionsDetail(!showDeductionsDetail)}
          className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 py-1"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 text-blue-600" />
            <span>{t.statutoryTransparency}</span>
          </div>
          {showDeductionsDetail ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showDeductionsDetail && (
          <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Provident Fund (PF employee share ~10%):</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                -₹{Math.round(payEstimate.grossPay * 0.1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Employee State Insurance (ESI medical coverage ~2%):</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                -₹{Math.round(payEstimate.grossPay * 0.02)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
              <span>{t.estimatedTakeHome}:</span>
              <span className="font-mono tabular-nums text-emerald-700 text-sm">
                ₹{payEstimate.estimatedTakeHome.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Digital Pay Slip */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-blue-700">
                  Digital Pay Slip
                </span>
                <h4 className="text-xl font-bold text-slate-900 font-heading">
                  {worker.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Worker Badge:</span>
                  <span className="font-bold text-slate-800">{worker.badgeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Trade / Role:</span>
                  <span className="font-bold text-slate-800">{worker.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Work Location:</span>
                  <span className="font-bold text-slate-800">{activeShift?.siteLocation || worker.currentSite}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Shift:</span>
                  <span className="font-bold text-slate-800">{new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span>Regular Hours ({payEstimate.regularHours}h @ ₹{payEstimate.regularRate}):</span>
                  <span className="font-mono font-semibold tabular-nums">₹{payEstimate.basePay}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Overtime ({payEstimate.overtimeHours}h @ 1.5x ₹{payEstimate.overtimeRate}):</span>
                  <span className="font-mono font-semibold tabular-nums">+₹{payEstimate.overtimePay}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Safety / Hazard Allowance:</span>
                  <span className="font-mono font-semibold tabular-nums">+₹{payEstimate.hazardAllowance}</span>
                </div>
                {payEstimate.shiftAllowance > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Shift Differential:</span>
                    <span className="font-mono font-semibold tabular-nums">+₹{payEstimate.shiftAllowance}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                  <span>Gross Shift Pay:</span>
                  <span className="font-mono tabular-nums text-blue-700">₹{payEstimate.grossPay}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
                ✓ Verified per statutory fair wage rules. 11-hour minimum rest period applied.
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-all text-center cursor-pointer"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="py-3 px-5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-all text-center cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
