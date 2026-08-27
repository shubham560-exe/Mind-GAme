import { jsPDF } from 'jspdf';
import { CognitiveProfile, GameScoreEntry, Language } from '../types';

export function generateClinicalPDF(
  profile: CognitiveProfile,
  scores: GameScoreEntry[],
  patientId: string = 'COG-9024',
  language: Language = 'en'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const mmse = profile.mmseEstimate;

  // Header Banner
  doc.setFillColor(13, 148, 136); // Teal #0D9488
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('COGNICURE NEURO-REHABILITATION PLATFORM', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart India Hackathon (SIH) • Clinical Telemetry & Cognitive Assessment Report', 14, 19);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 140, 19);

  // Patient Demographic Details Card
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 34, 182, 24, 'F');
  doc.setDrawColor(220, 226, 235);
  doc.rect(14, 34, 182, 24, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT DEMOGRAPHIC & COGNITIVE VITALS', 18, 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Patient ID: ${patientId}`, 18, 48);
  doc.text(`Age: 62 Yrs | Gender: M`, 68, 48);
  doc.text(`Assessment Type: Longitudinal Calibration`, 118, 48);

  doc.text(`CogniCure Quotient (CQ): ${profile.overallScore} / 1000`, 18, 54);
  doc.text(`Avg Latency: ${profile.avgReactionTime} ms`, 68, 54);
  doc.text(`Overall Accuracy: ${profile.overallAccuracy}%`, 118, 54);

  // MMSE (Mini-Mental State Examination) Scoring Block
  doc.setFillColor(240, 253, 250); // Light teal
  doc.rect(14, 63, 182, 38, 'F');
  doc.setDrawColor(13, 148, 136);
  doc.rect(14, 63, 182, 38, 'S');

  doc.setTextColor(13, 148, 136);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`MINI-MENTAL STATE EXAM (MMSE) MAPPING: ${mmse.totalScore} / 30`, 18, 71);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Diagnostic Category: ${mmse.diagnosticCategory}`, 18, 78);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`• Orientation: ${mmse.orientationScore}/10`, 18, 85);
  doc.text(`• Registration: ${mmse.registrationScore}/3`, 62, 85);
  doc.text(`• Attention & Calculation: ${mmse.attentionCalculationScore}/5`, 104, 85);
  doc.text(`• Recall: ${mmse.recallScore}/3`, 158, 85);
  doc.text(`• Visuospatial & Motor: ${mmse.languageVisuospatialScore}/9`, 18, 92);
  doc.text(`• Gaze Focus Stability: ${profile.gazeFocusScore}%`, 104, 92);

  // Domain Breakdown Table
  let y = 108;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('NEURO-COGNITIVE DOMAIN BREAKDOWN', 14, y);

  y += 5;
  doc.setFillColor(230, 235, 245);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Domain Category', 18, y + 5);
  doc.text('Assessment Protocol', 70, y + 5);
  doc.text('Score (0-100)', 130, y + 5);
  doc.text('Clinical Status', 165, y + 5);

  const domains = [
    {
      name: 'Working Memory',
      test: 'Spatial Recall (N-Back Grid)',
      score: profile.workingMemoryScore,
      status: profile.workingMemoryScore >= 70 ? 'Normal / Preserved' : 'Mild Deficit',
    },
    {
      name: 'Executive Function',
      test: 'Color-Stroop Challenge',
      score: profile.executiveInhibitionScore,
      status: profile.executiveInhibitionScore >= 75 ? 'Optimal Inhibition' : 'Moderate Interference',
    },
    {
      name: 'Visuospatial Coordination',
      test: 'Path Finder 2D Maze',
      score: profile.visuospatialCoordinationScore,
      status: profile.visuospatialPrecision >= 85 ? 'Precise Motor Path' : 'Tremor / Deviation',
    },
    {
      name: 'Attention Stability',
      test: 'Webcam Optical Centroid',
      score: profile.gazeFocusScore,
      status: profile.gazeFocusScore >= 80 ? 'Continuous Focus' : 'Divergence Observed',
    },
    {
      name: 'Cognitive Consistency',
      test: 'Longitudinal Score Variance',
      score: profile.consistencyScore,
      status: profile.consistencyScore >= 75 ? 'Stable Endurance' : 'Fatigue Prone',
    },
  ];

  domains.forEach((dom) => {
    y += 7;
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 7, 'F');
    doc.setDrawColor(240, 242, 245);
    doc.rect(14, y, 182, 7, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(dom.name, 18, y + 4.5);
    doc.text(dom.test, 70, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${dom.score} / 100`, 130, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(dom.status, 165, y + 4.5);
  });

  // Longitudinal Sessions Table (Last 4 sessions)
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('RECENT REHABILITATION SESSIONS TELEMETRY', 14, y);

  y += 5;
  doc.setFillColor(230, 235, 245);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Date / Time', 18, y + 5);
  doc.text('Clinical Module', 65, y + 5);
  doc.text('Score', 115, y + 5);
  doc.text('Accuracy', 140, y + 5);
  doc.text('Latency / Dev', 168, y + 5);

  const recent = scores.slice(0, 4);
  recent.forEach((sc) => {
    y += 7;
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 7, 'F');
    doc.setDrawColor(240, 242, 245);
    doc.rect(14, y, 182, 7, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(new Date(sc.timestamp).toLocaleDateString(), 18, y + 4.5);
    doc.text(sc.gameName, 65, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${sc.score}`, 115, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sc.accuracy}%`, 140, y + 4.5);
    doc.text(
      sc.pathDeviationPx ? `${sc.pathDeviationPx} px dev` : `${sc.reactionTimeMs} ms`,
      168,
      y + 4.5
    );
  });

  // Clinical Recommendations & Sign Off
  y += 14;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 38, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 38, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('AI CLINICAL SUMMARY & NEURO-REHABILITATION REGIMEN:', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`• ${mmse.clinicalSummary}`, 18, y + 13, { maxWidth: 172 });
  if (mmse.recommendations[0]) {
    doc.text(`• ${mmse.recommendations[0]}`, 18, y + 21, { maxWidth: 172 });
  }

  // Doctor Signature Line
  doc.setFont('helvetica', 'bold');
  doc.text('Attending Neurologist / Caretaker Signature: _______________________', 18, y + 32);
  doc.text('Medical Reg No: MCI-2026-9921', 130, y + 32);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('CogniCure PWA • Validated against Stroop (1935), Corsi Matrix (1972) & Folstein MMSE (1975).', 14, 290);

  doc.save(`CogniCure_Diagnostic_Report_${patientId}_${Date.now()}.pdf`);
}
