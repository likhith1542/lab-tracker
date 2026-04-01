import { useState, useEffect, useRef } from 'react';
import { Flame, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { getExperimentProgress, getSuccessRate, getCurrentStreak, getCategoryById, getDifficultyById, today, getLogForDate } from '../utils/experiments';

export default function ExperimentCard({ experiment, onTap, onQuickLog }) {
  const { daysCompleted, daysTotal, progress, daysRemaining } = getExperimentProgress(experiment);
  const successRate = getSuccessRate(experiment);
  const streak = getCurrentStreak(experiment);
  const category = getCategoryById(experiment.category);
  const difficulty = getDifficultyById(experiment.difficulty);
  const todayLog = getLogForDate(experiment, today());
  
  const [barWidth, setBarWidth] = useState(0);
  const [animClass, setAnimClass] = useState('');
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setBarWidth(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const handleSuccess = (e) => {
    e.stopPropagation();
    setAnimClass('animate-success-pulse');
    setTimeout(() => setAnimClass(''), 800);
    onQuickLog?.(experiment.id, 'success');
  };

  const handleFail = (e) => {
    e.stopPropagation();
    if (cardRef.current) {
      cardRef.current.classList.add('animate-fail-shake');
      setTimeout(() => cardRef.current?.classList.remove('animate-fail-shake'), 500);
    }
    onQuickLog?.(experiment.id, 'failed');
  };

  const statusColors = {
    active: 'var(--accent-cyan)',
    completed: 'var(--accent-green)',
    failed: 'var(--accent-red)',
  };

  const isCompleted = experiment.status === 'completed';
  const isFailed = experiment.status === 'failed';

  return (
    <div
      ref={cardRef}
      onClick={() => onTap?.(experiment.id)}
      className={`card-press relative rounded-2xl p-4 cursor-pointer overflow-hidden ${animClass}`}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid var(--bg-border)`,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${category.color}, transparent)` }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-2xl mt-0.5 flex-shrink-0">{category.emoji}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] leading-tight truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>
              {experiment.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: `${category.color}18`, color: category.color, fontFamily: 'DM Mono' }}>
                {category.label}
              </span>
              <span className="text-xs font-mono"
                style={{ color: difficulty.color, fontFamily: 'DM Mono' }}>
                {difficulty.label}
              </span>
              {streak >= 3 && (
                <span className="flex items-center gap-0.5 text-xs font-mono"
                  style={{ color: '#ff6b35', fontFamily: 'DM Mono' }}>
                  <span className="streak-fire">🔥</span>{streak}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 4 }} />
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono' }}>
            Day {daysCompleted}/{daysTotal}
          </span>
          <span className="text-xs font-mono font-medium" style={{ color: statusColors[experiment.status], fontFamily: 'DM Mono' }}>
            {isCompleted ? '✓ Done' : isFailed ? '✗ Failed' : `${daysRemaining}d left`}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${barWidth}%`,
              background: isCompleted
                ? 'var(--accent-green)'
                : isFailed
                ? 'var(--accent-red)'
                : `linear-gradient(90deg, ${category.color}, ${category.color}99)`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <CheckCircle size={13} style={{ color: 'var(--accent-green)' }} />
            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono' }}>
              {successRate}%
            </span>
          </div>
          {todayLog && (
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: todayLog.status === 'success' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {todayLog.status === 'success' ? '✅ Today' : '❌ Today'}
              </span>
            </div>
          )}
        </div>

        {/* Quick log buttons — only for active, no log today */}
        {experiment.status === 'active' && !todayLog && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleFail}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90"
              style={{ background: 'rgba(255,61,113,0.12)', color: 'var(--accent-red)', fontFamily: 'DM Mono' }}
            >
              <XCircle size={13} /> Fail
            </button>
            <button
              onClick={handleSuccess}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-90"
              style={{ background: 'rgba(0,255,157,0.12)', color: 'var(--accent-green)', fontFamily: 'DM Mono' }}
            >
              <CheckCircle size={13} /> Win
            </button>
          </div>
        )}

        {(isCompleted || isFailed) && (
          <span className="text-xs px-2 py-1 rounded-lg font-mono"
            style={{
              background: isCompleted ? 'rgba(0,255,157,0.1)' : 'rgba(255,61,113,0.1)',
              color: isCompleted ? 'var(--accent-green)' : 'var(--accent-red)',
              fontFamily: 'DM Mono'
            }}>
            {isCompleted ? '🏆 Completed' : '💀 Failed'}
          </span>
        )}
      </div>
    </div>
  );
}
