import React from 'react';
import { Brain, Heart, Shield, Stethoscope, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="w-full border-t border-teal-500/20 bg-[#070c18] text-slate-400 py-10 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">CogniCure</span>
              <p className="text-xs text-slate-400">{t.brandTagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-teal-300 font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              HIPAA & Privacy Compliant Client Telemetry
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/[0.08] text-indigo-300 font-semibold flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Smart India Hackathon (SIH) Prototype
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <p className="text-slate-500 text-center sm:text-left">
            CogniCure is an adaptive neuro-rehabilitation and cognitive gaming platform engineered for patient training and clinical monitoring.
          </p>
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <span>Crafted for Neuroplasticity & Healthcare Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
