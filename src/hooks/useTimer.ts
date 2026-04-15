import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTimerReturn {
  isRunning: boolean
  elapsed: number // seconds
  start: (initialSeconds?: number) => void
  stop: () => number // returns elapsed seconds
  reset: () => void
}

export function useTimer(): UseTimerReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsed * 1000
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const start = useCallback((initialSeconds = 0) => {
    setElapsed(initialSeconds)
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    return elapsed
  }, [elapsed])

  const reset = useCallback(() => {
    setIsRunning(false)
    setElapsed(0)
  }, [])

  return { isRunning, elapsed, start, stop, reset }
}
