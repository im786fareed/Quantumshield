/**
 * Evidence Vault — single source of truth for locally stored recordings.
 *
 * Storage model (honest version):
 * - Recordings never leave the device. There is no upload path in this module.
 * - Recordings are encrypted at rest with AES-GCM-256 using a non-extractable
 *   device key kept in the same IndexedDB database. This protects the raw
 *   ciphertext if the browser's storage files are copied off the device, but
 *   anyone who can unlock the device and open this browser profile can still
 *   play the recordings — the UI must say so rather than imply more.
 * - Records written by older app versions (plaintext blobs) are still
 *   readable and are re-encrypted in place the first time they are listed.
 */

const DB_NAME = 'QuantumShieldVault';
const DB_VERSION = 2;
const EVIDENCE_STORE = 'evidence';
const KEY_STORE = 'keys';
const DEVICE_KEY_ID = 'device-key';
const IV_BYTES = 12;

export interface EvidenceItem {
  id: number;
  fileName: string;
  /** Human-readable capture date (en-IN locale string). */
  date: string;
  /** Decrypted media, ready for playback or download. */
  blob: Blob;
  /** Recording length in seconds, when the recorder captured it. */
  duration?: number;
}

/** Stored shape — v2 records are encrypted, v1 (legacy) hold a plain blob. */
interface StoredRecord {
  id: number;
  fileName: string;
  date: string;
  duration?: number;
  // v2 (encrypted)
  enc?: 1;
  iv?: Uint8Array<ArrayBuffer>;
  data?: ArrayBuffer;
  mimeType?: string;
  // v1 (legacy plaintext)
  blob?: Blob;
}

function openVault(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(EVIDENCE_STORE)) {
        db.createObjectStore(EVIDENCE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(KEY_STORE)) {
        db.createObjectStore(KEY_STORE);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // Never hold a vault open against an upgrade or the privacy-page
      // "erase all data" wipe — close immediately when one is requested.
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onerror = () => reject(new Error(`Vault open failed: ${req.error?.message}`));
  });
}

function asPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error(req.error?.message ?? 'IndexedDB request failed'));
  });
}

/**
 * The device key is generated once, non-extractable (the raw key bytes can
 * never be exported by page script), and persisted via IndexedDB's native
 * CryptoKey support.
 */
async function getDeviceKey(db: IDBDatabase): Promise<CryptoKey> {
  const existing = await asPromise<CryptoKey | undefined>(
    db.transaction(KEY_STORE, 'readonly').objectStore(KEY_STORE).get(DEVICE_KEY_ID)
  );
  if (existing) return existing;

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  try {
    await asPromise(
      db.transaction(KEY_STORE, 'readwrite').objectStore(KEY_STORE).add(key, DEVICE_KEY_ID)
    );
    return key;
  } catch {
    // Another tab created the key first — use theirs so ciphertext stays consistent.
    const winner = await asPromise<CryptoKey | undefined>(
      db.transaction(KEY_STORE, 'readonly').objectStore(KEY_STORE).get(DEVICE_KEY_ID)
    );
    if (winner) return winner;
    throw new Error('Could not persist the vault encryption key');
  }
}

async function encryptRecord(
  key: CryptoKey,
  blob: Blob,
  base: Pick<StoredRecord, 'id' | 'fileName' | 'date' | 'duration'>
): Promise<StoredRecord> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    await blob.arrayBuffer()
  );
  return { ...base, enc: 1, iv, data, mimeType: blob.type };
}

/** Encrypt and store a recording. Throws if encryption or storage fails —
 *  callers keep their download-fallback so evidence is never lost. */
export async function saveEvidence(
  blob: Blob,
  fileName: string,
  duration?: number
): Promise<void> {
  if (!crypto?.subtle) throw new Error('Encryption unavailable in this browser context');
  const db = await openVault();
  try {
    const key = await getDeviceKey(db);
    const record = await encryptRecord(key, blob, {
      id: Date.now(),
      fileName,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      duration,
    });
    await asPromise(
      db.transaction(EVIDENCE_STORE, 'readwrite').objectStore(EVIDENCE_STORE).add(record)
    );
  } finally {
    db.close();
  }
}

/** List all recordings (newest first), decrypting each. Legacy plaintext
 *  records are returned as-is and silently upgraded to encrypted storage. */
export async function listEvidence(): Promise<EvidenceItem[]> {
  const db = await openVault();
  try {
    const records = await asPromise<StoredRecord[]>(
      db.transaction(EVIDENCE_STORE, 'readonly').objectStore(EVIDENCE_STORE).getAll()
    );

    const items: EvidenceItem[] = [];
    for (const r of records) {
      if (r.enc === 1 && r.iv && r.data) {
        try {
          const key = await getDeviceKey(db);
          const plain = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: r.iv },
            key,
            r.data
          );
          items.push({
            id: r.id,
            fileName: r.fileName,
            date: r.date,
            duration: r.duration,
            blob: new Blob([plain], { type: r.mimeType || 'video/webm' }),
          });
        } catch {
          // Key mismatch / corrupted record — skip rather than crash the vault.
          console.error(`[EvidenceVault] Could not decrypt record ${r.id}; skipping.`);
        }
      } else if (r.blob) {
        items.push({
          id: r.id,
          fileName: r.fileName,
          date: r.date,
          duration: r.duration,
          blob: r.blob,
        });
        // Lazy migration: re-write this legacy record encrypted. Only replace
        // after encryption succeeds so the evidence is never at risk.
        try {
          const key = await getDeviceKey(db);
          const upgraded = await encryptRecord(key, r.blob, {
            id: r.id,
            fileName: r.fileName,
            date: r.date,
            duration: r.duration,
          });
          await asPromise(
            db.transaction(EVIDENCE_STORE, 'readwrite').objectStore(EVIDENCE_STORE).put(upgraded)
          );
        } catch {
          // Migration is best-effort; the plaintext record stays readable.
        }
      }
    }
    return items.sort((a, b) => b.id - a.id);
  } finally {
    db.close();
  }
}

export async function countEvidence(): Promise<number> {
  const db = await openVault();
  try {
    return await asPromise(
      db.transaction(EVIDENCE_STORE, 'readonly').objectStore(EVIDENCE_STORE).count()
    );
  } finally {
    db.close();
  }
}

export async function deleteEvidence(id: number): Promise<void> {
  const db = await openVault();
  try {
    await asPromise(
      db.transaction(EVIDENCE_STORE, 'readwrite').objectStore(EVIDENCE_STORE).delete(id)
    );
  } finally {
    db.close();
  }
}
