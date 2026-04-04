// Dashboard Script for HealthSaathi

if (!window.HealthSaathiAuth?.isAuthenticated()) {
  window.location.href = "login.html";
}

const userNameEl = document.getElementById("userName");
const profileBtn = document.getElementById("profileBtn");
const quickQABtn = document.getElementById("quickQABtn");
const profileDropdown = document.getElementById("profileDropdown");
const editProfileBtn = document.getElementById("editProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");
const startQABtn = document.getElementById("startQABtn");
const qaContainer = document.getElementById("qaContainer");
const flashcardContainer = document.getElementById("flashcardContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressText = document.getElementById("progressText");
const profileModal = document.getElementById("profileModal");
const profileForm = document.getElementById("profileForm");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const openFamilyModalBtn = document.getElementById("openFamilyModalBtn");
const familySummaryList = document.getElementById("familySummaryList");
const familyModal = document.getElementById("familyModal");
const familyDetailForm = document.getElementById("familyDetailForm");
const cancelFamilyModalBtn = document.getElementById("cancelFamilyModalBtn");
const viewReportsBtn = document.getElementById("viewReportsBtn");
const viewCalendarBtn = document.getElementById("viewCalendarBtn");
const viewDocumentsBtn = document.getElementById("viewDocumentsBtn");
const startChatBtn = document.getElementById("startChatBtn");
const voiceControlBtn = document.getElementById("voiceControlBtn");
const offlineStatusBar = document.getElementById("offlineStatusBar");
const offlineStatusText = document.getElementById("offlineStatusText");
const syncNowBtn = document.getElementById("syncNowBtn");
const voiceStatusBar = document.getElementById("voiceStatusBar");
const voiceStatusText = document.getElementById("voiceStatusText");

const OFFLINE_QUEUE_KEY = "healthsaathi_offline_queue";
const TOAST_HOST_ID = "toastHost";
const DEFAULT_PAIN_MAP_IMAGE = "1000_F_857099409_gBv7P7V89SDGy10YTmiPfPochMCXJqFL.jpg";

let flashcardQuestions = [];
let flashcardIndex = 0;
let flashcardAnswers = {};
let currentSessionId = null;
let familyMembers = [];
let reportHistory = [];
let doctorDirectory = [];
let activeCameraStream = null;
let offlineSaveToastShown = false;
let isVoiceControlActive = false;
let globalVoiceRecognition = null;

const glossaryMap = {
  abdominal: "stomach area",
  thoracic: "chest area",
  cephalgia: "headache",
  edema: "swelling",
  dyspnea: "shortness of breath",
  nausea: "feeling like vomiting",
  inflammation: "irritation/swelling",
};

const LANGUAGE_SPEECH = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  ml: "ml-IN",
  // legacy keys
  English: "en-IN",
  Hindi: "hi-IN",
  Spanish: "es-ES",
};

const UI_TEXT = {
  en: {
    selectOption: "Select an option",
    voiceInput: "Voice Input",
    listening: "Listening...",
    speakQuestion: "Speak Question",
    previous: "Previous",
    next: "Next",
    complete: "Complete",
    question: "Question",
    of: "of",
    detectedArea: "Detected area",
    selectedAreas: "Selected areas",
    none: "None",
    startCamera: "Start Camera",
    capture: "Capture",
    stopCamera: "Stop Camera",
    cameraNotSupported: "Camera capture is not supported in this browser.",
    cameraDenied: "Could not access camera. Please allow permissions.",
    captureSuccess: "Image captured from camera.",
    speechOutNotSupported: "Speech output is not supported in this browser.",
    voiceControlStarted: "Voice control is active. Say commands like: open reports, next, sync now, start camera.",
    voiceControlStopped: "Voice control stopped.",
    voiceControlNotSupported: "Voice control is not supported in this browser.",
    commandNotRecognized: "Command not recognized. Try: open reports, open calendar, open documents, start Q and A, next, previous, sync now, logout.",
  },
  hi: {
    selectOption: "विकल्प चुनें",
    voiceInput: "आवाज से इनपुट",
    listening: "सुन रहा है...",
    speakQuestion: "प्रश्न सुनें",
    previous: "पिछला",
    next: "अगला",
    complete: "पूरा करें",
    question: "प्रश्न",
    of: "में से",
    detectedArea: "पहचाना गया भाग",
    selectedAreas: "चुने गए भाग",
    none: "कोई नहीं",
    startCamera: "कैमरा शुरू करें",
    capture: "कैप्चर",
    stopCamera: "कैमरा बंद करें",
    cameraNotSupported: "इस ब्राउज़र में कैमरा कैप्चर समर्थित नहीं है।",
    cameraDenied: "कैमरा एक्सेस नहीं मिला। अनुमति दें।",
    captureSuccess: "कैमरा से तस्वीर ली गई।",
    speechOutNotSupported: "इस ब्राउज़र में वॉइस आउटपुट समर्थित नहीं है।",
    voiceControlStarted: "वॉइस कंट्रोल चालू है। उदाहरण: open reports, next, sync now.",
    voiceControlStopped: "वॉइस कंट्रोल बंद किया गया।",
    voiceControlNotSupported: "इस ब्राउज़र में वॉइस कंट्रोल समर्थित नहीं है।",
    commandNotRecognized: "कमांड समझ नहीं आया। उदाहरण: open reports, open calendar, next, previous, logout.",
  },
  es: {
    selectOption: "Selecciona una opcion",
    voiceInput: "Entrada por voz",
    listening: "Escuchando...",
    speakQuestion: "Escuchar pregunta",
    previous: "Anterior",
    next: "Siguiente",
    complete: "Completar",
    question: "Pregunta",
    of: "de",
    detectedArea: "Area detectada",
    selectedAreas: "Areas seleccionadas",
    none: "Ninguna",
    startCamera: "Iniciar camara",
    capture: "Capturar",
    stopCamera: "Detener camara",
    cameraNotSupported: "La captura por camara no es compatible en este navegador.",
    cameraDenied: "No se pudo acceder a la camara. Permite permisos.",
    captureSuccess: "Imagen capturada desde la camara.",
    speechOutNotSupported: "La salida de voz no es compatible en este navegador.",
    voiceControlStarted: "El control por voz esta activo. Prueba: open reports, next, sync now.",
    voiceControlStopped: "Control por voz desactivado.",
    voiceControlNotSupported: "El control por voz no es compatible en este navegador.",
    commandNotRecognized: "Comando no reconocido. Prueba: open reports, open calendar, next, previous, logout.",
  },
};

// ── Marathi ──────────────────────────────────────────────────────────────────
UI_TEXT.mr = {
  selectOption: "पर्याय निवडा",
  voiceInput: "आवाज इनपुट",
  listening: "ऐकत आहे...",
  speakQuestion: "प्रश्न ऐका",
  previous: "मागील",
  next: "पुढे",
  complete: "पूर्ण करा",
  question: "प्रश्न",
  of: "पैकी",
  detectedArea: "आढळलेले क्षेत्र",
  selectedAreas: "निवडलेली क्षेत्रे",
  none: "काहीही नाही",
  startCamera: "कॅमेरा सुरू करा",
  capture: "कॅप्चर",
  stopCamera: "कॅमेरा बंद करा",
  cameraNotSupported: "या ब्राउझरमध्ये कॅमेरा समर्थित नाही.",
  cameraDenied: "कॅमेरा प्रवेश मिळाला नाही. परवानगी द्या.",
  captureSuccess: "कॅमेराद्वारे प्रतिमा घेतली.",
  speechOutNotSupported: "या ब्राउझरमध्ये व्हॉइस आउटपुट समर्थित नाही.",
  voiceControlStarted: "व्हॉइस नियंत्रण चालू आहे.",
  voiceControlStopped: "व्हॉइस नियंत्रण बंद केले.",
  voiceControlNotSupported: "या ब्राउझरमध्ये व्हॉइस नियंत्रण समर्थित नाही.",
  commandNotRecognized: "आदेश समजला नाही. उदा: next, previous, logout.",
};

// ── Kannada ──────────────────────────────────────────────────────────────────
UI_TEXT.kn = {
  selectOption: "ಆಯ್ಕೆ ಮಾಡಿ",
  voiceInput: "ಧ್ವನಿ ಒಳಹರಿವು",
  listening: "ಆಲಿಸುತ್ತಿದೆ...",
  speakQuestion: "ಪ್ರಶ್ನೆ ಕೇಳಿ",
  previous: "ಹಿಂದಿನ",
  next: "ಮುಂದೆ",
  complete: "ಮುಗಿಸಿ",
  question: "ಪ್ರಶ್ನೆ",
  of: "ರಲ್ಲಿ",
  detectedArea: "ಪತ್ತೆಹಚ್ಚಿದ ಪ್ರದೇಶ",
  selectedAreas: "ಆಯ್ದ ಪ್ರದೇಶಗಳು",
  none: "ಯಾವುದೂ ಇಲ್ಲ",
  startCamera: "ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ",
  capture: "ಕ್ಯಾಪ್ಚರ್",
  stopCamera: "ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ",
  cameraNotSupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
  cameraDenied: "ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶ ಸಿಗಲಿಲ್ಲ. ಅನುಮತಿ ನೀಡಿ.",
  captureSuccess: "ಕ್ಯಾಮೆರಾದಿಂದ ಚಿತ್ರ ತೆಗೆಯಲಾಗಿದೆ.",
  speechOutNotSupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಔಟ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
  voiceControlStarted: "ಧ್ವನಿ ನಿಯಂತ್ರಣ ಸಕ್ರಿಯವಾಗಿದೆ.",
  voiceControlStopped: "ಧ್ವನಿ ನಿಯಂತ್ರಣ ನಿಲ್ಲಿಸಲಾಗಿದೆ.",
  voiceControlNotSupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ನಿಯಂತ್ರಣ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
  commandNotRecognized: "ಆಜ್ಞೆ ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ಉದಾ: next, previous, logout.",
};

// ── Tamil ─────────────────────────────────────────────────────────────────────
UI_TEXT.ta = {
  selectOption: "ஒரு விருப்பத்தை தேர்ந்தெடு",
  voiceInput: "குரல் உள்ளீடு",
  listening: "கேட்கிறது...",
  speakQuestion: "கேள்வி கேளுங்கள்",
  previous: "முந்தைய",
  next: "அடுத்து",
  complete: "முடிக்க",
  question: "கேள்வி",
  of: "இல்",
  detectedArea: "கண்டறியப்பட்ட பகுதி",
  selectedAreas: "தேர்ந்தெடுத்த பகுதிகள்",
  none: "எதுவும் இல்லை",
  startCamera: "கேமரா தொடங்கு",
  capture: "பிடிக்க",
  stopCamera: "கேமரா நிறுத்து",
  cameraNotSupported: "இந்த உலாவியில் கேமரா ஆதரிக்கப்படவில்லை.",
  cameraDenied: "கேமரா அணுகல் கிடைக்கவில்லை. அனுமதி வழங்கவும்.",
  captureSuccess: "கேமராவிலிருந்து படம் எடுக்கப்பட்டது.",
  speechOutNotSupported: "இந்த உலாவியில் குரல் வெளியீடு ஆதரிக்கப்படவில்லை.",
  voiceControlStarted: "குரல் கட்டுப்பாடு செயல்பாட்டிலுள்ளது.",
  voiceControlStopped: "குரல் கட்டுப்பாடு நிறுத்தப்பட்டது.",
  voiceControlNotSupported: "இந்த உலாவியில் குரல் கட்டுப்பாடு ஆதரிக்கப்படவில்லை.",
  commandNotRecognized: "கட்டளை அங்கீகரிக்கப்படவில்லை. உதா: next, previous, logout.",
};

// ── Malayalam ─────────────────────────────────────────────────────────────────
UI_TEXT.ml = {
  selectOption: "ഒരു ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക",
  voiceInput: "ശബ്ദ ഇൻപുട്ട്",
  listening: "കേൾക്കുന്നു...",
  speakQuestion: "ചോദ്യം കേൾക്കുക",
  previous: "മുമ്പത്തേത്",
  next: "അടുത്തത്",
  complete: "പൂർത്തിയാക്കുക",
  question: "ചോദ്യം",
  of: "ൽ",
  detectedArea: "കണ്ടെത്തിയ ഭാഗം",
  selectedAreas: "തിരഞ്ഞെടുത്ത ഭാഗങ്ങൾ",
  none: "ഒന്നുമില്ല",
  startCamera: "ക്യാമറ ആരംഭിക്കുക",
  capture: "ക്യാപ്ചർ",
  stopCamera: "ക്യാമറ നിർത്തുക",
  cameraNotSupported: "ഈ ബ്രൗസറിൽ ക്യാമറ പിന്തുണയ്ക്കുന്നില്ല.",
  cameraDenied: "ക്യാമറ ആക്സസ് ലഭിച്ചില്ല. അനുമതി നൽകുക.",
  captureSuccess: "ക്യാമറയിൽ നിന്ന് ചിത്രം ക്യാപ്ചർ ചെയ്തു.",
  speechOutNotSupported: "ഈ ബ്രൗസറിൽ ശബ്ദ ഔട്ട്‌പുട്ട് പിന്തുണയ്ക്കുന്നില്ല.",
  voiceControlStarted: "ശബ്ദ നിയന്ത്രണം സജീവമാണ്.",
  voiceControlStopped: "ശബ്ദ നിയന്ത്രണം നിർത്തി.",
  voiceControlNotSupported: "ഈ ബ്രൗസറിൽ ശബ്ദ നിയന്ത്രണം പിന്തുണയ്ക്കുന്നില്ല.",
  commandNotRecognized: "കമാൻഡ് തിരിച്ചറിഞ്ഞില്ല. ഉദാ: next, previous, logout.",
};

