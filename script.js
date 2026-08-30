/* ---------------------------------------------------------
   iTANTRA Web Demo v4 — state
   Core Track (Bluetooth / Wi-Fi Direct) only — Stretch/LoRa removed.
--------------------------------------------------------- */
let swapped = false;          // false: A=sender, B=receiver. true: reversed.
let isPlaying = false;        // is a normal (non-emergency) playback currently speaking
let currentUtterance = null;

const LANGUAGES = [
  { code: 'en', native: 'English',   english: null,       bcp47: 'en-IN' },
  { code: 'hi', native: 'हिन्दी',      english: 'Hindi',    bcp47: 'hi-IN' },
  { code: 'ta', native: 'தமிழ்',       english: 'Tamil',    bcp47: 'ta-IN' },
  { code: 'te', native: 'తెలుగు',      english: 'Telugu',   bcp47: 'te-IN' },
  { code: 'kn', native: 'ಕನ್ನಡ',       english: 'Kannada',  bcp47: 'kn-IN' },
  { code: 'ml', native: 'മലയാളം',     english: 'Malayalam',bcp47: 'ml-IN' },
  { code: 'mr', native: 'मराठी',       english: 'Marathi',  bcp47: 'mr-IN' },
  { code: 'gu', native: 'ગુજરાતી',     english: 'Gujarati', bcp47: 'gu-IN' },
  { code: 'bn', native: 'বাংলা',       english: 'Bengali',  bcp47: 'bn-IN' },
  { code: 'or', native: 'ଓଡ଼ିଆ',       english: 'Odia',     bcp47: 'or-IN' },
];

