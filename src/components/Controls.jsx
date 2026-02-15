/**
 * Controls — Floating teleprompter control bar.
 * Appears on mouse movement, fades after 2 seconds of inactivity.
 */
export default function Controls({
  isPlaying,
  speed,
  fontSize,
  elapsed,
  isVoiceActive,
  isVoiceFollowing,
  onTogglePlay,
  onFaster,
  onSlower,
  onFontIncrease,
  onFontDecrease,
  onExit,
  visible,
}) {
  // Format elapsed time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="controls-overlay fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl"
      style={{
        background: 'rgba(23, 23, 23, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6,4 20,12 6,20" />
          </svg>
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Speed controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSlower}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors hover:bg-white/10"
          title="Slower (↓)"
          style={{ color: speed <= 0.5 ? '#555' : '#e5e5e5' }}
        >
          −
        </button>
        <span className="text-xs font-medium w-10 text-center" style={{ color: '#a3a3a3' }}>
          {speed.toFixed(2)}x
        </span>
        <button
          onClick={onFaster}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors hover:bg-white/10"
          title="Faster (↑)"
          style={{ color: speed >= 3 ? '#555' : '#e5e5e5' }}
        >
          +
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Font size controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onFontDecrease}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          title="Smaller text (-)"
          style={{ fontSize: '12px' }}
        >
          A
        </button>
        <span className="text-xs w-8 text-center" style={{ color: '#a3a3a3' }}>
          {fontSize}
        </span>
        <button
          onClick={onFontIncrease}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          title="Larger text (+)"
          style={{ fontSize: '16px' }}
        >
          A
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Voice indicator */}
      {isVoiceFollowing && (
        <>
          <div className="flex items-center gap-2" title="Voice follow active">
            <div className="relative flex items-center justify-center">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: isVoiceActive ? '#22c55e' : '#555',
                  transition: 'background 0.2s ease',
                }}
              />
              {isVoiceActive && (
                <div
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    background: '#22c55e',
                    animation: 'pulse-ring 1s ease-out infinite',
                  }}
                />
              )}
            </div>
            <span className="text-xs" style={{ color: '#a3a3a3' }}>
              Voice
            </span>
          </div>
          <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </>
      )}

      {/* Timer */}
      <span className="text-xs font-mono tabular-nums" style={{ color: '#a3a3a3' }}>
        {formatTime(elapsed)}
      </span>

      {/* Divider */}
      <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Exit */}
      <button
        onClick={onExit}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/20 hover:text-red-400"
        title="Exit (Esc)"
        style={{ color: '#a3a3a3' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