const QUESTION_TRANSLATIONS = {
  hi: {
    profile_name:            "आपको हम क्या कहें?",
    age:                     "आपकी उम्र क्या है?",
    gender:                  "लक्षण तर्कशास्त्र के लिए लिंग चुनें",
    care_mode:               "किसके लक्षण भरे जा रहे हैं?",
    elder_family_pick:       "वृद्ध परिवार सदस्य चुनें",
    timeline_anchor:         "पहला लक्षण कब शुरू हुआ था?",
    timeline_entries:        "टाइमलाइन: तारीख, क्या शुरू हुआ, तीव्रता और बदलाव",
    symptoms:                "अपने मुख्य लक्षण सरल शब्दों में बताएं",
    fear_notes:              "परामर्श से पहले कोई डर/घबराहट?",
    pain_location:           "दर्द वाले स्थान पर पिन लगाएं",
    pain_intensity:          "दर्द की तीव्रता",
    pain_type:               "दर्द का प्रकार",
    symptom_start:           "लक्षण पहली बार कब शुरू हुए?",
    symptom_change:          "कुल मिलाकर लक्षणों का रुझान कैसा है?",
    food_recent:             "पिछले 24 घंटों में क्या खाया?",
    spicy_frequency:         "तीखा/तेल वाला खाना कितनी बार खाते हैं?",
    water_intake:            "दैनिक पानी का सेवन",
    sleep_pattern:           "नींद की गुणवत्ता",
    stress_level:            "तनाव स्तर",
    physical_activity:       "शारीरिक गतिविधि",
    medications:             "वर्तमान दवाएं",
    family_history:          "परिवार में इसी तरह के लक्षणों का इतिहास?",
    share_to_family:         "परिवार के साथ रिपोर्ट शेयर करें?",
    share_specific_members:  "विशिष्ट सदस्य चुनें",
    language_pref:           "सारांश के लिए पसंदीदा भाषा",
    face_image:              "चेहरे की फोटो अपलोड करें (प्राथमिक उपचार हेतु)",
    visual_issue_image:      "लक्षण की फोटो अपलोड करें (जलन/त्वचा समस्या)",
    last_period_date:        "अंतिम मासिक धर्म की तारीख",
    timeline_pattern_window: "लक्षण आमतौर पर कब बढ़ते हैं?",
    timeline_latest_shift:   "पहले और अभी के लक्षणों में क्या बदला?",
    timeline_worse_reason:   "दिन में लक्षण किससे बिगड़ते हैं?",
    headache_trigger:        "सिरदर्द का कारण क्या हो सकता है?",
    high_pain_followup:      "दर्द अधिक है। क्या रोज की दिनचर्या प्रभावित है?",
    high_pain_relief:        "क्या चीज़ अस्थायी राहत देती है?",
    stress_trigger_followup: "क्या तनाव से लक्षण बढ़ते हैं?",
    sleep_followup:          "आमतौर पर कितने घंटे सोते हैं?",
    medication_followup:     "क्या दवाएं लगातार राहत देती हैं?",
    respiratory_followup:    "सांस लेने में तकलीफ, सीने में जकड़न, या बुखार?",
    digestive_followup:      "क्या लक्षण खाने के समय से जुड़े हैं?",
    worsening_followup:      "लक्षण बढ़ने के बाद से क्या बदला?",
    symptom_priority:        "अभी सबसे ज्यादा परेशान करने वाला लक्षण कौन सा है?",
  },
  es: {
    symptoms: "Describe tus sintomas principales en palabras simples",
    symptom_start: "Cuando empezaron los sintomas por primera vez?",
    symptom_change: "Tendencia general",
    stress_level: "Nivel de estres",
    sleep_pattern: "Calidad del sueno",
    language_pref: "Idioma preferido para el resumen",
    high_pain_followup: "El dolor es alto. Afecta tu rutina diaria?",
    symptom_priority: "Cual es el sintoma que mas te molesta ahora?",
  },
};

const OPTION_TRANSLATIONS = {
  hi: {
    language_pref: { English: "अंग्रेजी", Hindi: "हिंदी", Spanish: "स्पेनिश" },
    symptom_change: {
      "Getting worse": "बढ़ रहा है",
      Improving: "सुधर रहा है",
      Stable: "स्थिर",
      Fluctuating: "उतार-चढ़ाव",
    },
    stress_level: { Low: "कम", Moderate: "मध्यम", High: "अधिक", "Very high": "बहुत अधिक" },
  },
  es: {
    language_pref: { English: "Ingles", Hindi: "Hindi", Spanish: "Espanol" },
    symptom_change: {
      "Getting worse": "Empeorando",
      Improving: "Mejorando",
      Stable: "Estable",
      Fluctuating: "Fluctuando",
    },
    stress_level: { Low: "Bajo", Moderate: "Moderado", High: "Alto", "Very high": "Muy alto" },
  },
};

// ── Option translations – extended for all 6 languages
OPTION_TRANSLATIONS.mr = {
  symptom_change: { "Getting worse": "खराब होत आहे", Improving: "सुधारत आहे", Stable: "स्थिर", Fluctuating: "चढउतार" },
  stress_level:   { Low: "कमी", Moderate: "मध्यम", High: "जास्त", "Very high": "खूप जास्त" },
  sleep_pattern:  { Poor: "खराब", Average: "सरासरी", Good: "चांगले", "Very good": "खूप चांगले" },
  spicy_frequency:{ Rarely: "क्वचितच", "1-2 times/week": "आठवड्यातून 1-2 वेळा", "3-5 times/week": "3-5 वेळा", Daily: "रोज" },
  water_intake:   { "< 1 liter": "< 1 लिटर", "1-2 liters": "1-2 लिटर", "2-3 liters": "2-3 लिटर", "> 3 liters": "> 3 लिटर" },
  gender:         { Male: "पुरुष", Female: "महिला", Other: "इतर", "Prefer not to say": "सांगणे टाळतो" },
  care_mode:      { Self: "स्वतः", "Elder family member": "वृद्ध कुटुंब सदस्य" },
  share_to_family:{ "Do not share": "शेअर करू नका", "Share with all family": "सर्व कुटुंबाशी", "Share with specific family members": "विशिष्ट सदस्यांशी" },
  pain_type:      { Sharp: "तीव्र", Burning: "जळजळ", Pressure: "दबाव", Throbbing: "ठणका", Aching: "वेदना", Stabbing: "खुपसणे", Cramping: "पेटके", Dull: "बोथट" },
  language_pref:  { English: "इंग्रजी", Hindi: "हिंदी", Marathi: "मराठी", Kannada: "कन्नड", Tamil: "तमिळ", Malayalam: "मल्याळम" },
};
OPTION_TRANSLATIONS.kn = {
  symptom_change: { "Getting worse": "ಹದಗೆಡುತ್ತಿದೆ", Improving: "ಸುಧಾರಿಸುತ್ತಿದೆ", Stable: "ಸ್ಥಿರ", Fluctuating: "ಏರಿಳಿತ" },
  stress_level:   { Low: "ಕಡಿಮೆ", Moderate: "ಮಧ್ಯಮ", High: "ಹೆಚ್ಚು", "Very high": "ತುಂಬಾ ಹೆಚ್ಚು" },
  sleep_pattern:  { Poor: "ಕಳಪೆ", Average: "ಸಾಧಾರಣ", Good: "ಚೆನ್ನಾಗಿ", "Very good": "ತುಂಬಾ ಚೆನ್ನಾಗಿ" },
  spicy_frequency:{ Rarely: "ವಿರಳವಾಗಿ", "1-2 times/week": "ವಾರಕ್ಕೆ 1-2 ಬಾರಿ", "3-5 times/week": "3-5 ಬಾರಿ", Daily: "ಪ್ರತಿದಿನ" },
  water_intake:   { "< 1 liter": "< 1 ಲೀಟರ್", "1-2 liters": "1-2 ಲೀಟರ್", "2-3 liters": "2-3 ಲೀಟರ್", "> 3 liters": "> 3 ಲೀಟರ್" },
  gender:         { Male: "ಪುರುಷ", Female: "ಮಹಿಳೆ", Other: "ಇತರ", "Prefer not to say": "ಹೇಳಲು ಇಷ್ಟಪಡುವುದಿಲ್ಲ" },
  care_mode:      { Self: "ಸ್ವಯಂ", "Elder family member": "ಹಿರಿಯ ಕುಟುಂಬ ಸದಸ್ಯ" },
  share_to_family:{ "Do not share": "ಹಂಚಿಕೊಳ್ಳಬೇಡಿ", "Share with all family": "ಎಲ್ಲರೊಂದಿಗೆ", "Share with specific family members": "ನಿರ್ದಿಷ್ಟ ಸದಸ್ಯರೊಂದಿಗೆ" },
  pain_type:      { Sharp: "ತೀಕ್ಷ್ಣ", Burning: "ಉರಿ", Pressure: "ಒತ್ತಡ", Throbbing: "ಅಲೆಯಂತೆ", Aching: "ನೋವು", Stabbing: "ಇರಿಯುವ", Cramping: "ಸೆಳೆತ", Dull: "ಮಂದ" },
  language_pref:  { English: "ಇಂಗ್ಲಿಷ್", Hindi: "ಹಿಂದಿ", Marathi: "ಮರಾಠಿ", Kannada: "ಕನ್ನಡ", Tamil: "ತಮಿಳು", Malayalam: "ಮಲಯಾಳಂ" },
};
OPTION_TRANSLATIONS.ta = {
  symptom_change: { "Getting worse": "மோசமாகிறது", Improving: "மேம்படுகிறது", Stable: "நிலையான", Fluctuating: "ஏற்றத்தாழ்வு" },
  stress_level:   { Low: "குறைவு", Moderate: "மிதமான", High: "அதிகம்", "Very high": "மிக அதிகம்" },
  sleep_pattern:  { Poor: "மோசம்", Average: "சராசரி", Good: "நல்லது", "Very good": "மிக நல்லது" },
  spicy_frequency:{ Rarely: "அரிதாக", "1-2 times/week": "வாரம் 1-2 முறை", "3-5 times/week": "3-5 முறை", Daily: "தினமும்" },
  water_intake:   { "< 1 liter": "< 1 லிட்டர்", "1-2 liters": "1-2 லிட்டர்", "2-3 liters": "2-3 லிட்டர்", "> 3 liters": "> 3 லிட்டர்" },
  gender:         { Male: "ஆண்", Female: "பெண்", Other: "மற்றவை", "Prefer not to say": "சொல்ல விரும்பவில்லை" },
  care_mode:      { Self: "தன்னைத்தானே", "Elder family member": "மூத்த குடும்ப உறுப்பினர்" },
  share_to_family:{ "Do not share": "பகிர வேண்டாம்", "Share with all family": "அனைவரிடமும்", "Share with specific family members": "குறிப்பிட்டவர்களிடம்" },
  pain_type:      { Sharp: "கூர்மையான", Burning: "எரிச்சல்", Pressure: "அழுத்தம்", Throbbing: "துடிப்பு", Aching: "வலி", Stabbing: "குத்துவலி", Cramping: "இழுப்பு", Dull: "மழுமையான" },
  language_pref:  { English: "ஆங்கிலம்", Hindi: "இந்தி", Marathi: "மராத்தி", Kannada: "கன்னடம்", Tamil: "தமிழ்", Malayalam: "மலையாளம்" },
};
OPTION_TRANSLATIONS.ml = {
  symptom_change: { "Getting worse": "മോശമാകുന്നു", Improving: "മെച്ചപ്പെടുന്നു", Stable: "സ്ഥിരം", Fluctuating: "ഏറ്റക്കുറച്ചിൽ" },
  stress_level:   { Low: "കുറവ്", Moderate: "മിതമായ", High: "കൂടുതൽ", "Very high": "വളരെ കൂടുതൽ" },
  sleep_pattern:  { Poor: "മോശം", Average: "ശരാശരി", Good: "നല്ലത്", "Very good": "വളരെ നല്ലത്" },
  spicy_frequency:{ Rarely: "അപൂർവ്വമായി", "1-2 times/week": "ആഴ്ചയിൽ 1-2 തവണ", "3-5 times/week": "3-5 തവണ", Daily: "ദിവസവും" },
  water_intake:   { "< 1 liter": "< 1 ലിറ്റർ", "1-2 liters": "1-2 ലിറ്റർ", "2-3 liters": "2-3 ലിറ്റർ", "> 3 liters": "> 3 ലിറ്റർ" },
  gender:         { Male: "പുരുഷൻ", Female: "സ്ത്രീ", Other: "മറ്റുള്ളവ", "Prefer not to say": "പറഞ്ഞ് തരാൻ ഇഷ്ടമില്ല" },
  care_mode:      { Self: "സ്വയം", "Elder family member": "മൂത്ത കുടുംബ അംഗം" },
  share_to_family:{ "Do not share": "പങ്കിടരുത്", "Share with all family": "കുടുംബം മുഴുവനും", "Share with specific family members": "നിർദ്ദിഷ്ട അംഗങ്ങൾ" },
  pain_type:      { Sharp: "കൂർമ്മമായ", Burning: "കത്തൽ", Pressure: "സമ്മർദ്ദം", Throbbing: "മിടിക്കൽ", Aching: "വേദന", Stabbing: "കുത്ത്", Cramping: "ഞെരിവ്", Dull: "മന്ദം" },
  language_pref:  { English: "ഇംഗ്ലീഷ്", Hindi: "ഹിന്ദി", Marathi: "മറാത്തി", Kannada: "കന്നഡ", Tamil: "തമിഴ്", Malayalam: "മലയാളം" },
};

// Bridge to HS_i18n globe-picker so Q&A language tracks the header selector
function getUiLangCode() {
  // Prefer the HS_i18n globe-picker (set by user via the header language button)
  if (typeof HS_i18n !== "undefined") {
    const code = HS_i18n.getLang();
    if (code && UI_TEXT[code]) return code;
  }
  // Legacy fallback: language_pref dropdown answer inside the Q&A itself
  const preferred = String(flashcardAnswers.language_pref || "English");
  const legacyMap = { Hindi: "hi", Spanish: "es", Marathi: "mr", Kannada: "kn", Tamil: "ta", Malayalam: "ml" };
  return legacyMap[preferred] || "en";
}

function tUi(key) {
  const code = getUiLangCode();
  return UI_TEXT[code]?.[key] || UI_TEXT.en[key] || key;
}

function localizeQuestion(question) {
  const code = getUiLangCode();
  return QUESTION_TRANSLATIONS[code]?.[question.id] || question.question;
}

function localizeOption(questionId, optionValue) {
  const code = getUiLangCode();
  return OPTION_TRANSLATIONS[code]?.[questionId]?.[optionValue] || optionValue;
}

function getSpeechLang() {
  const code = getUiLangCode();
  return LANGUAGE_SPEECH[code] || "en-IN";
}

function stopActiveCameraStream() {
  if (!activeCameraStream) {
    return;
  }
  activeCameraStream.getTracks().forEach((track) => track.stop());
  activeCameraStream = null;
}

async function requestMicrophonePermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (_error) {
    return false;
  }
}

