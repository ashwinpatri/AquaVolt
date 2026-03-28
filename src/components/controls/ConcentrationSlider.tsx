import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import { PPM_MIN, PPM_MAX } from '../../utils/constants'

export default function ConcentrationSlider({ disabled }: { disabled: boolean }) {
  const { config, updateConfig } = useAppStore()
  const t = useLanguage()
  const pct = ((config.targetPpm - PPM_MIN) / (PPM_MAX - PPM_MIN)) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.concentration}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--purple-400)', fontVariantNumeric: 'tabular-nums' }}>
          {config.targetPpm} ppm
        </span>
      </div>
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', height: '4px', width: '100%', borderRadius: '2px', background: 'var(--bg-border)' }} />
        <div style={{
          position: 'absolute', height: '4px', width: `${pct}%`, borderRadius: '2px',
          background: 'linear-gradient(90deg, var(--purple-700), var(--purple-500))',
          transition: 'width 0.15s ease',
        }} />
        <input
          type="range" min={PPM_MIN} max={PPM_MAX} step={50}
          value={config.targetPpm}
          onChange={e => updateConfig({ targetPpm: Number(e.target.value) })}
          style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: '20px' }}
        />
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 8px)`,
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'var(--purple-500)', boxShadow: '0 0 8px var(--purple-glow)',
          transition: 'left 0.15s ease', pointerEvents: 'none',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{PPM_MIN}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{PPM_MAX}</span>
      </div>
    </div>
  )
}
