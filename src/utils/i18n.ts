import { Language } from '../types';

export interface TranslationDictionary {
  brandName: string;
  brandTagline: string;
  patientMode: string;
  doctorMode: string;
  patientView: string;
  clinicalView: string;
  languageSelect: string;
  fontNormal: string;
  fontLarge: string;
  fontXLarge: string;
  soundOn: string;
  soundOff: string;
  webcamOn: string;
  webcamOff: string;
  gazeTracking: string;
  gazeOptimal: string;
  gazeDiverted: string;
  focusAlert: string;
  quickAssessment: string;
  patientId: string;
  overallCognitiveIndex: string;
  mmseMapping: string;
  startTraining: string;
  exitGame: string;
  trainAgain: string;
  viewClinicalReport: string;
  gamesTitle: string;
  gamesSubtitle: string;
  adaptiveEngineBadge: string;
  difficultyFactor: string;
  reactionTime: string;
  accuracy: string;
  precision: string;
  errorRate: string;
  pathDeviation: string;
  sessionComplete: string;
  clinicalAnalytics: string;
  exportPdf: string;
  printReport: string;
  scientificValidation: string;
  
  // Games
  spatialRecallTitle: string;
  spatialRecallCat: string;
  spatialRecallDesc: string;
  spatialRecallInstr: string;
  
  stroopTitle: string;
  stroopCat: string;
  stroopDesc: string;
  stroopInstr: string;
  
  pathFinderTitle: string;
  pathFinderCat: string;
  pathFinderDesc: string;
  pathFinderInstr: string;

  // Game UI specifics
  tapMatchingInk: string;
  watchSequence: string;
  repeatSequence: string;
  traceCorridor: string;
  avoidWalls: string;
  livesRemaining: string;
  currentStreak: string;
  nextTarget: string;
  avgLatency: string;
  bestSpan: string;
  congratulations: string;
  
  // Colors for Stroop
  colorRed: string;
  colorGreen: string;
  colorBlue: string;
  colorYellow: string;
  colorPurple: string;
  colorOrange: string;

  // Clinical terms
  workingMemory: string;
  executiveFunction: string;
  visuospatialCoordination: string;
  attentionGazeStability: string;
  processingSpeed: string;
  normalCognition: string;
  mciWarning: string;
  severeImpairment: string;
  neuromotorTremor: string;
  doctorNotesTitle: string;
  rehabilitationPlan: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    brandName: 'CogniCure',
    brandTagline: 'AI Adaptive Cognitive Gaming & Neuro-Rehabilitation Platform',
    patientMode: 'Patient Training',
    doctorMode: 'Doctor / Caretaker View',
    patientView: 'Patient View',
    clinicalView: 'Clinical Telemetry',
    languageSelect: 'Language',
    fontNormal: 'Standard',
    fontLarge: 'Large',
    fontXLarge: 'Extra-Large',
    soundOn: 'Sound Enabled',
    soundOff: 'Muted',
    webcamOn: 'Gaze Tracker Active',
    webcamOff: 'Gaze Tracker Off',
    gazeTracking: 'AI Gaze Telemetry',
    gazeOptimal: 'Optimal Focus (Centroid Centered)',
    gazeDiverted: '⚠️ Focus Deviation Detected',
    focusAlert: 'Please look back at the screen to continue training',
    quickAssessment: 'Start Clinical Assessment',
    patientId: 'Patient ID',
    overallCognitiveIndex: 'CogniCure Quotient (CQ)',
    mmseMapping: 'MMSE Cognitive Score',
    startTraining: 'Start Training',
    exitGame: 'Exit Game',
    trainAgain: 'Train Again',
    viewClinicalReport: 'View Clinical Analytics',
    gamesTitle: 'Neuro-Cognitive Training Modules',
    gamesSubtitle: 'Interactive clinical tests calibrated with closed-loop adaptive difficulty',
    adaptiveEngineBadge: 'AI Adaptive Engine Active',
    difficultyFactor: 'Difficulty Factor',
    reactionTime: 'Reaction Time',
    accuracy: 'Accuracy',
    precision: 'Visuospatial Precision',
    errorRate: 'Error Rate',
    pathDeviation: 'Mean Path Deviation',
    sessionComplete: 'Clinical Module Assessment Complete!',
    clinicalAnalytics: 'Longitudinal Clinical Dashboard',
    exportPdf: 'Export Clinical Diagnostic PDF',
    printReport: 'Print Medical Summary',
    scientificValidation: 'Clinical & Scientific Literature Validation',