function normalizeVoiceCommand(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clickIfPossible(element) {
  if (!element || element.disabled) {
    return false;
  }
  element.click();
  return true;
}

function clickById(id) {
  return clickIfPossible(document.getElementById(id));
}

function openProfileAndEdit() {
  profileDropdown.style.display = "block";
  return clickIfPossible(editProfileBtn);
}

function clickVisibleControlByText(text) {
  const needle = normalizeVoiceCommand(text);
  if (!needle) {
    return false;
  }
  const candidates = Array.from(document.querySelectorAll("button, [role='button']"));
  const target = candidates.find((el) => {
    const label = normalizeVoiceCommand(el.textContent || el.getAttribute("aria-label") || "");
    const visible = el.offsetParent !== null;
    return visible && label.includes(needle) && !el.disabled;
  });
  return clickIfPossible(target);
}

function executeVoiceCommand(rawCommand) {
  const cmd = normalizeVoiceCommand(rawCommand);
  if (!cmd) {
    return false;
  }

  if (cmd.includes("stop voice") || cmd.includes("disable voice") || cmd.includes("voice off")) {
    toggleVoiceControl(false);
    return true;
  }

  if (cmd.includes("start qa") || cmd.includes("start q a") || cmd.includes("start session") || cmd.includes("begin qa") || cmd.includes("iniciar qa") || cmd.includes("shuru qa")) {
    return clickById("startQABtn") || clickById("quickQABtn");
  }

  if (cmd === "next" || cmd.includes("next question") || cmd.includes("siguiente") || cmd.includes("agla")) {
    return clickById("nextBtn");
  }

  if (cmd.includes("previous") || cmd.includes("go back") || cmd === "back" || cmd.includes("anterior") || cmd.includes("pichla")) {
    return clickById("prevBtn");
  }

  if (cmd.includes("open reports") || cmd.includes("view reports") || cmd.includes("open report") || cmd.includes("view report") || cmd.includes("abrir reportes")) {
    return clickById("viewReportsBtn");
  }

  if (cmd.includes("open calendar") || cmd.includes("view calendar") || cmd.includes("abrir calendario")) {
    return clickById("viewCalendarBtn");
  }

  if (cmd.includes("open documents") || cmd.includes("view documents") || cmd.includes("abrir documentos")) {
    return clickById("viewDocumentsBtn");
  }

  if (cmd.includes("open chat") || cmd.includes("start chat") || cmd.includes("abrir chat")) {
    return clickById("startChatBtn");
  }

  if (cmd.includes("edit profile") || cmd.includes("open profile")) {
    return openProfileAndEdit();
  }

  if (cmd.includes("open family") || cmd.includes("add family")) {
    return clickById("openFamilyModalBtn");
  }

  if (cmd.includes("save profile") || cmd.includes("submit profile")) {
    if (profileModal?.style.display === "flex") {
      profileForm?.requestSubmit();
      return true;
    }
  }

  if (cmd.includes("save member") || cmd.includes("submit member")) {
    if (familyModal?.style.display === "flex") {
      familyDetailForm?.requestSubmit();
      return true;
    }
  }

  if (cmd.includes("cancel profile")) {
    return clickById("cancelProfileBtn");
  }

  if (cmd.includes("cancel family") || cmd.includes("close family")) {
    return clickById("cancelFamilyModalBtn");
  }

  if (cmd.includes("logout") || cmd.includes("log out") || cmd.includes("sign out")) {
    return clickById("logoutBtn");
  }

  if (cmd.includes("sync") || cmd.includes("sync now")) {
    return clickById("syncNowBtn");
  }

  if (cmd.includes("speak question") || cmd.includes("read question")) {
    return clickById("speakQuestionBtn");
  }

  if (cmd.includes("voice input") || cmd.includes("dictate answer")) {
    return clickById("voiceBtn");
  }

  if (cmd.includes("start camera") || cmd.includes("open camera")) {
    return clickById("startCameraBtn");
  }

  if (cmd.includes("capture") || cmd.includes("take photo")) {
    return clickById("captureImageBtn");
  }

  if (cmd.includes("stop camera") || cmd.includes("close camera")) {
    return clickById("stopCameraBtn");
  }

  if (cmd.includes("clear pins")) {
    return clickById("clearPinsBtn");
  }

  if (cmd.includes("add timeline")) {
    return clickById("addTimelineRowBtn");
  }

  if (cmd.includes("scroll down")) {
    window.scrollBy({ top: 420, behavior: "smooth" });
    return true;
  }

  if (cmd.includes("scroll up")) {
    window.scrollBy({ top: -420, behavior: "smooth" });
    return true;
  }

  const clickMatch = cmd.match(/^click\s+(.+)$/);
  if (clickMatch?.[1]) {
    return clickVisibleControlByText(clickMatch[1]);
  }

  return false;
}

function updateVoiceControlButtonState() {
  if (!voiceControlBtn) {
    return;
  }
  voiceControlBtn.classList.toggle("voice-active", isVoiceControlActive);
  voiceControlBtn.setAttribute("title", isVoiceControlActive ? "Disable voice control" : "Enable voice control");
}

function setVoiceStatus(message, state = "idle") {
  if (!voiceStatusBar || !voiceStatusText) {
    return;
  }
  voiceStatusBar.classList.remove("listening", "error");
  if (state === "listening") {
    voiceStatusBar.classList.add("listening");
  }
  if (state === "error") {
    voiceStatusBar.classList.add("error");
  }
  voiceStatusText.textContent = message;
}

function toggleVoiceControl(forceState) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast(tUi("voiceControlNotSupported"), "error");
    setVoiceStatus("Voice control: not supported", "error");
    return;
  }

  const shouldEnable = typeof forceState === "boolean" ? forceState : !isVoiceControlActive;
  isVoiceControlActive = shouldEnable;
  updateVoiceControlButtonState();

  if (!shouldEnable) {
    if (globalVoiceRecognition) {
      globalVoiceRecognition.onend = null;
      globalVoiceRecognition.stop();
    }
    showToast(tUi("voiceControlStopped"));
    setVoiceStatus("Voice control: off", "idle");
    return;
  }

  setVoiceStatus("Voice control: requesting microphone...", "listening");
  requestMicrophonePermission().then((allowed) => {
    if (!allowed) {
      isVoiceControlActive = false;
      updateVoiceControlButtonState();
      showToast("Microphone permission blocked. Allow mic access and try again.", "error");
      setVoiceStatus("Voice control: mic permission blocked", "error");
      return;
    }

    if (!globalVoiceRecognition) {
      globalVoiceRecognition = new SpeechRecognition();
      globalVoiceRecognition.continuous = true;
      globalVoiceRecognition.interimResults = false;

      globalVoiceRecognition.onstart = () => {
        setVoiceStatus("Voice control: listening...", "listening");
      };

      globalVoiceRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (!event.results[i].isFinal) {
            continue;
          }
          const spoken = event.results[i][0]?.transcript || "";
          setVoiceStatus(`Heard: ${spoken}`, "listening");
          const ok = executeVoiceCommand(spoken);
          if (!ok) {
            showToast(tUi("commandNotRecognized"), "error");
            setVoiceStatus("Voice control: command not recognized", "error");
          }
        }
      };

      globalVoiceRecognition.onerror = (event) => {
        const code = String(event?.error || "").toLowerCase();
        if (code.includes("not-allowed") || code.includes("service-not-allowed")) {
          showToast("Microphone permission blocked. Allow mic access and try again.", "error");
          setVoiceStatus("Voice control: mic permission blocked", "error");
          return;
        }
        if (code.includes("no-speech")) {
          showToast("No speech detected. Try again.", "error");
          setVoiceStatus("Voice control: no speech detected", "error");
          return;
        }
        showToast(tUi("commandNotRecognized"), "error");
        setVoiceStatus("Voice control: error", "error");
      };

      globalVoiceRecognition.onend = () => {
        if (isVoiceControlActive) {
          globalVoiceRecognition.lang = getSpeechLang();
          globalVoiceRecognition.start();
        }
      };
    }

    try {
      globalVoiceRecognition.lang = getSpeechLang();
      globalVoiceRecognition.start();
      showToast(tUi("voiceControlStarted"));
      setVoiceStatus("Voice control: listening...", "listening");
    } catch (_error) {
      isVoiceControlActive = false;
      updateVoiceControlButtonState();
      showToast(tUi("voiceControlNotSupported"), "error");
      setVoiceStatus("Voice control: off", "idle");
    }
  });
}

function getAuthHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "x-user-email": window.HealthSaathiAuth.getCurrentUser(),
    "x-user-role": window.HealthSaathiAuth.getCurrentRole() || "patient",
    ...extra,
  };
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function ensureToastHost() {
  let host = document.getElementById(TOAST_HOST_ID);
  if (host) {
    return host;
  }

  host = document.createElement("div");
  host.id = TOAST_HOST_ID;
  host.className = "toast-host";
  document.body.appendChild(host);
  return host;
}

