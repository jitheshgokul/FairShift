import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileSearch,
  MessageSquare,
  Search,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { GrievanceTicket, Language } from '../../types';
import { translations } from '../../utils/i18n';
import { StorageService } from '../../services/storageService';
import { FirestoreService } from '../../services/firestoreService';

interface WorkerTicketLookupProps {
  language: Language;
  initialTicketId?: string;
}

export const WorkerTicketLookup: React.FC<WorkerTicketLookupProps> = ({
  language,
  initialTicketId = '',
}) => {
  const t = translations[language];
  const [searchId, setSearchId] = useState(initialTicketId);
  const [foundTicket, setFoundTicket] = useState<GrievanceTicket | null>(
    initialTicketId ? StorageService.getGrievanceById(initialTicketId) || null : null
  );
  const [hasSearched, setHasSearched] = useState(!!initialTicketId);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const idToLook = (customId || searchId).trim();
    if (!idToLook) return;

    setIsSearching(true);
    try {
      const result = await FirestoreService.getGrievanceById(idToLook);
      setFoundTicket(result || null);
    } catch {
      const fallback = StorageService.getGrievanceById(idToLook);
      setFoundTicket(fallback || null);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const sampleTickets = ['FS-1042', 'FS-2089', 'FS-3105', 'FS-4011'];

  const getStatusStepIndex = (status: GrievanceTicket['status']) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'in_review':
        return 1;
      case 'action_taken':
        return 2;
      case 'resolved':
        return 3;
      default:
        return 0;
    }
  };

  const steps = [
    { title: t.statusSubmitted, desc: 'Logged in system' },
    { title: t.statusInReview, desc: 'Assigned to safety officer' },
    { title: t.statusActionTaken, desc: 'Action in progress' },
    { title: t.statusResolved, desc: 'Resolved & closed' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      {/* Title */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {t.checkStatusTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.checkStatusSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="mt-5">
        <label htmlFor="ticket-id-search" className="sr-only">
          {t.enterTrackingId}
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="ticket-id-search"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={t.enterTrackingId}
              aria-label={t.enterTrackingId}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-bold uppercase tracking-wider text-slate-800 focus:ring-2 focus:ring-[#123B35] focus-visible:ring-2 focus-visible:ring-[#123B35] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            aria-label={t.lookupButton}
            className="px-6 py-3 rounded-xl bg-[#123B35] hover:bg-[#1A524A] active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>{t.lookupButton}</span>
          </button>
        </div>

        {/* Quick Sample IDs */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Try sample tickets:</span>
          {sampleTickets.map((id) => (
            <button
              key={id}
              type="button"
              aria-label={`Fill sample ticket ${id}`}
              onClick={() => {
                setSearchId(id);
                handleSearch(undefined, id);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#123B35] focus-visible:outline-none"
            >
              {id}
            </button>
          ))}
        </div>
      </form>

      {/* Results View with Live Region for Screen Readers */}
      {hasSearched && (
        <div aria-live="polite" className="mt-6 pt-6 border-t border-slate-100">
          {foundTicket ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Ticket Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold font-mono text-blue-900">
                      {foundTicket.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        foundTicket.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : foundTicket.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {foundTicket.severity.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Location:</strong> {foundTicket.location} ·{' '}
                    <span>Logged {foundTicket.createdAt}</span>
                  </p>
                </div>

                <div className="text-right self-start sm:self-auto">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Privacy:
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {foundTicket.isAnonymous ? 'Anonymous' : 'Confidential'}
                  </span>
                </div>
              </div>

              {/* Multi-step Visual Progress Tracker */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-4">
                  Resolution Progress
                </span>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                    {steps.map((st, idx) => {
                      const currentStep = getStatusStepIndex(foundTicket.status);
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isComplete
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50'
                                : 'bg-slate-100 text-slate-400 border border-slate-300'
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          <div className="text-left sm:text-center">
                            <span
                              className={`text-xs font-bold block ${
                                isCurrent
                                  ? 'text-blue-700'
                                  : isComplete
                                  ? 'text-slate-900'
                                  : 'text-slate-400'
                              }`}
                            >
                              {st.title}
                            </span>
                            <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
                              {st.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Worker's Original Report Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1.5">
                <span className="font-bold text-slate-800 block">Report Description:</span>
                <p className="leading-relaxed">{foundTicket.description}</p>
                {foundTicket.audioTranscript && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-slate-600 flex items-start gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span>
                      <strong>Voice Transcript:</strong> "{foundTicket.audioTranscript}"
                    </span>
                  </div>
                )}
              </div>

              {/* Official Supervisor / Management Response */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    {t.supervisorResponse}
                  </span>
                </div>

                {foundTicket.employerNote ? (
                  <div className="text-xs text-blue-900 bg-white p-3 rounded-xl border border-blue-100 leading-relaxed font-medium">
                    {foundTicket.employerNote}
                  </div>
                ) : (
                  <p className="text-xs text-blue-800/80 italic">
                    {t.noSupervisorResponseYet}
                  </p>
                )}

                <div className="text-[11px] text-blue-700/80 pt-1">
                  Last updated: <strong>{foundTicket.updatedAt}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <span className="text-rose-700 font-bold text-sm block">
                {t.ticketNotFound}
              </span>
              <p className="text-xs text-rose-600">
                Please check the ID and try again.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
