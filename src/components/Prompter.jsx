import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import useScroll from '../hooks/useScroll'
import useVoiceFollow from '../hooks/useVoiceFollow'
import useKeyboard from '../hooks/useKeyboard'
import Controls from './Controls'
import Countdown from './Countdown'

/**
 * Prompter — Full-screen teleprompter view.
 * Smooth scrolling, line highlighting, gradient edges, voice follow,
 * and keyboard/mouse controls.
 */
export default function Prompter({
  script,
  fontSize: initialFontSize,
  scrollSpeed: initialSpeed,
  showCountdown: shouldCountdown,
  mirrorMode: initialMirror,
  voiceFollow: initialVoiceFollow,
  onExit,
}) {
  // ── State ──────────────────────────────────────────────
  const [fontSize, setFontSize] = useState(initialFontSize)
  const [mirrorMode, setMirrorMode] = useState(initialMirror)
  const [voiceFollowEnabled, setVoiceFollowEnabled] = useState(initialVoiceFollow)
  const [countingDown, setCountingDown] = useState(shouldCountdown)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  // ── Refs ───────────────────────────────────────────────
  const containerRef = useRef(null)
  const controlsTimerRef = useRef(null)
  const elapsedTimerRef = useRef(null)
  const startTimeRef = useRef(null)

  // ── Hooks ──────────────────────────────────────────────
  const scroll = useScroll(containerRef, { initialSpeed })
  const voice = useVoiceFollow()

  // Split script into lines for rendering
  const lines = useMemo(() => {
    return script.split('\n').map((line, i) => ({
      id: i,
      text: line,
      isEmpty: line.trim() === '',
    }))
  }, [script])

  // ── Voice follow logic ─────────────────────────────────
  useEffect(() => {
    if (!voiceFollowEnabled || countingDown || scroll.isDone) return

    if (voice.isVoiceDetected) {
      if (!scroll.isPlaying) scroll.play()
    } else {
      if (scroll.isPlaying) scroll.pause()
    }
  }, [voice.isVoiceDetected, voiceFollowEnabled, countingDown, scroll])

  // Start/stop voice recognition
  useEffect(() => {
    if (voiceFollowEnabled && !countingDown) {
      voice.startListening()
    } else {
      voice.stopListening()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceFollowEnabled, countingDown])

  // ── Elapsed timer ──────────────────────────────────────
  useEffect(() => {
    if (scroll.isPlaying && !startTimeRef.current) {
      startTimeRef.current = Date.now() - elapsed * 1000
    }

    if (scroll.isPlaying) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000)
      }, 100)
    } else {
      clearInterval(elapsedTimerRef.current)
    }

    return () => clearInterval(elapsedTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll.isPlaying])

  // ── Controls auto-hide ─────────────────────────────────
  const showControls = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => {
      if (scroll.isPlaying) setControlsVisible(false)
    }, 2000)
  }, [scroll.isPlaying])

  useEffect(() => {
    const handleMouseMove = () => showControls()
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(controlsTimerRef.current)
    }
  }, [showControls])

  // Show controls when paused
  useEffect(() => {
    if (!scroll.isPlaying) setControlsVisible(true)
  }, [scroll.isPlaying])

  // ── Font size helpers ──────────────────────────────────
  const fontIncrease = useCallback(() => setFontSize(prev => Math.min(prev + 2, 96)), [])
  const fontDecrease = useCallback(() => setFontSize(prev => Math.max(prev - 2, 12)), [])

  // ── Fullscreen ─────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  // ── Exit handler ───────────────────────────────────────
  const handleExit = useCallback(() => {
    scroll.pause()
    voice.stopListening()
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    }
    onExit()
  }, [scroll, voice, onExit])

  // ── Keyboard shortcuts ─────────────────────────────────
  useKeyboard({
    onTogglePlay: scroll.toggle,
    onFaster: scroll.faster,
    onSlower: scroll.slower,
    onFontIncrease: fontIncrease,
    onFontDecrease: fontDecrease,
    onToggleFullscreen: toggleFullscreen,
    onToggleMirror: () => setMirrorMode(prev => !prev),
    onToggleVoice: () => setVoiceFollowEnabled(prev => !prev),
    onExit: handleExit,
  }, !countingDown)

  // ── Countdown complete handler ─────────────────────────
  const handleCountdownComplete = useCallback(() => {
    setCountingDown(false)
    if (!voiceFollowEnabled) {
      scroll.play()
    }
  }, [scroll, voiceFollowEnabled])

  // ── Line position tracking for highlighting ────────────
  const lineRefs = useRef([])
  const [activeLine, setActiveLine] = useState(0)

  // Track which line is in the center of the viewport
  useEffect(() => {
    if (countingDown) return

    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const centerY = container.clientHeight / 2
      let closestLine = 0
      let closestDistance = Infinity

      lineRefs.current.forEach((el, index) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const lineCenter = rect.top - containerRect.top + rect.height / 2
        const distance = Math.abs(lineCenter - centerY)

        if (distance < closestDistance) {
          closestDistance = distance
          closestLine = index
        }
      })

      setActiveLine(closestLine)
      scroll.updateProgress()
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [countingDown, scroll])

  // ── Render ─────────────────────────────────────────────
  if (countingDown) {
    return <Countdown onComplete={handleCountdownComplete} />
  }

  return (
    <div
      className="fixed inset-0 z-30"
      style={{ background: '#0a0a0a', cursor: controlsVisible ? 'default' : 'none' }}
    >
      {/* Scrollable text container */}
      <div
        ref={containerRef}
        className={`h-full overflow-y-auto ${mirrorMode ? 'mirror' : ''}`}
        style={{
          scrollBehavior: 'auto', // We control scroll via rAF
        }}
      >
        {/* Top spacer — start text at bottom of screen */}
        <div style={{ height: '50vh' }} />

        {/* Script lines */}
        <div
          className="max-w-4xl mx-auto px-8 pb-8"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          {lines.map((line, index) => (
            <div
              key={line.id}
              ref={(el) => (lineRefs.current[index] = el)}
              className="prompter-line py-1 transition-all duration-300 border-l-2 border-transparent"
              style={{
                color:
                  index === activeLine
                    ? '#ffffff'
                    : index < activeLine
                    ? '#666'
                    : '#b0b0b0',
                borderLeftColor: index === activeLine ? '#6366f1' : 'transparent',
                paddingLeft: index === activeLine ? '16px' : '18px',
                opacity: index === activeLine ? 1 : index < activeLine ? 0.4 : 0.75,
                minHeight: line.isEmpty ? `${fontSize * 0.8}px` : 'auto',
              }}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>

        {/* Bottom spacer — allow scrolling past last line */}
        <div style={{ height: '50vh' }} />
      </div>

      {/* Top gradient fade */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none z-35"
        style={{
          height: '20vh',
          background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)',
        }}
      />

      {/* Bottom gradient fade */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none z-35"
        style={{
          height: '25vh',
          background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)',
        }}
      />

      {/* Center line indicator */}
      <div
        className="fixed left-0 right-0 pointer-events-none z-35"
        style={{
          top: '50%',
          height: '1px',
          background: 'rgba(99, 102, 241, 0.08)',
        }}
      />

      {/* Progress bar */}
      <div
        className="fixed bottom-0 left-0 z-40"
        style={{
          height: '2px',
          width: `${scroll.progress * 100}%`,
          background: 'linear-gradient(to right, #6366f1, #818cf8)',
          transition: 'width 0.1s linear',
        }}
      />

      {/* Done overlay */}
      {scroll.isDone && (
        <div
          className="fixed inset-0 z-45 flex flex-col items-center justify-center gap-6"
          style={{
            background: 'rgba(10, 10, 10, 0.9)',
            animation: 'fade-in 0.5s ease',
          }}
        >
          <div className="text-6xl">✓</div>
          <h2 className="text-2xl font-semibold" style={{ color: '#e5e5e5' }}>
            You're done!
          </h2>
          <p className="text-sm" style={{ color: '#666' }}>
            {Math.floor(elapsed / 60)}m {Math.floor(elapsed % 60)}s elapsed
          </p>
          <button
            onClick={handleExit}
            className="mt-4 px-8 py-3 rounded-xl font-medium transition-colors"
            style={{ background: '#6366f1', color: 'white' }}
            onMouseEnter={(e) => (e.target.style.background = '#818cf8')}
            onMouseLeave={(e) => (e.target.style.background = '#6366f1')}
          >
            Back to Editor
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <Controls
        isPlaying={scroll.isPlaying}
        speed={scroll.speed}
        fontSize={fontSize}
        elapsed={elapsed}
        isVoiceActive={voice.isVoiceDetected}
        isVoiceFollowing={voiceFollowEnabled}
        onTogglePlay={scroll.toggle}
        onFaster={scroll.faster}
        onSlower={scroll.slower}
        onFontIncrease={fontIncrease}
        onFontDecrease={fontDecrease}
        onExit={handleExit}
        visible={controlsVisible}
      />
    </div>
  )
}
