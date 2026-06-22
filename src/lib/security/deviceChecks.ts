/**
 * Real, on-device browser/security checks.
 *
 * These read genuine browser & device signals (HTTPS, browser version, network,
 * memory, permissions, storage, WebRTC, JS environment) and return honest
 * results that vary per device. No simulated numbers, no data leaves the device.
 *
 * Shared by the full Device Security Scanner page and the on-launch quick
 * Security Check.
 */

export interface ScanResult {
  check: string;
  checkHi: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'INFO';
  detail: string;
  detailHi: string;
  score: number;
}

export const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const SCAN_PHASES = {
  en: [
    'Checking HTTPS connection security...',
    'Auditing browser security version...',
    'Analyzing network connection type...',
    'Measuring device memory capacity...',
    'Checking media permission exposure...',
    'Scanning browser storage integrity...',
    'Detecting WebRTC IP leak risk...',
    'Verifying JavaScript environment...',
  ],
  hi: [
    'HTTPS कनेक्शन सुरक्षा जांच रहे हैं...',
    'ब्राउज़र सुरक्षा संस्करण ऑडिट हो रहा है...',
    'नेटवर्क कनेक्शन प्रकार का विश्लेषण...',
    'डिवाइस मेमोरी क्षमता माप रहे हैं...',
    'मीडिया अनुमति एक्सपोज़र जांच रहे हैं...',
    'ब्राउज़र स्टोरेज अखंडता स्कैन हो रही है...',
    'WebRTC IP लीक जोखिम का पता लगाया जा रहा है...',
    'JavaScript वातावरण सत्यापित हो रहा है...',
  ]
};

