import { useCallback, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import type { AppConfig } from '../types'

const PI_USB_URL = 'http://192.168.7.2:5000'
const PI_BT_URL  = 'http://192.168.7.3:5000'

async function pingPi(url: string): Promise<boolean> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 3000)
  try {
    const res = await fetch(`${url}/ping`, { signal: ctrl.signal })
    clearTimeout(t)
    return res.ok
  } catch { clearTimeout(t); return false }
}

async function fetchDeviceInfo(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${url}/info`, { signal: AbortSignal.timeout(2000) })
    if (!res.ok) return null
    const data = await res.json() as Record<string, unknown>
    return typeof data.model === 'string' ? data.model : null
  } catch { return null }
}

async function deployConfig(piUrl: string, payload: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${piUrl}/config`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Deploy failed: ${res.status}`)
  return res.json()
}

async function sendCommand(piUrl: string, cmd: string): Promise<unknown> {
  const res = await fetch(`${piUrl}/command`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: cmd }),
  })
  if (!res.ok) throw new Error(`Command failed: ${res.status}`)
  return res.json()
}

export function usePiConnection() {
  const { connected, piUrl, setConnected, setDeviceModel, setLiveData, setRunning, running } = useAppStore()
  const wsRef = useRef<WebSocket | null>(null)

  const openWebSocket = useCallback((url: string) => {
    if (wsRef.current) wsRef.current.close()
    const ws = new WebSocket(url.replace('http://', 'ws://') + '/stream')
    wsRef.current = ws
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data as string) as Record<string, unknown>
        setLiveData({
          voltage:   typeof data.voltage   === 'number' ? data.voltage   : 0,
          current:   typeof data.current   === 'number' ? data.current   : 0,
          power:     typeof data.power     === 'number' ? data.power     : 0,
          charge:    typeof data.charge    === 'number' ? data.charge    : 0,
          uptime:    typeof data.uptime    === 'number' ? data.uptime    : 0,
          duty:      typeof data.duty      === 'number' ? data.duty      : 0,
          timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
          running:   typeof data.running   === 'boolean' ? data.running  : undefined,
        })
        if (typeof data.running === 'boolean') setRunning(data.running)
      } catch { /* ignore bad frames */ }
    }
    ws.onerror = () => { setConnected(false, null, null); setDeviceModel(null) }
    ws.onclose = () => { setConnected(false, null, null); setDeviceModel(null) }
  }, [setConnected, setDeviceModel, setLiveData, setRunning])

  const connect = useCallback(async (type: 'usb' | 'bluetooth'): Promise<string> => {
    const url = type === 'usb' ? PI_USB_URL : PI_BT_URL
    if (!await pingPi(url)) throw new Error(`${type.toUpperCase()} connection failed — check ${type === 'usb' ? 'cable' : 'pairing'}`)
    setConnected(true, url, type)
    openWebSocket(url)
    fetchDeviceInfo(url).then(model => setDeviceModel(model))
    return url
  }, [setConnected, setDeviceModel, openWebSocket])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    setConnected(false, null, null)
    setDeviceModel(null)
    setRunning(false)
  }, [setConnected, setDeviceModel, setRunning])

  const deploy = useCallback(async (config: AppConfig): Promise<unknown> => {
    if (!piUrl) throw new Error('Not connected')
    return deployConfig(piUrl, {
      target_ppm: config.targetPpm, volume_liters: config.volumeLiters,
      efficiency: config.efficiency, duty_cycle: config.dutyCycle,
      max_current: config.maxCurrent, max_runtime_minutes: config.maxRuntime, auto_stop: config.autoStop,
    })
  }, [piUrl])

  const start = useCallback(async () => {
    if (!piUrl) throw new Error('Not connected')
    await sendCommand(piUrl, 'start'); setRunning(true)
  }, [piUrl, setRunning])

  const stop = useCallback(async () => {
    if (!piUrl) throw new Error('Not connected')
    await sendCommand(piUrl, 'stop'); setRunning(false)
  }, [piUrl, setRunning])

  return { connected, running, connect, disconnect, deploy, start, stop }
}
