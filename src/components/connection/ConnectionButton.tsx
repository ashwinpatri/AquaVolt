import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import ConnectionModal from './ConnectionModal'

export default function ConnectionButton() {
  const [modalOpen, setModalOpen] = useState(false)
  const { connected, connectionType } = useAppStore()
  const t = useLanguage()

  const label = connected
    ? `${t.connectedTo} (${connectionType?.toUpperCase() ?? ''})`
    : t.disconnected

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="no-drag"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-tertiary)',
          border: `1px solid ${connected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 'var(--radius-md)', padding: '6px 12px',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
      >
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: connected ? 'var(--green)' : 'var(--red)', flexShrink: 0,
          animation: connected ? 'pulse-green 2s ease-in-out infinite' : 'pulse-red 1.5s ease-in-out infinite',
          boxShadow: connected ? '0 0 8px 2px var(--glow-green)' : '0 0 8px 2px var(--glow-red)',
        }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: connected ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </button>
      {modalOpen && <ConnectionModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
