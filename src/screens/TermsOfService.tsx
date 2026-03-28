import { useState, useRef, useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import { useLanguage } from '../App'

export default function TermsOfService() {
  const [scrolled, setScrolled]   = useState(false)
  const [checked, setChecked]     = useState(false)
  const [scrollPct, setScrollPct] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { setTosAccepted } = useAppStore()
  const t = useLanguage()

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
    setScrollPct(Math.min(pct, 1))
    if (pct >= 0.98) setScrolled(true)
  }, [])

  const handleAccept = () => {
    if (!checked) return
    setTosAccepted()
  }

  return (
    <div style={{
      width:          '100%',
      height:         '100%',
      background:     'var(--bg-primary)',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '40px 20px',
      gap:            '24px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {t.termsTitle}
        </h1>
        {!scrolled && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.termsScroll}</p>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
        {/* Scroll progress bar */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: '3px', background: 'var(--bg-border)', borderRadius: '2px', zIndex: 2,
        }}>
          <div style={{
            width: '3px',
            height: `${scrollPct * 100}%`,
            background: scrollPct >= 1 ? 'var(--green)' : 'var(--purple-600)',
            borderRadius: '2px',
            transition: 'height 0.1s ease, background 0.3s ease',
          }} />
        </div>

        {/* Scrollable text */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            background:   'var(--bg-secondary)',
            border:       '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-xl)',
            padding:      '28px 36px 28px 28px',
            height:       '380px',
            overflowY:    'scroll',
            color:        'var(--text-secondary)',
            fontSize:     '13px',
            lineHeight:   1.8,
            whiteSpace:   'pre-wrap',
          }}
        >
          {t.termsBody}
          <div style={{ height: '32px' }} />
        </div>

        {/* Fade overlay */}
        {!scrolled && (
          <div style={{
            position:      'absolute',
            bottom:        0, left: 0, right: '3px',
            height:        '80px',
            background:    'linear-gradient(transparent, var(--bg-secondary))',
            borderRadius:  '0 0 var(--radius-xl) var(--radius-xl)',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Checkbox */}
      <div
        style={{
          opacity:    scrolled ? 1 : 0,
          transform:  scrolled ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.3s ease',
          display:    'flex',
          alignItems: 'center',
          gap:        '10px',
          cursor:     scrolled ? 'pointer' : 'default',
        }}
        onClick={() => scrolled && setChecked(c => !c)}
      >
        <div style={{
          width:          '18px', height: '18px', borderRadius: '4px',
          border:         `2px solid ${checked ? 'var(--purple-600)' : 'var(--bg-border)'}`,
          background:     checked ? 'var(--purple-600)' : 'transparent',
          flexShrink:     0,
          display:        'flex', alignItems: 'center', justifyContent: 'center',
          transition:     'all 0.15s ease',
        }}>
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: '13px', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {t.termsAgree}
        </span>
      </div>

      {/* Accept button */}
      <button
        onClick={handleAccept}
        disabled={!checked}
        style={{
          padding:      '13px 48px',
          borderRadius: 'var(--radius-md)',
          border:       'none',
          background:   checked
            ? 'linear-gradient(135deg, var(--purple-700), var(--purple-500))'
            : 'var(--bg-border)',
          color:        checked ? '#fff' : 'var(--text-muted)',
          fontSize:     '15px',
          fontWeight:   600,
          cursor:       checked ? 'pointer' : 'not-allowed',
          opacity:      checked ? 1 : 0.5,
          transition:   'all 0.2s ease',
          boxShadow:    checked ? '0 4px 24px var(--purple-glow)' : 'none',
        }}
      >
        {t.continue}
      </button>
    </div>
  )
}
