import { initDB } from './db';

export async function getAllRecordings() {
  const db = await initDB();
  // Retrieves all stored evidence locally from the phone
  return db.getAll('emergency_recordings');
}

export async function deleteRecording(id: number) {
  const db = await initDB();
  return db.delete('emergency_recordings', id);
}