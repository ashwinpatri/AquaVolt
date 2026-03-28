import { createContext, useContext, useMemo } from 'react'
import { useAppStore } from './store/appStore'
import type { Translations } from './types'
import en from './i18n/en'
import de from './i18n/de'
import ru from './i18n/ru'
import LanguageSelect from './screens/LanguageSelect'
import TermsOfService from './screens/TermsOfService'
import Dashboard from './screens/Dashboard'

const TRANSLATIONS: Record<string, Translations> = { en, de, ru }

const LanguageContext = createContext<Translations>(en)
export const useLanguage = (): Translations => useContext(LanguageContext)

export default function App() {
  const { language, tosAccepted } = useAppStore()

  const t = useMemo(() => (language ? (TRANSLATIONS[language] ?? en) : en), [language])

  // language=null -> pick language first; then TOS; then dashboard
  const screen = !language ? 'language' : !tosAccepted ? 'tos' : 'dashboard'

  return (
    <LanguageContext.Provider value={t}>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {screen === 'language'  && <LanguageSelect />}
        {screen === 'tos'       && <TermsOfService />}
        {screen === 'dashboard' && <Dashboard />}
      </div>
    </LanguageContext.Provider>
  )
}