/* ---------------------------------------------------------
   Full UI translation table — every visible string inside a
   phone screen, keyed per language code, applied independently
   per phone (Phone A and Phone B can each run a different
   UI language at the same time).
--------------------------------------------------------- */
const TRANSLATIONS = {
  en: {
    connected:'Connected', app_language:'App language', speak_in:'Speak in', playback_language:'Playback language',
    transcription_label:'VOICE TRANSCRIPTION', transcription_hint:'(editable — try your own message)',
    secure_line:'Text payload — secured by OS-level Bluetooth/Wi-Fi Direct',
    push_to_talk:'PUSH TO TALK', hold_to_speak:'Hold to speak', ptt_listening:'LISTENING…',
    transmission:'Transmission', reception:'Reception', sim_badge:'sim',
    status_ready:'READY', status_listening:'LISTENING', status_preparing:'PREPARING', status_sending:'SENDING',
    status_sent:'SENT', status_waiting:'WAITING', status_receiving:'RECEIVING', status_verifying:'VERIFYING',
    status_playing:'PLAYING', status_priority:'PRIORITY',
    received_message_header:'RECEIVED MESSAGE', waiting_for_message:'Waiting for a message…',
    receiving_payload:'Receiving text payload…', play_as_voice:'Play as voice',
    ready_for_playback_initial:'Ready for voice playback', ready_for_playback:'Message ready for playback',
    tts_offline:'TTS is offline and on-device', verified_tts:'Verified • TTS on-device',
    playing_voice:'Playing voice…', text_to_speech:'Text → speech',
    playback_complete:'Playback complete', ready_for_next:'Ready for the next message',
    nav_home:'Home', nav_messages:'Messages', nav_emergency:'Emergency', nav_settings:'Settings',
    emergency_button:'Send emergency alert', emergency_active:'EMERGENCY ALERT ACTIVE',
    emergency_desc:'Maximum volume (simulated) • Non-interruptible',
    payload_text:'~{bytes} bytes (text payload, not audio)',
    role_sender:'SENDER', role_receiver:'RECEIVER', peer_sender:'Sender', peer_receiver:'Receiver',
    step_speech:'Speech', step_text:'Text', step_link:'Link', step_verify:'Verify',
  },
  hi: {
    connected:'कनेक्टेड', app_language:'ऐप भाषा', speak_in:'भाषा चुनें', playback_language:'प्लेबैक भाषा',
    transcription_label:'वॉइस ट्रांसक्रिप्शन', transcription_hint:'(संपादन योग्य — अपना संदेश आज़माएं)',
    secure_line:'टेक्स्ट पेलोड — OS-स्तर के ब्लूटूथ/वाई-फाई डायरेक्ट द्वारा सुरक्षित',
    push_to_talk:'बोलने के लिए दबाएं', hold_to_speak:'बोलने के लिए दबाए रखें', ptt_listening:'सुन रहा है…',
    transmission:'प्रेषण', reception:'प्राप्ति', sim_badge:'सिम्युलेटेड',
    status_ready:'तैयार', status_listening:'सुन रहा है', status_preparing:'तैयार हो रहा है', status_sending:'भेजा जा रहा है',
    status_sent:'भेज दिया गया', status_waiting:'प्रतीक्षारत', status_receiving:'प्राप्त हो रहा है', status_verifying:'सत्यापित हो रहा है',
    status_playing:'चल रहा है', status_priority:'प्राथमिकता',
    received_message_header:'प्राप्त संदेश', waiting_for_message:'संदेश की प्रतीक्षा है…',
    receiving_payload:'टेक्स्ट पेलोड प्राप्त हो रहा है…', play_as_voice:'आवाज़ में चलाएं',
    ready_for_playback_initial:'आवाज़ प्लेबैक के लिए तैयार', ready_for_playback:'संदेश प्लेबैक के लिए तैयार है',
    tts_offline:'TTS ऑफ़लाइन और डिवाइस पर है', verified_tts:'सत्यापित • TTS डिवाइस पर',
    playing_voice:'आवाज़ चल रही है…', text_to_speech:'टेक्स्ट → आवाज़',
    playback_complete:'प्लेबैक पूरा हुआ', ready_for_next:'अगले संदेश के लिए तैयार',
    nav_home:'होम', nav_messages:'संदेश', nav_emergency:'आपातकाल', nav_settings:'सेटिंग्स',
    emergency_button:'आपातकालीन अलर्ट भेजें', emergency_active:'आपातकालीन अलर्ट सक्रिय',
    emergency_desc:'अधिकतम वॉल्यूम (सिम्युलेटेड) • बाधित नहीं किया जा सकता',
    payload_text:'~{bytes} बाइट्स (टेक्स्ट पेलोड, ऑडियो नहीं)',
    role_sender:'प्रेषक', role_receiver:'प्राप्तकर्ता', peer_sender:'प्रेषक', peer_receiver:'प्राप्तकर्ता',
    step_speech:'आवाज़', step_text:'टेक्स्ट', step_link:'लिंक', step_verify:'सत्यापन',
  },
  ta: {
    connected:'இணைக்கப்பட்டது', app_language:'செயலி மொழி', speak_in:'பேசும் மொழி', playback_language:'பிளேபேக் மொழி',
    transcription_label:'குரல் படியெடுப்பு', transcription_hint:'(திருத்தக்கூடியது — உங்கள் செய்தியை முயற்சிக்கவும்)',
    secure_line:'உரை பேலோட் — OS-நிலை புளூடூத்/வைஃபை டைரக்ட் மூலம் பாதுகாக்கப்பட்டது',
    push_to_talk:'பேச அழுத்தவும்', hold_to_speak:'பேச அழுத்திப் பிடிக்கவும்', ptt_listening:'கேட்கிறது…',
    transmission:'அனுப்புதல்', reception:'பெறுதல்', sim_badge:'சிமுலேஷன்',
    status_ready:'தயார்', status_listening:'கேட்கிறது', status_preparing:'தயாராகிறது', status_sending:'அனுப்பப்படுகிறது',
    status_sent:'அனுப்பப்பட்டது', status_waiting:'காத்திருக்கிறது', status_receiving:'பெறப்படுகிறது', status_verifying:'சரிபார்க்கப்படுகிறது',
    status_playing:'இயங்குகிறது', status_priority:'முன்னுரிமை',
    received_message_header:'பெறப்பட்ட செய்தி', waiting_for_message:'செய்திக்காக காத்திருக்கிறது…',
    receiving_payload:'உரை பேலோட் பெறப்படுகிறது…', play_as_voice:'குரலாக இயக்கு',
    ready_for_playback_initial:'குரல் பிளேபேக்கிற்கு தயார்', ready_for_playback:'செய்தி பிளேபேக்கிற்கு தயார்',
    tts_offline:'TTS ஆஃப்லைனில் சாதனத்திலேயே இயங்குகிறது', verified_tts:'சரிபார்க்கப்பட்டது • TTS சாதனத்தில்',
    playing_voice:'குரல் இயங்குகிறது…', text_to_speech:'உரை → குரல்',
    playback_complete:'பிளேபேக் முடிந்தது', ready_for_next:'அடுத்த செய்திக்கு தயார்',
    nav_home:'முகப்பு', nav_messages:'செய்திகள்', nav_emergency:'அவசரநிலை', nav_settings:'அமைப்புகள்',
    emergency_button:'அவசர எச்சரிக்கை அனுப்பு', emergency_active:'அவசர எச்சரிக்கை செயலில்',
    emergency_desc:'அதிகபட்ச ஒலியளவு (சிமுலேஷன்) • குறுக்கிட முடியாது',
    payload_text:'~{bytes} பைட்டுகள் (உரை பேலோட், ஆடியோ அல்ல)',
    role_sender:'அனுப்புநர்', role_receiver:'பெறுநர்', peer_sender:'அனுப்புநர்', peer_receiver:'பெறுநர்',
    step_speech:'குரல்', step_text:'உரை', step_link:'இணைப்பு', step_verify:'சரிபார்ப்பு',
  },
  te: {
    connected:'కనెక్ట్ అయింది', app_language:'యాప్ భాష', speak_in:'మాట్లాడే భాష', playback_language:'ప్లేబ్యాక్ భాష',
    transcription_label:'వాయిస్ ట్రాన్స్‌క్రిప్షన్', transcription_hint:'(సవరించదగినది — మీ సందేశాన్ని ప్రయత్నించండి)',
    secure_line:'టెక్స్ట్ పేలోడ్ — OS-స్థాయి బ్లూటూత్/వైఫై డైరెక్ట్ ద్వారా సురక్షితం',
    push_to_talk:'మాట్లాడటానికి నొక్కండి', hold_to_speak:'మాట్లాడటానికి నొక్కి ఉంచండి', ptt_listening:'వింటోంది…',
    transmission:'ప్రసారం', reception:'స్వీకరణ', sim_badge:'సిమ్యులేషన్',
    status_ready:'సిద్ధం', status_listening:'వింటోంది', status_preparing:'సిద్ధమవుతోంది', status_sending:'పంపుతోంది',
    status_sent:'పంపబడింది', status_waiting:'వేచి ఉంది', status_receiving:'అందుతోంది', status_verifying:'ధృవీకరిస్తోంది',
    status_playing:'ప్లే అవుతోంది', status_priority:'ప్రాధాన్యత',
    received_message_header:'వచ్చిన సందేశం', waiting_for_message:'సందేశం కోసం వేచి ఉంది…',
    receiving_payload:'టెక్స్ట్ పేలోడ్ అందుతోంది…', play_as_voice:'వాయిస్‌గా ప్లే చేయండి',
    ready_for_playback_initial:'వాయిస్ ప్లేబ్యాక్‌కి సిద్ధం', ready_for_playback:'సందేశం ప్లేబ్యాక్‌కి సిద్ధంగా ఉంది',
    tts_offline:'TTS ఆఫ్‌లైన్‌లో పరికరంలోనే పనిచేస్తుంది', verified_tts:'ధృవీకరించబడింది • TTS పరికరంలో',
    playing_voice:'వాయిస్ ప్లే అవుతోంది…', text_to_speech:'టెక్స్ట్ → వాయిస్',
    playback_complete:'ప్లేబ్యాక్ పూర్తయింది', ready_for_next:'తదుపరి సందేశానికి సిద్ధం',
    nav_home:'హోమ్', nav_messages:'సందేశాలు', nav_emergency:'అత్యవసరం', nav_settings:'సెట్టింగ్‌లు',
    emergency_button:'అత్యవసర హెచ్చరిక పంపండి', emergency_active:'అత్యవసర హెచ్చరిక యాక్టివ్‌గా ఉంది',
    emergency_desc:'గరిష్ట వాల్యూమ్ (సిమ్యులేషన్) • అంతరాయం కలిగించలేరు',
    payload_text:'~{bytes} బైట్లు (టెక్స్ట్ పేలోడ్, ఆడియో కాదు)',
    role_sender:'పంపేవారు', role_receiver:'స్వీకర్త', peer_sender:'పంపేవారు', peer_receiver:'స్వీకర్త',
    step_speech:'వాయిస్', step_text:'టెక్స్ట్', step_link:'లింక్', step_verify:'ధృవీకరణ',
  },
  kn: {
    connected:'ಸಂಪರ್ಕಿತ', app_language:'ಆ್ಯಪ್ ಭಾಷೆ', speak_in:'ಮಾತನಾಡುವ ಭಾಷೆ', playback_language:'ಪ್ಲೇಬ್ಯಾಕ್ ಭಾಷೆ',
    transcription_label:'ಧ್ವನಿ ಪ್ರತಿಲೇಖನ', transcription_hint:'(ಸಂಪಾದಿಸಬಹುದಾದ — ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಪ್ರಯತ್ನಿಸಿ)',
    secure_line:'ಪಠ್ಯ ಪೇಲೋಡ್ — OS-ಮಟ್ಟದ ಬ್ಲೂಟೂತ್/ವೈಫೈ ಡೈರೆಕ್ಟ್‌ನಿಂದ ಸುರಕ್ಷಿತ',
    push_to_talk:'ಮಾತನಾಡಲು ಒತ್ತಿ', hold_to_speak:'ಮಾತನಾಡಲು ಒತ್ತಿ ಹಿಡಿಯಿರಿ', ptt_listening:'ಕೇಳುತ್ತಿದೆ…',
    transmission:'ಪ್ರಸಾರ', reception:'ಸ್ವೀಕೃತಿ', sim_badge:'ಸಿಮ್ಯುಲೇಶನ್',
    status_ready:'ಸಿದ್ಧ', status_listening:'ಕೇಳುತ್ತಿದೆ', status_preparing:'ಸಿದ್ಧವಾಗುತ್ತಿದೆ', status_sending:'ಕಳುಹಿಸುತ್ತಿದೆ',
    status_sent:'ಕಳುಹಿಸಲಾಗಿದೆ', status_waiting:'ಕಾಯುತ್ತಿದೆ', status_receiving:'ಸ್ವೀಕರಿಸುತ್ತಿದೆ', status_verifying:'ಪರಿಶೀಲಿಸುತ್ತಿದೆ',
    status_playing:'ಪ್ಲೇ ಆಗುತ್ತಿದೆ', status_priority:'ಆದ್ಯತೆ',
    received_message_header:'ಸ್ವೀಕರಿಸಿದ ಸಂದೇಶ', waiting_for_message:'ಸಂದೇಶಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ…',
    receiving_payload:'ಪಠ್ಯ ಪೇಲೋಡ್ ಸ್ವೀಕರಿಸಲಾಗುತ್ತಿದೆ…', play_as_voice:'ಧ್ವನಿಯಾಗಿ ಪ್ಲೇ ಮಾಡಿ',
    ready_for_playback_initial:'ಧ್ವನಿ ಪ್ಲೇಬ್ಯಾಕ್‌ಗೆ ಸಿದ್ಧ', ready_for_playback:'ಸಂದೇಶ ಪ್ಲೇಬ್ಯಾಕ್‌ಗೆ ಸಿದ್ಧವಾಗಿದೆ',
    tts_offline:'TTS ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಾಧನದಲ್ಲೇ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', verified_tts:'ಪರಿಶೀಲಿಸಲಾಗಿದೆ • TTS ಸಾಧನದಲ್ಲಿ',
    playing_voice:'ಧ್ವನಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ…', text_to_speech:'ಪಠ್ಯ → ಧ್ವನಿ',
    playback_complete:'ಪ್ಲೇಬ್ಯಾಕ್ ಪೂರ್ಣಗೊಂಡಿದೆ', ready_for_next:'ಮುಂದಿನ ಸಂದೇಶಕ್ಕೆ ಸಿದ್ಧ',
    nav_home:'ಮುಖಪುಟ', nav_messages:'ಸಂದೇಶಗಳು', nav_emergency:'ತುರ್ತು', nav_settings:'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    emergency_button:'ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ', emergency_active:'ತುರ್ತು ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯ',
    emergency_desc:'ಗರಿಷ್ಠ ವಾಲ್ಯೂಮ್ (ಸಿಮ್ಯುಲೇಶನ್) • ಅಡ್ಡಿಪಡಿಸಲಾಗದು',
    payload_text:'~{bytes} ಬೈಟ್‌ಗಳು (ಪಠ್ಯ ಪೇಲೋಡ್, ಆಡಿಯೋ ಅಲ್ಲ)',
    role_sender:'ಕಳುಹಿಸುವವರು', role_receiver:'ಸ್ವೀಕರಿಸುವವರು', peer_sender:'ಕಳುಹಿಸುವವರು', peer_receiver:'ಸ್ವೀಕರಿಸುವವರು',
    step_speech:'ಧ್ವನಿ', step_text:'ಪಠ್ಯ', step_link:'ಲಿಂಕ್', step_verify:'ಪರಿಶೀಲನೆ',
  },
  ml: {
    connected:'ബന്ധിപ്പിച്ചു', app_language:'ആപ്പ് ഭാഷ', speak_in:'സംസാരിക്കുന്ന ഭാഷ', playback_language:'പ്ലേബാക്ക് ഭാഷ',
    transcription_label:'വോയ്‌സ് ട്രാൻസ്ക്രിപ്ഷൻ', transcription_hint:'(എഡിറ്റ് ചെയ്യാവുന്നത് — നിങ്ങളുടെ സന്ദേശം പരീക്ഷിക്കുക)',
    secure_line:'ടെക്സ്റ്റ് പേലോഡ് — OS-തല ബ്ലൂടൂത്ത്/വൈഫൈ ഡയറക്റ്റ് വഴി സുരക്ഷിതം',
    push_to_talk:'സംസാരിക്കാൻ അമർത്തുക', hold_to_speak:'സംസാരിക്കാൻ അമർത്തിപ്പിടിക്കുക', ptt_listening:'കേൾക്കുന്നു…',
    transmission:'കൈമാറ്റം', reception:'സ്വീകരണം', sim_badge:'സിമുലേഷൻ',
    status_ready:'തയ്യാർ', status_listening:'കേൾക്കുന്നു', status_preparing:'തയ്യാറാകുന്നു', status_sending:'അയക്കുന്നു',
    status_sent:'അയച്ചു', status_waiting:'കാത്തിരിക്കുന്നു', status_receiving:'സ്വീകരിക്കുന്നു', status_verifying:'പരിശോധിക്കുന്നു',
    status_playing:'പ്ലേ ചെയ്യുന്നു', status_priority:'മുൻഗണന',
    received_message_header:'ലഭിച്ച സന്ദേശം', waiting_for_message:'സന്ദേശത്തിനായി കാത്തിരിക്കുന്നു…',
    receiving_payload:'ടെക്സ്റ്റ് പേലോഡ് സ്വീകരിക്കുന്നു…', play_as_voice:'ശബ്ദമായി പ്ലേ ചെയ്യുക',
    ready_for_playback_initial:'വോയ്‌സ് പ്ലേബാക്കിന് തയ്യാർ', ready_for_playback:'സന്ദേശം പ്ലേബാക്കിന് തയ്യാറാണ്',
    tts_offline:'TTS ഓഫ്‌ലൈനിൽ ഉപകരണത്തിൽ തന്നെ പ്രവർത്തിക്കുന്നു', verified_tts:'പരിശോധിച്ചു • TTS ഉപകരണത്തിൽ',
    playing_voice:'ശബ്ദം പ്ലേ ചെയ്യുന്നു…', text_to_speech:'ടെക്സ്റ്റ് → ശബ്ദം',
    playback_complete:'പ്ലേബാക്ക് പൂർത്തിയായി', ready_for_next:'അടുത്ത സന്ദേശത്തിന് തയ്യാർ',
    nav_home:'ഹോം', nav_messages:'സന്ദേശങ്ങൾ', nav_emergency:'അടിയന്തരം', nav_settings:'ക്രമീകരണങ്ങൾ',
    emergency_button:'അടിയന്തര മുന്നറിയിപ്പ് അയക്കുക', emergency_active:'അടിയന്തര മുന്നറിയിപ്പ് സജീവം',
    emergency_desc:'പരമാവധി വോളിയം (സിമുലേഷൻ) • തടസ്സപ്പെടുത്താനാവില്ല',
    payload_text:'~{bytes} ബൈറ്റുകൾ (ടെക്സ്റ്റ് പേലോഡ്, ഓഡിയോ അല്ല)',
    role_sender:'അയക്കുന്നയാൾ', role_receiver:'സ്വീകർത്താവ്', peer_sender:'അയക്കുന്നയാൾ', peer_receiver:'സ്വീകർത്താവ്',
    step_speech:'ശബ്ദം', step_text:'ടെക്സ്റ്റ്', step_link:'ലിങ്ക്', step_verify:'പരിശോധന',
  },
  mr: {
    connected:'कनेक्ट केले', app_language:'अ‍ॅप भाषा', speak_in:'बोलण्याची भाषा', playback_language:'प्लेबॅक भाषा',
    transcription_label:'व्हॉइस ट्रान्सक्रिप्शन', transcription_hint:'(संपादन करण्यायोग्य — तुमचा संदेश वापरून पहा)',
    secure_line:'मजकूर पेलोड — OS-स्तरीय ब्लूटूथ/वाय-फाय डायरेक्टद्वारे सुरक्षित',
    push_to_talk:'बोलण्यासाठी दाबा', hold_to_speak:'बोलण्यासाठी दाबून धरा', ptt_listening:'ऐकत आहे…',
    transmission:'प्रसारण', reception:'स्वागत', sim_badge:'सिम्युलेशन',
    status_ready:'तयार', status_listening:'ऐकत आहे', status_preparing:'तयार होत आहे', status_sending:'पाठवत आहे',
    status_sent:'पाठवले', status_waiting:'प्रतीक्षा करत आहे', status_receiving:'प्राप्त होत आहे', status_verifying:'पडताळणी करत आहे',
    status_playing:'प्ले होत आहे', status_priority:'प्राधान्य',
    received_message_header:'प्राप्त संदेश', waiting_for_message:'संदेशाची प्रतीक्षा आहे…',
    receiving_payload:'मजकूर पेलोड प्राप्त होत आहे…', play_as_voice:'आवाजात प्ले करा',
    ready_for_playback_initial:'आवाज प्लेबॅकसाठी तयार', ready_for_playback:'संदेश प्लेबॅकसाठी तयार आहे',
    tts_offline:'TTS ऑफलाइन आणि डिव्हाइसवरच चालते', verified_tts:'पडताळणी केली • TTS डिव्हाइसवर',
    playing_voice:'आवाज प्ले होत आहे…', text_to_speech:'मजकूर → आवाज',
    playback_complete:'प्लेबॅक पूर्ण झाले', ready_for_next:'पुढील संदेशासाठी तयार',
    nav_home:'होम', nav_messages:'संदेश', nav_emergency:'आणीबाणी', nav_settings:'सेटिंग्ज',
    emergency_button:'आणीबाणी सूचना पाठवा', emergency_active:'आणीबाणी सूचना सक्रिय',
    emergency_desc:'कमाल आवाज (सिम्युलेशन) • व्यत्यय आणता येणार नाही',
    payload_text:'~{bytes} बाइट्स (मजकूर पेलोड, ऑडिओ नाही)',
    role_sender:'पाठवणारा', role_receiver:'प्राप्तकर्ता', peer_sender:'पाठवणारा', peer_receiver:'प्राप्तकर्ता',
    step_speech:'आवाज', step_text:'मजकूर', step_link:'लिंक', step_verify:'पडताळणी',
  },
  gu: {
    connected:'જોડાયેલ', app_language:'એપ ભાષા', speak_in:'બોલવાની ભાષા', playback_language:'પ્લેબેક ભાષા',
    transcription_label:'વૉઇસ ટ્રાન્સક્રિપ્શન', transcription_hint:'(સંપાદનયોગ્ય — તમારો સંદેશ અજમાવો)',
    secure_line:'ટેક્સ્ટ પેલોડ — OS-સ્તરીય બ્લૂટૂથ/વાઇફાઇ ડાયરેક્ટ દ્વારા સુરક્ષિત',
    push_to_talk:'બોલવા માટે દબાવો', hold_to_speak:'બોલવા માટે દબાવી રાખો', ptt_listening:'સાંભળી રહ્યું છે…',
    transmission:'પ્રસારણ', reception:'સ્વાગત', sim_badge:'સિમ્યુલેશન',
    status_ready:'તૈયાર', status_listening:'સાંભળી રહ્યું છે', status_preparing:'તૈયાર થઈ રહ્યું છે', status_sending:'મોકલી રહ્યું છે',
    status_sent:'મોકલાયું', status_waiting:'રાહ જોઈ રહ્યું છે', status_receiving:'પ્રાપ્ત થઈ રહ્યું છે', status_verifying:'ચકાસી રહ્યું છે',
    status_playing:'ચાલી રહ્યું છે', status_priority:'પ્રાધાન્યતા',
    received_message_header:'પ્રાપ્ત સંદેશ', waiting_for_message:'સંદેશની રાહ જોવાઈ રહી છે…',
    receiving_payload:'ટેક્સ્ટ પેલોડ પ્રાપ્ત થઈ રહ્યો છે…', play_as_voice:'અવાજમાં ચલાવો',
    ready_for_playback_initial:'અવાજ પ્લેબેક માટે તૈયાર', ready_for_playback:'સંદેશ પ્લેબેક માટે તૈયાર છે',
    tts_offline:'TTS ઑફલાઇન અને ડિવાઇસ પર જ ચાલે છે', verified_tts:'ચકાસાયેલ • TTS ડિવાઇસ પર',
    playing_voice:'અવાજ ચાલી રહ્યો છે…', text_to_speech:'ટેક્સ્ટ → અવાજ',
    playback_complete:'પ્લેબેક પૂર્ણ થયું', ready_for_next:'આગલા સંદેશ માટે તૈયાર',
    nav_home:'હોમ', nav_messages:'સંદેશા', nav_emergency:'કટોકટી', nav_settings:'સેટિંગ્સ',
    emergency_button:'કટોકટી ચેતવણી મોકલો', emergency_active:'કટોકટી ચેતવણી સક્રિય',
    emergency_desc:'મહત્તમ વોલ્યુમ (સિમ્યુલેશન) • અવરોધ કરી શકાતું નથી',
    payload_text:'~{bytes} બાઇટ્સ (ટેક્સ્ટ પેલોડ, ઑડિયો નહીં)',
    role_sender:'મોકલનાર', role_receiver:'મેળવનાર', peer_sender:'મોકલનાર', peer_receiver:'મેળવનાર',
    step_speech:'અવાજ', step_text:'ટેક્સ્ટ', step_link:'લિંક', step_verify:'ચકાસણી',
  },
  bn: {
    connected:'সংযুক্ত', app_language:'অ্যাপ ভাষা', speak_in:'কথা বলার ভাষা', playback_language:'প্লেব্যাক ভাষা',
    transcription_label:'ভয়েস ট্রান্সক্রিপশন', transcription_hint:'(সম্পাদনাযোগ্য — আপনার বার্তা চেষ্টা করুন)',
    secure_line:'টেক্সট পেলোড — OS-স্তরের ব্লুটুথ/ওয়াই-ফাই ডাইরেক্ট দ্বারা সুরক্ষিত',
    push_to_talk:'কথা বলতে চাপুন', hold_to_speak:'কথা বলতে চেপে ধরুন', ptt_listening:'শুনছে…',
    transmission:'প্রেরণ', reception:'গ্রহণ', sim_badge:'সিমুলেশন',
    status_ready:'প্রস্তুত', status_listening:'শুনছে', status_preparing:'প্রস্তুত হচ্ছে', status_sending:'পাঠানো হচ্ছে',
    status_sent:'পাঠানো হয়েছে', status_waiting:'অপেক্ষা করছে', status_receiving:'গ্রহণ করা হচ্ছে', status_verifying:'যাচাই করা হচ্ছে',
    status_playing:'চলছে', status_priority:'অগ্রাধিকার',
    received_message_header:'প্রাপ্ত বার্তা', waiting_for_message:'বার্তার জন্য অপেক্ষা করা হচ্ছে…',
    receiving_payload:'টেক্সট পেলোড গ্রহণ করা হচ্ছে…', play_as_voice:'ভয়েস হিসেবে চালান',
    ready_for_playback_initial:'ভয়েস প্লেব্যাকের জন্য প্রস্তুত', ready_for_playback:'বার্তা প্লেব্যাকের জন্য প্রস্তুত',
    tts_offline:'TTS অফলাইনে এবং ডিভাইসেই চলে', verified_tts:'যাচাই করা হয়েছে • TTS ডিভাইসে',
    playing_voice:'ভয়েস চলছে…', text_to_speech:'টেক্সট → ভয়েস',
    playback_complete:'প্লেব্যাক সম্পূর্ণ', ready_for_next:'পরবর্তী বার্তার জন্য প্রস্তুত',
    nav_home:'হোম', nav_messages:'বার্তা', nav_emergency:'জরুরি', nav_settings:'সেটিংস',
    emergency_button:'জরুরি সতর্কতা পাঠান', emergency_active:'জরুরি সতর্কতা সক্রিয়',
    emergency_desc:'সর্বোচ্চ ভলিউম (সিমুলেশন) • বাধা দেওয়া যাবে না',
    payload_text:'~{bytes} বাইট (টেক্সট পেলোড, অডিও নয়)',
    role_sender:'প্রেরক', role_receiver:'প্রাপক', peer_sender:'প্রেরক', peer_receiver:'প্রাপক',
    step_speech:'ভয়েস', step_text:'টেক্সট', step_link:'লিংক', step_verify:'যাচাই',
  },
  or: {
    connected:'ସଂଯୁକ୍ତ', app_language:'ଆପ୍ ଭାଷା', speak_in:'କହିବା ଭାଷା', playback_language:'ପ୍ଲେବ୍ୟାକ୍ ଭାଷା',
    transcription_label:'ଭଏସ୍ ଟ୍ରାନ୍ସକ୍ରିପ୍ସନ୍', transcription_hint:'(ସମ୍ପାଦନଯୋଗ୍ୟ — ଆପଣଙ୍କ ବାର୍ତ୍ତା ଚେଷ୍ଟା କରନ୍ତୁ)',
    secure_line:'ଟେକ୍ସଟ୍ ପେଲୋଡ୍ — OS-ସ୍ତରୀୟ ବ୍ଲୁଟୁଥ୍/ୱାଇଫାଇ ଡାଇରେକ୍ଟ ଦ୍ୱାରା ସୁରକ୍ଷିତ',
    push_to_talk:'କହିବାକୁ ଦବାନ୍ତୁ', hold_to_speak:'କହିବାକୁ ଦବାଇ ରଖନ୍ତୁ', ptt_listening:'ଶୁଣୁଛି…',
    transmission:'ପ୍ରସାରଣ', reception:'ଗ୍ରହଣ', sim_badge:'ସିମୁଲେସନ୍',
    status_ready:'ପ୍ରସ୍ତୁତ', status_listening:'ଶୁଣୁଛି', status_preparing:'ପ୍ରସ୍ତୁତ ହେଉଛି', status_sending:'ପଠାଯାଉଛି',
    status_sent:'ପଠାଗଲା', status_waiting:'ଅପେକ୍ଷାରେ', status_receiving:'ଗ୍ରହଣ ହେଉଛି', status_verifying:'ଯାଞ୍ଚ ହେଉଛି',
    status_playing:'ଚାଲୁଛି', status_priority:'ପ୍ରାଥମିକତା',
    received_message_header:'ପ୍ରାପ୍ତ ବାର୍ତ୍ତା', waiting_for_message:'ବାର୍ତ୍ତା ପାଇଁ ଅପେକ୍ଷା କରୁଛି…',
    receiving_payload:'ଟେକ୍ସଟ୍ ପେଲୋଡ୍ ଗ୍ରହଣ ହେଉଛି…', play_as_voice:'ସ୍ୱର ଭାବରେ ଚଲାନ୍ତୁ',
    ready_for_playback_initial:'ସ୍ୱର ପ୍ଲେବ୍ୟାକ୍ ପାଇଁ ପ୍ରସ୍ତୁତ', ready_for_playback:'ବାର୍ତ୍ତା ପ୍ଲେବ୍ୟାକ୍ ପାଇଁ ପ୍ରସ୍ତୁତ',
    tts_offline:'TTS ଅଫଲାଇନ୍ ଏବଂ ଡିଭାଇସ୍‌ରେ ହିଁ ଚାଲେ', verified_tts:'ଯାଞ୍ଚ ହୋଇଗଲା • TTS ଡିଭାଇସ୍‌ରେ',
    playing_voice:'ସ୍ୱର ଚାଲୁଛି…', text_to_speech:'ଟେକ୍ସଟ୍ → ସ୍ୱର',
    playback_complete:'ପ୍ଲେବ୍ୟାକ୍ ସମ୍ପୂର୍ଣ୍ଣ', ready_for_next:'ପରବର୍ତ୍ତୀ ବାର୍ତ୍ତା ପାଇଁ ପ୍ରସ୍ତୁତ',
    nav_home:'ହୋମ୍', nav_messages:'ବାର୍ତ୍ତା', nav_emergency:'ଜରୁରୀକାଳୀନ', nav_settings:'ସେଟିଂସ୍',
    emergency_button:'ଜରୁରୀକାଳୀନ ଚେତାବନୀ ପଠାନ୍ତୁ', emergency_active:'ଜରୁରୀକାଳୀନ ଚେତାବନୀ ସକ୍ରିୟ',
    emergency_desc:'ସର୍ବାଧିକ ଭଲ୍ୟୁମ୍ (ସିମୁଲେସନ୍) • ବାଧା ଦିଆଯାଇପାରିବ ନାହିଁ',
    payload_text:'~{bytes} ବାଇଟ୍ (ଟେକ୍ସଟ୍ ପେଲୋଡ୍, ଅଡିଓ ନୁହେଁ)',
    role_sender:'ପ୍ରେରକ', role_receiver:'ପ୍ରାପକ', peer_sender:'ପ୍ରେରକ', peer_receiver:'ପ୍ରାପକ',
    step_speech:'ସ୍ୱର', step_text:'ଟେକ୍ସଟ୍', step_link:'ଲିଙ୍କ', step_verify:'ଯାଞ୍ଚ',
  },
};

