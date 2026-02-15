import { useEffect, useCallback } from 'react'

/**
 * useKeyboard — Global keyboard shortcuts for the teleprompter.
 *
 * @param {Object} handlers - Callback map for each shortcut
 * @param {boolean} active - Whether keyboard shortcuts are active
 */
export default function useKeyboard(handlers, active = true) {
  const {
    onTogglePlay,
    onFaster,
    onSlower,
    onFontIncrease,
    onFontDecrease,
    onToggleFullscreen,
    onToggleMirror,
    onToggleVoice,
    onExit,
  } = handlers

  const handleKeyDown = useCallback((e) => {
    if (!active) return

    // Don't capture shortcuts when typing in inputs/textareas
    const tag = e.target.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return

    switch (e.key) {
      case ' ':
        e.preventDefault()
        onTogglePlay?.()
        break

      case 'ArrowUp':
        e.preventDefault()
        onFaster?.()
        break

      case 'ArrowDown':
        e.preventDefault()
        onSlower?.()
        break

      case '+':
      case '=':
        e.preventDefault()
        onFontIncrease?.()
        break

      case '-':
      case '_':
        e.preventDefault()
        onFontDecrease?.()
        break

      case 'f':
      case 'F':
        e.preventDefault()
        onToggleFullscreen?.()
        break

      case 'm':
      case 'M':
        e.preventDefault()
        onToggleMirror?.()
        break

      case 'v':
      case 'V':
        e.preventDefault()
        onToggleVoice?.()
        break

      case 'Escape':
        e.preventDefault()
        onExit?.()
        break

      default:
        break
    }
  }, [
    active,
    onTogglePlay,
    onFaster,
    onSlower,
    onFontIncrease,
    onFontDecrease,
    onToggleFullscreen,
    onToggleMirror,
    onToggleVoice,
    onExit,
  ])

  useEffect(() => {
    if (!active) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, handleKeyDown])
}
