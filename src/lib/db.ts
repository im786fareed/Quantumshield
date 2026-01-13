import { openDB, IDBPDatabase } from 'idb';

export async function initDB() {
  return openDB('QuantumShield_Vault', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('emergency_recordings')) {
        db.createObjectStore('emergency_recordings', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveRecording(blob: Blob, location: string) {
  const db = await initDB();
  await db.add('emergency_recordings', {
    blob,
    location,
    timestamp: new Date().toISOString(),
  });
}