    spatialRecallTitle: 'Spatial Recall (N-Back)',
    spatialRecallCat: 'Working Memory & Visuospatial Span',
    spatialRecallDesc: 'Dynamic pattern-matching task that scales from 3x3 to 5x5 grid matrices based on your recall accuracy.',
    spatialRecallInstr: 'Watch the sequence of glowing neuro-tiles carefully. Replicate the exact pattern in order once the recall phase begins.',

    stroopTitle: 'Color-Stroop Challenge',
    stroopCat: 'Executive Function & Cognitive Inhibition',
    stroopDesc: 'Overcome cognitive interference by identifying the physical ink color of the stimulus word while ignoring the written word.',
    stroopInstr: 'Identify the COLOR OF THE INK as fast as possible. Suppress the impulse to read the text!',

    pathFinderTitle: 'Path Finder Maze',
    pathFinderCat: 'Visuospatial Motor & Tremor Analysis',
    pathFinderDesc: 'Trace the dynamic corridor from START to GOAL. Measures motor tremor, wall collisions, and path precision.',
    pathFinderInstr: 'Click and drag the green probe through the corridor to reach the target portal without touching the boundary walls.',

    tapMatchingInk: 'Tap the matching INK COLOR:',
    watchSequence: 'Memorize the Illuminated Pattern...',
    repeatSequence: 'Your Turn: Tap the Tiles in Order!',
    traceCorridor: 'Guide Probe to Destination Portal',
    avoidWalls: 'Keep cursor inside safe corridor — avoid red walls!',
    livesRemaining: 'Lives',
    currentStreak: 'Streak',
    nextTarget: 'Next Target',
    avgLatency: 'Avg Latency',
    bestSpan: 'Max Span',
    congratulations: 'Excellent Performance!',

    colorRed: 'RED',
    colorGreen: 'GREEN',
    colorBlue: 'BLUE',
    colorYellow: 'YELLOW',
    colorPurple: 'PURPLE',
    colorOrange: 'ORANGE',

