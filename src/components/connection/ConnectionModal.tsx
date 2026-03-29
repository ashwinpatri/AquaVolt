import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Usb, RefreshCw, X, Loader } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { useAppStore } from '../../store/appStore'
import { usePiConnection } from '../../hooks/usePiConnection'
import { useLanguage } from '../../App'

export default function ConnectionModal({ onClose }: { onClose: () => void }) {
  const [ports, setPorts]           = useState<string[]>([])
  const [loadingPorts, setLoadingPorts] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const [shaking, setShaking]       = useState(false)
  const { connected } = useAppStore()
  const { connect, disconnect } = usePiConnection()
  const t = useLanguage()

  const refreshPorts = async () => {
    setLoadingPorts(true)
    setErrorMsg('')
    try {
      const list = await invoke<string[]>('list_ports')
      setPorts(list)
    } catch {
      setPorts([])
    } finally {
      setLoadingPorts(false)
    }
  }

  useEffect(() => { refreshPorts() }, [])

  const attempt = async (portName: string) => {
    setConnecting(portName)
    setErrorMsg('')
    try {
      await connect(portName)
      setConnecting(null)
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Connection failed')
      setConnecting(null)
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    onClose()
  }

  return createPortal(
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', zIndex: 100,
      }} />

      <div
        className="fade-in"
        style={{
          position:     'fixed', top: '50%', left: '50%',
          transform:    'translate(-50%, -50%)',
          animation:    shaking ? 'shake 0.5s ease both' : 'fade-in 0.25s ease both',
          background:   'var(--bg-secondary)', border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-xl)', padding: '28px', width: '360px',
          zIndex:       101, boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {connected ? t.connectedTo : 'Connect to AquaVolt'}
          </span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {connected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
              padding: '14px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--glow-green)', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--green)' }}>{t.connectedTo}</span>
            </div>
            <button
              onClick={handleDisconnect}
              style={{
                width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--red)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              {t.disconnect}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>USB Serial Ports</span>
              <button
                onClick={refreshPorts}
                disabled={loadingPorts}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px 7px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-border)', background: 'transparent', opacity: loadingPorts ? 0.5 : 1 }}
              >
                <RefreshCw size={11} style={{ animation: loadingPorts ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>

            {loadingPorts ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--text-muted)', gap: '8px' }}>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px' }}>Scanning ports...</span>
              </div>
            ) : ports.length === 0 ? (
              <div style={{
                background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px',
              }}>
                No serial ports found.<br />
                <span style={{ fontSize: '11px' }}>Connect the Pi via USB-C and click Refresh.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ports.map(port => (
                  <button
                    key={port}
                    onClick={() => attempt(port)}
                    disabled={connecting !== null}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--bg-border)',
                      borderRadius: 'var(--radius-md)', padding: '12px 14px',
                      cursor: connecting !== null ? 'not-allowed' : 'pointer',
                      opacity: connecting !== null && connecting !== port ? 0.5 : 1,
                      transition: 'all 0.2s ease', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!connecting) e.currentTarget.style.borderColor = 'var(--purple-600)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-border)' }}
                  >
                    <div style={{ color: connecting === port ? 'var(--text-muted)' : 'var(--purple-400)', flexShrink: 0 }}>
                      {connecting === port
                        ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Usb size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {connecting === port ? 'Connecting...' : port}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>USB Serial · 115200 baud</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              {errorMsg
                ? <span style={{ fontSize: '12px', color: 'var(--red)' }}>{errorMsg}</span>
                : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.connectionHint}</span>}
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  )
}
