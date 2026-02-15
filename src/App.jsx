import { useState, useEffect, useCallback } from 'react'
import Editor from './components/Editor'
import Prompter from './components/Prompter'

/**
 * App — Root component for Moody teleprompter.
 * Manages two modes: Editor (write/paste script) and Prompter (full-screen scroll).
 * All settings persist in localStorage.
 */

// localStorage keys
const STORAGE_KEYS = {
  script: 'moody-script',
  fontSize: 'moody-fontSize',
  scrollSpeed: 'moody-scrollSpeed',
  showCountdown: 'moody-showCountdown',
  mirrorMode: 'moody-mirrorMode',
  voiceFollow: 'moody-voiceFollow',
}

// Load a value from localStorage with a fallback
function loadSetting(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback
    return JSON.parse(stored)
  } catch {
    return fallback
  }
}

// Save a value to localStorage
function saveSetting(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Silently fail if storage is full
  }
}

export default function App() {
  // ── App mode ───────────────────────────────────────────
  const [mode, setMode] = useState('editor') // 'editor' | 'prompter'

  // ── Persisted settings ─────────────────────────────────
  const [script, setScript] = useState(() => loadSetting(STORAGE_KEYS.script, ''))
  const [fontSize, setFontSize] = useState(() => loadSetting(STORAGE_KEYS.fontSize, 32))
  const [scrollSpeed, setScrollSpeed] = useState(() => loadSetting(STORAGE_KEYS.scrollSpeed, 1))
  const [showCountdown, setShowCountdown] = useState(() => loadSetting(STORAGE_KEYS.showCountdown, true))
  const [mirrorMode, setMirrorMode] = useState(() => loadSetting(STORAGE_KEYS.mirrorMode, false))
  const [voiceFollow, setVoiceFollow] = useState(() => loadSetting(STORAGE_KEYS.voiceFollow, false))

  // ── Persist settings on change ─────────────────────────
  useEffect(() => { saveSetting(STORAGE_KEYS.script, script) }, [script])
  useEffect(() => { saveSetting(STORAGE_KEYS.fontSize, fontSize) }, [fontSize])
  useEffect(() => { saveSetting(STORAGE_KEYS.scrollSpeed, scrollSpeed) }, [scrollSpeed])
  useEffect(() => { saveSetting(STORAGE_KEYS.showCountdown, showCountdown) }, [showCountdown])
  useEffect(() => { saveSetting(STORAGE_KEYS.mirrorMode, mirrorMode) }, [mirrorMode])
  useEffect(() => { saveSetting(STORAGE_KEYS.voiceFollow, voiceFollow) }, [voiceFollow])

  // ── Mode transitions ───────────────────────────────────
  const startPrompter = useCallback(() => {
    if (!script.trim()) return
    setMode('prompter')
  }, [script])

  const exitPrompter = useCallback(() => {
    setMode('editor')
  }, [])

  // ── Render ─────────────────────────────────────────────
  if (mode === 'prompter') {
    return (
      <Prompter
        script={script}
        fontSize={fontSize}
        scrollSpeed={scrollSpeed}
        showCountdown={showCountdown}
        mirrorMode={mirrorMode}
        voiceFollow={voiceFollow}
        onExit={exitPrompter}
      />
    )
  }

  return (
    <Editor
      script={script}
      setScript={setScript}
      fontSize={fontSize}
      setFontSize={setFontSize}
      scrollSpeed={scrollSpeed}
      setScrollSpeed={setScrollSpeed}
      showCountdown={showCountdown}
      setShowCountdown={setShowCountdown}
      mirrorMode={mirrorMode}
      setMirrorMode={setMirrorMode}
      voiceFollow={voiceFollow}
      setVoiceFollow={setVoiceFollow}
      onStart={startPrompter}
    />
  )
}
