import { useState, useMemo } from 'react';
import { Plus, Zap, FlaskConical, TrendingUp, Award, Target } from 'lucide-react';
import { useExperiments } from '../hooks/useExperiments';
import ExperimentCard from '../components/ExperimentCard';
import CreateExperimentModal from '../components/CreateExperimentModal';
import { getExperimentProgress, getSuccessRate, getCurrentStreak, today } from '../utils/experiments';

export default function Dashboard({ onNavigateToDetail }) {
  const { experiments, activeExperiments, loading, createExperiment, addLog } = useExperiments();
  const [showCreate, setShowCreate] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const stats = useMemo(() => {
    const total = experiments.length;
    const active = activeExperiments.length;
    const completed = experiments.filter(e => e.status === 'completed').length;
    const totalLogs = experiments.flatMap(e => e.logs || []);
    const successLogs = totalLogs.filter(l => l.status === 'success');
    const overallRate = totalLogs.length > 0 ? Math.round((successLogs.length / totalLogs.length) * 100) : 0;
    const maxStreak = Math.max(0, ...experiments.map(e => getCurrentStreak(e)));
    return { total, active, completed, overallRate, maxStreak };
  }, [experiments, activeExperiments]);

  const handleQuickLog = async (id, status) => {
    await addLog(id, { status, date: today(), note: '' });
    showToast(status === 'success' ? '✅ Logged as success!' : '❌ Logged as failed');
  };

  const todayCheckIns = useMemo(() => {
    return activeExperiments.filter(e => {
      const log = e.logs?.find(l => l.date === today());
      return !log;
    });
  }, [activeExperiments]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center space-y-3">
          <div className="text-4xl animate-float">⚗️</div>
          <p className="font-mono text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>Loading your lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl font-extrabold gradient-text-cyan" style={{ fontFamily: 'Syne' }}>
              Your Lab 🔬
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {stats.active > 0 ? `${stats.active} active experiment${stats.active > 1 ? 's' : ''}` : 'No active experiments'}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', color: '#0a0a0f', fontFamily: 'Syne' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            New
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: stats.total, icon: FlaskConical, color: 'var(--accent-cyan)' },
            { label: 'Active', value: stats.active, icon: Zap, color: 'var(--accent-yellow)' },
            { label: 'Done', value: stats.completed, icon: Award, color: 'var(--accent-green)' },
            { label: 'Rate', value: `${stats.overallRate}%`, icon: TrendingUp, color: 'var(--accent-purple)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}>
              <Icon size={16} style={{ color, margin: '0 auto 4px' }} />
              <div className="text-lg font-extrabold" style={{ color, fontFamily: 'Syne', lineHeight: 1 }}>{value}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's check-ins needed */}
      {todayCheckIns.length > 0 && (
        <div className="mx-5 mb-5 p-3 rounded-2xl" style={{
          background: 'rgba(0,229,255,0.05)',
          border: '1px solid rgba(0,229,255,0.2)',
        }}>
          <p className="text-xs font-mono font-bold mb-1" style={{ color: 'var(--accent-cyan)', fontFamily: 'DM Mono' }}>
            ⏰ PENDING CHECK-INS TODAY
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {todayCheckIns.length} experiment{todayCheckIns.length > 1 ? 's' : ''} waiting for today's log
          </p>
        </div>
      )}

      {/* Active experiments */}
      {activeExperiments.length > 0 && (
        <div className="px-5 mb-6">
          <p className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            ACTIVE EXPERIMENTS
          </p>
          <div className="space-y-3">
            {activeExperiments.map(exp => (
              <ExperimentCard
                key={exp.id}
                experiment={exp}
                onTap={onNavigateToDetail}
                onQuickLog={handleQuickLog}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {experiments.filter(e => e.status === 'completed').length > 0 && (
        <div className="px-5 mb-6">
          <p className="text-xs font-mono font-bold mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            COMPLETED
          </p>
          <div className="space-y-3">
            {experiments.filter(e => e.status === 'completed').map(exp => (
              <ExperimentCard
                key={exp.id}
                experiment={exp}
                onTap={onNavigateToDetail}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {experiments.length === 0 && (
        <div className="flex flex-col items-center justify-center px-5 pt-12 pb-8 text-center">
          <div className="text-6xl mb-6 animate-float">⚗️</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Syne' }}>Your lab is empty</h2>
          <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Start your first self-improvement experiment. Track habits, break patterns, build streaks.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-2xl font-bold text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', color: '#0a0a0f', fontFamily: 'Syne' }}
          >
            🚀 Launch First Experiment
          </button>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl text-sm font-semibold animate-scale-in shadow-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', color: 'var(--text-primary)', fontFamily: 'DM Mono', whiteSpace: 'nowrap' }}>
          {toastMsg}
        </div>
      )}

      {showCreate && (
        <CreateExperimentModal
          onClose={() => setShowCreate(false)}
          onCreate={createExperiment}
        />
      )}
    </div>
  );
}