function showToast(message, type = "success") {
  if (!message) {
    return;
  }
  const host = ensureToastHost();
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : "toast-success"}`;
  toast.textContent = message;
  host.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("toast-exit");
    window.setTimeout(() => toast.remove(), 260);
  }, 2600);
}

function formatDate(value) {
  if (!value) {
    return "Not provided";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString();
}

function getSavedProfile() {
  return safeParse(localStorage.getItem("healthsaathi_profile") || "{}", {});
}

function calculateAgeFromDob(dob) {
  if (!dob) {
    return "";
  }
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age > 0 ? String(age) : "";
}

function hydrateAnswersFromProfile(answers = {}) {
  const profile = getSavedProfile();
  const hydrated = { ...answers };
  if (!hydrated.profile_name && profile.name) {
    hydrated.profile_name = profile.name;
  }
  if (!hydrated.age && profile.dob) {
    hydrated.age = calculateAgeFromDob(profile.dob);
  }
  return hydrated;
}

function getQuestionSection(questionId) {
  const sections = {
    "1": {
      title: "Profile & Context",
      ids: ["profile_name", "age", "gender", "care_mode", "elder_family_pick", "family_history"],
    },
    "2": {
      title: "Timeline & Symptom Core",
      ids: ["timeline_anchor", "timeline_entries", "timeline_pattern_window", "timeline_latest_shift", "symptoms", "fear_notes", "pain_location", "pain_intensity", "pain_type", "symptom_start", "symptom_change"],
    },
    "3": {
      title: "Lifestyle & Triggers",
      ids: ["food_recent", "spicy_frequency", "water_intake", "sleep_pattern", "stress_level", "physical_activity", "headache_trigger", "high_pain_followup"],
    },
    "4": {
      title: "Sharing & Preferences",
      ids: ["medications", "last_period_date", "share_to_family", "share_specific_members", "language_pref", "face_image", "visual_issue_image"],
    },
  };

  for (const section of Object.values(sections)) {
    if (section.ids.includes(questionId)) {
      return section;
    }
  }

  return { title: "General", ids: [questionId] };
}

function queueOffline(action) {
  const queue = safeParse(localStorage.getItem(OFFLINE_QUEUE_KEY), []);
  queue.push(action);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  updateOfflineStatus();
}

function getOfflineQueueCount() {
  return safeParse(localStorage.getItem(OFFLINE_QUEUE_KEY), []).length;
}

function updateOfflineStatus() {
  if (!offlineStatusBar || !offlineStatusText) {
    return;
  }

  const pending = getOfflineQueueCount();
  offlineStatusBar.classList.remove("offline", "pending");

  if (!navigator.onLine) {
    offlineStatusBar.classList.add("offline");
    offlineStatusText.textContent = `Offline mode: ${pending} item(s) pending sync.`;
    if (syncNowBtn) {
      syncNowBtn.disabled = true;
    }
    return;
  }

  if (pending > 0) {
    offlineStatusBar.classList.add("pending");
    offlineStatusText.textContent = `Online: ${pending} item(s) waiting to sync.`;
    if (syncNowBtn) {
      syncNowBtn.disabled = false;
    }
    return;
  }

  offlineStatusText.textContent = "Online: all data synced.";
  if (syncNowBtn) {
    syncNowBtn.disabled = true;
  }
}

async function postWithOfflineQueue(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    updateOfflineStatus();
    return response;
  } catch (_error) {
    queueOffline({ url, payload });
    if (!offlineSaveToastShown) {
      showToast("Saved offline. Data will sync automatically when internet returns.");
      offlineSaveToastShown = true;
    }
    return null;
  }
}

async function syncOfflineQueue() {
  const queue = safeParse(localStorage.getItem(OFFLINE_QUEUE_KEY), []);
  if (!queue.length) {
    updateOfflineStatus();
    return;
  }

  const remaining = [];
  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(item.payload),
      });
      if (!response.ok) {
        remaining.push(item);
      }
    } catch (_error) {
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  updateOfflineStatus();

  if (!remaining.length) {
    offlineSaveToastShown = false;
    showToast("Offline data synced successfully.");
    await Promise.all([loadFamilyMembers(), loadReports()]);
    renderDashboardRecommendation();
  }
}

window.addEventListener("online", () => {
  offlineSaveToastShown = false;
  syncOfflineQueue();
});

window.addEventListener("offline", () => {
  updateOfflineStatus();
});

document.addEventListener("DOMContentLoaded", async () => {
  const userEmail = window.HealthSaathiAuth.getCurrentUser();
  userNameEl.textContent = userEmail.split("@")[0];
  loadProfile();
  await Promise.all([loadFamilyMembers(), loadReports()]);
  renderDashboardPrimaryAction();
  renderDashboardRecommendation();
  updateOfflineStatus();

  syncNowBtn?.addEventListener("click", async () => {
    syncNowBtn.disabled = true;
    await syncOfflineQueue();
    updateOfflineStatus();
  });

  voiceControlBtn?.addEventListener("click", () => {
    toggleVoiceControl();
  });

  updateVoiceControlButtonState();
  setVoiceStatus("Voice control: off", "idle");

  syncOfflineQueue();
});

window.addEventListener("beforeunload", () => {
  if (globalVoiceRecognition) {
    globalVoiceRecognition.onend = null;
    globalVoiceRecognition.stop();
  }
});

profileBtn.addEventListener("click", () => {
  profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.style.display = "none";
  }
});

editProfileBtn.addEventListener("click", () => {
  profileDropdown.style.display = "none";
  openProfileModal();
});

quickQABtn?.addEventListener("click", () => {
  startQABtn?.click();
});

logoutBtn.addEventListener("click", () => {
  window.HealthSaathiAuth.logout();
});

startQABtn.addEventListener("click", async () => {
  currentSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await loadPreviousAnswers(currentSessionId);
  flashcardAnswers = hydrateAnswersFromProfile(flashcardAnswers);
  flashcardQuestions = buildQuestionSet(flashcardAnswers);
  flashcardIndex = 0;
  qaContainer.style.display = "block";
  startQABtn.style.display = "none";
  document.querySelector(".qa-controls").style.display = "flex";
  renderCurrentFlashcard();
  updateProgress();
});

prevBtn.addEventListener("click", () => {
  if (flashcardIndex === 0) {
    return;
  }
  saveCurrentAnswer();
  flashcardIndex -= 1;
  renderCurrentFlashcard();
  updateProgress();
});

nextBtn.addEventListener("click", () => {
  saveCurrentAnswer();
  const rebuilt = buildQuestionSet(flashcardAnswers);
  const activeQuestionId = flashcardQuestions[flashcardIndex]?.id;
  flashcardQuestions = rebuilt;

  const idx = flashcardQuestions.findIndex((q) => q.id === activeQuestionId);
  flashcardIndex = idx >= 0 ? idx : flashcardIndex;

  if (flashcardIndex < flashcardQuestions.length - 1) {
    flashcardIndex += 1;
    renderCurrentFlashcard();
    updateProgress();
  } else {
    completeQASession();
  }
});

viewReportsBtn.addEventListener("click", () => openReportsHub());
viewCalendarBtn.addEventListener("click", () => openCalendarHub());
viewDocumentsBtn.addEventListener("click", () => openDocumentsHub());
startChatBtn.addEventListener("click", () => openChatHub());

function isReportForToday(report) {
  const reportDate = new Date(report.createdAt);
  if (Number.isNaN(reportDate.getTime())) {
    return false;
  }
  const today = new Date();
  return reportDate.toDateString() === today.toDateString();
}

function hasTodayReport() {
  return reportHistory.some((report) => isReportForToday(report));
}

function renderDashboardPrimaryAction() {
  const heroAction = document.querySelector(".welcome-section");
  const shouldUseHeaderAction = hasTodayReport();

  if (startQABtn) {
    startQABtn.style.display = shouldUseHeaderAction ? "none" : "inline-flex";
  }

  if (quickQABtn) {
    quickQABtn.style.display = shouldUseHeaderAction ? "inline-flex" : "none";
  }

  if (heroAction) {
    heroAction.classList.toggle("has-qa-ready", shouldUseHeaderAction);
  }
}

function insertQuestionsAfter(questions, afterId, additions) {
  const index = questions.findIndex((item) => item.id === afterId);
  if (index === -1) {
    questions.push(...additions);
    return;
  }
  questions.splice(index + 1, 0, ...additions);
}

function buildQuestionSet(answers = {}) {
  const resolvedAnswers = hydrateAnswersFromProfile(answers);
  const timelineRows = Array.isArray(resolvedAnswers.timeline_entries)
    ? resolvedAnswers.timeline_entries
    : safeParse(resolvedAnswers.timeline_entries || "[]", []);

  const questions = [
    { id: "profile_name", question: "What should we call you?", type: "text", required: true },
    { id: "age", question: "What is your age?", type: "number", min: 1, max: 120, required: true },
    {
      id: "gender",
      question: "Select sex for symptom logic",
      type: "select",
      options: ["Male", "Female", "Other", "Prefer not to say"],
      required: true,
    },
    {
      id: "care_mode",
      question: "Whose symptoms are being filled?",
      type: "select",
      options: ["Self", "Elder family member"],
      required: true,
    },
    {
      id: "elder_family_pick",
      question: "Select family member for elder symptom entry",
      type: "family_radio",
      conditional: (a) => a.care_mode === "Elder family member",
    },
    {
      id: "timeline_anchor",
      question: "Timeline start: when was the first symptom moment?",
      type: "datetime-local",
    },
    {
      id: "timeline_entries",
      question: "Timeline log: date, what started, start intensity, and better/worse trend",
      type: "timeline",
    },
    {
      id: "symptoms",
      question: "Describe your main symptoms in simple words",
      type: "textarea",
      required: true,
      placeholder: "Example: burning pain after spicy food and nausea",
    },
    {
      id: "fear_notes",
      question: "Any fear/nervousness before consultation?",
      type: "textarea",
      placeholder: "Share anything you are worried about",
    },
    {
      id: "pain_location",
      question: "Select pain area and add pin points (multi-point supported)",
      type: "pain_map",
    },
    {
      id: "pain_intensity",
      question: "Pain intensity",
      type: "slider",
      min: 0,
      max: 10,
      step: 1,
    },
    {
      id: "pain_type",
      question: "Pain type examples: sharp (needle), burning (acidity), pressure, throbbing",
      type: "multi_select",
      options: ["Sharp", "Burning", "Pressure", "Throbbing", "Aching", "Stabbing", "Cramping", "Dull"],
    },
    {
      id: "symptom_start",
      question: "When did symptoms first start?",
      type: "datetime-local",
      required: true,
    },
    {
      id: "symptom_change",
      question: "Overall trend",
      type: "select",
      options: ["Getting worse", "Improving", "Stable", "Fluctuating"],
      required: true,
    },
    {
      id: "food_recent",
      question: "What did you eat in last 24 hours?",
      type: "textarea",
      placeholder: "Include meals and snacks",
    },
    {
      id: "spicy_frequency",
      question: "How often do you eat spicy/oily/junk food?",
      type: "select",
      options: ["Rarely", "1-2 times/week", "3-5 times/week", "Daily"],
    },
    {
      id: "water_intake",
      question: "Daily water intake",
      type: "select",
      options: ["< 1 liter", "1-2 liters", "2-3 liters", "> 3 liters"],
    },
    {
      id: "sleep_pattern",
      question: "Sleep quality",
      type: "select",
      options: ["Poor", "Average", "Good", "Very good"],
    },
    {
      id: "stress_level",
      question: "Stress level",
      type: "select",
      options: ["Low", "Moderate", "High", "Very high"],
      required: true,
    },
    {
      id: "physical_activity",
      question: "Physical activity routine",
      type: "textarea",
      placeholder: "Example: 30-min walk daily",
    },
    {
      id: "medications",
      question: "Current medicines",
      type: "textarea",
    },
    {
      id: "family_history",
      question: "Any family history of similar symptoms?",
      type: "textarea",
    },
    {
      id: "share_to_family",
      question: "Share this report with family members?",
      type: "select",
      options: ["Do not share", "Share with all family", "Share with specific family members"],
    },
    {
      id: "share_specific_members",
      question: "Choose specific family members",
      type: "family_multi_select",
      conditional: (a) => a.share_to_family === "Share with specific family members",
    },
    {
      id: "language_pref",
      question: "Preferred language for summary",
      type: "select",
      options: ["English", "Hindi", "Marathi", "Kannada", "Tamil", "Malayalam"],
    },
    {
      id: "face_image",
      question: "Upload face photo (first-aid guidance only)",
      type: "image_upload",
    },
    {
      id: "visual_issue_image",
      question: "Upload symptom photo (burn/bite/skin issue)",
      type: "image_upload",
    },
  ];

  if (resolvedAnswers.gender === "Female") {
    questions.splice(14, 0, {
      id: "last_period_date",
      question: "Last menstrual cycle start date",
      type: "date",
    });
  }

  if (timelineRows.length > 0) {
    questions.push({
      id: "timeline_pattern_window",
      question: "From timeline trend, when do symptoms usually spike?",
      type: "select",
      options: ["Morning", "Afternoon", "Evening", "Night", "No clear pattern"],
    });
    questions.push({
      id: "timeline_latest_shift",
      question: "Compared with the first event, what changed most by the latest event?",
      type: "textarea",
      placeholder: "Example: intensity increased from 4 to 8 after oily meals",
    });

    const hasWorseningTimeline = timelineRows.some((row) => String(row?.trend || "").toLowerCase() === "worse");
    if (hasWorseningTimeline) {
      questions.push({
        id: "timeline_worse_reason",
        question: "What usually makes the symptoms worse during the day?",
        type: "textarea",
        placeholder: "Example: after climbing stairs, after oily food, after long screen time",
      });
    }
  }

  const symptomText = String(resolvedAnswers.symptoms || "").toLowerCase();
  const symptomWords = symptomText.split(/\W+/).filter(Boolean);

  if (resolvedAnswers.symptom_start) {
    insertQuestionsAfter(questions, "symptom_start", [
      {
        id: "symptom_onset_type",
        question: "Did this start suddenly or gradually?",
        type: "select",
        options: ["Suddenly", "Gradually", "Not sure"],
      },
      {
        id: "symptom_onset_trigger",
        question: "What were you doing when this started?",
        type: "textarea",
        placeholder: "Example: after meal, at work, after waking up",
      },
    ]);
  }

  if (symptomWords.length >= 3) {
    insertQuestionsAfter(questions, "symptoms", [
      {
        id: "symptom_priority",
        question: "Which single symptom is bothering you the most right now?",
        type: "text",
        placeholder: "Example: burning chest pain",
      },
    ]);
  }

  if (symptomText.includes("head") || symptomText.includes("migraine")) {
    questions.push({
      id: "headache_trigger",
      question: "Do screens/noise/light trigger headache?",
      type: "multi_select",
      options: ["Screen time", "Loud noise", "Bright light", "Skipped meals", "Poor sleep"],
    });
  }

  if (
    symptomText.includes("cough") ||
    symptomText.includes("cold") ||
    symptomText.includes("throat") ||
    symptomText.includes("breath") ||
    symptomText.includes("fever")
  ) {
    questions.push({
      id: "respiratory_followup",
      question: "Any breathing trouble, chest tightness, or persistent fever?",
      type: "multi_select",
      options: ["Breathing trouble", "Chest tightness", "Persistent fever", "None of these"],
    });
  }

  if (
    symptomText.includes("stomach") ||
    symptomText.includes("acidity") ||
    symptomText.includes("gas") ||
    symptomText.includes("nausea") ||
    symptomText.includes("vomit") ||
    symptomText.includes("abdomen")
  ) {
    questions.push({
      id: "digestive_followup",
      question: "Are symptoms linked with meal timing?",
      type: "select",
      options: ["Before meals", "After meals", "Late night", "No clear link"],
    });
  }

  if (String(resolvedAnswers.symptom_change || "").toLowerCase().includes("worse")) {
    questions.push({
      id: "worsening_followup",
      question: "What changed recently since symptoms worsened?",
      type: "textarea",
      placeholder: "Example: less sleep, missed medicines, stress at work",
    });
  }

  if (Number(resolvedAnswers.pain_intensity || 0) >= 7) {
    insertQuestionsAfter(questions, "pain_intensity", [
      {
        id: "high_pain_followup",
        question: "Pain is high. Is daily routine affected?",
        type: "select",
        options: ["Yes, severely", "Yes, somewhat", "No"],
      },
      {
        id: "high_pain_relief",
        question: "What gives temporary relief?",
        type: "multi_select",
        options: ["Rest", "Medicine", "Heat/ice", "Food", "No relief yet"],
      },
    ]);
  }

  if (["High", "Very high"].includes(String(resolvedAnswers.stress_level || ""))) {
    questions.push({
      id: "stress_trigger_followup",
      question: "Do symptoms get worse during stress?",
      type: "select",
      options: ["Yes", "No", "Not sure"],
    });
  }

  if (String(resolvedAnswers.sleep_pattern || "").toLowerCase() === "poor") {
    questions.push({
      id: "sleep_followup",
      question: "How many hours do you usually sleep?",
      type: "select",
      options: ["< 4 hours", "4-6 hours", "6-8 hours", "> 8 hours"],
    });
  }

  if (String(resolvedAnswers.medications || "").trim()) {
    questions.push({
      id: "medication_followup",
      question: "Do medicines reduce symptoms consistently?",
      type: "select",
      options: ["Yes", "Partly", "No", "Not sure"],
    });
  }

  const skipIds = new Set();
  if (resolvedAnswers.profile_name) {
    skipIds.add("profile_name");
  }
  if (resolvedAnswers.age) {
    skipIds.add("age");
  }

  return questions
    .filter((q) => !skipIds.has(q.id))
    .filter((q) => !q.conditional || q.conditional(resolvedAnswers));
}

function getPainSvg(gender) {
  if (gender === "Female") {
    return `
      <svg viewBox="0 0 260 520" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skinF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f0c7a5"/>
            <stop offset="100%" stop-color="#e4b089"/>
          </linearGradient>
        </defs>
        <rect width="260" height="520" fill="#f6fbff"/>
        <ellipse cx="130" cy="64" rx="30" ry="32" fill="url(#skinF)"/>
        <rect x="118" y="96" width="24" height="30" rx="11" fill="url(#skinF)"/>
        <path d="M82 130 C98 104, 162 104, 178 130 L184 246 C184 278, 76 278, 82 246 Z" fill="url(#skinF)"/>
        <path d="M86 246 L174 246 L182 330 C174 356, 86 356, 78 330 Z" fill="url(#skinF)"/>
        <rect x="48" y="132" width="28" height="150" rx="12" fill="url(#skinF)"/>
        <rect x="184" y="132" width="28" height="150" rx="12" fill="url(#skinF)"/>
        <rect x="98" y="334" width="28" height="162" rx="12" fill="url(#skinF)"/>
        <rect x="134" y="334" width="28" height="162" rx="12" fill="url(#skinF)"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 260 520" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skinM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#efc7a1"/>
          <stop offset="100%" stop-color="#d9a77e"/>
        </linearGradient>
      </defs>
      <rect width="260" height="520" fill="#f6fbff"/>
      <ellipse cx="130" cy="62" rx="31" ry="33" fill="url(#skinM)"/>
      <rect x="118" y="95" width="24" height="30" rx="9" fill="url(#skinM)"/>
      <rect x="84" y="126" width="92" height="130" rx="18" fill="url(#skinM)"/>
      <rect x="92" y="256" width="76" height="98" rx="16" fill="url(#skinM)"/>
      <rect x="52" y="132" width="28" height="154" rx="12" fill="url(#skinM)"/>
      <rect x="180" y="132" width="28" height="154" rx="12" fill="url(#skinM)"/>
      <rect x="100" y="354" width="28" height="146" rx="12" fill="url(#skinM)"/>
      <rect x="132" y="354" width="28" height="146" rx="12" fill="url(#skinM)"/>
    </svg>
  `;
}

function toSvgDataUri(svgMarkup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup.replace(/\n+/g, "").trim())}`;
}