let uiLang = { A: 'en', B: 'en' }; // independent UI language per phone

/* ---------------------------------------------------------
   DOM lookups, bundled per phone
--------------------------------------------------------- */
function collectPhone(id) {
  return {
    id,
    root: document.getElementById('phone' + id),
    roleLabel: document.getElementById('roleLabel' + id),
    peerRole: document.getElementById('peerRole' + id),
    peerName: document.getElementById('peerName' + id),
    avatar: document.getElementById('avatar' + id),
    senderBlock: document.getElementById('senderBlock' + id),
    receiverBlock: document.getElementById('receiverBlock' + id),
    langUI: document.getElementById('langUI' + id),
    langSend: document.getElementById('langSend' + id),
    langPlay: document.getElementById('langPlay' + id),
    transcript: document.getElementById('transcript' + id),
    secureLine: document.getElementById('secureLine' + id),
    payloadBadge: document.getElementById('payload' + id),
    ptt: document.getElementById('ptt' + id),
    ring: document.getElementById('ring' + id),
    pttText: document.getElementById('pttText' + id),
    stateSend: document.getElementById('stateSend' + id),
    transportSend: document.getElementById('transportSend' + id),
    emergencyBtn: document.getElementById('emergency' + id),
    receivedCard: document.getElementById('receivedCard' + id),
    receivedMessage: document.getElementById('receivedMessage' + id),
    receiveTime: document.getElementById('receiveTime' + id),
    playBtn: document.getElementById('play' + id),
    ttsTitle: document.getElementById('ttsTitle' + id),
    ttsSub: document.getElementById('ttsSub' + id),
    stateRecv: document.getElementById('stateRecv' + id),
    transportRecv: document.getElementById('transportRecv' + id),
  };
}

