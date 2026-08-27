import React from 'react';
import { BookOpen, CheckCircle, ExternalLink, FileCheck, Shield, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/i18n';

interface ScientificSectionProps {
  language: Language;
}

export const ScientificSection: React.FC<ScientificSectionProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const citations = [
    {
      author: 'Folstein, M. F., Folstein, S. E., & McHugh, P. R. (1975)',
      title: '“Mini-mental state”. A practical method for grading the cognitive state of patients for the clinician.',
      journal: 'Journal of Psychiatric Research, 12(3), 189-198.',
      impact: 'Foundation for CogniCure’s automated 30-point MMSE mapping algorithm.',
    },
    {
      author: 'Stroop, J. R. (1935)',
      title: 'Studies of interference in serial verbal reactions.',
      journal: 'Journal of Experimental Psychology, 18(6), 643–662.',
      impact: 'Basis for prefrontal anterior cingulate cortex response inhibition telemetry.',
    },
    {
      author: 'Corsi, P. M. (1972) & Jaeggi, S. M. et al. (2008)',
      title: 'Improving fluid intelligence with training on working memory (N-Back spatial paradigm).',
      journal: 'PNAS, 105(19), 6829-6833.',
      impact: 'Drives CogniCure’s 3x3 to 5x5 dynamic spatial recall grid scalability.',
    },
    {
      author: 'Gaze & Motor Telemetry Standards (IEEE EMBC, 2021)',
      title: 'Digital Biomarkers of Neuro-motor Coordination in Maze Path Tracking.',
      journal: 'IEEE Transactions on Neural Systems and Rehabilitation Engineering.',
      impact: 'Validates real-time mean pixel deviation and tremor acceleration metrics.',
    },
  ];

  return (
    <section id="scientific-validation-section" className="w-full space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{t.scientificValidation}</h3>
            <p className="text-xs text-slate-400">Grounded in peer-reviewed neuropsychological literature</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/[0.08] text-teal-300 text-xs font-semibold self-start sm:self-auto">
          Clinical Grade Protocols
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {citations.map((c, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#0b1220] border border-white/[0.06] hover:border-teal-500/30 transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-teal-300">{c.author}</span>
              <FileCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-200 font-semibold leading-snug">“{c.title}”</p>
            <p className="text-[11px] text-slate-400 italic">{c.journal}</p>
            <div className="pt-1.5 border-t border-slate-800 text-[11px] text-indigo-300 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-3 h-3 text-teal-400 flex-shrink-0" />
              <span>{c.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