function detectBodyAreaByPoint(x, y, view = "front") {
  const zonesByView = {
    front: [
      { id: "head", label: "Head", x1: 36, x2: 64, y1: 2, y2: 16 },
      { id: "neck", label: "Neck", x1: 44, x2: 56, y1: 16, y2: 23 },
      { id: "left_shoulder", label: "Left shoulder", x1: 24, x2: 42, y1: 20, y2: 30 },
      { id: "right_shoulder", label: "Right shoulder", x1: 58, x2: 76, y1: 20, y2: 30 },
      { id: "chest", label: "Chest", x1: 38, x2: 62, y1: 23, y2: 42 },
      { id: "abdomen", label: "Abdomen", x1: 39, x2: 61, y1: 42, y2: 58 },
      { id: "pelvis", label: "Pelvis", x1: 40, x2: 60, y1: 58, y2: 68 },
      { id: "left_arm", label: "Left arm", x1: 15, x2: 34, y1: 29, y2: 62 },
      { id: "right_arm", label: "Right arm", x1: 66, x2: 85, y1: 29, y2: 62 },
      { id: "left_thigh", label: "Left thigh", x1: 39, x2: 49, y1: 68, y2: 82 },
      { id: "right_thigh", label: "Right thigh", x1: 51, x2: 61, y1: 68, y2: 82 },
      { id: "left_leg", label: "Left lower leg", x1: 39, x2: 49, y1: 82, y2: 98 },
      { id: "right_leg", label: "Right lower leg", x1: 51, x2: 61, y1: 82, y2: 98 },
    ],
    back: [
      { id: "head_back", label: "Back of head", x1: 36, x2: 64, y1: 2, y2: 16 },
      { id: "neck_back", label: "Back of neck", x1: 44, x2: 56, y1: 16, y2: 23 },
      { id: "upper_back", label: "Upper back", x1: 36, x2: 64, y1: 23, y2: 42 },
      { id: "lower_back", label: "Lower back", x1: 38, x2: 62, y1: 42, y2: 58 },
      { id: "left_arm_back", label: "Left arm", x1: 15, x2: 34, y1: 29, y2: 62 },
      { id: "right_arm_back", label: "Right arm", x1: 66, x2: 85, y1: 29, y2: 62 },
      { id: "left_glute", label: "Left glute", x1: 40, x2: 49, y1: 58, y2: 70 },
      { id: "right_glute", label: "Right glute", x1: 51, x2: 60, y1: 58, y2: 70 },
      { id: "left_thigh_back", label: "Left thigh", x1: 39, x2: 49, y1: 70, y2: 84 },
      { id: "right_thigh_back", label: "Right thigh", x1: 51, x2: 61, y1: 70, y2: 84 },
      { id: "left_calf", label: "Left calf", x1: 39, x2: 49, y1: 84, y2: 98 },
      { id: "right_calf", label: "Right calf", x1: 51, x2: 61, y1: 84, y2: 98 },
    ],
  };

  const zones = zonesByView[view] || zonesByView.front;
  const hit = zones.find((zone) => x >= zone.x1 && x <= zone.x2 && y >= zone.y1 && y <= zone.y2);
  if (hit) {
    return hit;
  }
  return { id: "outside", label: "Outside mapped body area" };
}

