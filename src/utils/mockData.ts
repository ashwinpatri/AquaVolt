import type { LiveData } from '../types'

let mockCharge = 0
let mockStartTime = Date.now()

export function generateMockReading(running: boolean = false): LiveData {
  if (!running) {
    return {
      voltage: 0, current: 0, power: 0,
      charge: mockCharge, running: false,
      timestamp: Date.now(), uptime: Math.floor((Date.now() - mockStartTime) / 1000), duty: 0,
    }
  }
  const voltage = 5.8 + (Math.random() - 0.5) * 0.3
  const current = 1.85 + (Math.random() - 0.5) * 0.4
  mockCharge += current * 0.5
  return {
    voltage:   parseFloat(voltage.toFixed(3)),
    current:   parseFloat(current.toFixed(3)),
    power:     parseFloat((voltage * current).toFixed(3)),
    charge:    parseFloat(mockCharge.toFixed(2)),
    running:   true,
    timestamp: Date.now(),
    uptime:    Math.floor((Date.now() - mockStartTime) / 1000),
    duty:      70,
  }
}

export function generateMockHistory(seconds: number = 30): LiveData[] {
  const points: LiveData[] = []
  const now = Date.now()
  for (let i = seconds; i >= 0; i--) {
    points.push({ voltage: 0, current: 0, power: 0, charge: 0, timestamp: now - i * 1000, uptime: seconds - i, duty: 0 })
  }
  return points
}
