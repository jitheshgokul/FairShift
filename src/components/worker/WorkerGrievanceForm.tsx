import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  Coins,
  Copy,
  EyeOff,
  Flame,
  HardHat,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Square,
  UserX,
  Volume2,
  Wrench,
} from 'lucide-react';
import {
  GrievanceCategory,
  GrievanceSeverity,
  GrievanceTicket,
  Industry,
  Language,
  Worker,
} from '../../types';
import { translations } from '../../utils/i18n';

interface WorkerGrievanceFormProps {
  worker: Worker;
  industry: Industry;
  language: Language;
  onSubmitGrievance: (
    ticket: Omit<GrievanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => GrievanceTicket;
  onViewTicket: (ticketId: string) => void;
}

export const WorkerGrievanceForm: React.FC<WorkerGrievanceFormProps> = ({
  worker,
  industry,
  language,
  onSubmitGrievance,
  onViewTicket,
}) => {
  const t = translations[language];

  const [category, setCategory] = useState<GrievanceCategory>('safety_hazard');
  const [severity, setSeverity] = useState<GrievanceSeverity>('high');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(worker.currentSite);

  // Simulated Voice Note state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');

  // Submission success modal
  const [submittedTicket, setSubmittedTicket] = useState<GrievanceTicket | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Timer for voice note simulation
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setHasRecordedAudio(false);
    setIsPlayingAudio(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecordedAudio(true);

    // Generate simulated transcript based on selected category and language
    let sampleTranscript = '';
    if (language === 'ta') {
      if (category === 'safety_hazard') {
        sampleTranscript =
          'வணக்கம், தளத்தில் பாதுகாப்பு கயிறு மற்றும் சாரம் தளர்வாக உள்ளது. உடனடியாக சரிபார்க்கவும்.';
      } else if (category === 'unpaid_wages') {
        sampleTranscript =
          'கடந்த சனிக்கிழமை செய்த 2 மணிநேர கூடுதல் பணிக்கான ஊதியம் இன்னும் வரவில்லை.';
      } else {
        sampleTranscript = 'பாதுகாப்பு உபகரணங்கள் பற்றாக்குறையாக உள்ளது. புதிய ஹெல்மெட் மற்றும் பூட்ஸ் தேவை.';
      }
    } else if (language === 'hi') {
      if (category === 'safety_hazard') {
        sampleTranscript =
          'नमस्ते, कार्यस्थल पर सुरक्षा रेलिंग ढीली है। हवा में हिल रही है, कृपया तुरंत ठीक करें।';
      } else if (category === 'unpaid_wages') {
        sampleTranscript = 'पिछले शनिवार 2 घंटे ओवरटाइम किया था, उसका भुगतान अभी तक नहीं मिला है।';
      } else {
        sampleTranscript = 'सुरक्षा गियर उपलब्ध नहीं है। कृपया नए दस्ताने और सुरक्षा जूते प्रदान करें।';
      }
    } else {
      if (category === 'safety_hazard') {
        sampleTranscript =
          'Hello, the guard rail and scaffolding brackets on the outer wing are swaying. Please inspect immediately.';
      } else if (category === 'unpaid_wages') {
        sampleTranscript =
          'Worked 2 extra overtime hours last Friday evening, but it was missing from the voucher pay sheet.';
      } else {
        sampleTranscript =
          'Protective safety gear is worn out and needs prompt replacement for the shift crew.';
      }
    }

    setAudioTranscript(sampleTranscript);
    if (!description) {
      setDescription(sampleTranscript);
    }
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, (recordingSeconds || 4) * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !hasRecordedAudio) return;

    const newTicket = onSubmitGrievance({
      industry,
      category,
      severity,
      isAnonymous,
      workerId: isAnonymous ? undefined : worker.id,
      workerName: isAnonymous ? undefined : worker.name,
      contactNumber: isAnonymous ? undefined : worker.phone,
      location: location.trim() || worker.currentSite,
      description: description.trim() || audioTranscript,
      audioDurationSeconds: hasRecordedAudio ? Math.max(4, recordingSeconds) : undefined,
      audioTranscript: hasRecordedAudio ? audioTranscript : undefined,
    });

    setSubmittedTicket(newTicket);
  };

