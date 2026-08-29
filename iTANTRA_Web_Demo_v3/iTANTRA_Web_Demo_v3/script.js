/* ---------------------------------------------------------
   iTANTRA Web Demo v3 — state
--------------------------------------------------------- */
let swapped = false;          // false: A=sender, B=receiver. true: reversed.
let track = 'core';           // 'core' | 'stretch'
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
    signal: document.getElementById('signal' + id),
    senderBlock: document.getElementById('senderBlock' + id),
    receiverBlock: document.getElementById('receiverBlock' + id),
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
const trackToggle = document.getElementById('trackToggle');
const linkPillText = document.getElementById('linkPillText');
const demoHint = document.getElementById('demoHint');
const swapBtn = document.getElementById('swapBtn');
const simulateBtn = document.getElementById('simulateBtn');
const emergencyBtn = document.getElementById('emergencyBtn');

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
  buildLanguageOptions(phones[k].langSend);
  buildLanguageOptions(phones[k].langPlay);
});

/* ---------------------------------------------------------
   Transport line rendering (track-aware, honest labeling)
--------------------------------------------------------- */
function buildLine(container, steps) {
  container.innerHTML = steps
    .map((s, i) => (i === 0 ? `<span>${s}</span>` : `<i>→</i><span>${s}</span>`))
    .join('');
}

function renderTransportLines() {
  const senderSteps = track === 'core'
    ? ['Speech', 'STT', 'Text', 'Link']
    : ['Speech', 'STT', 'Text', 'Compress', 'Encrypt', 'LoRa'];
  const receiverSteps = track === 'core'
    ? ['Link', 'Verify', 'Text', 'TTS']
    : ['LoRa', 'Decrypt', 'Verify', 'Decompress', 'TTS'];

  ['A', 'B'].forEach(k => {
    buildLine(phones[k].transportSend, senderSteps);
    buildLine(phones[k].transportRecv, receiverSteps);
    phones[k].secureLine.innerHTML = track === 'core'
      ? '<span>✓</span> Text payload — secured by OS-level Bluetooth/Wi-Fi Direct'
      : '<span>✓</span> Text payload — encrypted (ChaCha20-Poly1305)';
    phones[k].signal.textContent = track === 'core' ? '●  Wi-Fi  82%' : '📡  LoRa  −92 dBm';
  });

  linkPillText.textContent = track === 'core' ? 'Bluetooth / Wi-Fi Direct' : 'LoRa (865–867 MHz)';
}

/* ---------------------------------------------------------
   Payload byte counters — live, tied to actual typed text
--------------------------------------------------------- */
function updatePayload(k) {
  const text = phones[k].transcript.innerText.trim();
  const bytes = byteLength(text);
  const overhead = track === 'core' ? 0 : 25; // rough demo-only illustrative envelope overhead for Stretch
  phones[k].payloadBadge.textContent = overhead
    ? `~${bytes} bytes text + ~${overhead} bytes envelope ≈ ${bytes + overhead} bytes total`
    : `~${bytes} bytes (text payload, not audio)`;
}

