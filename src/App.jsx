import { useState, useEffect } from 'react';
import { ExperimentsProvider } from './hooks/useExperiments';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import ExperimentsPage from './pages/ExperimentsPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import ExperimentDetail from './pages/ExperimentDetail';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [detailId, setDetailId] = useState(null);
  const [prevTab, setPrevTab] = useState(null);

  // Handle back button
  useEffect(() => {
    const handlePopState = () => {
      if (detailId) {
        setDetailId(null);
        if (prevTab) setActiveTab(prevTab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [detailId, prevTab]);

  const navigateToDetail = (id) => {
    setPrevTab(activeTab);
    setDetailId(id);
    window.history.pushState({ detailId: id }, '');
  };

  const navigateBack = () => {
    setDetailId(null);
    if (prevTab) setActiveTab(prevTab);
    window.history.back();
  };

  const handleTabChange = (tab) => {
    setDetailId(null);
    setActiveTab(tab);
  };

  return (
    <ExperimentsProvider>
      <div className="noise-overlay flex flex-col min-h-dvh" style={{ background: 'var(--bg-base)' }}>
        {/* Page content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {detailId ? (
            <ExperimentDetail
              key={detailId}
              experimentId={detailId}
              onBack={navigateBack}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard key="dashboard" onNavigateToDetail={navigateToDetail} />
              )}
              {activeTab === 'experiments' && (
                <ExperimentsPage key="experiments" onNavigateToDetail={navigateToDetail} />
              )}
              {activeTab === 'insights' && (
                <InsightsPage key="insights" onNavigateToDetail={navigateToDetail} />
              )}
              {activeTab === 'settings' && (
                <SettingsPage key="settings" />
              )}
            </>
          )}
        </div>

        {/* Bottom nav always visible */}
        <BottomNav active={activeTab} onChange={handleTabChange} />
      </div>
    </ExperimentsProvider>
  );
}
