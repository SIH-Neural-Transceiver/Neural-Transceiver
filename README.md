# iTANTRA Web Demo v4

A presentation-focused front-end prototype for iTANTRA.

## What changed from v3

- **Emergency button moved inside the phone screen.** There's no more
  separate "Emergency Priority" strip below the phones. Each phone now has
  its own "Send emergency alert" button embedded in its screen — it only
  appears on whichever phone currently holds the sender role, and sends a
  non-interruptible priority alert straight to the other phone.
- **Stretch Track / LoRa removed entirely.** The Core/Stretch toggle is gone.
  The demo now only shows the Core Track transport (Bluetooth / Wi-Fi
  Direct), matching the PS's required transport directly with no optional
  extension to explain away.
- **Full per-phone UI translation across all 10 languages.** Previously the
  language dropdowns only controlled speech-to-text/playback language. Now
  each phone also has its own **App language** selector that switches every
  visible label, button, and status word on that phone's screen — role
  labels, transcription card, push-to-talk button, transport states,
  received-message card, nav bar, and the emergency button — independently
  per phone. Phone A can run the UI in Tamil while Phone B runs it in
  Bengali, for example.

## Notes / scope

- User-typed transcript text and toast notifications are intentionally left
  untranslated (they're user data / transient chrome, not fixed UI copy).
- Protocol acronyms (STT, TTS) are kept as-is across languages, matching how
  they're conventionally referred to.

## Run
Open `index.html` in a browser. Chrome/Edge have the broadest Speech
Synthesis language coverage; voice availability for some Indian languages
varies by OS and browser.

## GitHub Pages
Upload `index.html`, `style.css`, and `script.js` to the repository root and enable:
Settings → Pages → Deploy from a branch → `main` → `/ (root)`

This is a front-end simulation, not the native Android implementation. Real
STT, on-device TTS, encryption, and Bluetooth/Wi-Fi Direct transport are
implemented separately in the native application, per the V2 architecture.
