import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { generateId, today, updateExperimentStatus } from '../utils/experiments';

const ExperimentsContext = createContext(null);

export function ExperimentsProvider({ children }) {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const data = await storage.getAll();
      const updated = data.map(updateExperimentStatus);
      // Save any status updates
      for (const exp of updated) {
        const original = data.find(e => e.id === exp.id);
        if (original?.status !== exp.status) {
          await storage.put(exp);
        }
      }
      setExperiments(updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Failed to load experiments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const createExperiment = useCallback(async (data) => {
    const exp = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      duration: parseInt(data.duration),
      startDate: data.startDate || today(),
      category: data.category || 'custom',
      difficulty: data.difficulty || 'medium',
      status: 'active',
      logs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await storage.put(exp);
    setExperiments(prev => [exp, ...prev]);
    return exp;
  }, []);

  const updateExperiment = useCallback(async (id, updates) => {
    const exp = await storage.get(id);
    if (!exp) return null;
    const updated = { ...exp, ...updates, updatedAt: new Date().toISOString() };
    await storage.put(updated);
    setExperiments(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  }, []);

  const deleteExperiment = useCallback(async (id) => {
    await storage.delete(id);
    setExperiments(prev => prev.filter(e => e.id !== id));
  }, []);

  const addLog = useCallback(async (id, logEntry) => {
    const exp = await storage.get(id);
    if (!exp) return null;
    
    const logDate = logEntry.date || today();
    const existingIdx = exp.logs.findIndex(l => l.date === logDate);
    
    let newLogs;
    if (existingIdx >= 0) {
      newLogs = exp.logs.map((l, i) => i === existingIdx ? { ...l, ...logEntry, date: logDate } : l);
    } else {
      newLogs = [...exp.logs, { ...logEntry, date: logDate, createdAt: new Date().toISOString() }];
    }

    const updated = { ...exp, logs: newLogs, updatedAt: new Date().toISOString() };
    const withStatus = updateExperimentStatus(updated);
    await storage.put(withStatus);
    setExperiments(prev => prev.map(e => e.id === id ? withStatus : e));
    return withStatus;
  }, []);

  const restartExperiment = useCallback(async (id) => {
    const exp = await storage.get(id);
    if (!exp) return null;
    const restarted = {
      ...exp,
      status: 'active',
      startDate: today(),
      logs: [],
      updatedAt: new Date().toISOString(),
    };
    await storage.put(restarted);
    setExperiments(prev => prev.map(e => e.id === id ? restarted : e));
    return restarted;
  }, []);

  const exportData = useCallback(async () => {
    const json = await storage.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labtracker_${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(async (file) => {
    const text = await file.text();
    const count = await storage.importAll(text);
    await loadAll();
    return count;
  }, [loadAll]);

  const getExperiment = useCallback((id) => experiments.find(e => e.id === id), [experiments]);

  const activeExperiments = experiments.filter(e => e.status === 'active');
  const completedExperiments = experiments.filter(e => e.status === 'completed');

  return (
    <ExperimentsContext.Provider value={{
      experiments,
      activeExperiments,
      completedExperiments,
      loading,
      createExperiment,
      updateExperiment,
      deleteExperiment,
      addLog,
      restartExperiment,
      exportData,
      importData,
      getExperiment,
      reload: loadAll,
    }}>
      {children}
    </ExperimentsContext.Provider>
  );
}

export const useExperiments = () => {
  const ctx = useContext(ExperimentsContext);
  if (!ctx) throw new Error('useExperiments must be used within ExperimentsProvider');
  return ctx;
};
