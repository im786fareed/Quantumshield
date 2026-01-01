export function track(event: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") return;

  try {
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        ts: Date.now(),
      }),
    });
  } catch {
    // silent
  }
}