['A', 'B'].forEach(k => {
  phones[k].transcript.addEventListener('input', () => updatePayload(k));
  updatePayload(k);
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
    p.roleLabel.textContent = isSender ? 'SENDER' : 'RECEIVER';
    p.root.classList.toggle('swapped', !isSender && k === 'A');
  });

  phones.A.peerRole.textContent = sKey === 'A' ? 'Receiver' : 'Sender';
  phones.B.peerRole.textContent = sKey === 'B' ? 'Receiver' : 'Sender';
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

  const mult = track === 'core' ? 1 : 2.6; // Stretch track: airtime dominates latency, per project's own airtime math

  sender.stateSend.textContent = 'LISTENING';
  receiver.stateRecv.textContent = 'READY';
  sender.ring.classList.add('active');
  sender.ptt.classList.add('active');
  sender.pttText.textContent = 'LISTENING…';
  toastMsg(`Capturing voice on Phone ${sKey}`);

  await wait(1100);

  sender.ptt.classList.remove('active');
  sender.pttText.textContent = 'PUSH TO TALK';
  sender.ring.classList.remove('active');
  sender.stateSend.textContent = track === 'core' ? 'PREPARING' : 'ENCRYPTING';
  receiver.stateRecv.textContent = 'WAITING';

  await wait(650 * mult);
  sender.stateSend.textContent = 'SENDING';
  receiver.stateRecv.textContent = 'RECEIVING';
  receiver.receivedMessage.textContent = 'Receiving text payload…';

  await wait(850 * mult);
  sender.stateSend.textContent = 'SENT';
  receiver.stateRecv.textContent = 'VERIFYING';
  receiver.receivedMessage.textContent = `“${text}”`;
  receiver.receiveTime.textContent = now();
  receiver.receivedCard.classList.add('received');
  receiver.receivedCard.classList.remove('emergency');
  receiver.playBtn.disabled = false;

  await wait(450);
  receiver.stateRecv.textContent = 'READY';
  receiver.ttsTitle.textContent = 'Message ready for playback';
  receiver.ttsSub.textContent = `Verified • TTS on-device (${track === 'core' ? 'Core Track' : 'Stretch Track'})`;
  toastMsg(`Phone ${rKey} received the message`);
}

/* ---------------------------------------------------------
   Play-as-voice — actually speaks via SpeechSynthesis
--------------------------------------------------------- */
function wirePlayButton(k) {
  phones[k].playBtn.addEventListener('click', () => {
    const p = phones[k];
    const text = p.receivedMessage.textContent.replace(/^"|"$|^“|”$/g, '');
    if (!text || text.includes('Waiting for a message')) return;

    const bcp47 = bcp47For(p.langPlay);
    p.stateRecv.textContent = 'PLAYING';
    p.ttsTitle.textContent = 'Playing voice…';
    p.ttsSub.textContent = `Text → speech • ${bcp47}`;
    isPlaying = true;

    speak(text, bcp47, {
      onstart: () => toastMsg('Voice playback started'),
      onend: () => {
        isPlaying = false;
        p.stateRecv.textContent = 'READY';
        p.ttsTitle.textContent = 'Playback complete';
        p.ttsSub.textContent = 'Ready for the next message';
      },
    });
  });
}
wirePlayButton('A');
wirePlayButton('B');

/* ---------------------------------------------------------
   Emergency — interrupts any in-progress playback, per PS
--------------------------------------------------------- */
emergencyBtn.addEventListener('click', () => {
  const sKey = senderKey(), rKey = receiverKey();
  const receiver = phones[rKey];
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
  receiver.ttsTitle.textContent = 'EMERGENCY ALERT ACTIVE';
  receiver.ttsSub.textContent = 'Maximum volume (simulated) • Non-interruptible';
  receiver.stateRecv.textContent = 'PRIORITY';

  isPlaying = true;
  const bcp47 = bcp47For(receiver.langPlay);
  setTimeout(() => {
    speak(emergencyText, bcp47, {
      rate: 1.05,
      pitch: 1.15,
      onend: () => {
        isPlaying = false;
        receiver.stateRecv.textContent = 'READY';
      },
    });
  }, 450); // let the alarm tone finish first

  toastMsg(`Emergency priority alert sent from Phone ${sKey} to Phone ${rKey}`);
});

/* ---------------------------------------------------------
   Swap / Track toggle / Buttons
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

trackToggle.addEventListener('click', (e) => {
  const btn = e.target.closest('.track-btn');
  if (!btn) return;
  track = btn.dataset.track;
  [...trackToggle.querySelectorAll('.track-btn')].forEach(b => b.classList.toggle('active', b === btn));
  renderTransportLines();
  ['A', 'B'].forEach(updatePayload);
  toastMsg(track === 'core'
    ? 'Core Track: matches the PS transport spec directly'
    : 'Stretch Track: optional LoRa range extension, not required by the PS');
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
renderRoles();
renderTransportLines();
