function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(new Error(`Failed to wipe database "${name}"`));
    req.onblocked = () => resolve(); // Still resolve if blocked by open tabs
  });
}

export async function nukeAllLocalData() {
  // 1. Wipe the Evidence Vault (recordings + its encryption key) and the
  //    legacy database from older app versions. Deleting the key store makes
  //    any straggling ciphertext permanently unreadable.
  await deleteDatabase('QuantumShieldVault');
  await deleteDatabase('QuantumShield_Vault'); // legacy name, pre-2026 builds

  // 2. Wipe LocalStorage (consent, contacts, activity, settings)
  localStorage.clear();
  return true;
}
