import { FileText, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { invoke } from '@tauri-apps/api/core'
import { useLanguage } from '../../App'

const DOCS = [
  { key: 'assembly',  file: 'assembly.pdf',  labelKey: 'assemblyGuide'     },
  { key: 'chemistry', file: 'chemistry.pdf', labelKey: 'chemistryExplained' },
  { key: 'wiring',    file: 'wiring.pdf',    labelKey: 'wiringDiagram'     },
] as const

export default function DocsViewer({ onClose }: { onClose: () => void }) {
  const t = useLanguage()

  const openDoc = async (file: string) => {
    try { await invoke('open_doc', { filename: file }) }
    catch { window.open(`/src/assets/docs/${file}`, '_blank') }
  }

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
      />
      <div className="fade-in" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-xl)', padding: '28px', width: '340px',
        zIndex: 201, boxShadow: '0 32px 96px rgba(0,0,0,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>{t.docs}</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DOCS.map(doc => (
            <button key={doc.key} onClick={() => openDoc(doc.file)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-600)'; e.currentTarget.style.color = 'var(--purple-400)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            >
              <FileText size={18} style={{ color: 'var(--purple-500)', flexShrink: 0 }} />
              {t[doc.labelKey]}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
          Available offline
        </p>
      </div>
    </>,
    document.body
  )
}
