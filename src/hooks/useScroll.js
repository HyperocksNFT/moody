import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * useScroll — Smooth teleprompter scroll engine using requestAnimationFrame.
 * Provides play/pause, speed control, and progress tracking.
 *
 * @param {React.RefObject} containerRef — ref to the scrollable container
 * @param {Object} options
 * @param {number} options.initialSpeed — default speed multiplier (1 = ~40px/s)
 */
export default function useScroll(containerRef, { initialSpeed = 1 } = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(initialSpeed)
  const [progress, setProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)

  const animFrameRef = useRef(null)
  const lastTimeRef = useRef(null)
  const isPlayingRef = useRef(false)
  const speedRef = useRef(initialSpeed)

  // Keep refs in sync with state
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  // Base scroll speed in pixels per second
  const BASE_SPEED = 40

  const updateProgress = useCallback(() => {
    const el = containerRef.current
    if (!el) return 0

    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll <= 0) return 0

    const p = Math.min(el.scrollTop / maxScroll, 1)
    setProgress(p)

    if (p >= 0.999) {
      setIsDone(true)
      setIsPlaying(false)
      isPlayingRef.current = false
    }

    return p
  }, [containerRef])

  // Animation loop
  const tick = useCallback((timestamp) => {
    if (!isPlayingRef.current) return

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp
    }

    const delta = (timestamp - lastTimeRef.current) / 1000 // seconds
    lastTimeRef.current = timestamp

    const el = containerRef.current
    if (el) {
      const pxToScroll = BASE_SPEED * speedRef.current * delta
      el.scrollTop += pxToScroll
      updateProgress()
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }, [containerRef, updateProgress])

  const play = useCallback(() => {
    if (isDone) return
    setIsPlaying(true)
    isPlayingRef.current = true
    lastTimeRef.current = null
    animFrameRef.current = requestAnimationFrame(tick)
  }, [tick, isDone])

  const pause = useCallback(() => {
    setIsPlaying(false)
    isPlayingRef.current = false
    lastTimeRef.current = null
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) pause()
    else play()
  }, [play, pause])

  const faster = useCallback(() => {
    setSpeed(prev => Math.min(prev + 0.25, 3))
  }, [])

  const slower = useCallback(() => {
    setSpeed(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  const adjustSpeed = useCallback((delta) => {
    setSpeed(prev => Math.min(Math.max(prev + delta, 0.5), 3))
  }, [])

  const reset = useCallback(() => {
    pause()
    setProgress(0)
    setIsDone(false)
    const el = containerRef.current
    if (el) el.scrollTop = 0
  }, [pause, containerRef])

  const scrollTo = useCallback((position) => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = position
      updateProgress()
    }
  }, [containerRef, updateProgress])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  return {
    isPlaying,
    speed,
    progress,
    isDone,
    play,
    pause,
    toggle,
    faster,
    slower,
    adjustSpeed,
    reset,
    setSpeed,
    scrollTo,
    updateProgress,
  }
}
