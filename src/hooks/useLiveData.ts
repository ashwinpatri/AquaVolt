import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { generateMockReading } from '../utils/mockData'
import { MOCK_INTERVAL_MS } from '../utils/constants'

export function useLiveData(): void {
  const { connected, running, setLiveData } = useAppStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (connected) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      const reading = generateMockReading(running)
      setLiveData(reading)
    }, MOCK_INTERVAL_MS)

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current)
    }
  }, [connected, running, setLiveData])
}