    workingMemory: 'Working Memory',
    executiveFunction: 'Executive Function',
    visuospatialCoordination: 'Visuospatial Motor Control',
    attentionGazeStability: 'Gaze & Attention Stability',
    processingSpeed: 'Neural Processing Speed',
    normalCognition: 'Normal Cognitive Function',
    mciWarning: 'Mild Cognitive Impairment (MCI) Indicator',
    severeImpairment: 'Significant Impairment - Clinical Followup Advised',
    neuromotorTremor: 'Neuromotor Tremor Index',
    doctorNotesTitle: 'Clinical Telemetry Observations & Diagnosis',
    rehabilitationPlan: 'Suggested Neuro-Rehabilitation Regimen',
  },

  hi: {
    brandName: 'कॉग्नीक्योर (CogniCure)',
    brandTagline: 'एआई-संचालित संज्ञानात्मक गेमिंग और न्यूरो-पुनर्वास मंच',
    patientMode: 'मरीज़ प्रशिक्षण (Patient)',
    doctorMode: 'डॉक्टर / देखभालकर्ता दृश्य',
    patientView: 'मरीज़ दृश्य',
    clinicalView: 'क्लिनिकल टेलीमेट्री',
    languageSelect: 'भाषा (Language)',
    fontNormal: 'सामान्य फ़ॉन्ट',
    fontLarge: 'बड़ा फ़ॉन्ट',
    fontXLarge: 'अति-बड़ा फ़ॉन्ट',
    soundOn: 'ध्वनि सक्रिय',
    soundOff: 'ध्वनि बंद',
    webcamOn: 'टकटकी ट्रैकर सक्रिय',
    webcamOff: 'टकटकी ट्रैकर बंद',
    gazeTracking: 'एआई गेज टेलीमेट्री',
    gazeOptimal: 'सर्वोत्तम ध्यान (केंद्रीय टकटकी)',
    gazeDiverted: '⚠️ ध्यान विचलित हुआ',
    focusAlert: 'कृपया प्रशिक्षण जारी रखने के लिए स्क्रीन पर देखें',
    quickAssessment: 'क्लिनिकल मूल्यांकन शुरू करें',
    patientId: 'मरीज़ पहचान संख्या',
    overallCognitiveIndex: 'कॉग्नीक्योर सूचकांक (CQ)',
    mmseMapping: 'एमएमएसई संज्ञानात्मक स्कोर',
    startTraining: 'प्रशिक्षण शुरू करें',
    exitGame: 'खेल से बाहर निकलें',
    trainAgain: 'पुनः अभ्यास करें',
    viewClinicalReport: 'क्लिनिकल रिपोर्ट देखें',
    gamesTitle: 'न्यूरो-संज्ञानात्मक प्रशिक्षण मॉड्यूल',
    gamesSubtitle: 'बंद-लूप अनुकूली कठिनाई के साथ कैलिब्रेट किए गए इंटरैक्टिव क्लिनिकल परीक्षण',
    adaptiveEngineBadge: 'एआई अनुकूली इंजन सक्रिय',
    difficultyFactor: 'कठिनाई गुणांक',
    reactionTime: 'प्रतिक्रिया समय',
    accuracy: 'सटीकता',
    precision: 'स्थानिक परिशुद्धता',
    errorRate: 'त्रुटि दर',
    pathDeviation: 'औसत पथ विचलन',
    sessionComplete: 'क्लिनिकल मॉड्यूल मूल्यांकन पूर्ण!',
    clinicalAnalytics: 'अनुदैर्ध्य क्लिनिकल डैशबोर्ड',
    exportPdf: 'क्लिनिकल डायग्नोस्टिक पीडीएफ डाउनलोड करें',
    printReport: 'चिकित्सा सारांश प्रिंट करें',
    scientificValidation: 'वैज्ञानिक एवं क्लिनिकल साहित्य सत्यापन',

    spatialRecallTitle: 'स्थानिक स्मरण (Spatial Recall)',
    spatialRecallCat: 'कार्यशील स्मृति और स्थानिक अवधि',
    spatialRecallDesc: 'गतिशील पैटर्न-मिलान कार्य जो आपकी स्मरण सटीकता के आधार पर 3x3 से 5x5 ग्रिड तक अनुकूलित होता है।',
    spatialRecallInstr: 'चमकती हुई न्यूरो-टाइल्स के अनुक्रम को ध्यान से देखें। फिर उसी क्रम में टाइल्स दबाएं।',

    stroopTitle: 'रंग-स्ट्रूप चुनौती (Color-Stroop)',
    stroopCat: 'कार्यकारी कार्य और संज्ञानात्मक अवरोध',
    stroopDesc: 'लिखे गए शब्द को नज़रअंदाज़ करते हुए शब्द के स्याही रंग को पहचानकर संज्ञानात्मक रुकावट को दूर करें।',
    stroopInstr: 'जितनी जल्दी हो सके स्याही का असली रंग चुनें। शब्द पढ़ने के आवेग को रोकें!',

    pathFinderTitle: 'मार्ग खोजक भूलभुलैया (Path Finder)',
    pathFinderCat: 'स्थानिक गति और कंपन विश्लेषण',
    pathFinderDesc: 'शुरुआत से लक्ष्य तक गलियारे से गुजरें। यह कंपन, दीवार टकराव और पथ सटीकता मापता है।',
    pathFinderInstr: 'दीवारों को छुए बिना हरे रंग के प्रोब को खींचकर अंतिम लक्ष्य पोर्टल तक पहुंचाएं।',

    tapMatchingInk: 'स्याही के रंग से मेल खाने वाला बटन दबाएं:',
    watchSequence: 'पैटर्न को ध्यान से याद करें...',
    repeatSequence: 'आपकी बारी: सही क्रम में टाइल्स दबाएं!',
    traceCorridor: 'सुरक्षित गलियारे से होकर लक्ष्य तक जाएं',
    avoidWalls: 'दीवारों से बचें — कर्सर को बीच में रखें!',
    livesRemaining: 'शेष जीवन',
    currentStreak: 'लगातार सही',
    nextTarget: 'अगला लक्ष्य',
    avgLatency: 'औसत प्रतिक्रिया',
    bestSpan: 'अधिकतम स्मृति स्तर',
    congratulations: 'शानदार प्रदर्शन!',

    colorRed: 'लाल',
    colorGreen: 'हरा',
    colorBlue: 'नीला',
    colorYellow: 'पीला',
    colorPurple: 'बैंगनी',
    colorOrange: 'नारंगी',

    workingMemory: 'कार्यशील स्मृति',
    executiveFunction: 'कार्यकारी निर्णय क्षमता',
    visuospatialCoordination: 'स्थानिक गतिक नियंत्रण',
    attentionGazeStability: 'ध्यान और टकटकी स्थिरता',
    processingSpeed: 'तंत्रिका प्रसंस्करण गति',
    normalCognition: 'सामान्य संज्ञानात्मक कार्य',
    mciWarning: 'हल्का संज्ञानात्मक क्षीणता (MCI) संकेत',
    severeImpairment: 'संज्ञानात्मक गिरावट - क्लिनिकल परामर्श अनुशंसित',
    neuromotorTremor: 'न्यूरोमोटर कंपन सूचकांक',
    doctorNotesTitle: 'क्लिनिकल टेलीमेट्री अवलोकन एवं निदान',
    rehabilitationPlan: 'सुझाया गया न्यूरो-पुनर्वास नियम',
  },

  ta: {
    brandName: 'காக்னிக்யூர் (CogniCure)',
    brandTagline: 'செயற்கை நுண்ணறிவு அடிப்படையிலான நரம்பியல் மறுவாழ்வு தளம்',
    patientMode: 'நோயாளி பயிற்சி (Patient)',
    doctorMode: 'மருத்துவர் / பராமரிப்பாளர் பார்வை',
    patientView: 'நோயாளி பார்வை',
    clinicalView: 'மருத்துவ டெலிமெட்ரி',
    languageSelect: 'மொழி (Language)',
    fontNormal: 'சாதாரண எழுத்து',
    fontLarge: 'பெரிய எழுத்து',
    fontXLarge: 'மிகப் பெரிய எழுத்து',
    soundOn: 'ஒலி இயக்கத்தில் உள்ளது',
    soundOff: 'ஒலி முடக்கப்பட்டது',
    webcamOn: 'பார்வை டிராக்கர் இயங்குகிறது',
    webcamOff: 'பார்வை டிராக்கர் அணைக்கப்பட்டது',
    gazeTracking: 'பார்வை நிலைத்தன்மை கண்காணிப்பு',
    gazeOptimal: 'சிறந்த கவனம் (மையப்பார்வை)',
    gazeDiverted: '⚠️ கவனம் திசைதிருப்பப்பட்டது',
    focusAlert: 'பயிற்சியைத் தொடர தயவுசெய்து திரையைப் பாருங்கள்',
    quickAssessment: 'மருத்துவ மதிப்பீட்டைத் தொடங்கு',
    patientId: 'நோயாளி எண்',
    overallCognitiveIndex: 'காக்னிக்யூர் குறியீடு (CQ)',
    mmseMapping: 'MMSE நரம்பியல் மதிப்பெண்',
    startTraining: 'பயிற்சியைத் தொடங்கு',
    exitGame: 'வெளியேறு',
    trainAgain: 'மீண்டும் பயிற்சி செய்',
    viewClinicalReport: 'மருத்துவ அறிக்கையைக் காண்க',
    gamesTitle: 'நரம்பியல் அறிவாற்றல் பயிற்சி தொகுதிகள்',
    gamesSubtitle: 'நிகழ்நேர தழுவல் கடினத்தன்மையுடன் கூடிய மருத்துவ பரிசோதனைகள்',
    adaptiveEngineBadge: 'AI தழுவல் எஞ்சின் செயலில் உள்ளது',
    difficultyFactor: 'கடினத்தன்மை காரணி',
    reactionTime: 'எதிர்வினை நேரம்',
    accuracy: 'துல்லியம்',
    precision: 'இடஞ்சார்ந்த துல்லியம்',
    errorRate: 'பிழை விகிதம்',
    pathDeviation: 'பாதை விலகல் அளவு',
    sessionComplete: 'மருத்துவ தொகுதி மதிப்பீடு நிறைவடைந்தது!',
    clinicalAnalytics: 'நீண்டகால மருத்துவ பகுப்பாய்வு பலகை',
    exportPdf: 'மருத்துவ பரிசோதனை PDF பதிவிறக்கு',
    printReport: 'மருத்துவ சுருக்கத்தை அச்சிடுக',
    scientificValidation: 'அறிவியல் மற்றும் மருத்துவ சான்றுகள்',

    spatialRecallTitle: 'இடஞ்சார்ந்த நினைவு (Spatial Recall)',
    spatialRecallCat: 'நினைவாற்றல் மற்றும் இடஞ்சார்ந்த இடைவெளி',
    spatialRecallDesc: 'உங்கள் நினைவுத்திறனுக்கு ஏற்ப 3x3 முதல் 5x5 வரை தானாக மாறும் கட்ட முறை விளையாட்டு.',
    spatialRecallInstr: 'ஒளிரும் வரிசையை உன்னிப்பாகக் கவனியுங்கள். பின்னர் அதே வரிசையில் கட்டங்களைத் தொடவும்.',

    stroopTitle: 'வண்ண-ஸ்ட்ரூப் சவால் (Color-Stroop)',
    stroopCat: 'செயல்முறை கட்டுப்பாடு மற்றும் கவனக் குவிப்பு',
    stroopDesc: 'எழுத்தை விடுத்து, சொல்லின் மைய வண்ணத்தை விரைவாகக் கண்டறிந்து அறிவாற்றல் குறுக்கீட்டை வெல்லுங்கள்.',
    stroopInstr: 'முடிந்தவரை விரைவாக மைய வண்ணத்தைத் தேர்ந்தெடுக்கவும். சொல்லை வாசிப்பதைத் தவிர்க்கவும்!',

    pathFinderTitle: 'பாதை கண்டுபிடிப்பான் (Path Finder)',
    pathFinderCat: 'இடஞ்சார்ந்த இயக்கம் மற்றும் நடுக்க பகுப்பாய்வு',
    pathFinderDesc: 'தொடக்கம் முதல் இலக்கு வரை பாதையில் செல்லுங்கள். இது கை நடுக்கம் மற்றும் துல்லியத்தை அளவிடுகிறது.',
    pathFinderInstr: 'சுவர்களைத் தொடாமல் பச்சை நிற முனையை இழுத்து இலக்கு வாயிலை அடையுங்கள்.',

    tapMatchingInk: 'வண்ணத்திற்கு ஏற்ற பொத்தானைத் தொடவும்:',
    watchSequence: 'வரிசையை நினைவில் வையுங்கள்...',
    repeatSequence: 'உங்கள் முறை: சரியான வரிசையில் தொடவும்!',
    traceCorridor: 'பாதுகாப்பான பாதையில் வழிகாட்டவும்',
    avoidWalls: 'சுவர்களில் படாமல் நடுப்பகுதியில் செல்லவும்!',
    livesRemaining: 'மீதமுள்ள வாய்ப்புகள்',
    currentStreak: 'தொடர் வெற்றிகள்',
    nextTarget: 'அடுத்த இலக்கு',
    avgLatency: 'சராசரி வேகம்',
    bestSpan: 'அதிகபட்ச நினைவு அளவு',
    congratulations: 'சிறப்பான செயல்பாடு!',

    colorRed: 'சிகப்பு',
    colorGreen: 'பச்சை',
    colorBlue: 'நீலம்',
    colorYellow: 'மஞ்சள்',
    colorPurple: 'ஊதா',
    colorOrange: 'ஆரஞ்சு',

    workingMemory: 'செயல் நினைவாற்றல்',
    executiveFunction: 'செயல்முறை கட்டுப்பாடு',
    visuospatialCoordination: 'இடஞ்சார்ந்த இயக்கக் கட்டுப்பாடு',
    attentionGazeStability: 'பார்வை நிலைத்தன்மை மற்றும் கவனம்',
    processingSpeed: 'நரம்பியல் தகவல் செயலாக்க வேகம்',
    normalCognition: 'இயல்பான அறிவாற்றல் செயல்பாடு',
    mciWarning: 'லேசான அறிவாற்றல் குறைபாடு (MCI) அறிகுறி',
    severeImpairment: 'குறிப்பிடத்தக்க குறைபாடு - மருத்துவ ஆலோசனை தேவை',
    neuromotorTremor: 'நரம்புத்தசை நடுக்க குறியீடு',
    doctorNotesTitle: 'மருத்துவ கண்காணிப்பு முடிவுகள் & பரிசோதனை',
    rehabilitationPlan: 'பரிந்துரைக்கப்பட்ட நரம்பியல் மறுவாழ்வு திட்டம்',
  },
};
