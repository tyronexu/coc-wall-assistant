// IndexedDB 轻量封装
// 两个 store: tracker（每日进度）, reminders（提醒任务）

const DB_NAME = 'coc-wall-db';
const DB_VER = 1;

let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tracker')) {
        const s = db.createObjectStore('tracker', { keyPath: 'id' });
        s.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('reminders')) {
        const s = db.createObjectStore('reminders', { keyPath: 'id' });
        s.createIndex('fireAt', 'fireAt', { unique: false });
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode) {
  return openDB().then((db) => {
    const t = db.transaction(store, mode);
    return { store: t.objectStore(store), tx: t };
  });
}

export async function dbPut(store, value) {
  const { store: s, tx } = await tx(store, 'readwrite');
  return new Promise((resolve, reject) => {
    const r = s.put(value);
    r.onsuccess = () => resolve(value);
    r.onerror = () => reject(r.error);
  });
}

export async function dbGetAll(store) {
  const { store: s } = await tx(store, 'readonly');
  return new Promise((resolve, reject) => {
    const r = s.getAll();
    r.onsuccess = () => resolve(r.result || []);
    r.onerror = () => reject(r.error);
  });
}

export async function dbDelete(store, id) {
  const { store: s } = await tx(store, 'readwrite');
  return new Promise((resolve, reject) => {
    const r = s.delete(id);
    r.onsuccess = () => resolve(true);
    r.onerror = () => reject(r.error);
  });
}

export async function dbGet(store, id) {
  const { store: s } = await tx(store, 'readonly');
  return new Promise((resolve, reject) => {
    const r = s.get(id);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
