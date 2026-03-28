import { useAppStore } from '../store/appStore'
import { useLiveData } from '../hooks/useLiveData'
import TopBar from '../components/layout/TopBar'
import Sidebar from '../components/layout/Sidebar'
import RightPanel from '../components/layout/RightPanel'
import SessionLog from '../tabs/SessionLog'
import Settings from '../tabs/Settings'

export default function Dashboard() {
  useLiveData()
  const { activeTab, settingsOpen, setSettingsOpen } = useAppStore()

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <TopBar />

      {settingsOpen ? (
        // Settings as a full page
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Settings onClose={() => setSettingsOpen(false)} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'dashboard'  && <RightPanel />}
            {activeTab === 'sessionlog' && <SessionLog />}
          </div>
        </div>
      )}
    </div>
  )
}
