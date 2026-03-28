import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import ConcentrationSlider from '../controls/ConcentrationSlider'
import PowerSlider from '../controls/PowerSlider'
import VolumeSelect from '../controls/VolumeSelect'
import StartStopButton from '../controls/StartStopButton'
import DeployButton from '../controls/DeployButton'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '0 0 8px 0', borderBottom: '1px solid var(--bg-border)', marginBottom: '12px',
    }}>{children}</div>
  )
}

function Divider() { return <div style={{ borderTop: '1px solid var(--bg-border)', margin: '16px 0' }} /> }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function formatUptime(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60), s = seconds % 60
  return `${m}m ${s}s`
}

export default function Sidebar() {
  const { connected, connectionType, deviceModel, liveData, config } = useAppStore()
  const t = useLanguage()

  return (
    <div style={{
      width: 'var(--sidebar-width)', flexShrink: 0,
      background: 'var(--bg-secondary)', borderRight: '1px solid var(--bg-border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        <SectionLabel>{t.device}</SectionLabel>
        <div style={{ opacity: connected ? 1 : 0.4 }}>
          <InfoRow label={t.piModel}        value={connected ? (deviceModel ?? 'Unknown') : '—'} />
          <InfoRow label={t.connectionType} value={connected ? (connectionType === 'usb' ? 'USB' : 'Bluetooth') : '—'} />
          <InfoRow label={t.uptime}         value={connected ? formatUptime(liveData.uptime) : '—'} />
        </div>

        <Divider />

        <SectionLabel>{t.target}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ConcentrationSlider disabled={!connected} />
          <VolumeSelect        disabled={!connected} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: connected ? 1 : 0.4 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.efficiency}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--amber)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px', padding: '2px 8px' }}>
              {Math.round(config.efficiency * 100)}%
            </span>
          </div>
        </div>

        <Divider />

        <SectionLabel>{t.power}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <PowerSlider   disabled={!connected} />
          <StartStopButton disabled={!connected} />
        </div>

        <Divider />

        <SectionLabel>Deploy</SectionLabel>
        <DeployButton disabled={!connected} />

      </div>

      {!connected && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px',
          background: 'rgba(239,68,68,0.08)', borderTop: '1px solid rgba(239,68,68,0.2)',
          textAlign: 'center', fontSize: '11px', color: 'var(--red)',
        }}>
          Connect device to enable controls
        </div>
      )}
    </div>
  )
}
