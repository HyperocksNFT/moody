import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * useVoiceFollow — Web Speech API integration for voice-activated scrolling.
 * Detects when the user is speaking and signals scroll/pause accordingly.
 * Falls back gracefully if the browser doesn't support SpeechRecognition.
 */
export default function useVoiceFollow() {
  const [isListening, setIsListening] = useState(false)
  const [isVoiceDetected, setIsVoiceDetected] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const restartTimerRef = useRef(null)
  const isListeningRef = useRef(false)

  // Silence threshold — pause scrolling after this many ms of no voice
  const SILENCE_DELAY = 1500

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Clean up any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (e) { /* ignore */ }
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      isListeningRef.current = true
    }

    recognition.onresult = () => {
      // Voice detected — mark as active, reset silence timer
      setIsVoiceDetected(true)
      clearTimers()

      silenceTimerRef.current = setTimeout(() => {
        setIsVoiceDetected(false)
      }, SILENCE_DELAY)
    }

    recognition.onspeechstart = () => {
      setIsVoiceDetected(true)
      clearTimers()
    }

    recognition.onspeechend = () => {
      silenceTimerRef.current = setTimeout(() => {
        setIsVoiceDetected(false)
      }, SILENCE_DELAY)
    }

    recognition.onerror = (event) => {
      // "no-speech" and "aborted" are normal — auto-restart
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (isListeningRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              try { recognition.start() } catch (e) { /* ignore */ }
            }
          }, 300)
        }
        return
      }
      console.warn('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            try { recognition.start() } catch (e) { /* ignore */ }
          }
        }, 300)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (e) {
      console.warn('Failed to start speech recognition:', e)
    }
  }, [clearTimers])

  const stopListening = useCallback(() => {
    isListeningRef.current = false
    setIsListening(false)
    setIsVoiceDetected(false)
    clearTimers()

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) { /* ignore */ }
      recognitionRef.current = null
    }
  }, [clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false
      clearTimers()
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (e) { /* ignore */ }
      }
    }
  }, [clearTimers])

  return {
    isListening,
    isVoiceDetected,
    isSupported,
    startListening,
    stopListening,
  }
}
