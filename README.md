# iTANTRA Web Demo v3

A presentation-focused front-end prototype for iTANTRA. This revision fixes the
functional issues found in v2 and adds several improvements to make a live
SIH demo more convincing and more technically honest.

## What changed from v2

**Fixed bugs**
- Swap sender/receiver now actually works — both phones have full sender and
  receiver UI blocks, and the simulation logic reads the live `swapped` state
  instead of always animating Phone A → Phone B.
- Phone B's PTT button is now wired up (previously only Phone A's was) and
  each PTT button is functionally disabled — not just dimmed — when that
  phone is in receiver role, matching the walkie-talkie half-duplex model.
- The transcript is now editable (`contenteditable`) on both phones instead
  of a hardcoded sentence, so a live demo can use a different message each run.

**Honesty / terminology fixes**
- Added a **Core Track / Stretch Track** toggle. Core Track (Bluetooth/Wi-Fi
  Direct) labels the payload "Text payload — secured by OS-level transport"
  and the Stretch Track (LoRa) labels it "encrypted (ChaCha20-Poly1305)" —
  the demo no longer implies uniform app-level encryption on both tracks,
  matching the actual V2 architecture decision.
- Transport lines now differ correctly by track (Core: `Speech→STT→Text→Link`;
  Stretch: `Speech→STT→Text→Compress→Encrypt→LoRa`).
- A small "sim" tooltip badge next to the Transmission/Reception headers
  makes clear the timing values are illustrative, not measured latency.
- The prototype note now explicitly says voice playback uses the browser's
  Speech Synthesis API for demo convenience only, and is not the real
  offline on-device Android TTS engine.
- Header chip renamed "Offline Mode ✓" for clarity (was ambiguous "Offline"
  styled green, which could read as a warning at a glance).

**New functionality**
- **Real voice playback** via the Web Speech Synthesis API (`speechSynthesis`),
  using the selected playback language's BCP-47 code, with a clear fallback
  message if a voice for that language isn't installed in the browser.
- **Emergency alerts now actually interrupt in-progress playback** — if a
  normal message is playing when Emergency is triggered, playback is cancelled
  before the alert plays, demonstrating the PS's "non-interruptible" requirement
  live instead of just asserting it in copy.
- **Alarm tone** (Web Audio oscillator beep) plays before the emergency voice
  alert, matching the "Alarm Tone / Voice Alert Indication" step from the
  system flowchart.
- **Live payload byte counter**, computed from the actual typed message
  (`TextEncoder`), directly demonstrating the "transmit text, not audio"
  claim instead of only asserting it in a feature card.
- Language dropdowns now show English names alongside native script
  (e.g., "हिन्दी (Hindi)") for judges unfamiliar with the scripts.

## Run
Open `index.html` in a browser. Chrome/Edge have the broadest Speech
Synthesis language coverage; voice availability for some Indian languages
varies by OS and browser.

## GitHub Pages
Upload `index.html`, `style.css`, and `script.js` to the repository root and enable:
Settings → Pages → Deploy from a branch → `main` → `/ (root)`

This is a front-end simulation, not the native Android implementation. Real
STT, on-device TTS, encryption, and Bluetooth/Wi-Fi/LoRa transport are
implemented separately in the native application, per the V2 architecture.