const phones = { A: collectPhone('A'), B: collectPhone('B') };
const toast = document.getElementById('toast');
const demoHint = document.getElementById('demoHint');
const swapBtn = document.getElementById('swapBtn');
const simulateBtn = document.getElementById('simulateBtn');

let audioCtx = null; // lazily created on first user gesture (browser autoplay policy)

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
function toastMsg(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function senderKey() { return swapped ? 'B' : 'A'; }
function receiverKey() { return swapped ? 'A' : 'B'; }

function byteLength(str) {
  return new TextEncoder().encode(str).length;
}

function bcp47For(selectEl) {
  const opt = selectEl.selectedOptions[0];
  return opt ? opt.dataset.bcp47 : 'en-IN';
}

/* Look up a UI string for a given phone (k) in that phone's own
   language, with optional {var} substitution. Falls back to English. */
function tr(k, key, vars) {
  const dict = TRANSLATIONS[uiLang[k]] || TRANSLATIONS.en;
  let s = dict[key] !== undefined ? dict[key] : TRANSLATIONS.en[key];
  if (vars) {
    Object.keys(vars).forEach(v => { s = s.replace('{' + v + '}', vars[v]); });
  }
  return s;
}

/* ---------------------------------------------------------
   Populate language selects with native + English labels
--------------------------------------------------------- */
function buildLanguageOptions(selectEl) {
  selectEl.innerHTML = '';
  LANGUAGES.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.dataset.bcp47 = l.bcp47;
    opt.textContent = l.english ? `${l.native} (${l.english})` : l.native;
    selectEl.appendChild(opt);
  });
}

