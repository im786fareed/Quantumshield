/* ── Real, on-device protection activity ──
   Honest counters only. Nothing here is simulated or invented:
   every number reflects something the user actually did in the app,
   stored locally on their own device. Starts at zero for a new user.
*/

const ACTIVITY_KEY = 'qs_activity';

// Keys already written by other real features — we only READ these.
const EDUCATION_WATCHED_KEY = 'qs_education_watched';
const SAFETY_CIRCLE_KEY = 'qs_cb_safety_circle';
const TRUSTED_CONTACTS_KEY = 'quantumshield_trusted_contacts';

type ActivityStore = {
  checks: number;     // total scans the user has actually run
  threats: number;    // scans that came back risky/unsafe
  firstSeen: number;  // epoch ms of first use — powers "days protected"
};

function readStore(): ActivityStore {
  if (typeof window === 'undefined') return { checks: 0, threats: 0, firstSeen: 0 };
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        checks: Number(parsed.checks) || 0,
        threats: Number(parsed.threats) || 0,
        firstSeen: Number(parsed.firstSeen) || 0,
      };
    }
  } catch { /* ignore corrupt data */ }
  return { checks: 0, threats: 0, firstSeen: 0 };
}

function writeStore(s: ActivityStore) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(s)); } catch { /* storage full / blocked */ }
}

/** Call once when the app first loads so "days protected" can start counting honestly. */
export function ensureFirstSeen() {
  const s = readStore();
  if (!s.firstSeen) { s.firstSeen = Date.now(); writeStore(s); }
}

/** Record one real scan. Pass flagged=true only when the scan actually found a risk. */
export function logCheck(flagged: boolean) {
  const s = readStore();
  s.checks += 1;
  if (flagged) s.threats += 1;
  if (!s.firstSeen) s.firstSeen = Date.now();
  writeStore(s);
}

function countStored(key: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch { return 0; }
}

export type ProtectionStats = {
  checks: number;
  threats: number;
  daysProtected: number;
  videosWatched: number;
  contactsProtected: number;
  isNew: boolean; // true when the user has no activity yet
};

/** Read-only snapshot of the user's real protection activity. */
export function getProtectionStats(): ProtectionStats {
  const s = readStore();
  const firstSeen = s.firstSeen || Date.now();
  const daysProtected = Math.max(0, Math.floor((Date.now() - firstSeen) / 86_400_000));
  const videosWatched = countStored(EDUCATION_WATCHED_KEY);
  const contactsProtected =
    countStored(SAFETY_CIRCLE_KEY) + countStored(TRUSTED_CONTACTS_KEY);

  return {
    checks: s.checks,
    threats: s.threats,
    daysProtected,
    videosWatched,
    contactsProtected,
    isNew: s.checks === 0 && videosWatched === 0 && contactsProtected === 0,
  };
}