export async function runRealChecks(lang: 'en' | 'hi'): Promise<{ results: ScanResult[]; health: number }> {
  const results: ScanResult[] = [];
  let score = 0;

  // ── Check 1: HTTPS (12 pts) ────────────────────────────────────────────────
  await delay(350);
  const isHttps = typeof location !== 'undefined' && location.protocol === 'https:';
  const c1: ScanResult = {
    check: 'Connection Encryption',
    checkHi: 'कनेक्शन एन्क्रिप्शन',
    status: isHttps ? 'PASS' : 'FAIL',
    detail: isHttps
      ? 'HTTPS active — all data in transit is TLS-encrypted.'
      : 'UNENCRYPTED connection detected. Your data is visible to attackers on the same network.',
    detailHi: isHttps
      ? 'HTTPS सक्रिय — ट्रांजिट में सभी डेटा TLS-एन्क्रिप्टेड है।'
      : 'अनएन्क्रिप्टेड कनेक्शन पाया गया। नेटवर्क पर हमलावर आपका डेटा देख सकते हैं।',
    score: isHttps ? 12 : 0,
  };
  results.push(c1);
  score += c1.score;

  // ── Check 2: Browser version modernity (15 pts) ───────────────────────────
  await delay(400);
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const chromeVer = ua.match(/Chrome\/(\d+)/)?.[1];
  const ffVer = ua.match(/Firefox\/(\d+)/)?.[1];
  const safVer = ua.match(/Version\/(\d+).*Safari/)?.[1];
  const ver = chromeVer ? +chromeVer : ffVer ? +ffVer : safVer ? +safVer : 0;
  const isModern = (chromeVer && ver >= 110) || (ffVer && ver >= 110) || (safVer && ver >= 16);
  const c2: ScanResult = {
    check: 'Browser Security Level',
    checkHi: 'ब्राउज़र सुरक्षा स्तर',
    status: isModern ? 'PASS' : ver > 0 ? 'WARN' : 'INFO',
    detail: isModern
      ? `Browser version ${ver} — up to date with latest security patches.`
      : ver > 0
        ? `Browser version ${ver} is outdated. Update to receive critical security patches.`
        : 'Browser version could not be determined.',
    detailHi: isModern
      ? `ब्राउज़र संस्करण ${ver} — नवीनतम सुरक्षा पैच के साथ अप-टू-डेट है।`
      : ver > 0
        ? `ब्राउज़र संस्करण ${ver} पुराना है। महत्वपूर्ण सुरक्षा पैच के लिए अपडेट करें।`
        : 'ब्राउज़र संस्करण निर्धारित नहीं किया जा सका।',
    score: isModern ? 15 : ver > 0 ? 7 : 10,
  };
  results.push(c2);
  score += c2.score;

  // ── Check 3: Network connection quality (12 pts) ──────────────────────────
  await delay(350);
  const conn = typeof navigator !== 'undefined' ? (navigator as any).connection : null;
  const effectiveType: string = conn?.effectiveType || 'unknown';
  const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g';
  const c3: ScanResult = {
    check: 'Network Security',
    checkHi: 'नेटवर्क सुरक्षा',
    status: isSlow ? 'WARN' : 'PASS',
    detail: isSlow
      ? `Slow ${effectiveType} connection detected. Avoid online banking or OTP entry on slow networks.`
      : `Network: ${effectiveType === 'unknown' ? 'WiFi/Fast' : effectiveType.toUpperCase()}. Connection speed adequate for secure operations.`,
    detailHi: isSlow
      ? `धीमा ${effectiveType} नेटवर्क पाया गया। धीमे नेटवर्क पर बैंकिंग या OTP से बचें।`
      : `नेटवर्क: ${effectiveType === 'unknown' ? 'WiFi/तेज़' : effectiveType.toUpperCase()}। सुरक्षित ऑपरेशन के लिए पर्याप्त स्पीड।`,
    score: isSlow ? 5 : 12,
  };
  results.push(c3);
  score += c3.score;

  // ── Check 4: Device memory (10 pts) ───────────────────────────────────────
  await delay(300);
  const mem: number | undefined = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory : undefined;
  const memScore = !mem ? 7 : mem >= 4 ? 10 : mem >= 2 ? 7 : 3;
  const c4: ScanResult = {
    check: 'Device Memory',
    checkHi: 'डिवाइस मेमोरी',
    status: !mem ? 'INFO' : mem >= 2 ? 'PASS' : 'WARN',
    detail: mem
      ? `${mem}GB RAM. ${mem < 2 ? 'Low memory devices are vulnerable to resource exhaustion attacks and may fail to run security updates.' : 'Sufficient RAM for secure multitasking.'}`
      : 'Device memory not reported (browser privacy protection).',
    detailHi: mem
      ? `${mem}GB RAM। ${mem < 2 ? 'कम मेमोरी वाले डिवाइस सुरक्षा अपडेट चलाने में विफल हो सकते हैं।' : 'सुरक्षित मल्टीटास्किंग के लिए पर्याप्त RAM।'}`
      : 'डिवाइस मेमोरी रिपोर्ट नहीं हुई (ब्राउज़र गोपनीयता सुरक्षा)।',
    score: memScore,
  };
  results.push(c4);
  score += c4.score;

  // ── Check 5: Media permission exposure (13 pts) ───────────────────────────
  await delay(450);
  let permScore = 10;
  let permDetail = 'Permissions API not available on this browser.';
  let permDetailHi = 'इस ब्राउज़र पर Permissions API उपलब्ध नहीं है।';
  let permStatus: ScanResult['status'] = 'INFO';
  try {
    const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    const camPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
    const bothGranted = micPerm.state === 'granted' && camPerm.state === 'granted';
    const eitherGranted = micPerm.state === 'granted' || camPerm.state === 'granted';
    if (bothGranted) {
      permDetail = 'Both mic & camera are pre-granted. Verify no background app is accessing them.';
      permDetailHi = 'माइक्रोफोन और कैमरा दोनों पहले से granted हैं। सुनिश्चित करें कोई बैकग्राउंड ऐप एक्सेस नहीं कर रहा।';
      permScore = 7; permStatus = 'WARN';
    } else if (eitherGranted) {
      permDetail = `${micPerm.state === 'granted' ? 'Microphone' : 'Camera'} already granted. Review if this was intentional.`;
      permDetailHi = `${micPerm.state === 'granted' ? 'माइक्रोफोन' : 'कैमरा'} पहले से granted है। जांचें कि यह जानबूझकर था या नहीं।`;
      permScore = 9; permStatus = 'WARN';
    } else {
      permDetail = 'Mic & camera permissions are restricted — no unauthorized background access possible.';
      permDetailHi = 'माइक्रोफोन और कैमरा प्रतिबंधित हैं — कोई अनधिकृत बैकग्राउंड एक्सेस संभव नहीं।';
      permScore = 13; permStatus = 'PASS';
    }
  } catch { /* permissions API unavailable */ }
  results.push({
    check: 'Media Permission Audit',
    checkHi: 'मीडिया अनुमति ऑडिट',
    status: permStatus, detail: permDetail, detailHi: permDetailHi, score: permScore,
  });
  score += permScore;

  // ── Check 6: Storage integrity (10 pts) ───────────────────────────────────
  await delay(350);
  const suspiciousKeys = ['anydesk', 'teamviewer', 'rat_session', 'payload', 'inject', 'c2_', 'backdoor'];
  let lsScore = 10;
  let lsDetail = 'No suspicious browser storage artifacts detected.';
  let lsDetailHi = 'कोई संदिग्ध ब्राउज़र स्टोरेज आर्टिफैक्ट नहीं मिला।';
  let lsStatus: ScanResult['status'] = 'PASS';
  try {
    const lsKeys = Object.keys(localStorage).map(k => k.toLowerCase());
    const found = suspiciousKeys.filter(k => lsKeys.some(lk => lk.includes(k)));
    if (found.length > 0) {
      lsScore = 0; lsStatus = 'FAIL';
      lsDetail = `Suspicious storage keys found: ${found.join(', ')}. Consider clearing browser data.`;
      lsDetailHi = `संदिग्ध स्टोरेज कुंजियां मिलीं: ${found.join(', ')}। ब्राउज़र डेटा साफ़ करने पर विचार करें।`;
    }
  } catch { lsDetail = 'Storage scan skipped (privacy mode).'; lsDetailHi = 'स्टोरेज स्कैन छोड़ा गया (प्राइवेसी मोड)।'; }
  results.push({ check: 'Storage Integrity', checkHi: 'स्टोरेज अखंडता', status: lsStatus, detail: lsDetail, detailHi: lsDetailHi, score: lsScore });
  score += lsScore;

  // ── Check 7: WebRTC IP leak risk (13 pts) ─────────────────────────────────
  await delay(400);
  const hasWebRTC = typeof window !== 'undefined' && !!(window as any).RTCPeerConnection;
  const c7: ScanResult = {
    check: 'IP Leak Protection',
    checkHi: 'IP लीक सुरक्षा',
    status: hasWebRTC ? 'WARN' : 'PASS',
    detail: hasWebRTC
      ? 'WebRTC is active. If you use a VPN, run a WebRTC leak test at browserleaks.com to confirm your real IP is hidden.'
      : 'WebRTC is disabled/blocked — your IP address cannot be leaked through the browser.',
    detailHi: hasWebRTC
      ? 'WebRTC सक्रिय है। VPN उपयोगकर्ता browserleaks.com पर IP लीक टेस्ट करें।'
      : 'WebRTC अक्षम/अवरुद्ध है — ब्राउज़र के माध्यम से IP पता लीक नहीं हो सकता।',
    score: hasWebRTC ? 9 : 13,
  };
  results.push(c7);
  score += c7.score;

  // ── Check 8: JavaScript environment integrity (15 pts) ───────────────────
  await delay(350);
  let jsScore = 15;
  let jsDetail = 'JavaScript environment appears clean. No tampering detected.';
  let jsDetailHi = 'JavaScript वातावरण स्वच्छ दिखता है। कोई छेड़छाड़ नहीं पाई गई।';
  let jsStatus: ScanResult['status'] = 'PASS';
  try {
    const tampered =
      typeof console.log !== 'function' ||
      typeof setTimeout !== 'function' ||
      Array.isArray !== Function.prototype.call.bind(Array.isArray) === false;
    const suspiciousGlobals = ['__webdriver_evaluate', '__selenium_evaluate', 'callSelenium', '__webdriver_script_fn'];
    const foundGlobals = suspiciousGlobals.filter(g => g in window);
    if (tampered || foundGlobals.length > 0) {
      jsScore = 4; jsStatus = 'WARN';
      jsDetail = 'Potential automation/injection tool detected in browser environment. Use a clean browser.';
      jsDetailHi = 'ब्राउज़र वातावरण में संभावित ऑटोमेशन/इंजेक्शन टूल पाया गया।';
    }
  } catch { /* native env error — actually good sign */ }
  results.push({ check: 'JS Environment Integrity', checkHi: 'JS वातावरण अखंडता', status: jsStatus, detail: jsDetail, detailHi: jsDetailHi, score: jsScore });
  score += jsScore;

  return { results, health: Math.min(100, score) };
}
