import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  HardHat,
  Lock,
  LogIn,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { Industry, Language } from '../types';
import { translations } from '../utils/i18n';
import { WorkerTicketLookup } from './worker/WorkerTicketLookup';

interface WelcomeScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSignInGoogle: () => void;
  onContinueAsGuest: () => void;
  currentIndustry: Industry;
  onIndustryChange: (ind: Industry) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onLanguageChange,
  onSignInGoogle,
  onContinueAsGuest,
  currentIndustry,
  onIndustryChange,
}) => {
  const t = translations[language];
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await onSignInGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#123B35] flex flex-col font-sans selection:bg-[#123B35] selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DDE2D7] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#123B35] flex items-center justify-center text-white shadow-md shadow-[#123B35]/20">
                <Scale className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#123B35] font-heading">
                  FairShift
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBF2F0] text-[#123B35] border border-[#2D7B70]/30">
                  Fair Work & Wellbeing
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-[#EFF1EB] p-1 rounded-xl border border-[#DDE2D7]">
                <Globe2 className="w-3.5 h-3.5 text-[#123B35] ml-1.5 mr-1 shrink-0" />
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    language === 'en'
                      ? 'bg-[#123B35] text-white shadow-xs'
                      : 'text-[#123B35] hover:text-black'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('ta')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    language === 'ta'
                      ? 'bg-[#123B35] text-white shadow-xs'
                      : 'text-[#123B35] hover:text-black'
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('hi')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    language === 'hi'
                      ? 'bg-[#123B35] text-white shadow-xs'
                      : 'text-[#123B35] hover:text-black'
                  }`}
                >
                  हिन्दी
                </button>
              </div>

              {/* Quick Ticket Lookup */}
              <button
                type="button"
                onClick={() => setShowLookupModal(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDE2D7] bg-white text-xs font-semibold text-[#123B35] hover:bg-[#EFF1EB] transition-all shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-[#22645B]" />
                <span>{t.checkStatusTitle}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Mission & Identity */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2F0] text-[#123B35] border border-[#2D7B70]/30 text-xs font-bold tracking-wide">
              <Shield className="w-3.5 h-3.5 text-[#22645B]" />
              <span>Dignity, Fair Pay & Safety Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#123B35] leading-tight font-heading">
              {language === 'ta'
                ? 'நியாயமான உழைப்பு, வெளிப்படையான ஊதியம் & தொழிலாளர் நலன்'
                : language === 'hi'
                ? 'उचित पारिश्रमिक, पारदर्शी वेतन और श्रमिक कल्याण मंच'
                : 'Fair Work, Transparent Pay & Worker Wellbeing'}
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
              {language === 'ta'
                ? 'கட்டுமானப் பணியாளர்கள் மற்றும் கல்லூரி ஆதரவு ஊழியர்களுக்கான பணி வருகை கண்காணிப்பு, சட்டப்பூர்வ 1.5x கூடுதல் ஊதியம் மற்றும் ரகசிய பாதுகாப்பு புகார் முறை.'
                : language === 'hi'
                ? 'निर्माण श्रमिकों और कॉलेज सहयोगी कर्मचारियों के लिए कार्य उपस्थिति, 1.5x ओवरटाइम वेतन पारदर्शिता और पूर्णतः गोपनीय सुरक्षा शिकायत निवारण प्रणाली।'
                : 'Empowering construction workers and campus support staff with transparent shift tracking, statutory 1.5x overtime calculations, and confidential grievance reporting with anonymous privacy protection.'}
            </p>

            {/* Industry Selector Pills */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                {t.switchIndustry}
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => onIndustryChange('construction')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentIndustry === 'construction'
                      ? 'bg-[#123B35] text-white shadow-md'
                      : 'bg-white border border-[#DDE2D7] text-slate-700 hover:bg-[#EFF1EB]'
                  }`}
                >
                  <HardHat className="w-4 h-4 text-amber-300" />
                  <span>{t.constructionIndustry}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onIndustryChange('college_support')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentIndustry === 'college_support'
                      ? 'bg-[#123B35] text-white shadow-md'
                      : 'bg-white border border-[#DDE2D7] text-slate-700 hover:bg-[#EFF1EB]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  <span>{t.collegeIndustry}</span>
                </button>
              </div>
            </div>

            {/* Core Pillars Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
              <div className="bg-white p-4 rounded-2xl border border-[#DDE2D7] shadow-xs">
                <Clock className="w-5 h-5 text-[#123B35] mb-2" />
                <h4 className="font-bold text-sm text-[#123B35]">Shift Tracking</h4>
                <p className="text-xs text-slate-600 mt-1">Check-in, break timers & shift receipts</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#DDE2D7] shadow-xs">
                <Scale className="w-5 h-5 text-[#123B35] mb-2" />
                <h4 className="font-bold text-sm text-[#123B35]">Overtime & Pay</h4>
                <p className="text-xs text-slate-600 mt-1">1.5x statutory overtime & pay transparency</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#DDE2D7] shadow-xs">
                <ShieldAlert className="w-5 h-5 text-[#123B35] mb-2" />
                <h4 className="font-bold text-sm text-[#123B35]">Safety Reporting</h4>
                <p className="text-xs text-slate-600 mt-1">Confidential filing with tracking ID lookup</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated Authentication Box */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-[#123B35]/20 shadow-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-1.5 pb-2 border-b border-[#DDE2D7]">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#123B35]" />
                  <h3 className="text-xl font-bold text-[#123B35] font-heading">
                    {language === 'ta' ? 'அங்கீகரிக்கப்பட்ட உள்நுழைவு' : language === 'hi' ? 'प्रमाणित प्रवेश' : 'Secure Portal Access'}
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  {language === 'ta'
                    ? 'உங்கள் கணக்குடன் உள்நுழையவும்.'
                    : language === 'hi'
                    ? 'अपने अधिकृत खाते से साइन इन करें।'
                    : 'Sign in to access your authorized portal.'}
                </p>
              </div>

              {/* Role Resolution Explanation */}
              <div className="bg-[#EFF1EB] rounded-2xl p-3.5 text-xs space-y-1.5 border border-[#DDE2D7]">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#123B35] shrink-0" />
                  <span>Authorised supervisors route to the Employer Dashboard.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#123B35] shrink-0" />
                  <span>Workers access attendance, pay slips, and hazard reports.</span>
                </div>
              </div>

              {/* Primary Action: Google Sign In */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 bg-[#123B35] hover:bg-[#1A524A] text-white py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer min-h-[48px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Connecting to Firebase...' : 'Sign in with Google'}</span>
                </button>

                {/* Secondary Action: Demo / Guest Access */}
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#EFF1EB] text-[#123B35] py-3 px-4 rounded-2xl font-bold text-xs border border-[#DDE2D7] transition-all"
                >
                  <Users className="w-4 h-4 text-[#22645B]" />
                  <span>Explore Worker Portal (Demo)</span>
                </button>

                {/* Ticket Lookup Button */}
                <button
                  type="button"
                  onClick={() => setShowLookupModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#EBF2F0] hover:bg-[#DDE2D7] text-[#123B35] py-2.5 px-4 rounded-2xl font-semibold text-xs transition-all border border-[#2D7B70]/30"
                >
                  <Search className="w-3.5 h-3.5 text-[#123B35]" />
                  <span>Track Grievance Ticket</span>
                </button>
              </div>

              {/* Security Guarantee */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-[#22645B]" />
                <span>Protected with secure role-based access control</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Lookup Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#DDE2D7] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE2D7]">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#123B35]" />
                <h3 className="font-bold text-lg text-[#123B35] font-heading">
                  {t.checkStatusTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLookupModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <WorkerTicketLookup language={language} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#DDE2D7] bg-white py-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#123B35]" />
            <span className="font-bold text-[#123B35] font-heading">FairShift</span>
            <span>·</span>
            <span>Fair Work & Worker Wellbeing Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>English · தமிழ் · हिन्दी</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
