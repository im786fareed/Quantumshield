package com.quantumshield.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
 * KinAlertService — runs on the EMERGENCY CONTACT's device.
 *
 * When the victim's Circuit Breaker triggers, Firebase Cloud Function
 * sends a high-priority FCM Data Message to this device. This service:
 *   1. Creates an ALARM-category notification channel (bypasses Silent Mode)
 *   2. Plays the emergency_siren sound at full volume
 *   3. Shows a full-screen intent (pops over lock screen like an incoming call)
 *   4. Displays victim name, situation, and Google Maps link
 *   5. Action buttons: CALL NOW · CALL 1930 · DISMISS
 *
 * Note: On first app launch, the FCM token is saved to the victim's
 * EmergencyVault so the relay function knows where to send alerts.
 */
class KinAlertService : FirebaseMessagingService() {

    companion object {
        private const val CHANNEL_ID   = "CRITICAL_DISTRESS_SIGNAL"
        private const val NOTIF_ID     = 9001
    }

    /* ── FCM token refresh ── */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Store the refreshed token locally so it can be shared with the victim's app
        // when the kin pairs their device (QR code or PIN exchange flow — future feature)
        getSharedPreferences("qs_fcm", MODE_PRIVATE)
            .edit()
            .putString("fcm_token", token)
            .apply()
    }

    /* ── Incoming FCM message ── */
    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        val data = message.data
        if (data["type"] != "CIRCUIT_BREAKER_DISTRESS") return

        val victimName = data["victim_name"] ?: "Your contact"
        val caller     = data["caller"]      ?: "Unknown Caller"
        val mapsLink   = data["maps_link"]   ?: ""

        ensureNotificationChannel()
        showEmergencyAlert(victimName, caller, mapsLink)
    }

    /* ── Notification channel: ALARM importance bypasses Silent/DND ── */
    private fun ensureNotificationChannel() {
        val nm = getSystemService(NotificationManager::class.java)

        if (nm.getNotificationChannel(CHANNEL_ID) != null) return

        val soundUri = Uri.parse(
            "android.resource://$packageName/raw/emergency_siren"
        )
        val audioAttrs = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        val channel = NotificationChannel(
            CHANNEL_ID,
            "Circuit Breaker — Critical Distress",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "High-urgency alerts when your family member may be in danger"
            setSound(soundUri, audioAttrs)
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 500)
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setBypassDnd(true)             // Override Do Not Disturb
        }

        nm.createNotificationChannel(channel)
    }

    /* ── Build and show the full-screen alert ── */
    private fun showEmergencyAlert(victimName: String, caller: String, mapsLink: String) {
        val nm = getSystemService(NotificationManager::class.java)

        // Full-screen intent — appears over lock screen like a call
        val fullScreenIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("distress_alert", true)
            putExtra("victim_name", victimName)
        }
        val fullScreenPending = PendingIntent.getActivity(
            this, 0, fullScreenIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Action: Open Google Maps location
        val mapsPending = if (mapsLink.isNotBlank()) {
            PendingIntent.getActivity(
                this, 1,
                Intent(Intent.ACTION_VIEW, Uri.parse(mapsLink)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                },
                PendingIntent.FLAG_IMMUTABLE
            )
        } else null

        // Action: Call Cybercrime helpline 1930
        val callCrimePending = PendingIntent.getActivity(
            this, 2,
            Intent(Intent.ACTION_DIAL, Uri.parse("tel:1930")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            },
            PendingIntent.FLAG_IMMUTABLE
        )

        // Action: Dismiss
        val dismissPending = PendingIntent.getBroadcast(
            this, 3,
            Intent(this, CircuitBreakerResetReceiver::class.java).apply {
                putExtra("dismiss_kin_alert", true)
            },
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val soundUri = Uri.parse(
            "android.resource://$packageName/raw/emergency_siren"
        )

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentTitle("🚨 QUANTUM SHIELD: $victimName — ISOLATION ALERT")
            .setContentText(
                "$victimName is in an unverified call ($caller) for 6+ hours and unreachable. " +
                "Possible Virtual Kidnapping / Digital Arrest scam."
            )
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(
                        "⚠️ $victimName has been in an unknown call with \"$caller\" for 6+ hours " +
                        "and has missed your calls.\n\n" +
                        "This may be a Virtual Kidnapping or Digital Arrest scam.\n\n" +
                        "Call them immediately. If unreachable, contact:\n" +
                        "• Cybercrime Helpline: 1930\n• Police Emergency: 100"
                    )
            )
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 500, 200, 500, 200, 500))
            .setFullScreenIntent(fullScreenPending, true)
            .setOngoing(true)
            .setAutoCancel(false)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setColor(0xFFDC2626.toInt())

        // Add action buttons
        if (mapsPending != null) {
            builder.addAction(0, "📍 View Location", mapsPending)
        }
        builder.addAction(0, "📞 Call 1930", callCrimePending)
        builder.addAction(0, "✓ Dismiss", dismissPending)

        nm.notify(NOTIF_ID, builder.build())
    }
}
