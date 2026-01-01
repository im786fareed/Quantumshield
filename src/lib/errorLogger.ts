type ErrorPayload = {
  message: string;
  stack?: string;
  source?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
};

export async function logError(
  error: unknown,
  source = "unknown"
) {
  try {
    const payload: ErrorPayload = {
      message:
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      source,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };

    // Log locally (always)
    console.error("[QuantumShield Error]", payload);

    // OPTIONAL remote logging (safe)
    await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // never crash app from logger
  }
}