['A', 'B'].forEach(k => {
  buildLanguageOptions(phones[k].langUI);
  buildLanguageOptions(phones[k].langSend);
  buildLanguageOptions(phones[k].langPlay);
});

/* ---------------------------------------------------------
   Apply the chosen UI language to everything inside one
   phone's screen — static labels via data-i18n, plus the
   few dynamic pieces (role labels, transport lines, payload
   counter) that depend on current state.
--------------------------------------------------------- */
function applyTranslations(k) {
  const p = phones[k];
  p.root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = tr(k, key);
    if (val !== undefined) el.textContent = val;
  });
  renderTransportLines(k);
  updatePayload(k);
  renderRoles();
}

/* ---------------------------------------------------------
   Transport line rendering (Core Track only: Bluetooth/Wi-Fi Direct)
--------------------------------------------------------- */
function buildLine(container, steps) {
  container.innerHTML = steps
    .map((s, i) => (i === 0 ? `<span>${s}</span>` : `<i>→</i><span>${s}</span>`))
    .join('');
}

function renderTransportLines(k) {
  const senderSteps = [tr(k, 'step_speech'), 'STT', tr(k, 'step_text'), tr(k, 'step_link')];
  const receiverSteps = [tr(k, 'step_link'), tr(k, 'step_verify'), tr(k, 'step_text'), 'TTS'];
  buildLine(phones[k].transportSend, senderSteps);
  buildLine(phones[k].transportRecv, receiverSteps);
  phones[k].secureLine.innerHTML = `<span>✓</span> ${tr(k, 'secure_line')}`;
}

