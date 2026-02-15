# Moody Clone — Teleprompter App

## Concept
Téléprompter intelligent qui se positionne près de la caméra (notch ou haut d'écran).
Le texte scrolle automatiquement et suit ta voix — quand tu parles ça scroll, quand tu t'arrêtes ça pause.

## Features v1.0
- [ ] Script editor (textarea pour coller/écrire ton texte)
- [ ] Mode téléprompter plein écran avec scrolling smooth
- [ ] Voice-following via Web Speech API (pause/resume auto)
- [ ] Contrôle vitesse de scroll (slider + raccourcis)
- [ ] Contrôle taille du texte
- [ ] Mode compact (petite fenêtre toujours au-dessus)
- [ ] Mode miroir (texte inversé pour vrais prompters)
- [ ] Raccourcis clavier (Space = pause, ↑↓ = vitesse, F = fullscreen)
- [ ] Timer / compte à rebours avant démarrage
- [ ] Dark mode par défaut, design minimal

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Desktop**: Electron (fenêtre frameless, always-on-top, transparent)
- **Voice**: Web Speech API (SpeechRecognition)
- **Build**: electron-builder pour macOS/Windows/Linux
- **CI**: GitHub Actions pour builds cross-platform
- **Deploy**: GitHub Releases + landing page web

## Architecture
```
moody/
├── src/                    # React app
│   ├── App.jsx            # Main app
│   ├── components/
│   │   ├── Editor.jsx     # Script editor
│   │   ├── Prompter.jsx   # Teleprompter view
│   │   ├── Controls.jsx   # Speed, size, voice controls
│   │   └── Countdown.jsx  # 3-2-1 countdown
│   ├── hooks/
│   │   ├── useVoiceFollow.js  # Web Speech API
│   │   └── useScroll.js       # Smooth scroll logic
│   └── styles/
├── electron/               # Electron main process
│   ├── main.js
│   └── preload.js
├── public/
├── .github/workflows/      # CI/CD
│   └── build.yml
├── package.json
└── README.md
```

## Design
- Background: #0a0a0a (near black)
- Text: #f5f5f5 (off white)
- Accent: #6366f1 (indigo)
- Font: system-ui, monospace option
- Esthétique: minimale, pro, comme le reel
