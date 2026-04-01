import { openDB } from 'idb';

const DB_NAME = 'labtracker';
const DB_VERSION = 1;
const STORE_NAME = 'experiments';

let dbPromise = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status');
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
};

export const storage = {
  async getAll() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  async get(id) {
    const db = await getDB();
    return db.get(STORE_NAME, id);
  },

  async put(experiment) {
    const db = await getDB();
    await db.put(STORE_NAME, experiment);
    return experiment;
  },

  async delete(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  async exportAll() {
    const data = await this.getAll();
    return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), experiments: data }, null, 2);
  },

  async importAll(jsonStr) {
    const parsed = JSON.parse(jsonStr);
    const experiments = parsed.experiments || parsed;
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const exp of experiments) {
      await tx.store.put(exp);
    }
    await tx.done;
    return experiments.length;
  },

  async clear() {
    const db = await getDB();
    await db.clear(STORE_NAME);
  },
};

// Fallback to localStorage if IndexedDB fails
export const localStorageFallback = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem('labtracker_experiments') || '[]');
    } catch { return []; }
  },
  put(experiment) {
    const all = this.getAll();
    const idx = all.findIndex(e => e.id === experiment.id);
    if (idx >= 0) all[idx] = experiment;
    else all.push(experiment);
    localStorage.setItem('labtracker_experiments', JSON.stringify(all));
    return experiment;
  },
  delete(id) {
    const all = this.getAll().filter(e => e.id !== id);
    localStorage.setItem('labtracker_experiments', JSON.stringify(all));
  },
  get(id) {
    return this.getAll().find(e => e.id === id) || null;
  },
};
