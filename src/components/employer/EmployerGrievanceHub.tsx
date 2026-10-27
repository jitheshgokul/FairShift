import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  EyeOff,
  Filter,
  Flame,
  MessageSquare,
  Play,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  Square,
  Volume2,
} from 'lucide-react';
import {
  GrievanceCategory,
  GrievanceStatus,
  GrievanceTicket,
  Language,
} from '../../types';
import { translations } from '../../utils/i18n';

interface EmployerGrievanceHubProps {
  grievances: GrievanceTicket[];
  language: Language;
  onUpdateStatus: (
    ticketId: string,
    status: GrievanceStatus,
    employerNote?: string
  ) => void;
}

export const EmployerGrievanceHub: React.FC<EmployerGrievanceHubProps> = ({
  grievances,
  language,
  onUpdateStatus,
}) => {
  const t = translations[language];
  const [selectedTicket, setSelectedTicket] = useState<GrievanceTicket | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<GrievanceStatus>('in_review');
  const [employerNoteText, setEmployerNoteText] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTickets = grievances.filter((g) => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    return true;
  });

  const handlePlayVoice = (ticket: GrievanceTicket) => {
    if (activePlayingId === ticket.id) {
      setActivePlayingId(null);
    } else {
      setActivePlayingId(ticket.id);
      setTimeout(() => {
        setActivePlayingId(null);
      }, (ticket.audioDurationSeconds || 5) * 1000);
    }
  };

  const handleOpenModal = (ticket: GrievanceTicket) => {
    setSelectedTicket(ticket);
    setStatusToUpdate(ticket.status);
    setEmployerNoteText(ticket.employerNote || '');
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    onUpdateStatus(selectedTicket.id, statusToUpdate, employerNoteText.trim());
    setSelectedTicket(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      {/* Title & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {t.grievanceHubTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.grievanceHubSubtitle}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter Category"
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="all">{t.filterCategory}</option>
            <option value="safety_hazard">{t.hazard}</option>
            <option value="missing_ppe">{t.missingPPE}</option>
            <option value="unpaid_wages">{t.unpaidWages}</option>
            <option value="excessive_overtime">{t.excessiveOvertime}</option>
            <option value="equipment_fault">{t.equipmentFault}</option>
            <option value="harassment">{t.harassment}</option>
          </select>
        </div>
      </div>

      {/* Grievance Ticket Cards */}
      <div className="mt-5 space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No grievances filed matching the selected filter.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isPlaying = activePlayingId === ticket.id;

            return (
              <div
                key={ticket.id}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all space-y-4"
              >
                {/* Top Strip: ID, Category, Severity, Privacy */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold font-mono text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {ticket.id}
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        ticket.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : ticket.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ticket.severity.toUpperCase()}
                    </span>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {ticket.isAnonymous ? (
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Anonymous</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Confidential: {ticket.workerName || 'Worker'}</span>
                      </span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">{ticket.createdAt}</span>
                  </div>
                </div>

                {/* Location and Description */}
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-1">
                    Location: <span className="font-medium text-slate-700">{ticket.location}</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-normal">
                    {ticket.description}
                  </p>
                </div>

                {/* Voice Note Playback if present */}
                {ticket.audioDurationSeconds && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(ticket)}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                      >
                        {isPlaying ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Audio Note ({ticket.audioDurationSeconds}s)
                        </span>
                        {ticket.audioTranscript && (
                          <span className="text-xs text-slate-600 italic block mt-0.5">
                            "{ticket.audioTranscript}"
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {isPlaying ? 'Playing...' : 'Recorded'}
                    </span>
                  </div>
                )}

                {/* Existing Supervisor Note */}
                {ticket.employerNote && (
                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.supervisorResponse}:</span>
                    </div>
                    <p className="text-blue-950 leading-relaxed">{ticket.employerNote}</p>
                  </div>
                )}

                {/* Bottom Row: Status Badge & Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : ticket.status === 'action_taken'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : ticket.status === 'in_review'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {ticket.status === 'resolved'
                        ? t.statusResolved
                        : ticket.status === 'action_taken'
                        ? t.statusActionTaken
                        : ticket.status === 'in_review'
                        ? t.statusInReview
                        : t.statusSubmitted}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenModal(ticket)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.updateStatusBtn}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Update Status and Post Response Note */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {selectedTicket.id}
                </span>
                <h4 className="text-lg font-bold text-slate-900 font-heading">
                  Respond to Grievance
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Update Resolution Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['submitted', t.statusSubmitted],
                      ['in_review', t.statusInReview],
                      ['action_taken', t.statusActionTaken],
                      ['resolved', t.statusResolved],
                    ] as [GrievanceStatus, string][]
                  ).map(([stKey, stLabel]) => (
                    <button
                      key={stKey}
                      type="button"
                      onClick={() => setStatusToUpdate(stKey)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        statusToUpdate === stKey
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {stLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t.addResponseNote}
                </label>
                <textarea
                  rows={4}
                  value={employerNoteText}
                  onChange={(e) => setEmployerNoteText(e.target.value)}
                  placeholder={t.addResponsePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs leading-relaxed border border-amber-200">
                Workers can view this update using their Tracking ID.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer text-center"
                >
                  {t.saveResolution}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
