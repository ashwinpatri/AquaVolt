import { useCallback, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { gramsProduced, ppmFromGrams, formatDuration } from '../utils/faraday'

interface SessionRef {
  startTime: number
  startCharge: number
}

export function useSession() {
  const { liveData, config, addSession } = useAppStore()
  const sessionRef = useRef<SessionRef | null>(null)

  const beginSession = useCallback(() => {
    sessionRef.current = {
      startTime:   Date.now(),
      startCharge: liveData.charge,
    }
  }, [liveData.charge])

  const endSession = useCallback((status: 'complete' | 'interrupted' = 'complete') => {
    if (!sessionRef.current) return

    const { startTime, startCharge } = sessionRef.current
    const endTime     = Date.now()
    const duration    = endTime - startTime
    const deltaCharge = Math.max(0, liveData.charge - startCharge)
    const grams       = gramsProduced(deltaCharge, config.efficiency)
    const volumeL     = config.customVolume ?? config.volumeLiters
    const ppm         = volumeL ? ppmFromGrams(grams, volumeL) : null

    addSession({
      id:            `session-${startTime}`,
      startTime,
      endTime,
      duration,
      durationLabel: formatDuration(duration),
      grams:         parseFloat(grams.toFixed(3)),
      ppm:           ppm !== null ? parseFloat(ppm.toFixed(0)) : null,
      efficiency:    config.efficiency,
      status,
    })

    sessionRef.current = null
  }, [liveData.charge, config, addSession])

  return { beginSession, endSession }
}