function renderCurrentFlashcard() {
  const question = flashcardQuestions[flashcardIndex];
  if (!question) {
    return;
  }

  stopActiveCameraStream();

  const answer = flashcardAnswers[question.id] || "";
  const section = getQuestionSection(question.id);
  const localizedQuestion = localizeQuestion(question);
  const sectionQuestions = flashcardQuestions.filter((q) => getQuestionSection(q.id).title === section.title);
  const sectionPosition = sectionQuestions.findIndex((q) => q.id === question.id) + 1;
  let inputHtml = "";

  if (question.type === "text") {
    inputHtml = `<input type="text" id="flashcardInput" value="${String(answer).replace(/"/g, "&quot;")}" placeholder="${question.placeholder || ""}" ${question.required ? "required" : ""}>`;
  } else if (question.type === "number") {
    inputHtml = `<input type="number" id="flashcardInput" min="${question.min || 0}" max="${question.max || 999}" value="${answer}" ${question.required ? "required" : ""}>`;
  } else if (question.type === "textarea") {
    inputHtml = `<textarea id="flashcardInput" rows="4" placeholder="${question.placeholder || ""}" ${question.required ? "required" : ""}>${answer}</textarea>`;
  } else if (question.type === "select") {
    inputHtml = `
      <select id="flashcardInput" ${question.required ? "required" : ""}>
        <option value="">${tUi("selectOption")}</option>
        ${question.options
          .map((opt) => `<option value="${opt}" ${answer === opt ? "selected" : ""}>${localizeOption(question.id, opt)}</option>`)
          .join("")}
      </select>
    `;
  } else if (question.type === "date") {
    inputHtml = `<input type="date" id="flashcardInput" value="${answer}">`;
  } else if (question.type === "datetime-local") {
    inputHtml = `<input type="datetime-local" id="flashcardInput" value="${answer}">`;
  } else if (question.type === "slider") {
    const sliderValue = Number(answer || 0);
    inputHtml = `
      <div class="slider-container">
        <input type="range" class="pain-slider" id="flashcardInput" min="${question.min}" max="${question.max}" step="${question.step || 1}" value="${sliderValue}">
        <div class="slider-value" id="sliderValue">${sliderValue}</div>
      </div>
    `;
  } else if (question.type === "multi_select") {
    const selected = Array.isArray(answer) ? answer : safeParse(answer || "[]", []);
    inputHtml = `
      <div class="multi-select">
        ${question.options
          .map(
            (opt) => `
          <label class="checkbox-label">
            <input type="checkbox" value="${opt}" ${selected.includes(opt) ? "checked" : ""}>
            ${localizeOption(question.id, opt)}
          </label>
        `
          )
          .join("")}
      </div>
    `;
  } else if (question.type === "pain_map") {
    const parsed = typeof answer === "string" ? safeParse(answer || "{}", {}) : answer;
    const selectedAreas = parsed.areas || [];
    const pins = parsed.pins || [];
    const mapView = parsed.view || "front";
    const mapSource = parsed.source || "default";
    const imageUrl = parsed.imageUrl || DEFAULT_PAIN_MAP_IMAGE;
    const gender = flashcardAnswers.gender || "Male";

    inputHtml = `
      <div class="body-image-container">
        <div class="pain-map-toolbar">
          <label class="map-input-row">View
            <select id="bodyViewSelect">
              <option value="front" ${mapView === "front" ? "selected" : ""}>Front</option>
              <option value="back" ${mapView === "back" ? "selected" : ""}>Back</option>
            </select>
          </label>
          <label class="map-input-row">Image source
            <select id="bodyImageSource">
              <option value="default" ${mapSource === "default" ? "selected" : ""}>HealthSaathi body</option>
              <option value="web" ${mapSource === "web" ? "selected" : ""}>From web URL</option>
              <option value="upload" ${mapSource === "upload" ? "selected" : ""}>Upload image</option>
            </select>
          </label>
          <label class="map-input-row">Zoom
            <input type="range" id="zoomRange" min="70" max="185" value="100">
          </label>
          <button type="button" id="clearPinsBtn" class="control-btn">Clear Pins</button>
        </div>

        <div class="pain-map-source-fields">
          <div id="bodyImageUrlWrap" class="map-source-field" style="display:${mapSource === "web" ? "grid" : "none"}">
            <input type="url" id="bodyImageUrlInput" placeholder="Paste image URL from web" value="${String(mapSource === "web" ? imageUrl : "").replace(/"/g, "&quot;")}">
            <button type="button" id="applyBodyImageUrlBtn" class="control-btn">Use This Image</button>
          </div>
          <div id="bodyImageUploadWrap" class="map-source-field" style="display:${mapSource === "upload" ? "grid" : "none"}">
            <input type="file" id="bodyImageUploadInput" accept="image/*">
          </div>
        </div>

        <div class="pain-map-shell" id="painMapShell">
          <img id="painMapImage" class="pain-map-image" src="${String(imageUrl).replace(/"/g, "&quot;")}" alt="Body map image">
          <div class="pain-pin-layer" id="painPinLayer"></div>
        </div>
        <p class="muted">Pinpoint pain on the image. Hover shows detected area; click adds a pin tagged to that area.</p>
        <p class="map-area-hint">${tUi("detectedArea")}: <strong id="detectedAreaText">${tUi("none")}</strong></p>
        <p class="muted">${tUi("selectedAreas")}: <span id="selectedAreaText">${selectedAreas.join(", ") || tUi("none")}</span></p>
      </div>
    `;

    flashcardAnswers._tmpPainMap = {
      areas: selectedAreas,
      pins,
      view: mapView,
      source: mapSource,
      imageUrl,
      gender,
    };
  } else if (question.type === "timeline") {
    const rows = Array.isArray(answer) ? answer : safeParse(answer || "[]", []);
    const normalized = rows.length
      ? rows
      : [{ date: "", whenStarted: "", startIntensity: "", trend: "", note: "" }];

    inputHtml = `
      <div id="timelineRows" class="timeline-builder">
        ${normalized
          .map(
            (row, idx) => `
          <div class="card-lite timeline-row" data-index="${idx}">
            <label>Date<input type="date" class="timeline-date" value="${row.date || ""}"></label>
            <label>When started<input type="text" class="timeline-when" value="${row.whenStarted || ""}" placeholder="Example: after lunch"></label>
            <label>Intensity at start (0-10)<input type="number" min="0" max="10" class="timeline-intensity" value="${row.startIntensity || ""}"></label>
            <label>Trend
              <select class="timeline-trend">
                <option value="">Select</option>
                <option value="Worse" ${row.trend === "Worse" ? "selected" : ""}>Worse</option>
                <option value="Better" ${row.trend === "Better" ? "selected" : ""}>Better</option>
                <option value="Same" ${row.trend === "Same" ? "selected" : ""}>Same</option>
              </select>
            </label>
            <label>Note<input type="text" class="timeline-note" value="${row.note || ""}"></label>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="timeline-actions">
        <button type="button" id="addTimelineRowBtn" class="control-btn">Add timeline event</button>
      </div>
    `;
  } else if (question.type === "family_radio") {
    if (!familyMembers.length) {
      inputHtml = `<p class="muted">No family members added yet. Add from profile first.</p>`;
    } else {
      inputHtml = `
        <div class="multi-select">
          ${familyMembers
            .map(
              (member) => `
            <label class="checkbox-label">
              <input type="radio" name="familyRadio" value="${member.id}" ${String(answer) === String(member.id) ? "checked" : ""}>
              ${member.name} (${member.relation || "family"})
            </label>
          `
            )
            .join("")}
        </div>
      `;
    }
  } else if (question.type === "family_multi_select") {
    const selectedIds = Array.isArray(answer) ? answer : safeParse(answer || "[]", []);
    if (!familyMembers.length) {
      inputHtml = `<p class="muted">No family members available to select.</p>`;
    } else {
      inputHtml = `
        <div class="multi-select">
          ${familyMembers
            .map(
              (member) => `
            <label class="checkbox-label">
              <input type="checkbox" value="${member.id}" ${selectedIds.includes(String(member.id)) || selectedIds.includes(member.id) ? "checked" : ""}>
              ${member.name} (${member.relation || "family"})
            </label>
          `
            )
            .join("")}
        </div>
      `;
    }
  } else if (question.type === "image_upload") {
    inputHtml = `
      <input type="file" id="flashcardInput" accept="image/*">
      <div class="camera-tools">
        <video id="cameraPreview" autoplay playsinline style="display:none;"></video>
        <canvas id="cameraCanvas" style="display:none;"></canvas>
        <div class="camera-actions">
          <button type="button" id="startCameraBtn" class="control-btn">${tUi("startCamera")}</button>
          <button type="button" id="captureImageBtn" class="control-btn" style="display:none;">${tUi("capture")}</button>
          <button type="button" id="stopCameraBtn" class="control-btn" style="display:none;">${tUi("stopCamera")}</button>
        </div>
      </div>
      <div id="imagePreview" class="image-preview"></div>
    `;
  }

  // Show voice mic on all question types except pain_map / timeline / image
  const voiceableTypes = ["text", "textarea", "select", "multi_select", "slider", "number", "date", "datetime-local"];
  const withVoice = voiceableTypes.includes(question.type);
  const voiceControls = `
    <div class="voice-actions">
      <button type="button" id="speakQuestionBtn" class="voice-btn">${tUi("speakQuestion")}</button>
      ${withVoice ? `<button type="button" id="voiceBtn" class="voice-btn" title="${tUi("voiceInput")}">
        <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z'/><path d='M19 10v2a7 7 0 0 1-14 0v-2'/><line x1='12' y1='19' x2='12' y2='23'/><line x1='8' y1='23' x2='16' y2='23'/></svg>
        ${tUi("voiceInput")}
      </button>` : ""}
    </div>
  `;

  flashcardContainer.innerHTML = `
    <div class="flashcard">
      <p class="flashcard-section">${section.title} • ${sectionPosition}/${sectionQuestions.length}</p>
      <h3>${tUi("question")} ${flashcardIndex + 1}</h3>
      <p class="flashcard-question">${localizedQuestion}</p>
      ${inputHtml}
      ${voiceControls}
    </div>
  `;

  bindQuestionInteraction(question);
  prevBtn.disabled = flashcardIndex === 0;
  prevBtn.textContent = tUi("previous");
  nextBtn.textContent = flashcardIndex === flashcardQuestions.length - 1 ? tUi("complete") : tUi("next");
}

function bindQuestionInteraction(question) {
  document.getElementById("speakQuestionBtn")?.addEventListener("click", () => {
    speakQuestion(localizeQuestion(question));
  });

  // Voice auto-fill: mic listens, fills the answer, then auto-advances after 1.2s
  document.getElementById("voiceBtn")?.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(tUi("voiceControlNotSupported"), "error");
      return;
    }
    const btn = document.getElementById("voiceBtn");
    const rec = new SpeechRecognition();
    rec.lang = getSpeechLang();
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    if (btn) { btn.textContent = tUi("listening"); btn.disabled = true; }

    rec.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript || "";
      if (!spoken) return;

      const input = document.getElementById("flashcardInput");
      const qType = question.type;

      if (qType === "text" || qType === "textarea") {
        if (input) input.value = spoken;
      } else if (qType === "number") {
        const num = parseFloat(spoken.replace(/[^0-9.]/g, ""));
        if (!isNaN(num) && input) input.value = num;
      } else if (qType === "select") {
        // Find closest option by spoken word
        const opts = Array.from(input?.options || []);
        const spokenNorm = spoken.toLowerCase();
        const match = opts.find(o =>
          o.value && (o.value.toLowerCase().includes(spokenNorm) ||
                       spokenNorm.includes(o.value.toLowerCase()) ||
                       o.text.toLowerCase().includes(spokenNorm))
        );
        if (match && input) input.value = match.value;
      } else if (qType === "multi_select") {
        const checkboxes = document.querySelectorAll(".multi-select input[type=checkbox]");
        const spokenNorm = spoken.toLowerCase();
        checkboxes.forEach(cb => {
          if (cb.value.toLowerCase().includes(spokenNorm) || spokenNorm.includes(cb.value.toLowerCase())) {
            cb.checked = true;
          }
        });
      } else if (qType === "slider") {
        const num = parseFloat(spoken.replace(/[^0-9.]/g, ""));
        if (!isNaN(num) && input) {
          input.value = Math.min(Math.max(num, Number(input.min || 0)), Number(input.max || 10));
          document.getElementById("sliderValue").textContent = input.value;
        }
      }

      showToast(`✓ "${spoken}"`, "success");
      if (btn) { btn.textContent = tUi("voiceInput"); btn.disabled = false; }

      // Auto-advance after 1.2 seconds
      setTimeout(() => { nextBtn?.click(); }, 1200);
    };

    rec.onerror = (evt) => {
      const errCode = String(evt?.error || "").toLowerCase();
      let micMsg;
      if (errCode.includes("not-allowed") || errCode.includes("service-not-allowed")) {
        micMsg = "Microphone blocked — please allow mic access in your browser settings.";
      } else if (errCode.includes("no-speech")) {
        micMsg = "No speech detected. Please speak clearly and try again.";
      } else if (errCode.includes("network")) {
        micMsg = "Network error with speech service. Check connection and try again.";
      } else {
        micMsg = "Could not capture voice. Please try again.";
      }
      showToast(micMsg, "error");
      if (btn) { btn.textContent = tUi("voiceInput"); btn.disabled = false; }
    };

    rec.onend = () => {
      if (btn && btn.disabled) { btn.textContent = tUi("voiceInput"); btn.disabled = false; }
    };

    rec.start();
  });

  if (question.id === "language_pref") {
    document.getElementById("flashcardInput")?.addEventListener("change", () => {
      if (globalVoiceRecognition && isVoiceControlActive) {
        globalVoiceRecognition.lang = getSpeechLang();
      }
    });
  }


  if (question.type === "slider") {
    const slider = document.getElementById("flashcardInput");
    const display = document.getElementById("sliderValue");
    slider?.addEventListener("input", () => {
      display.textContent = slider.value;
    });
  }

  if (question.type === "pain_map") {
    const data = flashcardAnswers._tmpPainMap || { areas: [], pins: [], view: "front", source: "default", imageUrl: "" };
    const shell = document.getElementById("painMapShell");
    const zoomRange = document.getElementById("zoomRange");
    const areaText = document.getElementById("selectedAreaText");
    const detectedAreaText = document.getElementById("detectedAreaText");
    const pinLayer = document.getElementById("painPinLayer");
    const painMapImage = document.getElementById("painMapImage");
    const viewSelect = document.getElementById("bodyViewSelect");
    const sourceSelect = document.getElementById("bodyImageSource");
    const bodyImageUrlWrap = document.getElementById("bodyImageUrlWrap");
    const bodyImageUploadWrap = document.getElementById("bodyImageUploadWrap");
    const bodyImageUrlInput = document.getElementById("bodyImageUrlInput");
    const bodyImageUploadInput = document.getElementById("bodyImageUploadInput");

    const defaultImage = () => DEFAULT_PAIN_MAP_IMAGE;
    const fallbackSvgImage = () => toSvgDataUri(getPainSvg(flashcardAnswers.gender || data.gender || "Male"));

    if (!data.imageUrl) {
      data.imageUrl = defaultImage();
    }

    const renderSourceFields = () => {
      if (bodyImageUrlWrap) {
        bodyImageUrlWrap.style.display = data.source === "web" ? "grid" : "none";
      }
      if (bodyImageUploadWrap) {
        bodyImageUploadWrap.style.display = data.source === "upload" ? "grid" : "none";
      }
    };

    const applyImage = (url) => {
      if (!url || !painMapImage) {
        return;
      }
      painMapImage.src = url;
      data.imageUrl = url;
    };

    const applyAreaStyles = () => {
      if (areaText) {
        areaText.textContent = data.areas.join(", ") || tUi("none");
      }
    };

    const renderPins = () => {
      pinLayer.innerHTML = data.pins
        .map(
          (pin, idx) =>
            `<button type="button" class="pain-pin" data-index="${idx}" style="left:${pin.x}%;top:${pin.y}%" title="${pin.area || "pain point"}">${idx + 1}</button>`
        )
        .join("");
    };

    applyAreaStyles();
    renderPins();
    renderSourceFields();

    painMapImage?.addEventListener("error", () => {
      if (painMapImage?.src && !painMapImage.src.includes("data:image/svg+xml")) {
        applyImage(fallbackSvgImage());
        showToast("Could not load anatomy image. Switched to fallback body map.", "error");
        return;
      }
      showToast("Unable to load this image URL. Check link or upload an image.", "error");
    });

    const getPointAndArea = (event) => {
      const rect = shell.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      if (x < 0 || x > 100 || y < 0 || y > 100) {
        return null;
      }
      const targetArea = detectBodyAreaByPoint(x, y, data.view || "front");
      return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        areaId: targetArea.id,
        areaLabel: targetArea.label,
      };
    };

    painMapImage?.addEventListener("mousemove", (event) => {
      const point = getPointAndArea(event);
      if (!point || !detectedAreaText) {
        return;
      }
      detectedAreaText.textContent = point.areaLabel;
    });

    painMapImage?.addEventListener("mouseleave", () => {
      if (detectedAreaText) {
        detectedAreaText.textContent = tUi("none");
      }
    });

    painMapImage?.addEventListener("click", (event) => {
      const point = getPointAndArea(event);
      if (!point) {
        return;
      }
      data.pins.push({ x: point.x, y: point.y, area: point.areaLabel, areaId: point.areaId });
      if (point.areaId !== "outside" && !data.areas.includes(point.areaLabel)) {
        data.areas.push(point.areaLabel);
      }
      applyAreaStyles();
      renderPins();
    });

    pinLayer?.addEventListener("click", (event) => {
      const pin = event.target.closest(".pain-pin");
      if (!pin) {
        return;
      }
      const idx = Number(pin.dataset.index);
      data.pins.splice(idx, 1);
      renderPins();
    });

    zoomRange?.addEventListener("input", () => {
      shell.style.setProperty("--zoom-scale", `${zoomRange.value / 100}`);
    });

    viewSelect?.addEventListener("change", () => {
      data.view = viewSelect.value;
      if (detectedAreaText) {
        detectedAreaText.textContent = tUi("none");
      }
    });

    sourceSelect?.addEventListener("change", () => {
      data.source = sourceSelect.value;
      if (data.source === "default") {
        applyImage(defaultImage());
      }
      renderSourceFields();
    });

    document.getElementById("applyBodyImageUrlBtn")?.addEventListener("click", () => {
      const url = bodyImageUrlInput?.value?.trim();
      if (!url) {
        showToast("Paste a valid image URL.", "error");
        return;
      }
      data.source = "web";
      applyImage(url);
      showToast("Web image loaded for pain mapping.");
    });

    bodyImageUploadInput?.addEventListener("change", async (event) => {
      const file = event.target?.files?.[0];
      if (!file) {
        return;
      }
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
      }).catch(() => "");

      if (!fileData) {
        showToast("Unable to read uploaded image.", "error");
        return;
      }
      data.source = "upload";
      applyImage(fileData);
      showToast("Uploaded image ready for pin pointing.");
    });

    document.getElementById("clearPinsBtn")?.addEventListener("click", () => {
      data.pins = [];
      renderPins();
      showToast("Pins cleared.");
    });

    flashcardAnswers._tmpPainMap = data;
  }

  if (question.type === "timeline") {
    document.getElementById("addTimelineRowBtn")?.addEventListener("click", () => {
      const wrapper = document.getElementById("timelineRows");
      if (!wrapper) {
        return;
      }
      const div = document.createElement("div");
      div.className = "card-lite timeline-row";
      div.innerHTML = `
        <label>Date<input type="date" class="timeline-date"></label>
        <label>When started<input type="text" class="timeline-when" placeholder="Example: after lunch"></label>
        <label>Intensity at start (0-10)<input type="number" min="0" max="10" class="timeline-intensity"></label>
        <label>Trend
          <select class="timeline-trend">
            <option value="">Select</option>
            <option value="Worse">Worse</option>
            <option value="Better">Better</option>
            <option value="Same">Same</option>
          </select>
        </label>
        <label>Note<input type="text" class="timeline-note"></label>
      `;
      wrapper.appendChild(div);
    });
  }

  if (question.type === "image_upload") {
    const input = document.getElementById("flashcardInput");
    const preview = document.getElementById("imagePreview");
    const startCameraBtn = document.getElementById("startCameraBtn");
    const captureImageBtn = document.getElementById("captureImageBtn");
    const stopCameraBtn = document.getElementById("stopCameraBtn");
    const cameraPreview = document.getElementById("cameraPreview");
    const cameraCanvas = document.getElementById("cameraCanvas");

    input?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file || !preview) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        preview.innerHTML = `<img src="${reader.result}" alt="uploaded preview">`;
      };
      reader.readAsDataURL(file);
    });

    startCameraBtn?.addEventListener("click", async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        showToast(tUi("cameraNotSupported"), "error");
        return;
      }

      try {
        activeCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (cameraPreview) {
          cameraPreview.srcObject = activeCameraStream;
          cameraPreview.style.display = "block";
        }
        if (captureImageBtn) {
          captureImageBtn.style.display = "inline-flex";
        }
        if (stopCameraBtn) {
          stopCameraBtn.style.display = "inline-flex";
        }
      } catch (_error) {
        showToast(tUi("cameraDenied"), "error");
      }
    });

    captureImageBtn?.addEventListener("click", () => {
      if (!cameraPreview || !cameraCanvas || !preview) {
        return;
      }
      const width = cameraPreview.videoWidth || 640;
      const height = cameraPreview.videoHeight || 480;
      cameraCanvas.width = width;
      cameraCanvas.height = height;
      const ctx = cameraCanvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.drawImage(cameraPreview, 0, 0, width, height);
      const dataUrl = cameraCanvas.toDataURL("image/png");
      preview.innerHTML = `<img src="${dataUrl}" alt="camera capture">`;
      showToast(tUi("captureSuccess"));
    });

    stopCameraBtn?.addEventListener("click", () => {
      stopActiveCameraStream();
      if (cameraPreview) {
        cameraPreview.srcObject = null;
        cameraPreview.style.display = "none";
      }
      if (captureImageBtn) {
        captureImageBtn.style.display = "none";
      }
      if (stopCameraBtn) {
        stopCameraBtn.style.display = "none";
      }
    });
  }

  document.getElementById("voiceBtn")?.addEventListener("click", startVoiceInput);
}

function speakQuestion(text) {
  if (!window.speechSynthesis) {
    showToast(tUi("speechOutNotSupported"), "error");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechLang();
  utterance.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const input = document.getElementById("flashcardInput");
  if (!SpeechRecognition || !input) {
    showToast("Voice input is not supported in this browser.", "error");
    return;
  }

  requestMicrophonePermission().then((allowed) => {
    if (!allowed) {
      showToast("Microphone permission blocked. Allow mic access and try again.", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang();
    recognition.interimResults = false;

    const btn = document.getElementById("voiceBtn");
    if (btn) {
      btn.textContent = tUi("listening");
    }

    recognition.onresult = (event) => {
      const spoken = event.results?.[0]?.[0]?.transcript || "";
      input.value = `${input.value ? `${input.value} ` : ""}${spoken}`;
    };

    recognition.onend = () => {
      if (btn) {
        btn.textContent = tUi("voiceInput");
      }
    };

    recognition.onerror = (event) => {
      const code = String(event?.error || "").toLowerCase();
      if (code.includes("not-allowed") || code.includes("service-not-allowed")) {
        showToast("Microphone permission blocked. Allow mic access and try again.", "error");
      } else if (code.includes("no-speech")) {
        showToast("No speech detected. Try again.", "error");
      }
      if (btn) {
        btn.textContent = tUi("voiceInput");
      }
    };

    recognition.start();
  });
}

function saveCurrentAnswer() {
  const question = flashcardQuestions[flashcardIndex];
  if (!question) {
    return;
  }

  let answer;

  if (question.type === "multi_select" || question.type === "family_multi_select") {
    answer = Array.from(document.querySelectorAll("input[type='checkbox']:checked")).map((el) => el.value);
  } else if (question.type === "family_radio") {
    answer = document.querySelector("input[name='familyRadio']:checked")?.value || "";
  } else if (question.type === "slider") {
    answer = document.getElementById("flashcardInput")?.value || "0";
  } else if (question.type === "pain_map") {
    answer = JSON.stringify(flashcardAnswers._tmpPainMap || { areas: [], pins: [] });
  } else if (question.type === "timeline") {
    answer = Array.from(document.querySelectorAll(".timeline-row")).map((row) => ({
      date: row.querySelector(".timeline-date")?.value || "",
      whenStarted: row.querySelector(".timeline-when")?.value || "",
      startIntensity: row.querySelector(".timeline-intensity")?.value || "",
      trend: row.querySelector(".timeline-trend")?.value || "",
      note: row.querySelector(".timeline-note")?.value || "",
    }));
  } else if (question.type === "image_upload") {
    const img = document.querySelector("#imagePreview img");
    answer = img ? img.src : "";
  } else {
    answer = document.getElementById("flashcardInput")?.value || "";
  }

  flashcardAnswers[question.id] = answer;

  if (currentSessionId) {
    postWithOfflineQueue("/api/qa_answers", {
      sessionId: currentSessionId,
      questionId: question.id,
      answer: typeof answer === "string" ? answer : JSON.stringify(answer),
    });
  }
}

function updateProgress() {
  progressText.textContent = `${tUi("question")} ${flashcardIndex + 1} ${tUi("of")} ${flashcardQuestions.length}`;
}

function computeCompleteness(answers) {
  const requiredFields = [
    "profile_name",
    "age",
    "gender",
    "symptoms",
    "pain_intensity",
    "timeline_entries",
    "food_recent",
    "sleep_pattern",
    "stress_level",
    "physical_activity",
  ];
  let filled = 0;
  requiredFields.forEach((field) => {
    const value = answers[field];
    if (Array.isArray(value)) {
      if (value.length) {
        filled += 1;
      }
      return;
    }
    if (typeof value === "object" && value !== null) {
      if (Object.keys(value).length) {
        filled += 1;
      }
      return;
    }
    if (String(value || "").trim()) {
      filled += 1;
    }
  });
  return Math.round((filled / requiredFields.length) * 100);
}

function detectUrgency(answers) {
  const flags = [];
  const text = String(answers.symptoms || "").toLowerCase();
  const severity = Number(answers.pain_intensity || 0);
  const trend = String(answers.symptom_change || "").toLowerCase();

  if (severity >= 8) {
    flags.push("High pain intensity detected.");
  }
  if (trend.includes("worse")) {
    flags.push("Symptoms are worsening.");
  }

  const dangerWords = ["chest pain", "breathing", "blood", "faint", "stroke", "seizure"];
  if (dangerWords.some((word) => text.includes(word))) {
    flags.push("Potential red-flag symptom found.");
  }

  if (!flags.length) {
    return { level: "Low", recommendation: "Continue monitoring and consult if symptoms persist.", flags };
  }

  if (flags.length >= 2) {
    return { level: "High", recommendation: "Immediate consultation recommended.", flags };
  }

  return { level: "Moderate", recommendation: "Consult doctor soon.", flags };
}

function detectPatterns(answers) {
  const current = String(answers.symptoms || "").toLowerCase();
  if (!current || !reportHistory.length) {
    return [];
  }

  const matches = [];
  for (const report of reportHistory) {
    const previous = String(report?.answers?.symptoms || report?.symptoms || "").toLowerCase();
    if (!previous) {
      continue;
    }
    const words = current.split(/\W+/).filter(Boolean);
    const overlap = words.filter((word) => word.length > 3 && previous.includes(word));
    if (overlap.length >= 2) {
      matches.push(`Repeated pattern with report from ${formatDate(report.createdAt)}.`);
      break;
    }
  }

  const food = String(answers.food_recent || "").toLowerCase();
  const spicy = String(answers.spicy_frequency || "").toLowerCase();
  if (food.includes("spicy") || spicy.includes("daily")) {
    matches.push("Possible trigger: symptoms may be linked to spicy/oily intake.");
  }

  return matches;
}

function getMenstrualInsight(answers) {
  if (answers.gender !== "Female" || !answers.last_period_date) {
    return "";
  }

  const painData = safeParse(answers.pain_location || "{}", {});
  const areas = painData.areas || [];
  if (!areas.includes("abdomen")) {
    return "";
  }

  const lastPeriod = new Date(answers.last_period_date);
  if (Number.isNaN(lastPeriod.getTime())) {
    return "";
  }

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % 28) + 28) % 28;
  if (cycleDay >= 24 && cycleDay <= 28) {
    return "Cycle may be approaching. Consider rest, hydration, and monitoring abdominal pain.";
  }
  return "";
}

function simplifyLanguage(text) {
  let simplified = text;
  Object.entries(glossaryMap).forEach(([medical, plain]) => {
    const regex = new RegExp(`\\b${medical}\\b`, "gi");
    simplified = simplified.replace(regex, plain);
  });
  return simplified;
}

function buildChecklist(answers, urgency, patterns) {
  const checklist = [
    "Explain symptom start and timeline clearly.",
    "Show pain map pin points to doctor.",
    "Mention medication currently in use.",
  ];

  if (urgency.level === "High") {
    checklist.push("Ask for immediate clinical evaluation.");
  }
  if (patterns.length) {
    checklist.push("Discuss repeated trigger pattern with doctor.");
  }
  if (answers.fear_notes) {
    checklist.push("Share fear/nervousness note so nothing is missed.");
  }

  return checklist;
}

function renderResultsHub(answers, summaryHtml, doctorSummary, checklist, analysis) {
  const urgencyBadgeClass = analysis.urgency.level === "High" ? "danger" : analysis.urgency.level === "Moderate" ? "warn" : "safe";

  flashcardContainer.innerHTML = `
    <div class="flashcard">
      <h3>Result Hub</h3>
      <p>Pre-consultation completeness score: <strong>${analysis.completeness}%</strong></p>
      <div class="insight-badges">
        <span class="badge ${urgencyBadgeClass}">Urgency: ${analysis.urgency.level}</span>
        <span class="badge">Pattern flags: ${analysis.patterns.length}</span>
      </div>
      <div class="results-tabs">
        <button class="results-tab active" data-tab="summary">Summary</button>
        <button class="results-tab" data-tab="doctor">Doctor View</button>
        <button class="results-tab" data-tab="checklist">Checklist</button>
      </div>
      <div class="results-panel active" id="tab-summary">
        <div class="summary">${summaryHtml}</div>
        <div class="actions" style="margin-top: 1rem;">
          <button id="downloadSummaryBtn" class="feature-btn">Download Full Report</button>
          <button id="emailSummaryBtn" class="feature-btn">Email Report</button>
        </div>
      </div>
      <div class="results-panel" id="tab-doctor">
        <div class="summary">${doctorSummary}</div>
      </div>
      <div class="results-panel" id="tab-checklist">
        <ul class="checklist">${checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
        <p class="muted">${analysis.urgency.recommendation}</p>
      </div>
    </div>
  `;

  document.querySelectorAll(".results-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".results-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".results-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add("active");
    });
  });

  document.getElementById("downloadSummaryBtn")?.addEventListener("click", () => {
    downloadSummary(summaryHtml, analysis);
  });

  document.getElementById("emailSummaryBtn")?.addEventListener("click", () => {
    const subject = encodeURIComponent("HealthSaathi Consultation Summary");
    const plain = summaryHtml
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const body = encodeURIComponent(plain);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });
}

function completeQASession() {
  stopActiveCameraStream();
  const completeness = computeCompleteness(flashcardAnswers);
  const urgency = detectUrgency(flashcardAnswers);
  const patterns = detectPatterns(flashcardAnswers);
  const menstrualInsight = getMenstrualInsight(flashcardAnswers);

  const summaryHtml = generateSummaryHtml(flashcardAnswers, urgency, patterns, menstrualInsight, completeness);
  const doctorSummary = generateDoctorSummary(flashcardAnswers, urgency, patterns);
  const checklist = buildChecklist(flashcardAnswers, urgency, patterns);

  const analysis = { completeness, urgency, patterns };
  renderResultsHub(flashcardAnswers, summaryHtml, doctorSummary, checklist, analysis);
  document.querySelector(".qa-controls").style.display = "none";

  saveReportToDatabase({
    title: `Health Assessment - ${new Date().toLocaleDateString()}`,
    createdAt: new Date().toISOString(),
    sessionId: currentSessionId,
    answers: flashcardAnswers,
    analysis,
    doctorSummary,
  });
}

function generateSummaryHtml(answers, urgency, patterns, menstrualInsight, completeness) {
  const pain = safeParse(answers.pain_location || "{}", {});
  const timeline = Array.isArray(answers.timeline_entries) ? answers.timeline_entries : safeParse(answers.timeline_entries || "[]", []);

  const symptomText = simplifyLanguage(String(answers.symptoms || "Not provided"));

  return `
    <strong>Name:</strong> ${answers.profile_name || "Not provided"}<br>
    <strong>Age / Sex:</strong> ${answers.age || "-"} / ${answers.gender || "-"}<br>
    <strong>Main Symptoms:</strong> ${symptomText}<br>
    <strong>Pain Intensity:</strong> ${answers.pain_intensity || "0"}/10<br>
    <strong>Pain Areas:</strong> ${(pain.areas || []).join(", ") || "Not specified"}<br>
    <strong>Pain Pins:</strong> ${(pain.pins || []).length} points tagged<br>
    <strong>Pain Type:</strong> ${(Array.isArray(answers.pain_type) ? answers.pain_type : safeParse(answers.pain_type || "[]", [])).join(", ") || "Not provided"}<br>
    <strong>Timeline Events:</strong> ${timeline.length || 0}<br>
    <strong>Food & Lifestyle:</strong> ${answers.food_recent || "-"}; sleep ${answers.sleep_pattern || "-"}; stress ${answers.stress_level || "-"}; activity ${answers.physical_activity || "-"}<br>
    <strong>Urgency:</strong> ${urgency.level} (${urgency.recommendation})<br>
    <strong>Pattern Detection:</strong> ${patterns.length ? patterns.join(" ") : "No repeated pattern found yet."}<br>
    <strong>Menstrual Insight:</strong> ${menstrualInsight || "Not applicable"}<br>
    <strong>Family Visibility:</strong> ${answers.share_to_family || "Not specified"}<br>
    <strong>Case Completeness:</strong> ${completeness}%
  `;
}

function generateDoctorSummary(answers, urgency, patterns) {
  const timeline = Array.isArray(answers.timeline_entries) ? answers.timeline_entries : safeParse(answers.timeline_entries || "[]", []);
  return `
    <strong>Doctor Quick Summary</strong><br>
    Symptom: ${simplifyLanguage(String(answers.symptoms || "N/A"))}.<br>
    Pain score: ${answers.pain_intensity || "0"}/10, trend: ${answers.symptom_change || "Not provided"}.<br>
    Timeline events captured: ${timeline.length}.<br>
    Risk level: ${urgency.level}. ${urgency.recommendation}<br>
    Trigger notes: ${patterns.length ? patterns.join(" ") : "No clear trigger yet."}
  `;
}

async function saveReportToDatabase(payload) {
  await postWithOfflineQueue("/api/reports", payload);
  await loadReports();
  renderDashboardRecommendation();
}

function downloadSummary(summaryHtml, analysis) {
  const plain = summaryHtml
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const blob = new Blob([
    `HealthSaathi Consultation Report\n\n${plain}\n\nUrgency: ${analysis.urgency.level}\nCompleteness: ${analysis.completeness}%`,
  ]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `healthsaathi-report-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function loadPreviousAnswers(_sessionId) {
  try {
    const response = await fetch("/api/qa_answers", { headers: getAuthHeaders() });
    if (!response.ok) {
      flashcardAnswers = {};
      return;
    }
    flashcardAnswers = await response.json();
    if (flashcardAnswers.timeline_entries && typeof flashcardAnswers.timeline_entries === "string") {
      flashcardAnswers.timeline_entries = safeParse(flashcardAnswers.timeline_entries, []);
    }
    if (flashcardAnswers.pain_type && typeof flashcardAnswers.pain_type === "string") {
      flashcardAnswers.pain_type = safeParse(flashcardAnswers.pain_type, []);
    }
    if (flashcardAnswers.share_specific_members && typeof flashcardAnswers.share_specific_members === "string") {
      flashcardAnswers.share_specific_members = safeParse(flashcardAnswers.share_specific_members, []);
    }
  } catch (_error) {
    flashcardAnswers = {};
  }
}

function openProfileModal() {
  const userEmail = window.HealthSaathiAuth.getCurrentUser();
  document.getElementById("profileEmail").value = userEmail;
  const savedProfile = safeParse(localStorage.getItem("healthsaathi_profile") || "{}", {});
  document.getElementById("profileName").value = savedProfile.name || "";
  document.getElementById("profileDob").value = savedProfile.dob || "";
  document.getElementById("profilePhone").value = savedProfile.phone || "";
  document.getElementById("profileCountryCode").value = savedProfile.countryCode || "+91";
  renderFamilyMemberSummary();
  profileModal.style.display = "flex";
}

function renderFamilyMemberSummary() {
  if (!familySummaryList) {
    return;
  }

  if (!familyMembers.length) {
    familySummaryList.innerHTML = '<p class="muted">No family members added yet.</p>';
    return;
  }

  familySummaryList.innerHTML = familyMembers
    .map(
      (member) => `
      <div class="family-summary-item">
        <div>
          <strong>${member.name}</strong>
          <p class="family-meta">${member.relation || "Family"} • ${member.isAppUser ? "Registered user" : member.inviteSent ? "Invite sent" : "Not registered"}</p>
        </div>
        <div class="family-actions-inline">
          <button type="button" class="family-edit-btn" data-family-edit-id="${member.id}">Edit</button>
          <button type="button" class="family-remove-btn" data-family-remove-id="${member.id}">Remove</button>
          ${member.email && !member.isAppUser ? `<button type="button" class="family-invite-btn" data-family-invite-id="${member.id}">Invite</button>` : ""}
        </div>
      </div>
    `
    )
    .join("");

  familySummaryList.querySelectorAll("[data-family-edit-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const memberId = Number(btn.dataset.familyEditId);
      const member = familyMembers.find((item) => item.id === memberId);
      openFamilyMemberModal(member || null);
    });
  });

  familySummaryList.querySelectorAll("[data-family-remove-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const memberId = Number(btn.dataset.familyRemoveId);
      try {
        const response = await fetch(`/api/family-members/${memberId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          showToast("Unable to remove family member.", "error");
          return;
        }
        await loadFamilyMembers();
        renderFamilyMemberSummary();
        showToast("Family member removed.");
      } catch (_error) {
        showToast("Unable to remove family member.", "error");
      }
    });
  });

  familySummaryList.querySelectorAll("[data-family-invite-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const memberId = Number(btn.dataset.familyInviteId);
      try {
        const response = await fetch(`/api/family-members/${memberId}/invite`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          showToast(body.error || "Unable to send invite.", "error");
          return;
        }
        if (body.mailto) {
          window.location.href = body.mailto;
          showToast("Invite prepared. Complete sending in your mail app.");
        } else {
          showToast(body.inviteMessage || "Invite sent.");
        }
        await loadFamilyMembers();
        renderFamilyMemberSummary();
      } catch (_error) {
        showToast("Unable to send invite.", "error");
      }
    });
  });
}

function openFamilyMemberModal(member = null) {
  if (!familyModal) {
    return;
  }
  document.getElementById("familyModalTitle").textContent = member ? "Edit Family Member" : "Add Family Member";
  document.getElementById("familyMemberId").value = member?.id || "";
  document.getElementById("familyDetailName").value = member?.name || "";
  document.getElementById("familyDetailRelation").value = member?.relation || "";
  document.getElementById("familyDetailEmail").value = member?.email || "";
  document.getElementById("familyDetailPhone").value = member?.phone || "";
  familyModal.style.display = "flex";
}

openFamilyModalBtn?.addEventListener("click", () => {
  openFamilyMemberModal(null);
});

cancelFamilyModalBtn?.addEventListener("click", () => {
  familyModal.style.display = "none";
});

familyDetailForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const memberId = document.getElementById("familyMemberId").value.trim();
  const payload = {
    name: document.getElementById("familyDetailName").value.trim(),
    relation: document.getElementById("familyDetailRelation").value.trim(),
    email: document.getElementById("familyDetailEmail").value.trim(),
    phone: document.getElementById("familyDetailPhone").value.trim(),
  };

  if (!payload.name) {
    showToast("Family member name is required.", "error");
    return;
  }

  try {
    if (memberId) {
      const response = await fetch(`/api/family-members/${memberId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        showToast("Unable to update family member.", "error");
        return;
      }
      showToast("Family member updated.");
    } else {
      await postWithOfflineQueue("/api/family-members", payload);
      showToast("Family member added.");
    }

    await loadFamilyMembers();
    familyModal.style.display = "none";
    renderFamilyMemberSummary();
  } catch (_error) {
    showToast("Unable to save family member.", "error");
  }
});

