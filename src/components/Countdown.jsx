import { useState, useEffect } from 'react'

/**
 * Countdown — 3-2-1 full-screen countdown before the prompter starts.
 * Each number animates in with a scale + fade effect.
 */
export default function Countdown({ onComplete }) {
  const [count, setCount] = useState(3)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (count === 0) {
      // Brief pause then complete
      const timer = setTimeout(() => {
        onComplete?.()
      }, 300)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setCount(prev => prev - 1)
        setVisible(true)
      }, 200)
    }, 800)

    return () => clearTimeout(timer)
  }, [count, onComplete])

  if (count === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{ background: '#0a0a0a' }}>
      <div
        className="transition-all duration-300 ease-out"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          opacity: visible ? 1 : 0,
        }}
      >
        <span
          className="font-bold select-none"
          style={{
            fontSize: '12rem',
            lineHeight: 1,
            color: '#e5e5e5',
            textShadow: '0 0 80px rgba(99, 102, 241, 0.3)',
          }}
        >
          {count}
        </span>
      </div>

      {/* Subtle ring animation */}
      <div
        className="absolute rounded-full border-2"
        style={{
          width: '200px',
          height: '200px',
          borderColor: 'rgba(99, 102, 241, 0.2)',
          animation: visible ? 'pulse-ring 0.8s ease-out forwards' : 'none',
        }}
      />
    </div>
  )
}
