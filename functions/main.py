"""
QuantumShield — Circuit Breaker: Firebase Cloud Function
=========================================================
Relay endpoint: receives a distress signal from the victim's device and
pushes a HIGH-PRIORITY FCM "Data Message" to every kin device token.

Cost: $0/month on Firebase Free Tier (Spark Plan).
- FCM sends: unlimited, free forever.
- Cloud Function invocations: 2M free/month (we use ~1 per distress event).
- Compute time: ~100ms per call, well within 400K GB-seconds free quota.

Deployment:
    pip install firebase-functions firebase-admin
    firebase deploy --only functions

Endpoint: POST https://REGION-PROJECT.cloudfunctions.net/relayDistressSignal
Body (JSON):
    {
        "caller":      "Unknown Caller",       # label shown in the alert
        "victim_name": "Rahul Sharma",         # user's own name (set during onboarding)
        "tokens":      ["fcm_token_1", ...],   # kin device FCM tokens
        "lat":         28.6139,                # optional GPS
        "lng":         77.2090
    }
"""

import json
import logging
import os

import firebase_admin
from firebase_admin import auth, messaging
from firebase_functions import https_fn, options

# ── Initialise Firebase Admin SDK once (cold-start singleton) ──────────────
if not firebase_admin._apps:
    firebase_admin.initialize_app()

logger = logging.getLogger(__name__)
MAX_TOKENS = 20
MAX_TOKEN_LENGTH = 4096
MAX_LABEL_LENGTH = 100

# ── CORS — restrict to your domain in production ──────────────────────────
ALLOWED_ORIGINS = {
    "https://quantumshield.in",
    "capacitor://localhost",   # Capacitor Android
    "http://localhost:3000",   # Local dev
}


@https_fn.on_request(
    cors=options.CorsOptions(cors_origins=list(ALLOWED_ORIGINS), cors_methods=["POST"]),
    region="asia-south1",      # Mumbai — lowest latency for India
    memory=options.MemoryOption.MB_256,
    timeout_sec=30,
    min_instances=0,           # Scale to zero = $0 idle cost
)
def relayDistressSignal(req: https_fn.Request) -> https_fn.Response:
    """
    Relay a Circuit Breaker distress signal to all kin FCM tokens.
    """
    # ── Input validation ────────────────────────────────────────────────────
    if req.method != "POST":
        return https_fn.Response("Method not allowed", status=405)

    authorization = req.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return https_fn.Response("Authentication required", status=401)
    try:
        auth.verify_id_token(authorization.removeprefix("Bearer "))
    except Exception:
        return https_fn.Response("Invalid authentication token", status=401)

    try:
        data: dict = req.get_json(force=True, silent=True) or {}
    except Exception:
        return https_fn.Response("Invalid JSON", status=400)

    tokens      = data.get("tokens", [])
    victim_name = data.get("victim_name", "Your contact")
    caller      = data.get("caller", "Unknown Caller")
    lat         = data.get("lat")
    lng         = data.get("lng")

    if (
        not tokens
        or not isinstance(tokens, list)
        or len(tokens) > MAX_TOKENS
        or any(not isinstance(token, str) or not token or len(token) > MAX_TOKEN_LENGTH for token in tokens)
    ):
        return https_fn.Response(
            json.dumps({"error": "Provide 1-20 valid FCM tokens"}),
            status=400,
            content_type="application/json",
        )
    if (
        not isinstance(victim_name, str)
        or not isinstance(caller, str)
        or len(victim_name) > MAX_LABEL_LENGTH
        or len(caller) > MAX_LABEL_LENGTH
    ):
        return https_fn.Response("Invalid alert labels", status=400)
    if (lat is None) != (lng is None):
        return https_fn.Response("Both latitude and longitude are required", status=400)
    if lat is not None and (
        not isinstance(lat, (int, float))
        or not isinstance(lng, (int, float))
        or not -90 <= lat <= 90
        or not -180 <= lng <= 180
    ):
        return https_fn.Response("Invalid location", status=400)

    # ── Build location string ───────────────────────────────────────────────
    maps_link = (
        f"https://www.google.com/maps?q={lat},{lng}"
        if lat is not None and lng is not None
        else "Location unavailable"
    )

    # ── Compose the FCM Data Message ───────────────────────────────────────
    # We use a DATA message (not Notification message) so the receiving app
    # can trigger a custom ALARM-category notification that bypasses Silent Mode.
    data_payload = {
        "type":        "CIRCUIT_BREAKER_DISTRESS",
        "victim_name": victim_name,
        "caller":      caller,
        "maps_link":   maps_link,
        "priority":    "CRITICAL",
        "timestamp":   str(int(__import__("time").time())),
    }

    # ── Notification fallback (shown if app is in background/killed) ────────
    notif = messaging.Notification(
        title=f"🚨 QUANTUM SHIELD: {victim_name.upper()} — ISOLATION ALERT",
        body=(
            f"{victim_name} has been in an unverified call ({caller}) for 6+ hours "
            f"and is unreachable. Possible scam. Act NOW."
        ),
    )

    android_config = messaging.AndroidConfig(
        priority="high",                           # Wakes device even in Doze mode
        notification=messaging.AndroidNotification(
            channel_id="CRITICAL_DISTRESS_SIGNAL", # High-importance channel on kin's app
            sound="emergency_siren",
            notification_priority=messaging.AndroidNotificationPriority.PRIORITY_MAX,
            visibility=messaging.AndroidNotificationVisibility.PUBLIC,
            sticky=True,
        ),
    )

    apns_config = messaging.APNSConfig(
        headers={"apns-priority": "10"},
        payload=messaging.APNSPayload(
            aps=messaging.Aps(
                sound=messaging.CriticalSound(name="emergency_siren.wav", critical=True, volume=1.0),
                badge=1,
                content_available=True,
            )
        ),
    )

    # ── Send to all tokens (batch, max 500 per call) ────────────────────────
    sent_count   = 0
    failed_count = 0

    for i in range(0, len(tokens), 500):
        batch = tokens[i : i + 500]
        messages = [
            messaging.Message(
                data=data_payload,
                notification=notif,
                android=android_config,
                apns=apns_config,
                token=token,
            )
            for token in batch
        ]
        response = messaging.send_each(messages)
        sent_count   += response.success_count
        failed_count += response.failure_count
        for idx, r in enumerate(response.responses):
            if not r.success:
                logger.warning("FCM send failed for a recipient token: %s", r.exception)

    logger.info(
        "Circuit Breaker distress relayed. victim=%s sent=%d failed=%d",
        victim_name, sent_count, failed_count,
    )

    return https_fn.Response(
        json.dumps({
            "status":        "dispatched",
            "sent":          sent_count,
            "failed":        failed_count,
        }),
        status=200,
        content_type="application/json",
    )


# ────────────────────────────────────────────────────────────────────────────
# KIN-SIDE: EmergencyAlertHandler (called when the kin's app receives FCM)
# This logic lives in the Android app (KinAlertService.kt), but is documented
# here for reference.
#
# On receiving type=CIRCUIT_BREAKER_DISTRESS:
#   1. Create NotificationChannel with IMPORTANCE_HIGH + AudioAttributes.USAGE_ALARM
#   2. Play R.raw.emergency_siren at full volume (bypasses Silent Mode)
#   3. Show full-screen intent (pops over lock screen like an incoming call)
#   4. Display victim name, caller label, Google Maps link
#   5. Action buttons: "CALL NOW" (opens dialer) | "CALL 1930" (cybercrime)
# ────────────────────────────────────────────────────────────────────────────