cancelProfileBtn.addEventListener("click", () => {
  profileModal.style.display = "none";
});

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const profile = {
    name: document.getElementById("profileName").value.trim(),
    dob: document.getElementById("profileDob").value,
    phone: document.getElementById("profilePhone").value.trim(),
    countryCode: document.getElementById("profileCountryCode").value,
  };

  localStorage.setItem("healthsaathi_profile", JSON.stringify(profile));
  if (profile.name) {
    userNameEl.textContent = profile.name;
  }

  profileModal.style.display = "none";
  renderDashboardPrimaryAction();
  showToast("Profile saved.");
});

function loadProfile() {
  const profile = safeParse(localStorage.getItem("healthsaathi_profile") || "{}", {});
  if (profile.name) {
    userNameEl.textContent = profile.name;
  }
}

async function loadFamilyMembers() {
  try {
    const response = await fetch("/api/family-members", { headers: getAuthHeaders() });
    if (!response.ok) {
      familyMembers = [];
      return;
    }
    familyMembers = await response.json();
  } catch (_error) {
    familyMembers = [];
  }
}

async function loadDoctors() {
  try {
    const response = await fetch("/api/doctors", { headers: getAuthHeaders() });
    if (!response.ok) {
      doctorDirectory = [];
      return;
    }
    doctorDirectory = await response.json();
  } catch (_error) {
    doctorDirectory = [];
  }
}

