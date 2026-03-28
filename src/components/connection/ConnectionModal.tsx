import { useState } from 'react'
import { Usb, Bluetooth, X, Loader } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { usePiConnection } from '../../hooks/usePiConnection'
import { useLanguage } from '../../App'

interface ConnectOptionProps {
  icon: React.ReactNode
  label: string
  sub: string
  loading: boolean
  onClick: () => void
  disabled: boolean
}

function ConnectOption({ icon, label, sub, loading, onClick, disabled }: ConnectOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:        '100%', display: 'flex', alignItems: 'center', gap: '14px',
        background:   'var(--bg-tertiary)', border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)', padding: '14px 16px',
        cursor:       disabled ? 'not-allowed' : 'pointer',
        opacity:      disabled ? 0.6 : 1,
        transition:   'all 0.2s ease', textAlign: 'left',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = 'var(--purple-600)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-border)' }}
    >
      <div style={{ color: loading ? 'var(--text-muted)' : 'var(--purple-400)', flexShrink: 0 }}>
        {loading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {loading ? 'Connecting...' : label}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>
      </div>
    </button>
  )
}

export default function ConnectionModal({ onClose }: { onClose: () => void }) {
  const [status, setStatus]   = useState<'idle' | 'connecting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [shaking, setShaking] = useState(false)
  const { connected } = useAppStore()
  const { connect, disconnect } = usePiConnection()
  const t = useLanguage()

  const attempt = async (type: 'usb' | 'bluetooth') => {
    setStatus('connecting')
    setErrorMsg('')
    try {
      await connect(type)
      setStatus('idle')
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Connection failed')
      setStatus('error')
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    onClose()
  }

  return (
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ConnectOption
                icon={<Usb size={20} />}
                label={t.connectUsb}
                sub="USB-C cable to Raspberry Pi"
                loading={status === 'connecting'}
                onClick={() => attempt('usb')}
                disabled={status === 'connecting'}
              />
              <ConnectOption
                icon={<Bluetooth size={20} />}
                label={t.connectBluetooth}
                sub="Bluetooth 5.0 — Pi must be paired"
                loading={false}
                onClick={() => attempt('bluetooth')}
                disabled={status === 'connecting'}
              />
            </div>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              {status === 'error' ? (
                <span style={{ fontSize: '12px', color: 'var(--red)' }}>{errorMsg}</span>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.connectionHint}</span>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
