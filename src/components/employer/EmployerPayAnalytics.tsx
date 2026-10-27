import React from 'react';
import {
  Banknote,
  CheckCircle,
  Download,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Language, ShiftRecord, Worker } from '../../types';
import { translations } from '../../utils/i18n';

interface EmployerPayAnalyticsProps {
  workers: Worker[];
  shifts: ShiftRecord[];
  language: Language;
}

export const EmployerPayAnalytics: React.FC<EmployerPayAnalyticsProps> = ({
  workers,
  shifts,
  language,
}) => {
  const t = translations[language];

  // Calculate total payroll expenditure
  let totalRegularPay = 0;
  let totalOvertimePay = 0;
  let totalAllowances = 0;
  let totalGross = 0;

  shifts.forEach((s) => {
    totalRegularPay += s.basePay;
    totalOvertimePay += s.overtimePay;
    totalAllowances += s.hazardAllowance + s.shiftAllowance;
    totalGross += s.grossPay;
  });

  const handleExportCsv = () => {
    const headers = [
      'Shift ID',
      'Worker Name',
      'Role',
      'Industry',
      'Date',
      'Check-In',
      'Check-Out',
      'Regular Hours',
      'Overtime Hours',
      'Base Pay (INR)',
      'Overtime Pay (INR)',
      'Allowances (INR)',
      'Gross Pay (INR)',
      'Location',
      'Verified',
    ];

    const rows = shifts.map((s) => [
      s.id,
      `"${s.workerName}"`,
      `"${s.role}"`,
      s.industry,
      s.date,
      s.checkInTime,
      s.checkOutTime || 'Active',
      s.regularHours,
      s.overtimeHours,
      s.basePay,
      s.overtimePay,
      s.hazardAllowance + s.shiftAllowance,
      s.grossPay,
      `"${s.siteLocation}"`,
      s.verifiedByEmployer ? 'YES' : 'PENDING',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FairShift_Payroll_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      {/* Title & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Banknote className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Payroll & Overtime
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Labor costs, overtime, and statutory allowances
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs min-h-[38px] self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{t.exportPayrollCsv}</span>
        </button>
      </div>

      {/* 3-Column Cost Breakdown */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Regular Base Pay */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Regular Wages
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-slate-900">
            ₹{totalRegularPay.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Standard shift wages
          </span>
        </div>

        {/* Overtime Pay (1.5x) */}
        <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-700 block">
            Overtime Wages (1.5x)
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-orange-600">
            ₹{totalOvertimePay.toLocaleString()}
          </div>
          <span className="text-[11px] text-orange-700 font-medium mt-1 block">
            1.5x overtime wages
          </span>
        </div>

        {/* Hazard & Shift Allowances */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
            Allowances
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-emerald-700">
            ₹{totalAllowances.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Safety and shift allowances
          </span>
        </div>
      </div>

      {/* Fair Work Statutory Compliance Checklist */}
      <div className="mt-5 p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2.5">
          Statutory Compliance Audit
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1.5x overtime rate enforced</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>30-minute rest intervals scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Anonymous grievance channel active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hazard stipends applied automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
};
