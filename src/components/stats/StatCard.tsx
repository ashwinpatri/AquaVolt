interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, unit, sub, accent = false }: StatCardProps) {
  return (
    <div style={{
      background:    'var(--bg-secondary)', border: '1px solid var(--bg-border)',
      borderRadius:  'var(--radius-lg)', padding: '16px 18px',
      display:       'flex', flexDirection: 'column', gap: '4px', minWidth: 0,
    }}>
      <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{
          fontSize:           '26px', fontWeight: 700,
          color:              accent ? 'var(--purple-400)' : 'var(--text-primary)',
          lineHeight:         1.1, fontVariantNumeric: 'tabular-nums',
        }}>
          {value ?? '—'}
        </span>
        {unit && (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{unit}</span>
        )}
      </div>
      {sub && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  )
}
