/**
 * HealthSaathi — i18n Translations
 * Supported: English (en), Hindi (hi), Marathi (mr), Kannada (kn), Tamil (ta), Malayalam (ml)
 *
 * Usage:
 *   Add  data-i18n="key"  to any element whose textContent should translate.
 *   Add  data-i18n-ph="key"  for input placeholder translation.
 *   Call  HS_i18n.setLang('hi')  to switch language.
 *   Current lang stored in localStorage key  'hs_lang'.
 */

window.HS_i18n = (function () {

  const TRANSLATIONS = {

    /* ─────────────── ENGLISH ─────────────── */
    en: {
      lang_name:           'English',
      app_subtitle:        'Your Health Companion',
      greeting_morning:    'Good morning',
      greeting_afternoon:  'Good afternoon',
      greeting_evening:    'Good evening',
      welcome_back:        'Welcome back,',
      ready_consult:       'Ready to prepare for your next consultation?',
      start_qa:            'Start Q&A Session',
      take_tour:           'Take a Tour',
      loading:             'Loading…',
      offline_msg:         'Checking connection...',
      sync_now:            'Sync Now',
      voice_off:           'Voice control: off',
      voice_on:            'Voice control: on (listening…)',
      stat_reports:        '0 Reports',
      stat_visits:         '0 Visits',
      stat_chat:           'Chat ready',

      card_reports_title:  'Reports',
      card_reports_desc:   'View and download your consultation summaries. Share directly with your doctor or family members.',
      view_reports:        'View Reports',

      card_calendar_title: 'Calendar',
      card_calendar_desc:  'Track doctor visits, symptom events, and health patterns across a visual timeline calendar.',
      view_calendar:       'View Calendar',

      card_docs_title:     'Documents',
      card_docs_desc:      'Store prescriptions, lab reports, and medical documents securely. Upload and access anytime.',
      view_docs:           'View Documents',

      card_chat_title:     'Chat',
      card_chat_desc:      'Communicate directly with your doctor. Send messages, share reports, and get follow-up guidance.',
      start_chat:          'Start Chat',

      edit_profile:        'Edit Profile',
      take_tour_again:     'Take Tour Again',
      logout:              'Logout',

      profile_modal_title: 'Edit Profile',
      profile_name:        'Full Name',
      profile_email:       'Email',
      profile_dob:         'Date of Birth',
      profile_phone:       'Phone',
      profile_family:      'Family Members',
      profile_add_family:  '+ Add Family Member',
      profile_cancel:      'Cancel',
      profile_save:        'Save Profile',

      family_modal_title:  'Add Family Member',
      family_name:         'Name',
      family_relation:     'Relation',
      family_email:        'Email',
      family_phone:        'Phone',
      family_save:         'Save Member',

      tour_step1_title:    '👋 Welcome to Your Dashboard',
      tour_step1_desc:     'This is your health command centre. See your name, quick stats, and jump into a Q&A session — all from right here.',
      tour_step2_title:    '⚡ Start a Q&A Session',
      tour_step2_desc:     'Tap this to begin a guided symptom intake — describe what you\'re feeling step by step before your doctor visit.',
      tour_step3_title:    '🗂️ Your Health Features',
      tour_step3_desc:     'Reports, Calendar, Documents, and Chat — everything you need to manage and share your health information.',
      tour_step4_title:    '📄 Smart Reports',
      tour_step4_desc:     'After completing a Q&A session, a structured doctor-ready report is auto-generated here. You can download, email, or share it.',
      tour_step5_title:    '🎤 Voice Input',
      tour_step5_desc:     'Tap the microphone to enable voice input. You can fill in symptom answers just by speaking — great for multi-tasking!',
      tour_step6_title:    '👤 Your Profile',
      tour_step6_desc:     'Access your profile, add family members, restart this tour, or log out from here. You\'re all set!',
      tour_skip:           'Skip tour',
      tour_next:           'Next',
      tour_finish:         'Finish',
    },

    /* ─────────────── HINDI ─────────────── */
    hi: {
      lang_name:           'हिंदी',
      app_subtitle:        'आपका स्वास्थ्य साथी',
      greeting_morning:    'शुभ प्रभात',
      greeting_afternoon:  'शुभ अपराह्न',
      greeting_evening:    'शुभ संध्या',
      welcome_back:        'वापसी पर स्वागत है,',
      ready_consult:       'क्या आप अपने अगले परामर्श की तैयारी के लिए तैयार हैं?',
      start_qa:            'प्रश्नोत्तर सत्र शुरू करें',
      take_tour:           'दौरा करें',
      loading:             'लोड हो रहा है…',
      offline_msg:         'कनेक्शन जाँच रहे हैं...',
      sync_now:            'अभी सिंक करें',
      voice_off:           'वॉइस नियंत्रण: बंद',
      voice_on:            'वॉइस नियंत्रण: चालू (सुन रहा है…)',
      stat_reports:        '0 रिपोर्ट',
      stat_visits:         '0 दौरे',
      stat_chat:           'चैट तैयार',

      card_reports_title:  'रिपोर्ट',
      card_reports_desc:   'अपनी परामर्श सारांशों को देखें और डाउनलोड करें। सीधे अपने डॉक्टर या परिवार के सदस्यों के साथ साझा करें।',
      view_reports:        'रिपोर्ट देखें',

      card_calendar_title: 'कैलेंडर',
      card_calendar_desc:  'डॉक्टर के दौरे, लक्षण घटनाओं और स्वास्थ्य पैटर्न को विज़ुअल टाइमलाइन कैलेंडर पर ट्रैक करें।',
      view_calendar:       'कैलेंडर देखें',

      card_docs_title:     'दस्तावेज़',
      card_docs_desc:      'प्रिस्क्रिप्शन, लैब रिपोर्ट और मेडिकल दस्तावेज़ सुरक्षित रूप से संग्रहीत करें। कभी भी अपलोड और एक्सेस करें।',
      view_docs:           'दस्तावेज़ देखें',

      card_chat_title:     'चैट',
      card_chat_desc:      'अपने डॉक्टर से सीधे संवाद करें। संदेश भेजें, रिपोर्ट साझा करें और अनुवर्ती मार्गदर्शन प्राप्त करें।',
      start_chat:          'चैट शुरू करें',

      edit_profile:        'प्रोफ़ाइल संपादित करें',
      take_tour_again:     'दौरा फिर करें',
      logout:              'लॉगआउट',

      profile_modal_title: 'प्रोफ़ाइल संपादित करें',
      profile_name:        'पूरा नाम',
      profile_email:       'ईमेल',
      profile_dob:         'जन्म तिथि',
      profile_phone:       'फ़ोन',
      profile_family:      'परिवार के सदस्य',
      profile_add_family:  '+ परिवार सदस्य जोड़ें',
      profile_cancel:      'रद्द करें',
      profile_save:        'प्रोफ़ाइल सहेजें',

      family_modal_title:  'परिवार सदस्य जोड़ें',
      family_name:         'नाम',
      family_relation:     'संबंध',
      family_email:        'ईमेल',
      family_phone:        'फ़ोन',
      family_save:         'सदस्य सहेजें',

      tour_step1_title:    '👋 आपके डैशबोर्ड में आपका स्वागत है',
      tour_step1_desc:     'यह आपका स्वास्थ्य नियंत्रण केंद्र है। अपना नाम, त्वरित आँकड़े देखें और Q&A सत्र शुरू करें — सब यहीं से।',
      tour_step2_title:    '⚡ Q&A सत्र शुरू करें',
      tour_step2_desc:     'डॉक्टर के दौरे से पहले चरण-दर-चरण अपने लक्षण बताने के लिए इसे टैप करें।',
      tour_step3_title:    '🗂️ आपकी स्वास्थ्य सुविधाएँ',
      tour_step3_desc:     'रिपोर्ट, कैलेंडर, दस्तावेज़ और चैट — आपकी स्वास्थ्य जानकारी प्रबंधित और साझा करने के लिए सब कुछ।',
      tour_step4_title:    '📄 स्मार्ट रिपोर्ट',
      tour_step4_desc:     'Q&A सत्र पूरा करने के बाद, एक संरचित डॉक्टर-तैयार रिपोर्ट यहाँ स्वतः बन जाती है।',
      tour_step5_title:    '🎤 वॉइस इनपुट',
      tour_step5_desc:     'वॉइस इनपुट सक्षम करने के लिए माइक्रोफ़ोन टैप करें। बोलकर ही लक्षण भरें!',
      tour_step6_title:    '👤 आपकी प्रोफ़ाइल',
      tour_step6_desc:     'यहाँ से प्रोफ़ाइल, परिवार सदस्य, दौरा या लॉगआउट एक्सेस करें। आप तैयार हैं!',
      tour_skip:           'छोड़ें',
      tour_next:           'अगला',
      tour_finish:         'समाप्त',
    },

    /* ─────────────── MARATHI ─────────────── */
    mr: {
      lang_name:           'मराठी',
      app_subtitle:        'तुमचा आरोग्य साथी',
      greeting_morning:    'शुभ प्रभात',
      greeting_afternoon:  'शुभ मध्यान्ह',
      greeting_evening:    'शुभ संध्या',
      welcome_back:        'परत स्वागत आहे,',
      ready_consult:       'तुमच्या पुढील सल्ल्यासाठी तयार आहात का?',
      start_qa:            'प्रश्नोत्तर सत्र सुरू करा',
      take_tour:           'फेरफटका मारा',
      loading:             'लोड होत आहे…',
      offline_msg:         'कनेक्शन तपासत आहे...',
      sync_now:            'आत्ता सिंक करा',
      voice_off:           'व्हॉइस नियंत्रण: बंद',
      voice_on:            'व्हॉइस नियंत्रण: सुरू (ऐकत आहे…)',
      stat_reports:        '0 अहवाल',
      stat_visits:         '0 भेटी',
      stat_chat:           'चॅट तयार आहे',

      card_reports_title:  'अहवाल',
      card_reports_desc:   'तुमचे सल्ला सारांश पाहा आणि डाउनलोड करा. थेट डॉक्टर किंवा कुटुंबासाठी शेअर करा.',
      view_reports:        'अहवाल पाहा',

      card_calendar_title: 'दिनदर्शिका',
      card_calendar_desc:  'डॉक्टरांच्या भेटी, लक्षण घटना आणि आरोग्य नमुने व्हिज्युअल कॅलेंडरवर ट्रॅक करा.',
      view_calendar:       'दिनदर्शिका पाहा',

      card_docs_title:     'दस्तऐवज',
      card_docs_desc:      'प्रिस्क्रिप्शन, लॅब रिपोर्ट आणि वैद्यकीय दस्तऐवज सुरक्षितपणे साठवा. कधीही अपलोड करा आणि ऍक्सेस करा.',
      view_docs:           'दस्तऐवज पाहा',

      card_chat_title:     'चॅट',
      card_chat_desc:      'तुमच्या डॉक्टरांशी थेट संवाद साधा. संदेश पाठवा, अहवाल शेअर करा आणि पाठपुरावा मार्गदर्शन मिळवा.',
      start_chat:          'चॅट सुरू करा',

      edit_profile:        'प्रोफाइल संपादित करा',
      take_tour_again:     'पुन्हा फेरफटका मारा',
      logout:              'लॉगआउट',

      profile_modal_title: 'प्रोफाइल संपादित करा',
      profile_name:        'पूर्ण नाव',
      profile_email:       'ईमेल',
      profile_dob:         'जन्म तारीख',
      profile_phone:       'फोन',
      profile_family:      'कुटुंब सदस्य',
      profile_add_family:  '+ कुटुंब सदस्य जोडा',
      profile_cancel:      'रद्द करा',
      profile_save:        'प्रोफाइल जतन करा',

      family_modal_title:  'कुटुंब सदस्य जोडा',
      family_name:         'नाव',
      family_relation:     'नाते',
      family_email:        'ईमेल',
      family_phone:        'फोन',
      family_save:         'सदस्य जतन करा',

      tour_step1_title:    '👋 तुमच्या डॅशबोर्डमध्ये स्वागत आहे',
      tour_step1_desc:     'हे तुमचे आरोग्य नियंत्रण केंद्र आहे. नाव, आकडेवारी पाहा आणि Q&A सत्र सुरू करा — सर्व येथून.',
      tour_step2_title:    '⚡ Q&A सत्र सुरू करा',
      tour_step2_desc:     'डॉक्टरांच्या भेटीपूर्वी टप्प्याटप्प्याने लक्षणे सांगण्यासाठी हे टॅप करा.',
      tour_step3_title:    '🗂️ तुमची आरोग्य वैशिष्ट्ये',
      tour_step3_desc:     'अहवाल, दिनदर्शिका, दस्तऐवज आणि चॅट — आरोग्य माहिती व्यवस्थापित करण्यासाठी सर्व काही.',
      tour_step4_title:    '📄 स्मार्ट अहवाल',
      tour_step4_desc:     'Q&A सत्र पूर्ण केल्यानंतर, डॉक्टर-तयार अहवाल येथे स्वयंचलितपणे तयार होतो.',
      tour_step5_title:    '🎤 व्हॉइस इनपुट',
      tour_step5_desc:     'व्हॉइस इनपुट सक्षम करण्यासाठी मायक्रोफोन टॅप करा. बोलून लक्षणे भरा!',
      tour_step6_title:    '👤 तुमची प्रोफाइल',
      tour_step6_desc:     'येथून प्रोफाइल, कुटुंब सदस्य, फेरफटका किंवा लॉगआउट ऍक्सेस करा. तयार आहात!',
      tour_skip:           'वगळा',
      tour_next:           'पुढे',
      tour_finish:         'समाप्त',
    },

    /* ─────────────── KANNADA ─────────────── */
    kn: {
      lang_name:           'ಕನ್ನಡ',
      app_subtitle:        'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಂಗಾತಿ',
      greeting_morning:    'ಶುಭ ಬೆಳಗು',
      greeting_afternoon:  'ಶುಭ ಮಧ್ಯಾಹ್ನ',
      greeting_evening:    'ಶುಭ ಸಂಜೆ',
      welcome_back:        'ಮರಳಿ ಸ್ವಾಗತ,',
      ready_consult:       'ನಿಮ್ಮ ಮುಂದಿನ ಸಮಾಲೋಚನೆಗೆ ತಯಾರಾಗಿದ್ದೀರಾ?',
      start_qa:            'ಪ್ರಶ್ನೋತ್ತರ ಅವಧಿ ಪ್ರಾರಂಭಿಸಿ',
      take_tour:           'ಪ್ರವಾಸ ತೆಗೆದುಕೊಳ್ಳಿ',
      loading:             'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
      offline_msg:         'ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
      sync_now:            'ಈಗ ಸಿಂಕ್ ಮಾಡಿ',
      voice_off:           'ಧ್ವನಿ ನಿಯಂತ್ರಣ: ಆಫ್',
      voice_on:            'ಧ್ವನಿ ನಿಯಂತ್ರಣ: ಆನ್ (ಆಲಿಸುತ್ತಿದೆ…)',
      stat_reports:        '0 ವರದಿಗಳು',
      stat_visits:         '0 ಭೇಟಿಗಳು',
      stat_chat:           'ಚಾಟ್ ಸಿದ್ಧ',

      card_reports_title:  'ವರದಿಗಳು',
      card_reports_desc:   'ನಿಮ್ಮ ಸಮಾಲೋಚನೆ ಸಾರಾಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ. ನಿಮ್ಮ ವೈದ್ಯರು ಅಥವಾ ಕುಟುಂಬದೊಂದಿಗೆ ನೇರವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ.',
      view_reports:        'ವರದಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ',

      card_calendar_title: 'ಕ್ಯಾಲೆಂಡರ್',
      card_calendar_desc:  'ವೈದ್ಯರ ಭೇಟಿಗಳು, ರೋಗಲಕ್ಷಣ ಘಟನೆಗಳು ಮತ್ತು ಆರೋಗ್ಯ ಮಾದರಿಗಳನ್ನು ದೃಶ್ಯ ಟೈಮ್‌ಲೈನ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
      view_calendar:       'ಕ್ಯಾಲೆಂಡರ್ ವೀಕ್ಷಿಸಿ',

      card_docs_title:     'ದಾಖಲೆಗಳು',
      card_docs_desc:      'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು, ಲ್ಯಾಬ್ ರಿಪೋರ್ಟ್‌ಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ.',
      view_docs:           'ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',

      card_chat_title:     'ಚಾಟ್',
      card_chat_desc:      'ನಿಮ್ಮ ವೈದ್ಯರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂವಹನ ನಡೆಸಿ. ಸಂದೇಶಗಳನ್ನು ಕಳುಹಿಸಿ, ವರದಿಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.',
      start_chat:          'ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ',

      edit_profile:        'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
      take_tour_again:     'ಮತ್ತೆ ಪ್ರವಾಸ ತೆಗೆದುಕೊಳ್ಳಿ',
      logout:              'ಲಾಗ್‌ಔಟ್',

      profile_modal_title: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
      profile_name:        'ಪೂರ್ಣ ಹೆಸರು',
      profile_email:       'ಇಮೇಲ್',
      profile_dob:         'ಜನ್ಮ ದಿನಾಂಕ',
      profile_phone:       'ಫೋನ್',
      profile_family:      'ಕುಟುಂಬ ಸದಸ್ಯರು',
      profile_add_family:  '+ ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ',
      profile_cancel:      'ರದ್ದುಮಾಡಿ',
      profile_save:        'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ',

      family_modal_title:  'ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ',
      family_name:         'ಹೆಸರು',
      family_relation:     'ಸಂಬಂಧ',
      family_email:        'ಇಮೇಲ್',
      family_phone:        'ಫೋನ್',
      family_save:         'ಸದಸ್ಯರನ್ನು ಉಳಿಸಿ',

      tour_step1_title:    '👋 ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ',
      tour_step1_desc:     'ಇದು ನಿಮ್ಮ ಆರೋಗ್ಯ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ. ಹೆಸರು, ತ್ವರಿತ ಅಂಕಿಅಂಶಗಳನ್ನು ನೋಡಿ ಮತ್ತು Q&A ಅವಧಿ ಪ್ರಾರಂಭಿಸಿ.',
      tour_step2_title:    '⚡ Q&A ಅವಧಿ ಪ್ರಾರಂಭಿಸಿ',
      tour_step2_desc:     'ವೈದ್ಯರ ಭೇಟಿಗೆ ಮುನ್ನ ಹಂತ-ಹಂತವಾಗಿ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಲು ಇದನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.',
      tour_step3_title:    '🗂️ ನಿಮ್ಮ ಆರೋಗ್ಯ ವೈಶಿಷ್ಟ್ಯಗಳು',
      tour_step3_desc:     'ವರದಿಗಳು, ಕ್ಯಾಲೆಂಡರ್, ದಾಖಲೆಗಳು ಮತ್ತು ಚಾಟ್ — ಆರೋಗ್ಯ ಮಾಹಿತಿ ನಿರ್ವಹಿಸಲು ಎಲ್ಲವೂ.',
      tour_step4_title:    '📄 ಸ್ಮಾರ್ಟ್ ವರದಿಗಳು',
      tour_step4_desc:     'Q&A ಅವಧಿ ಪೂರ್ಣಗೊಂಡ ನಂತರ, ರಚನಾತ್ಮಕ ವೈದ್ಯ-ಸಿದ್ಧ ವರದಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರಚಿಸಲ್ಪಡುತ್ತದೆ.',
      tour_step5_title:    '🎤 ಧ್ವನಿ ಒಳಹರಿವು',
      tour_step5_desc:     'ಧ್ವನಿ ಒಳಹರಿವು ಸಕ್ರಿಯಗೊಳಿಸಲು ಮೈಕ್ರೋಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡಿ. ಮಾತನಾಡಿ ರೋಗಲಕ್ಷಣಗಳನ್ನು ತುಂಬಿ!',
      tour_step6_title:    '👤 ನಿಮ್ಮ ಪ್ರೊಫೈಲ್',
      tour_step6_desc:     'ಇಲ್ಲಿಂದ ಪ್ರೊಫೈಲ್, ಕುಟುಂಬ ಸದಸ್ಯರು, ಪ್ರವಾಸ ಅಥವಾ ಲಾಗ್‌ಔಟ್ ಪ್ರವೇಶಿಸಿ.',
      tour_skip:           'ಬಿಟ್ಟುಬಿಡಿ',
      tour_next:           'ಮುಂದೆ',
      tour_finish:         'ಮುಗಿಸಿ',
    },

    /* ─────────────── TAMIL ─────────────── */
    ta: {
      lang_name:           'தமிழ்',
      app_subtitle:        'உங்கள் உடல்நலம் துணை',
      greeting_morning:    'காலை வணக்கம்',
      greeting_afternoon:  'மதிய வணக்கம்',
      greeting_evening:    'மாலை வணக்கம்',
      welcome_back:        'மீண்டும் வரவேற்கிறோம்,',
      ready_consult:       'உங்கள் அடுத்த ஆலோசனைக்கு தயாரா?',
      start_qa:            'கேள்வி-பதில் அமர்வு தொடங்கு',
      take_tour:           'சுற்றுப்பயணம் எடுங்கள்',
      loading:             'ஏற்றுகிறது…',
      offline_msg:         'இணைப்பை சரிபார்க்கிறது...',
      sync_now:            'இப்போது ஒத்திசை',
      voice_off:           'குரல் கட்டுப்பாடு: அணைக்கப்பட்டது',
      voice_on:            'குரல் கட்டுப்பாடு: இயக்கத்தில் (கேட்கிறது…)',
      stat_reports:        '0 அறிக்கைகள்',
      stat_visits:         '0 வருகைகள்',
      stat_chat:           'அரட்டை தயார்',

      card_reports_title:  'அறிக்கைகள்',
      card_reports_desc:   'உங்கள் ஆலோசனை சுருக்கங்களை பார்க்கவும் மற்றும் பதிவிறக்கவும். மருத்துவர் அல்லது குடும்பத்தினருடன் நேரடியாக பகிரவும்.',
      view_reports:        'அறிக்கைகளை பார்',

      card_calendar_title: 'நாட்காட்டி',
      card_calendar_desc:  'மருத்துவர் வருகைகள், அறிகுறி நிகழ்வுகள் மற்றும் உடல்நல முறைகளை காட்சி நாட்காட்டியில் கண்காணிக்கவும்.',
      view_calendar:       'நாட்காட்டி பார்',

      card_docs_title:     'ஆவணங்கள்',
      card_docs_desc:      'மருந்துச்சீட்டுகள், ஆய்வக அறிக்கைகள் மற்றும் மருத்துவ ஆவணங்களை பாதுகாப்பாக சேமிக்கவும்.',
      view_docs:           'ஆவணங்கள் பார்',

      card_chat_title:     'அரட்டை',
      card_chat_desc:      'உங்கள் மருத்துவருடன் நேரடியாக தொடர்பு கொள்ளுங்கள். செய்திகள் அனுப்பி, அறிக்கைகள் பகிர்ந்து வழிகாட்டல் பெறுங்கள்.',
      start_chat:          'அரட்டை தொடங்கு',

      edit_profile:        'சுயவிவரம் திருத்து',
      take_tour_again:     'மீண்டும் சுற்றுப்பயணம்',
      logout:              'வெளியேறு',

      profile_modal_title: 'சுயவிவரம் திருத்து',
      profile_name:        'முழு பெயர்',
      profile_email:       'மின்னஞ்சல்',
      profile_dob:         'பிறந்த தேதி',
      profile_phone:       'தொலைபேசி',
      profile_family:      'குடும்ப உறுப்பினர்கள்',
      profile_add_family:  '+ குடும்ப உறுப்பினரை சேர்',
      profile_cancel:      'ரத்து செய்',
      profile_save:        'சுயவிவரம் சேமி',

      family_modal_title:  'குடும்ப உறுப்பினரை சேர்',
      family_name:         'பெயர்',
      family_relation:     'உறவு',
      family_email:        'மின்னஞ்சல்',
      family_phone:        'தொலைபேசி',
      family_save:         'உறுப்பினரை சேமி',

      tour_step1_title:    '👋 உங்கள் டாஷ்போர்டுக்கு வரவேற்கிறோம்',
      tour_step1_desc:     'இது உங்கள் உடல்நல கட்டுப்பாட்டு மையம். பெயர், புள்ளிவிவரங்கள் பாருங்கள் மற்றும் கேள்வி-பதில் அமர்வு தொடங்குங்கள்.',
      tour_step2_title:    '⚡ கேள்வி-பதில் அமர்வு தொடங்கு',
      tour_step2_desc:     'மருத்துவர் வருகைக்கு முன் படிப்படியாக அறிகுறிகளை விவரிக்க இதை தட்டுங்கள்.',
      tour_step3_title:    '🗂️ உங்கள் உடல்நல அம்சங்கள்',
      tour_step3_desc:     'அறிக்கைகள், நாட்காட்டி, ஆவணங்கள் மற்றும் அரட்டை — அனைத்தும் இங்கே.',
      tour_step4_title:    '📄 திறமையான அறிக்கைகள்',
      tour_step4_desc:     'கேள்வி-பதில் அமர்வுக்கு பிறகு, மருத்துவர்-தயாரான அறிக்கை தானாக உருவாகிறது.',
      tour_step5_title:    '🎤 குரல் உள்ளீடு',
      tour_step5_desc:     'குரல் உள்ளீட்டை இயக்க மைக்ரோஃபோனை தட்டுங்கள். பேசி அறிகுறிகளை நிரப்புங்கள்!',
      tour_step6_title:    '👤 உங்கள் சுயவிவரம்',
      tour_step6_desc:     'இங்கிருந்து சுயவிவரம், குடும்பம், சுற்றுப்பயணம் அல்லது வெளியேறுதல் அணுகலாம்.',
      tour_skip:           'தவிர்',
      tour_next:           'அடுத்து',
      tour_finish:         'முடி',
    },

    /* ─────────────── MALAYALAM ─────────────── */
    ml: {
      lang_name:           'മലയാളം',
      app_subtitle:        'നിങ്ങളുടെ ആരോഗ്യ സഹചാരി',
      greeting_morning:    'ശുഭ പ്രഭാതം',
      greeting_afternoon:  'ശുഭ മദ്ധ്യാഹ്നം',
      greeting_evening:    'ശുഭ സന്ധ്യ',
      welcome_back:        'തിരിച്ചുവരവിൽ സ്വാഗതം,',
      ready_consult:       'അടുത്ത കൂടിക്കാഴ്ചയ്ക്ക് തയ്യാറാണോ?',
      start_qa:            'ചോദ്യ-ഉത്തര സെഷൻ ആരംഭിക്കുക',
      take_tour:           'ടൂർ എടുക്കുക',
      loading:             'ലോഡ് ചെയ്യുന്നു…',
      offline_msg:         'കണക്ഷൻ പരിശോധിക്കുന്നു...',
      sync_now:            'ഇപ്പോൾ സമന്വയിക്കുക',
      voice_off:           'വോയ്സ് നിയന്ത്രണം: ഓഫ്',
      voice_on:            'വോയ്സ് നിയന്ത്രണം: ഓൺ (കേൾക്കുന്നു…)',
      stat_reports:        '0 റിപ്പോർട്ടുകൾ',
      stat_visits:         '0 സന്ദർശനങ്ങൾ',
      stat_chat:           'ചാറ്റ് തയ്യാർ',

      card_reports_title:  'റിപ്പോർട്ടുകൾ',
      card_reports_desc:   'നിങ്ങളുടെ കൂടിക്കാഴ്ച സംഗ്രഹങ്ങൾ കാണുക, ഡൗൺലോഡ് ചെയ്യുക. ഡോക്ടറോ കുടുംബത്തിനോ നേരിട്ട് പങ്കിടുക.',
      view_reports:        'റിപ്പോർട്ടുകൾ കാണുക',

      card_calendar_title: 'കലണ്ടർ',
      card_calendar_desc:  'ഡോക്ടർ സന്ദർശനങ്ങൾ, രോഗലക്ഷണ സംഭവങ്ങൾ, ആരോഗ്യ മാതൃകകൾ എന്നിവ ദൃശ്യ ടൈംലൈൻ കലണ്ടറിൽ ട്രാക്ക് ചെയ്യുക.',
      view_calendar:       'കലണ്ടർ കാണുക',

      card_docs_title:     'രേഖകൾ',
      card_docs_desc:      'പ്രിസ്ക്രിപ്ഷനുകൾ, ലാബ് റിപ്പോർട്ടുകൾ, മെഡിക്കൽ രേഖകൾ സുരക്ഷിതമായി സൂക്ഷിക്കുക.',
      view_docs:           'രേഖകൾ കാണുക',

      card_chat_title:     'ചാറ്റ്',
      card_chat_desc:      'നേരിട്ട് ഡോക്ടറുമായി ആശയവിനിമയം നടത്തുക. സന്ദേശങ്ങൾ അയക്കുക, റിപ്പോർട്ടുകൾ പങ്കിടുക.',
      start_chat:          'ചാറ്റ് ആരംഭിക്കുക',

      edit_profile:        'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
      take_tour_again:     'വീണ്ടും ടൂർ എടുക്കുക',
      logout:              'ലോഗ്ഔട്ട്',

      profile_modal_title: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
      profile_name:        'പൂർണ്ണ നാമം',
      profile_email:       'ഇമെയിൽ',
      profile_dob:         'ജനനതീയതി',
      profile_phone:       'ഫോൺ',
      profile_family:      'കുടുംബ അംഗങ്ങൾ',
      profile_add_family:  '+ കുടുംബ അംഗത്തെ ചേർക്കുക',
      profile_cancel:      'റദ്ദാക്കുക',
      profile_save:        'പ്രൊഫൈൽ സൂക്ഷിക്കുക',

      family_modal_title:  'കുടുംബ അംഗത്തെ ചേർക്കുക',
      family_name:         'പേര്',
      family_relation:     'ബന്ധം',
      family_email:        'ഇമെയിൽ',
      family_phone:        'ഫോൺ',
      family_save:         'അംഗത്തെ സൂക്ഷിക്കുക',

      tour_step1_title:    '👋 നിങ്ങളുടെ ഡാഷ്ബോർഡിലേക്ക് സ്വാഗതം',
      tour_step1_desc:     'ഇത് നിങ്ങളുടെ ആരോഗ്യ നിയന്ത്രണ കേന്ദ്രമാണ്. പേര്, ഡേറ്റ കാണുക, Q&A സെഷൻ ആരംഭിക്കുക.',
      tour_step2_title:    '⚡ Q&A സെഷൻ ആരംഭിക്കുക',
      tour_step2_desc:     'ഡോക്ടർ സന്ദർശനത്തിന് മുമ്പ് ഘട്ടം ഘട്ടമായി രോഗലക്ഷണങ്ങൾ വിവരിക്കാൻ ടാപ്പ് ചെയ്യുക.',
      tour_step3_title:    '🗂️ നിങ്ങളുടെ ആരോഗ്യ സവിശേഷതകൾ',
      tour_step3_desc:     'റിപ്പോർട്ടുകൾ, കലണ്ടർ, രേഖകൾ, ചാറ്റ് — ആരോഗ്യ വിവരം നിയന്ത്രിക്കാൻ ആവശ്യമായ എല്ലാം.',
      tour_step4_title:    '📄 സ്മാർട്ട് റിപ്പോർട്ടുകൾ',
      tour_step4_desc:     'Q&A സെഷൻ പൂർത്തിയാക്കിയ ശേഷം, ഡോക്ടർ-ഒരുങ്ങിയ റിപ്പോർട്ട് സ്വയം ഉണ്ടാകുന്നു.',
      tour_step5_title:    '🎤 വോയ്സ് ഇൻപുട്ട്',
      tour_step5_desc:     'വോയ്സ് ഇൻപുട്ട് പ്രവർത്തനക്ഷമമാക്കാൻ മൈക്ക് ടാപ്പ് ചെയ്യുക. സംസാരിച്ച് രോഗലക്ഷണങ്ങൾ പൂരിപ്പിക്കുക!',
      tour_step6_title:    '👤 നിങ്ങളുടെ പ്രൊഫൈൽ',
      tour_step6_desc:     'ഇവിടെ നിന്ന് പ്രൊഫൈൽ, കുടുംബം, ടൂർ അല്ലെങ്കിൽ ലോഗ്ഔട്ട് ആക്സസ് ചെയ്യുക.',
      tour_skip:           'ഒഴിവാക്കുക',
      tour_next:           'അടുത്തത്',
      tour_finish:         'പൂർത്തിയാക്കുക',
    },
  };

  const LANGS = ['en', 'hi', 'mr', 'kn', 'ta', 'ml'];
  let currentLang = localStorage.getItem('hs_lang') || 'en';

  /** Return the translation for a key in the current language, fallback to English. */
  function t(key) {
    const lang = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return lang[key] || TRANSLATIONS.en[key] || key;
  }

  /** Apply translations to all [data-i18n] and [data-i18n-ph] elements. */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = t(key);
      if (val !== undefined) el.setAttribute('placeholder', val);
    });
    // Update <html lang> attribute
    document.documentElement.lang = currentLang;
    // Update lang selector display label
    const langLabel = document.getElementById('currentLangLabel');
    if (langLabel) langLabel.textContent = t('lang_name');
  }

  /** Set language, persist, apply. */
  function setLang(code) {
    if (!TRANSLATIONS[code]) return;
    currentLang = code;
    localStorage.setItem('hs_lang', code);
    applyTranslations();
  }

  /** Current language code. */
  function getLang() { return currentLang; }

  // Expose
  return { t, setLang, getLang, applyTranslations, LANGS, TRANSLATIONS };
})();