/* ---------------------------------------------------------
   Payload byte counters — live, tied to actual typed text
--------------------------------------------------------- */
function updatePayload(k) {
  const text = phones[k].transcript.innerText.trim();
  const bytes = byteLength(text);
  phones[k].payloadBadge.textContent = tr(k, 'payload_text', { bytes });
}

['A', 'B'].forEach(k => {
  phones[k].transcript.addEventListener('input', () => updatePayload(k));
});

/* ---------------------------------------------------------
   Role rendering — which block is visible on which phone
--------------------------------------------------------- */
function renderRoles() {
  const sKey = senderKey(), rKey = receiverKey();

  Object.entries(phones).forEach(([k, p]) => {
    const isSender = k === sKey;
    p.senderBlock.classList.toggle('hidden', !isSender);
    p.receiverBlock.classList.toggle('hidden', isSender);
    p.roleLabel.textContent = isSender ? tr(k, 'role_sender') : tr(k, 'role_receiver');
    p.root.classList.toggle('swapped', !isSender && k === 'A');
  });

  phones.A.peerRole.textContent = sKey === 'A' ? tr('A', 'peer_receiver') : tr('A', 'peer_sender');
  phones.B.peerRole.textContent = sKey === 'B' ? tr('B', 'peer_receiver') : tr('B', 'peer_sender');
  phones.A.peerName.textContent = 'Phone B';
  phones.B.peerName.textContent = 'Phone A';

  demoHint.textContent = `Phone ${sKey} is the sender — its message will be sent to Phone ${rKey}.`;
}

