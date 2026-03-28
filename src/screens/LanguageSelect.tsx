import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { LANGUAGES } from '../utils/constants'
import type { Language } from '../types'

export default function LanguageSelect() {
  const { language, setLanguage } = useAppStore()
  const [selected, setSelected] = useState<Language | null>(language)

  const handleContinue = () => {
    if (!selected) return
    setLanguage(selected)
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
      gap:            '48px',
      userSelect:     'none',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width:        '72px',
          height:       '72px',
          borderRadius: '18px',
          background:   'linear-gradient(135deg, var(--purple-700), var(--purple-500))',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     '32px',
          fontWeight:   900,
          color:        '#fff',
          boxShadow:    '0 0 40px var(--purple-glow), 0 0 80px rgba(124,58,237,0.15)',
        }}>A</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AquaVolt
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Electrochemical Water Treatment System
          </div>
        </div>
      </div>

      {/* Language cards */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {selected
            ? selected === 'en' ? 'Select your language to continue'
              : selected === 'de' ? 'Wählen Sie Ihre Sprache'
              : 'Выберите язык для продолжения'
            : 'Select your language to continue'}
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code as Language)}
              style={{
                width:        '140px',
                padding:      '24px 16px',
                borderRadius: 'var(--radius-xl)',
                border:       `2px solid ${selected === lang.code ? 'var(--purple-600)' : 'var(--bg-border)'}`,
                background:   selected === lang.code
                  ? 'rgba(124,58,237,0.12)'
                  : 'var(--bg-secondary)',
                cursor:       'pointer',
                display:      'flex',
                flexDirection:'column',
                alignItems:   'center',
                gap:          '10px',
                transition:   'all 0.2s ease',
                boxShadow:    selected === lang.code
                  ? '0 0 24px rgba(124,58,237,0.2)'
                  : 'none',
              }}
            >
              <span style={{ fontSize: '32px' }}>{lang.flag}</span>
              <span style={{
                fontSize:   '14px',
                fontWeight: selected === lang.code ? 600 : 400,
                color:      selected === lang.code ? 'var(--purple-400)' : 'var(--text-secondary)',
              }}>
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        style={{
          padding:      '13px 48px',
          borderRadius: 'var(--radius-md)',
          border:       'none',
          background:   selected
            ? 'linear-gradient(135deg, var(--purple-700), var(--purple-500))'
            : 'var(--bg-border)',
          color:        selected ? '#fff' : 'var(--text-muted)',
          fontSize:     '15px',
          fontWeight:   600,
          cursor:       selected ? 'pointer' : 'not-allowed',
          transition:   'all 0.2s ease',
          boxShadow:    selected ? '0 4px 24px var(--purple-glow)' : 'none',
        }}
      >
        Continue
      </button>
    </div>
  )
}
