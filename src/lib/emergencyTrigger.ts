export function triggerEmergency(tabSetter: (tab: any) => void) {
  try {
    // store reason so Emergency page can show context
    sessionStorage.setItem(
      'emergency_trigger_reason',
      'critical_risk_detected'
    );

    tabSetter('emergency');
  } catch {
    // fallback navigation safety
    window.location.href = '/emergency';
  }
}
