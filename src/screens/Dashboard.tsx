import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useLiveData } from '../hooks/useLiveData'
import TopBar from '../components/layout/TopBar'
import Sidebar from '../components/layout/Sidebar'
import RightPanel from '../components/layout/RightPanel'
import SessionLog from '../tabs/SessionLog'
import Settings from '../tabs/Settings'
import DocsViewer from '../components/docs/DocsViewer'

export default function Dashboard() {
  useLiveData()
  const { activeTab, settingsOpen, setSettingsOpen } = useAppStore()
  const [docsOpen, setDocsOpen] = useState(false)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <TopBar onDocsOpen={() => setDocsOpen(true)} />
      {docsOpen && <DocsViewer onClose={() => setDocsOpen(false)} />}

      {settingsOpen ? (
        // Settings as a full page
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Settings onClose={() => setSettingsOpen(false)} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {activeTab === 'dashboard'  && <RightPanel />}
            {activeTab === 'sessionlog' && <SessionLog />}
          </div>
        </div>
      )}
    </div>
  )
}
