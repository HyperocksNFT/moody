import { useMemo } from 'react'

/**
 * Editor — Script input screen with settings panel.
 * Clean, dark-themed interface for writing/pasting teleprompter scripts.
 */

const SAMPLE_TEXT = `Welcome to Moody — your personal teleprompter.

Paste your script here, or start typing. When you're ready, hit "Start Prompter" and the countdown will begin.

The teleprompter scrolls your text smoothly from bottom to top, highlighting the current line so you always know where you are.

Enable Voice Follow to let Moody scroll when you speak and pause when you stop. It's like magic.

Keyboard shortcuts: Space to play/pause, arrows for speed, +/- for font size, V for voice, M for mirror mode, F for fullscreen, Escape to exit.

Good luck with your recording!`

export default function Editor({
  script,
  setScript,
  fontSize,
  setFontSize,
  scrollSpeed,
  setScrollSpeed,
  showCountdown,
  setShowCountdown,
  mirrorMode,
  setMirrorMode,
  voiceFollow,
  setVoiceFollow,
  onStart,
}) {
  // Word and character count
  const stats = useMemo(() => {
    const chars = script.length
    const words = script.trim() ? script.trim().split(/\s+/).length : 0
    // Rough reading time at ~150 wpm (teleprompter pace)
    const readingTime = Math.ceil(words / 150)
    return { chars, words, readingTime }
  }, [script])

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1a1a1a' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: '#6366f1', color: 'white' }}
          >
            M
          </div>
          <h1 className="text-lg font-semibold" style={{ color: '#e5e5e5' }}>
            Moody
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a1a1a', color: '#666' }}>
            Teleprompter
          </span>
        </div>

        <button
          onClick={onStart}
          disabled={!script.trim()}
          className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: script.trim() ? '#6366f1' : '#333',
            color: 'white',
            boxShadow: script.trim() ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => script.trim() && (e.target.style.background = '#818cf8')}
          onMouseLeave={(e) => script.trim() && (e.target.style.background = '#6366f1')}
        >
          Start Prompter →
        </button>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Script textarea */}
        <div className="flex-1 flex flex-col p-6">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste or type your script here..."
            className="flex-1 w-full resize-none rounded-xl p-6 text-base leading-relaxed transition-all duration-200"
            style={{
              background: '#111',
              color: '#e5e5e5',
              border: '1px solid #222',
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: '14px',
              lineHeight: '1.8',
            }}
          />

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#555' }}>
            <span>{stats.words} words</span>
            <span>·</span>
            <span>{stats.chars} characters</span>
            <span>·</span>
            <span>~{stats.readingTime} min read</span>
            {!script.trim() && (
              <>
                <span>·</span>
                <button
                  onClick={() => setScript(SAMPLE_TEXT)}
                  className="underline transition-colors hover:text-indigo-400"
                >
                  Load sample text
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings sidebar */}
        <aside
          className="w-72 p-6 border-l overflow-y-auto flex flex-col gap-6"
          style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#555' }}>
            Settings
          </h2>

          {/* Font size */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: '#a3a3a3' }}>Font Size</label>
              <span className="text-xs font-mono" style={{ color: '#555' }}>{fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Scroll speed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm" style={{ color: '#a3a3a3' }}>Scroll Speed</label>
              <span className="text-xs font-mono" style={{ color: '#555' }}>{scrollSpeed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.25"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Countdown"
              sublabel="3-2-1 before start"
              checked={showCountdown}
              onChange={setShowCountdown}
            />
            <ToggleRow
              label="Mirror Mode"
              sublabel="Flip text horizontally"
              checked={mirrorMode}
              onChange={setMirrorMode}
            />
            <ToggleRow
              label="Voice Follow"
              sublabel="Scroll with your voice"
              checked={voiceFollow}
              onChange={setVoiceFollow}
            />
          </div>

          {/* Keyboard shortcuts */}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: '#1a1a1a' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#444' }}>
              Shortcuts
            </h3>
            <div className="flex flex-col gap-1.5 text-xs" style={{ color: '#555' }}>
              <ShortcutRow keys="Space" desc="Play / Pause" />
              <ShortcutRow keys="↑ / ↓" desc="Speed" />
              <ShortcutRow keys="+ / −" desc="Font size" />
              <ShortcutRow keys="V" desc="Voice follow" />
              <ShortcutRow keys="M" desc="Mirror mode" />
              <ShortcutRow keys="F" desc="Fullscreen" />
              <ShortcutRow keys="Esc" desc="Exit" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ── Toggle row component ─────────────────────────────── */
function ToggleRow({ label, sublabel, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm" style={{ color: '#e5e5e5' }}>{label}</span>
        {sublabel && (
          <p className="text-xs mt-0.5" style={{ color: '#555' }}>{sublabel}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5.5 rounded-full transition-colors duration-200"
        style={{
          background: checked ? '#6366f1' : '#333',
          width: '40px',
          height: '22px',
        }}
      >
        <div
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform duration-200"
          style={{
            width: '18px',
            height: '18px',
            top: '2px',
            left: '2px',
            background: 'white',
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}

/* ── Shortcut row component ───────────────────────────── */
function ShortcutRow({ keys, desc }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="px-1.5 py-0.5 rounded font-mono"
        style={{ background: '#1a1a1a', fontSize: '10px', color: '#777' }}
      >
        {keys}
      </span>
      <span>{desc}</span>
    </div>
  )
}