  const handleCopyId = () => {
    if (!submittedTicket) return;
    navigator.clipboard.writeText(submittedTicket.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const categories = [
    {
      id: 'safety_hazard' as GrievanceCategory,
      label: t.hazard,
      icon: Flame,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      activeColor: 'bg-rose-600 text-white border-rose-600',
    },
    {
      id: 'missing_ppe' as GrievanceCategory,
      label: t.missingPPE,
      icon: HardHat,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      activeColor: 'bg-amber-600 text-white border-amber-600',
    },
    {
      id: 'unpaid_wages' as GrievanceCategory,
      label: t.unpaidWages,
      icon: Coins,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      activeColor: 'bg-blue-600 text-white border-blue-600',
    },
    {
      id: 'excessive_overtime' as GrievanceCategory,
      label: t.excessiveOvertime,
      icon: AlertOctagon,
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      activeColor: 'bg-orange-600 text-white border-orange-600',
    },
    {
      id: 'equipment_fault' as GrievanceCategory,
      label: t.equipmentFault,
      icon: Wrench,
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      activeColor: 'bg-slate-800 text-white border-slate-800',
    },
    {
      id: 'harassment' as GrievanceCategory,
      label: t.harassment,
      icon: UserX,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      activeColor: 'bg-purple-600 text-white border-purple-600',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all">
      {/* Title & Privacy Guarantee Header */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              {t.reportTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.reportSubtitle}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Step 1: Select Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. {t.categorySelect}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 min-h-[90px] cursor-pointer ${
                    isSelected
                      ? c.activeColor + ' shadow-md shadow-slate-900/10 scale-[1.02]'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold leading-snug line-clamp-2">
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Privacy / Confidentiality Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            2. Confidentiality Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                isAnonymous
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <EyeOff className={`w-5 h-5 shrink-0 mt-0.5 ${isAnonymous ? 'text-white' : 'text-slate-500'}`} />
              <div>
                <span className="text-xs font-bold block">{t.anonymousReport}</span>
                <span className={`text-[11px] block mt-0.5 leading-tight ${isAnonymous ? 'text-blue-100' : 'text-slate-500'}`}>
                  {t.anonymousDesc}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                !isAnonymous
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Shield className={`w-5 h-5 shrink-0 mt-0.5 ${!isAnonymous ? 'text-white' : 'text-slate-500'}`} />
              <div>
                <span className="text-xs font-bold block">{t.confidentialReport}</span>
                <span className={`text-[11px] block mt-0.5 leading-tight ${!isAnonymous ? 'text-blue-100' : 'text-slate-500'}`}>
                  {t.confidentialDesc}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 3: Location of Hazard */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            3. Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Tower B 4th floor scaffolding, or Cafeteria..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Step 4: Voice Note Recording */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-blue-600" />
              4. {t.voiceNoteOption}
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
              Voice Note
            </span>
          </div>

          {!isRecording && !hasRecordedAudio && (
            <button
              type="button"
              onClick={handleStartRecording}
              className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-white border-2 border-dashed border-blue-400 hover:border-blue-600 text-blue-700 font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Mic className="w-4 h-4" />
              </div>
              <span>{t.startRecording}</span>
            </button>
          )}

          {isRecording && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center animate-ping">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-900 block">
                    {t.recordingActive}
                  </span>
                  <span className="text-sm font-mono font-bold text-rose-700 tabular-nums">
                    00:{String(recordingSeconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStopRecording}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[40px]"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{t.stopRecording}</span>
              </button>
            </div>
          )}

          {hasRecordedAudio && !isRecording && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.audioRecorded} ({recordingSeconds}s)</span>
                </div>
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>
              </div>

              {/* Audio playback simulator */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-emerald-200">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer shrink-0"
                >
                  {isPlayingAudio ? (
                    <Square className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
                <div className="flex-1 flex items-center gap-1">
                  {[...Array(16)].map((_, i) => (
                    <span
                      key={i}
                      className={`h-4 w-1.5 rounded-full transition-all ${
                        isPlayingAudio
                          ? 'bg-emerald-600 animate-pulse'
                          : 'bg-emerald-200'
                      }`}
                      style={{
                        height: `${Math.sin(i) * 10 + 16}px`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {isPlayingAudio ? 'Playing...' : `00:${String(recordingSeconds).padStart(2, '0')}`}
                </span>
              </div>

              {/* Simulated Transcript */}
              {audioTranscript && (
                <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    {t.transcript}:
                  </span>
                  <p className="italic">"{audioTranscript}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 5: Text Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            5. {t.describeIssue}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.describePlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!description.trim() && !hasRecordedAudio}
          className={`w-full min-h-[54px] px-6 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            description.trim() || hasRecordedAudio
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
          <span>{t.submitReport}</span>
        </button>
      </form>

      {/* Submission Confirmation Modal with Tracking ID */}
      {submittedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 font-heading">
                {t.reportSuccessTitle}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {t.reportSuccessDesc}
              </p>
            </div>

            {/* Prominent Tracking ID Container */}
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-400 flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                {t.yourTrackingId}
              </span>
              <span className="text-3xl font-extrabold font-mono text-blue-900 tracking-wider">
                {submittedTicket.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="mt-1 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyId}</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-left text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Category:</span>
                <strong className="text-slate-800">{submittedTicket.category}</strong>
              </div>
              <div className="flex justify-between">
                <span>Privacy:</span>
                <strong className="text-slate-800">
                  {submittedTicket.isAnonymous ? 'Anonymous' : 'Confidential'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <strong className="text-slate-800">{submittedTicket.createdAt}</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const id = submittedTicket.id;
                  setSubmittedTicket(null);
                  onViewTicket(id);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all cursor-pointer"
              >
                Track Ticket
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedTicket(null);
                  setDescription('');
                  setHasRecordedAudio(false);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