async function loadReports() {
  try {
    const response = await fetch("/api/reports", { headers: getAuthHeaders() });
    if (!response.ok) {
      reportHistory = [];
      return;
    }
    reportHistory = await response.json();
  } catch (_error) {
    reportHistory = [];
  }

  renderDashboardPrimaryAction();
}

function renderDashboardRecommendation() {
  const existing = document.getElementById("dashboardInsight");
  if (existing) {
    existing.remove();
  }

  const latest = reportHistory[0];
  const message = latest?.analysis?.urgency?.level === "High"
    ? "Latest report suggests urgent consultation."
    : reportHistory.length > 1
    ? "Trend data available. Review calendar and reports for continuity."
    : "Start a Q&A session to generate your first structured report.";

  const el = document.createElement("p");
  el.id = "dashboardInsight";
  el.className = "muted";
  el.textContent = message;
  document.querySelector(".welcome-section")?.appendChild(el);
}

function openReportsHub() {
  qaContainer.style.display = "block";
  document.querySelector(".qa-controls").style.display = "none";

  const rows = reportHistory.length
    ? reportHistory
        .map(
          (report) => `
        <li class="history-item">
          <div>
            <strong>${report.title || "Consultation report"}</strong>
            <p class="history-meta">${formatDate(report.createdAt)}</p>
          </div>
          <button class="feature-btn" data-report-id="${report.id}">Delete</button>
        </li>
      `
        )
        .join("")
    : "<p class='muted'>No reports available yet.</p>";

  flashcardContainer.innerHTML = `
    <div class="flashcard">
      <h3>Reports Hub</h3>
      <ul class="history-list">${rows}</ul>
    </div>
  `;

  document.querySelectorAll("[data-report-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await fetch(`/api/reports/${btn.dataset.reportId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await loadReports();
      openReportsHub();
      renderDashboardRecommendation();
    });
  });
}

async function openDocumentsHub() {
  qaContainer.style.display = "block";
  document.querySelector(".qa-controls").style.display = "none";

  let docs = [];
  try {
    const response = await fetch("/api/documents", { headers: getAuthHeaders() });
    if (response.ok) {
      docs = await response.json();
    }
  } catch (_error) {
    docs = [];
  }

  flashcardContainer.innerHTML = `
    <div class="flashcard">
      <h3>Prescription & Documents Keeper</h3>
      <form id="documentForm" class="login-form">
        <input id="docTitle" type="text" placeholder="Document title (optional if file selected)">
        <textarea id="docNotes" rows="3" placeholder="Notes / prescription details"></textarea>
        <input id="docFile" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx">
        <p class="muted">Upload prescriptions/reports and keep them safe. Max recommended size: 4MB.</p>
        <button type="submit" class="feature-btn">Add Document</button>
      </form>
      <ul class="history-list">
        ${docs
          .map(
            (doc) => `
          <li class="history-item">
            <div>
              <strong>${doc.title}</strong>
              <p class="history-meta">${doc.notes || "No notes"}</p>
              <p class="history-meta">${doc.fileName ? `File: ${doc.fileName}` : ""}</p>
            </div>
            ${doc.fileData ? `<button class="feature-btn" data-doc-download="${doc.id}">Download</button>` : ""}
            <button class="feature-btn" data-doc-id="${doc.id}">Delete</button>
          </li>
        `
          )
          .join("") || "<p class='muted'>No documents yet.</p>"}
      </ul>
    </div>
  `;

  document.getElementById("documentForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("docTitle").value.trim();
    const notes = document.getElementById("docNotes").value.trim();
    const file = document.getElementById("docFile")?.files?.[0];

    if (!title && !file) {
      showToast("Please add a title or upload a file.", "error");
      return;
    }

    let fileData = "";
    let fileName = "";
    let fileMime = "";

    if (file) {
      fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      }).catch(() => "");
      fileName = file.name;
      fileMime = file.type || "application/octet-stream";
    }

    const response = await postWithOfflineQueue("/api/documents", {
      title,
      notes,
      fileName,
      fileMime,
      fileData,
      createdAt: new Date().toISOString(),
    });

    if (response && !response.ok) {
      const body = await response.json().catch(() => ({}));
      showToast(body.error || "Unable to save document.", "error");
      return;
    }

    showToast(response ? "Document saved." : "Document saved offline and queued for sync.");
    openDocumentsHub();
  });

  const docsById = new Map(docs.map((doc) => [String(doc.id), doc]));

  document.querySelectorAll("[data-doc-download]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const doc = docsById.get(String(btn.dataset.docDownload));
      if (!doc?.fileData) {
        return;
      }
      const a = document.createElement("a");
      a.href = doc.fileData;
      a.download = doc.fileName || `${doc.title || "document"}.bin`;
      a.click();
    });
  });

  document.querySelectorAll("[data-doc-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const response = await fetch(`/api/documents/${btn.dataset.docId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          showToast("Unable to delete document.", "error");
          return;
        }
        showToast("Document deleted.");
        openDocumentsHub();
      } catch (_error) {
        showToast("Unable to delete document.", "error");
      }
    });
  });
}

async function openCalendarHub() {
  qaContainer.style.display = "block";
  document.querySelector(".qa-controls").style.display = "none";
  await loadReports();

  let visits = [];
  try {
    const response = await fetch("/api/calendar", { headers: getAuthHeaders() });
    if (response.ok) {
      visits = await response.json();
    }
  } catch (_error) {
    visits = [];
  }

  const reportEvents = reportHistory.flatMap((report) => {
    const events = [];
    const reportDate = new Date(report.createdAt);
    if (!Number.isNaN(reportDate.getTime())) {
      events.push({
        date: reportDate.toISOString().slice(0, 10),
        type: "symptom",
        note: `Symptom reported: ${String(report?.answers?.symptoms || "general update").slice(0, 70)}`,
      });
    }

    const timelineRows = Array.isArray(report?.answers?.timeline_entries)
      ? report.answers.timeline_entries
      : safeParse(report?.answers?.timeline_entries || "[]", []);

    timelineRows.forEach((row) => {
      if (row?.date) {
        events.push({
          date: row.date,
          type: "symptom",
          note: `Timeline: ${row.whenStarted || "symptom event"} (${row.trend || "update"})`,
        });
      }
    });

    return events;
  });

  const visitEvents = visits.map((entry) => ({
    date: String(entry.date).slice(0, 10),
    type: "visit",
    note: entry.note,
  }));

  const allEvents = [...reportEvents, ...visitEvents];
  const eventsByDate = allEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let currentMonth = new Date();
  let selectedDate = null;

  flashcardContainer.innerHTML = `
    <div class="flashcard">
      <h3>Health Timeline Calendar</h3>
      <p class="muted">Symptom-reported days and doctor-visit days are shown together.</p>
      <div class="calendar-legend" aria-label="Calendar legend">
        <span><i class="dot symptom"></i> Symptom reported</span>
        <span><i class="dot visit"></i> Doctor visit</span>
      </div>
      <div class="calendar-toolbar">
        <button type="button" id="calendarPrevBtn" class="control-btn">Prev</button>
        <h4 id="calendarMonthLabel" class="calendar-month-label"></h4>
        <button type="button" id="calendarNextBtn" class="control-btn">Next</button>
      </div>
      <div class="calendar-weekdays">
        ${weekdayNames.map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div id="calendarGrid" class="calendar-grid-visual"></div>
      <div id="calendarDaySummary" class="calendar-day-summary muted">Click a highlighted date for details.</div>
      <form id="calendarForm" class="login-form" style="margin-top: 1rem;">
        <input id="visitDate" type="date" required>
        <input id="visitNote" type="text" placeholder="Add doctor visit note" required>
        <button type="submit" class="feature-btn">Add Visit Event</button>
      </form>
    </div>
  `;

  const renderMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    document.getElementById("calendarMonthLabel").textContent = `${monthNames[month]} ${year}`;

    const cells = [];
    for (let i = 0; i < startOffset; i += 1) {
      cells.push('<div class="calendar-cell empty"></div>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = eventsByDate[dateStr] || [];
      const hasVisit = dayEvents.some((e) => e.type === "visit");
      const hasSymptom = dayEvents.some((e) => e.type === "symptom");
      const classes = ["calendar-cell"];
      if (hasSymptom) {
        classes.push("has-symptom");
      }
      if (hasVisit) {
        classes.push("has-visit");
      }
      if (selectedDate === dateStr) {
        classes.push("active");
      }

      cells.push(`
        <button type="button" class="${classes.join(" ")}" data-date="${dateStr}">
          <span class="day-num">${day}</span>
          <span class="calendar-dots">
            ${hasSymptom ? '<i class="dot symptom"></i>' : ""}
            ${hasVisit ? '<i class="dot visit"></i>' : ""}
          </span>
        </button>
      `);
    }

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = cells.join("");

    const todayStr = new Date().toISOString().slice(0, 10);
    if (!selectedDate && eventsByDate[todayStr]) {
      selectedDate = todayStr;
    }

    if (selectedDate) {
      const activeEvents = eventsByDate[selectedDate] || [];
      const activeSummary = activeEvents.length
        ? activeEvents
            .map((event) => `<li><strong>${event.type === "visit" ? "Doctor Visit" : "Symptom Report"}</strong>: ${event.note}</li>`)
            .join("")
        : "<li>No events logged for this day.</li>";
      document.getElementById("calendarDaySummary").innerHTML = `<strong>${selectedDate}</strong><ul class="calendar-insight">${activeSummary}</ul>`;
    }

    grid.querySelectorAll(".calendar-cell[data-date]").forEach((cell) => {
      cell.addEventListener("click", () => {
        selectedDate = cell.dataset.date;
        renderMonth();
        const dayEvents = eventsByDate[selectedDate] || [];
        const details = dayEvents.length
          ? dayEvents
              .map((event) => `<li><strong>${event.type === "visit" ? "Doctor Visit" : "Symptom Report"}</strong>: ${event.note}</li>`)
              .join("")
          : "<li>No events logged for this day.</li>";
        document.getElementById("calendarDaySummary").innerHTML = `<strong>${selectedDate}</strong><ul class="calendar-insight">${details}</ul>`;
      });
    });
  };

  document.getElementById("calendarPrevBtn")?.addEventListener("click", () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    renderMonth();
  });

  document.getElementById("calendarNextBtn")?.addEventListener("click", () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    renderMonth();
  });

  renderMonth();

  document.getElementById("calendarForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = document.getElementById("visitDate").value;
    const note = document.getElementById("visitNote").value.trim();
    if (!date || !note) {
      return;
    }
    await postWithOfflineQueue("/api/calendar", { date, note, createdAt: new Date().toISOString() });
    await loadReports();
    openCalendarHub();
  });
}

async function openChatHub() {
  qaContainer.style.display = "block";
  document.querySelector(".qa-controls").style.display = "none";

  const role = window.HealthSaathiAuth.getCurrentRole();
  await loadDoctors();

  const doctorSelector = role === "doctor"
    ? '<input id="doctorTargetEmail" type="email" placeholder="Patient email for doctor view">'
    : `
      <select id="doctorTargetEmail" required>
        <option value="">Select your doctor</option>
        ${doctorDirectory.map((doctor) => `<option value="${doctor.email}">${doctor.email}</option>`).join("")}
      </select>
    `;

  flashcardContainer.innerHTML = `
    <div class="flashcard">
      <h3>Doctor-Patient Chat</h3>
      <p class="muted">${role === "doctor" ? "Pick a patient thread to reply to. " : "Pick the doctor you want to send this to. "}Messages are kept in separate threads per doctor.</p>
      ${doctorSelector}
      <div id="chatMessages" class="chat-messages"></div>
      <div class="dynamic-row">
        <input id="chatInput" type="text" placeholder="Type your message">
        <button id="chatSendBtn" class="feature-btn">Send</button>
      </div>
    </div>
  `;

  const loadMessages = async () => {
    const target = document.getElementById("doctorTargetEmail")?.value.trim();
    const query = role === "doctor"
      ? (target ? `?patientEmail=${encodeURIComponent(target)}` : "")
      : (target ? `?doctorEmail=${encodeURIComponent(target)}` : "");
    let messages = [];
    try {
      const response = await fetch(`/api/chat${query}`, { headers: getAuthHeaders() });
      if (response.ok) {
        messages = await response.json();
      }
    } catch (_error) {
      messages = [];
    }

    const messagesHtml = messages
      .map((msg) => `<div class="chat-message"><strong>${msg.sender}:</strong> ${msg.text}</div>`)
      .join("");
    document.getElementById("chatMessages").innerHTML = messagesHtml || '<p class="muted">No messages yet.</p>';
  };

  await loadMessages();

  document.getElementById("doctorTargetEmail")?.addEventListener("change", loadMessages);
  document.getElementById("chatSendBtn")?.addEventListener("click", async () => {
    const text = document.getElementById("chatInput").value.trim();
    if (!text) {
      return;
    }
    const target = document.getElementById("doctorTargetEmail")?.value.trim();
    const sender = window.HealthSaathiAuth.getCurrentRole() === "doctor" ? "Doctor" : "Patient";
    await postWithOfflineQueue("/api/chat", {
      sender,
      text,
      createdAt: new Date().toISOString(),
      patientEmail: role === "doctor" ? (target || undefined) : undefined,
      doctorEmail: role !== "doctor" ? (target || undefined) : undefined,
    });
    document.getElementById("chatInput").value = "";
    await loadMessages();
  });
}
