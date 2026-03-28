import { Usb, Bluetooth, BookOpen, ArrowLeft, Lock, RotateCcw } from 'lucide-react'
import { VERSION } from '../version'
import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { usePiConnection } from '../hooks/usePiConnection'
import { useLanguage } from '../App'
import { LANGUAGES, ELECTRODE_SPECS, DEFAULT_EFFICIENCY, MAX_CURRENT_DEFAULT, MAX_RUNTIME_DEFAULT } from '../utils/constants'
import DocsViewer from '../components/docs/DocsViewer'
import type { Language, ElectrodeType } from '../types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--bg-border)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </div>
  )
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: '90px', padding: '6px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, textAlign: 'right' }}
    />
  )
}


function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: '40px', height: '22px', borderRadius: '11px', background: value ? 'var(--purple-600)' : 'var(--bg-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  )
}

export default function Settings({ onClose }: { onClose: () => void }) {
  const { connected, connectionType, deviceModel, language, setLanguage, config, updateConfig, lifetimeSeconds, resetElectrode, setElectrodeType } = useAppStore()
  const { disconnect } = usePiConnection()
  const [docsOpen, setDocsOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [advancedUnlocked, setAdvancedUnlocked] = useState(false)
  const t = useLanguage()

  const electrodeOptions: { value: ElectrodeType; label: string }[] = [
    { value: 'graphite',     label: t.graphite     },
    { value: 'titanium_mmo', label: t.titaniumMmo  },
    { value: 'platinum',     label: t.platinum     },
  ]

  const spec      = ELECTRODE_SPECS[config.electrodeType ?? 'graphite']
  const hoursUsed = lifetimeSeconds / 3600
  const isPlatinum = (config.electrodeType ?? 'graphite') === 'platinum'
  const healthPct = isPlatinum ? 100 : Math.max(0, Math.round((1 - hoursUsed / spec.maxHours) * 100))
  const healthColor = isPlatinum ? 'var(--green)' : healthPct > 60 ? 'var(--green)' : healthPct > 25 ? 'var(--amber)' : 'var(--red)'

  return (
    <>
      {/* Full-page settings layout */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderBottom: '1px solid var(--bg-border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)', fontSize: '13px', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>{t.settings}</span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '580px' }}>

            <Section title={t.connectionSettings}>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {connected
                  ? (connectionType === 'usb' ? <Usb size={16} color="var(--green)" /> : <Bluetooth size={16} color="var(--green)" />)
                  : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-red 1.5s infinite' }} />}
                <span style={{ fontSize: '13px', color: connected ? 'var(--green)' : 'var(--red)', flex: 1 }}>
                  {connected
                    ? `${t.connectedTo} via ${connectionType?.toUpperCase()}${deviceModel ? ` — ${deviceModel}` : ''}`
                    : t.disconnected}
                </span>
              </div>
              {connected && (
                <button onClick={() => { disconnect(); onClose() }}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                >
                  {t.disconnect}
                </button>
              )}
            </Section>

            <Section title={t.preferences}>
              <SettingRow label={t.language}>
                <select value={language ?? 'en'} onChange={e => setLanguage(e.target.value as Language)}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
              </SettingRow>
            </Section>

            <Section title={t.electrodes}>
              <SettingRow label={t.electrodeType}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {electrodeOptions.map(opt => (
                    <button key={opt.value} onClick={() => setElectrodeType(opt.value)}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease',
                        background: config.electrodeType === opt.value ? 'var(--purple-600)' : 'var(--bg-tertiary)',
                        border: `1px solid ${config.electrodeType === opt.value ? 'var(--purple-600)' : 'var(--bg-border)'}`,
                        color: config.electrodeType === opt.value ? '#fff' : 'var(--text-secondary)',
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </SettingRow>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t.electrodeHealth}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: healthColor }}>
                    {isPlatinum ? 'No wear' : `${healthPct}%`}
                  </span>
                </div>
                {!isPlatinum && (
                  <>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${healthPct}%`, background: healthColor, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.hoursUsed}: {hoursUsed.toFixed(1)}h</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.hoursRemaining}: {Math.max(0, spec.maxHours - hoursUsed).toFixed(1)}h</span>
                    </div>
                  </>
                )}
              </div>

            </Section>

            <Section title={t.advanced}>
              {advancedUnlocked ? (
                <>
                  <SettingRow label={t.efficiencyOverride}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <NumberInput value={Math.round(config.efficiency * 100)} onChange={v => updateConfig({ efficiency: v / 100 })} min={10} max={100} />
                      <button onClick={() => updateConfig({ efficiency: DEFAULT_EFFICIENCY })} title="Reset to default" style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
                      ><RotateCcw size={12} /></button>
                    </div>
                  </SettingRow>
                  <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '-8px', marginBottom: '12px', lineHeight: '1.5' }}>
                    Inaccurate values cause miscalculated NaOCl output. Too high = overdosing (harmful chlorine levels); too low = underdosing (ineffective treatment).
                  </p>

                  <SettingRow label={t.maxCurrent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <NumberInput value={config.maxCurrent} onChange={v => updateConfig({ maxCurrent: v })} min={0.5} max={10} step={0.5} />
                      <button onClick={() => updateConfig({ maxCurrent: MAX_CURRENT_DEFAULT })} title="Reset to default" style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
                      ><RotateCcw size={12} /></button>
                    </div>
                  </SettingRow>
                  <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '-8px', marginBottom: '12px', lineHeight: '1.5' }}>
                    Exceeding safe limits overheats the electrolytic cell, rapidly degrades electrodes, and can produce chlorine gas. Do not exceed your cell's rated current.
                  </p>

                  <SettingRow label={t.maxRuntime}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <NumberInput value={config.maxRuntime} onChange={v => updateConfig({ maxRuntime: v })} min={1} max={480} />
                      <button onClick={() => updateConfig({ maxRuntime: MAX_RUNTIME_DEFAULT })} title="Reset to default" style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
                      ><RotateCcw size={12} /></button>
                    </div>
                  </SettingRow>
                  <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '-8px', marginBottom: '12px', lineHeight: '1.5' }}>
                    Extended runtimes without auto-stop can over-chlorinate water to unsafe levels and cause thermal damage to the cell.
                  </p>

                  <SettingRow label={t.autoStop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Toggle value={config.autoStop} onChange={v => updateConfig({ autoStop: v })} />
                      <button onClick={() => updateConfig({ autoStop: true })} title="Reset to default" style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
                      ><RotateCcw size={12} /></button>
                    </div>
                  </SettingRow>
                  {!config.autoStop && (
                    <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '-8px', marginBottom: '12px', lineHeight: '1.5' }}>
                      Without auto-stop the session runs until manually stopped. Over-chlorination can make water unsafe and corrode equipment.
                    </p>
                  )}
                  <button onClick={() => setAdvancedUnlocked(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    <Lock size={11} /> Lock advanced settings
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="advanced-unlock"
                    checked={false}
                    onChange={e => { if (e.target.checked) setAdvancedUnlocked(true) }}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--purple-600)', cursor: 'pointer' }}
                  />
                  <label htmlFor="advanced-unlock" style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                    Enable advanced settings
                  </label>
                </div>
              )}
            </Section>

            <Section title={t.docs}>
              <button onClick={() => setDocsOpen(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-600)'; e.currentTarget.style.color = 'var(--purple-400)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <BookOpen size={16} style={{ color: 'var(--purple-500)' }} />
                Open Documentation
              </button>
            </Section>

            <Section title={t.about}>
              <SettingRow label={t.version}><span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{VERSION}</span></SettingRow>
              <SettingRow label="Protocol"><span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Faraday's Law (INA219)</span></SettingRow>
              <SettingRow label="Developers">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <a href="https://github.com/ashwinpatri" target="_blank" rel="noreferrer"
                    style={{ fontSize: '13px', color: 'var(--purple-400)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >@ashwinpatri</a>
                  <a href="https://github.com/Dwalker1000" target="_blank" rel="noreferrer"
                    style={{ fontSize: '13px', color: 'var(--purple-400)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >@Dwalker1000</a>
                </div>
              </SettingRow>
            </Section>

            {/* Danger zone */}
            <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: '24px', marginTop: '8px' }}>
              {confirmReset ? (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>Reset electrode wear counter to zero?</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Only do this when you have installed new electrodes.</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { resetElectrode(); setConfirmReset(false) }}
                      style={{ flex: 1, padding: '9px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.15)', color: 'var(--red)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >Yes, reset</button>
                    <button onClick={() => setConfirmReset(false)}
                      style={{ flex: 1, padding: '9px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)}
                  style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                >{t.resetElectrode}</button>
              )}
            </div>

          </div>
        </div>
      </div>

      {docsOpen && <DocsViewer onClose={() => setDocsOpen(false)} />}
    </>
  )
}
