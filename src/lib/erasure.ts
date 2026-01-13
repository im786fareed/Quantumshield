export async function nukeAllLocalData() {
  // 1. Wipe IndexedDB (The Recordings)
  const req = indexedDB.deleteDatabase('QuantumShield_Vault');
  
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      // 2. Wipe LocalStorage (Consent & Analytics)
      localStorage.clear();
      resolve(true);
    };
    req.onerror = () => reject(new Error("Failed to wipe database"));
    req.onblocked = () => resolve(true); // Still resolve if blocked by open tabs
  });
}