/* ---------------------------------------------------------
   Alarm beep (Web Audio) — for the Emergency Priority Layer
--------------------------------------------------------- */
function playAlarmBeep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const beep = (freq, start, dur) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + start + 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + start + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + start);
      osc.stop(audioCtx.currentTime + start + dur + 0.05);
    };
    beep(880, 0, 0.18);
    beep(880, 0.26, 0.18);
  } catch (e) {
    // Web Audio unavailable — silently skip the tone, rest of the demo still works
  }
}

/* ---------------------------------------------------------
   Speech playback — real SpeechSynthesis where available,
   with a clearly-labeled fallback if not
--------------------------------------------------------- */
function speak(text, bcp47, { onstart, onend, rate = 1, pitch = 1 } = {}) {
  if (!('speechSynthesis' in window)) {
    toastMsg('SpeechSynthesis unavailable in this browser — showing simulated playback only');
    onstart && onstart();
    setTimeout(() => onend && onend(), 1800);
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = bcp47;
  utter.rate = rate;
  utter.pitch = pitch;
  let started = false;
  utter.onstart = () => { started = true; onstart && onstart(); };
  utter.onend = () => onend && onend();
  utter.onerror = () => {
    if (!started) toastMsg(`No installed voice for ${bcp47} — showing simulated playback only`);
    onend && onend();
  };
  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  isPlaying = false;
}

/* ---------------------------------------------------------
   Core simulate-call flow (generalised for either direction)
--------------------------------------------------------- */
async function simulateCall() {
  const sKey = senderKey(), rKey = receiverKey();
  const sender = phones[sKey], receiver = phones[rKey];
  const text = sender.transcript.innerText.trim() || 'Message ready to send.';
  updatePayload(sKey);

  sender.stateSend.textContent = tr(sKey, 'status_listening');
  receiver.stateRecv.textContent = tr(rKey, 'status_ready');
  sender.ring.classList.add('active');
  sender.ptt.classList.add('active');
  sender.pttText.textContent = tr(sKey, 'ptt_listening');
  toastMsg(`Capturing voice on Phone ${sKey}`);

  await wait(1100);

  sender.ptt.classList.remove('active');
  sender.pttText.textContent = tr(sKey, 'push_to_talk');
  sender.ring.classList.remove('active');
  sender.stateSend.textContent = tr(sKey, 'status_preparing');
  receiver.stateRecv.textContent = tr(rKey, 'status_waiting');

  await wait(650);
  sender.stateSend.textContent = tr(sKey, 'status_sending');
  receiver.stateRecv.textContent = tr(rKey, 'status_receiving');
  receiver.receivedMessage.textContent = tr(rKey, 'receiving_payload');

  await wait(850);
  sender.stateSend.textContent = tr(sKey, 'status_sent');
  receiver.stateRecv.textContent = tr(rKey, 'status_verifying');
  receiver.receivedMessage.textContent = `“${text}”`;
  receiver.receiveTime.textContent = now();
  receiver.receivedCard.classList.add('received');
  receiver.receivedCard.classList.remove('emergency');
  receiver.playBtn.disabled = false;

  await wait(450);
  receiver.stateRecv.textContent = tr(rKey, 'status_ready');
  receiver.ttsTitle.textContent = tr(rKey, 'ready_for_playback');
  receiver.ttsSub.textContent = tr(rKey, 'verified_tts');
  toastMsg(`Phone ${rKey} received the message`);
}

/* ---------------------------------------------------------
   Play-as-voice — actually speaks via SpeechSynthesis
--------------------------------------------------------- */
function wirePlayButton(k) {
  phones[k].playBtn.addEventListener('click', () => {
    const p = phones[k];
    const text = p.receivedMessage.textContent.replace(/^"|"$|^“|”$/g, '');
    if (!text) return;

    const bcp47 = bcp47For(p.langPlay);
    p.stateRecv.textContent = tr(k, 'status_playing');
    p.ttsTitle.textContent = tr(k, 'playing_voice');
    p.ttsSub.textContent = `${tr(k, 'text_to_speech')} • ${bcp47}`;
    isPlaying = true;

    speak(text, bcp47, {
      onstart: () => toastMsg('Voice playback started'),
      onend: () => {
        isPlaying = false;
        p.stateRecv.textContent = tr(k, 'status_ready');
        p.ttsTitle.textContent = tr(k, 'playback_complete');
        p.ttsSub.textContent = tr(k, 'ready_for_next');
      },
    });
  });
}
wirePlayButton('A');
wirePlayButton('B');

/* ---------------------------------------------------------
   Emergency — lives inside the sender phone's own screen.
   Whichever phone currently holds the sender role shows this
   button; tapping it sends a non-interruptible priority alert
   straight to the other phone, cancelling any playback in
   progress there first, per the PS's "non-interruptible" spec.
--------------------------------------------------------- */
function triggerEmergency(k) {
  const other = k === 'A' ? 'B' : 'A';
  const receiver = phones[other];
  const wasPlaying = isPlaying;

  if (wasPlaying) {
    stopSpeaking();
    toastMsg('Emergency alert interrupted ongoing playback');
  }

  playAlarmBeep();

  const emergencyText = 'EMERGENCY — Medical assistance required at current location.';
  receiver.receivedMessage.textContent = emergencyText;
  receiver.receiveTime.textContent = now();
  receiver.playBtn.disabled = false;
  receiver.receivedCard.classList.add('received', 'emergency');
  receiver.ttsTitle.textContent = tr(other, 'emergency_active');
  receiver.ttsSub.textContent = tr(other, 'emergency_desc');
  receiver.stateRecv.textContent = tr(other, 'status_priority');

  isPlaying = true;
  const bcp47 = bcp47For(receiver.langPlay);
  setTimeout(() => {
    speak(emergencyText, bcp47, {
      rate: 1.05,
      pitch: 1.15,
      onend: () => {
        isPlaying = false;
        receiver.stateRecv.textContent = tr(other, 'status_ready');
      },
    });
  }, 450); // let the alarm tone finish first

  toastMsg(`Emergency priority alert sent from Phone ${k} to Phone ${other}`);
}
phones.A.emergencyBtn.addEventListener('click', () => triggerEmergency('A'));
phones.B.emergencyBtn.addEventListener('click', () => triggerEmergency('B'));

/* ---------------------------------------------------------
   Swap / PTT / Simulate / UI language selects
--------------------------------------------------------- */
function bindPTT(k) {
  phones[k].ptt.addEventListener('click', () => {
    if (senderKey() !== k) return; // functionally disabled on the receiver-role side, not just dimmed
    simulateCall();
  });
}
bindPTT('A');
bindPTT('B');

simulateBtn.addEventListener('click', simulateCall);

swapBtn.addEventListener('click', () => {
  swapped = !swapped;
  renderRoles();
  toastMsg(`Roles swapped — Phone ${senderKey()} is now the sender`);
});

['A', 'B'].forEach(k => {
  phones[k].langUI.value = uiLang[k];
  phones[k].langUI.addEventListener('change', e => {
    uiLang[k] = e.target.value;
    applyTranslations(k);
    toastMsg(`Phone ${k} UI switched to: ${e.target.selectedOptions[0].textContent}`);
  });
});

/* ---------------------------------------------------------
   Clock + language toasts
--------------------------------------------------------- */
function updateTimes() {
  document.getElementById('timeA').textContent = now();
  document.getElementById('timeB').textContent = now();
}
updateTimes();
setInterval(updateTimes, 30000);

['A', 'B'].forEach(k => {
  phones[k].langSend.addEventListener('change', e => {
    const label = e.target.selectedOptions[0].textContent;
    toastMsg(`Phone ${k} will speak in: ${label}`);
  });
  phones[k].langPlay.addEventListener('change', e => {
    const label = e.target.selectedOptions[0].textContent;
    toastMsg(`Phone ${k} will play back in: ${label}`);
  });
});

/* ---------------------------------------------------------
   Initial render
--------------------------------------------------------- */
['A', 'B'].forEach(k => {
  updatePayload(k);
  renderTransportLines(k);
});
renderRoles();
