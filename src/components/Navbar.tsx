import React from 'react';
import {
  Activity,
  Brain,
  Eye,
  EyeOff,
  Globe,
  Stethoscope,
  Volume2,
  VolumeX,
  Type,
  User,
  Sliders,
} from 'lucide-react';
import { AppMode, FontSizeSetting, GazeTelemetry, Language } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { sound } from '../utils/audio';

interface NavbarProps {
  mode: AppMode;
  onToggleMode: (newMode: AppMode) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  gazeTelemetry: GazeTelemetry;
  onToggleGazeTelemetry: () => void;
  fontSize: FontSizeSetting;
  onSelectFontSize: (size: FontSizeSetting) => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onToggleMode,
  language,
  onSelectLanguage,
  gazeTelemetry,
  onToggleGazeTelemetry,
  fontSize,
  onSelectFontSize,
  onNavigateHome,
}) => {
  const t = TRANSLATIONS[language];
  const isMuted = sound.getMuted();

  const handleToggleSound = () => {
    sound.toggleMute();
    // Force re-render through state in parent if needed
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-teal-500/20 bg-[#070c18]/90 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <button
          id="cognicure-logo-btn"
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-teal-300 transition-colors">
                CogniCure
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300">
                SIH Medical
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[200px] sm:max-w-xs">
              {t.brandTagline}
            </span>
          </div>
        </button>

        {/* Controls and Selectors */}
        <div className="flex items-center gap-2.5">
          {/* Mode Switcher Pill (Patient vs Doctor View) */}
          <div className="hidden sm:flex items-center p-1 rounded-2xl bg-[#0b1220] border border-teal-500/25">
            <button
              id="mode-patient-btn"
              onClick={() => onToggleMode('patient')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'patient'
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {t.patientMode}
            </button>
            <button
              id="mode-clinical-btn"
              onClick={() => onToggleMode('clinical')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'clinical'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              {t.doctorMode}
            </button>
          </div>

          {/* Vernacular Language Selector */}
          <div className="flex items-center rounded-xl bg-slate-900/80 border border-white/[0.08] p-0.5">
            {(['en', 'hi', 'ta'] as Language[]).map((lang) => (
              <button
                key={lang}
                id={`lang-btn-${lang}`}
                onClick={() => onSelectLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : 'தமிழ்'}
              </button>
            ))}
          </div>

          {/* Gaze Tracker Toggle */}
          <button
            id="gaze-toggle-btn"
            onClick={onToggleGazeTelemetry}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              gazeTelemetry.isEnabled
                ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-sm shadow-teal-500/20'
                : 'bg-slate-900/80 border-white/[0.08] text-slate-400 hover:text-slate-200'
            }`}
            title={gazeTelemetry.isEnabled ? t.webcamOn : t.webcamOff}
          >
            {gazeTelemetry.isEnabled ? <Eye className="w-4 h-4 text-teal-400" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px]">
              {gazeTelemetry.isEnabled ? 'Gaze Active' : 'Gaze Off'}
            </span>
          </button>

          {/* Font Size Selector (Accessibility) */}
          <div className="hidden lg:flex items-center rounded-xl bg-slate-900/80 border border-white/[0.08] p-0.5">
            <button
              onClick={() => onSelectFontSize('normal')}
              className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                fontSize === 'normal' ? 'bg-indigo-500/25 text-indigo-300' : 'text-slate-400'
              }`}
              title="Standard Font"
            >
              A
            </button>
            <button
              onClick={() => onSelectFontSize('large')}
              className={`px-2 py-1 rounded-lg text-sm font-bold cursor-pointer ${
                fontSize === 'large' ? 'bg-indigo-500/25 text-indigo-300' : 'text-slate-400'
              }`}
              title="Large Font"
            >
              A+
            </button>
            <button
              onClick={() => onSelectFontSize('xl')}
              className={`px-2 py-1 rounded-lg text-base font-black cursor-pointer ${
                fontSize === 'xl' ? 'bg-indigo-500/25 text-indigo-300' : 'text-slate-400'
              }`}
              title="Extra-Large Font"
            >
              A++
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
