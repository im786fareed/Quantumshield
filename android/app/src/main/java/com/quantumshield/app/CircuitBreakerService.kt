package com.quantumshield.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * CircuitBreakerService — the heart of the Anti-Isolation Protocol.
 *
 * WHAT IT DOES (no audio, no message content):
 *  1. Listens for WhatsApp "Ongoing call" notifications.
 *  2. Checks whether the caller name is in the device phonebook.
 *  3. If unknown, starts the 6-hour isolation timer in LocalTracker.
 *  4. Detects missed calls from Safety Circle contacts.
 *  5. When threshold is met (6h + missed emergency call) → triggers distress.
 *
 * PERMISSION REQUIRED:
 *  User must grant "Notification Access" via Settings → Apps → Special App Access
 *  (BIND_NOTIFICATION_LISTENER_SERVICE in manifest).
 *
 * BATTERY OPTIMISATION:
 *  All state is stored in EncryptedSharedPreferences (LocalTracker).
 *  WorkManager heartbeat (every 30 min) re-checks threshold without keeping
 *  CPU alive between notifications.
 */
class CircuitBreakerService : NotificationListenerService() {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    /* ── WhatsApp package variants ── */
    private val whatsappPackages = setOf(
        "com.whatsapp",
        "com.whatsapp.w4b",          // WhatsApp Business
    )

    /* ── Telecom packages for missed-call detection ── */
    private val telecomPackages = setOf(
        "com.android.server.telecom",
        "com.google.android.dialer",
        "com.samsung.android.incallui",
    )

    /* ─────────────────────────────────────────────────────────────
       onNotificationPosted — called every time a notification appears
    ───────────────────────────────────────────────────────────── */
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (!LocalTracker.isGuardianActive(this)) return

        val pkg    = sbn.packageName ?: return
        val extras = sbn.notification?.extras ?: return

        when {
            pkg in whatsappPackages  -> handleWhatsAppNotification(extras)
            pkg in telecomPackages   -> handleTelecomNotification(extras)
        }
    }

    /* ─────────────────────────────────────────────────────────────
       WhatsApp call detection
    ───────────────────────────────────────────────────────────── */
    private fun handleWhatsAppNotification(extras: Bundle) {
        val title = extras.getString(Notification.EXTRA_TITLE) ?: return
        val text  = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: return

        val isOngoingCall = text.contains("Ongoing call", ignoreCase = true)
            || text.contains("WhatsApp call", ignoreCase = true)
            || text.contains("WhatsApp video call", ignoreCase = true)

        if (!isOngoingCall) {
            // Call ended — clear isolation if we were tracking this caller
            if (LocalTracker.isCurrentlyIsolated(this)) {
                LocalTracker.clearCall(this)
            }
            return
        }

        // Call is ongoing — check if caller is a known contact
        val isKnown = isCallerInPhonebook(title)
            || EmergencyVault.isKnownContact(this, title, null)

        if (!isKnown && !LocalTracker.isCurrentlyIsolated(this)) {
            // Unknown caller — start the 6-hour timer
            LocalTracker.markCallStart(this, callerLabel = title.ifBlank { "Unknown" })
            scheduleHeartbeat()
        }
    }

    /* ─────────────────────────────────────────────────────────────
       Missed call from Safety Circle
    ───────────────────────────────────────────────────────────── */
    private fun handleTelecomNotification(extras: Bundle) {
        val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
        val text  = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""

        val isMissed = text.contains("Missed call", ignoreCase = true)
            || text.contains("Missed", ignoreCase = true)

        if (!isMissed) return
        if (!LocalTracker.isCurrentlyIsolated(this)) return
        if (!EmergencyVault.isEmergencyContact(this, title, null)) return

        LocalTracker.incrementMissedCalls(this)
        evaluateDistressCriteria()
    }

    /* ─────────────────────────────────────────────────────────────
       Distress evaluation
    ───────────────────────────────────────────────────────────── */
    private fun evaluateDistressCriteria() {
        if (LocalTracker.isDistressThresholdMet(this)) {
            scope.launch { triggerDistressSignal() }
        } else if (LocalTracker.isPreAlertThresholdMet(this)) {
            showPreAlertNotification()
        }
    }

    /* ─────────────────────────────────────────────────────────────
       Pre-alert (at 5 hours) — shown ONLY to the victim, not the kin
    ───────────────────────────────────────────────────────────── */
    private fun showPreAlertNotification() {
        val channelId = "QS_PRE_ALERT"
        val nm = getSystemService(NotificationManager::class.java)

        val channel = NotificationChannel(channelId, "Safety Check-In", NotificationManager.IMPORTANCE_HIGH)
        nm.createNotificationChannel(channel)

        val resetIntent = Intent(this, CircuitBreakerResetReceiver::class.java)
        val resetPending = PendingIntent.getBroadcast(
            this, 0, resetIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notif = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("QuantumShield: Are you safe?")
            .setContentText("You have been in an unknown call for 5+ hours. Tap if you are safe to reset the timer.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .addAction(0, "I AM SAFE — Reset Timer", resetPending)
            .setOngoing(true)
            .build()

        nm.notify(5001, notif)
    }

    /* ─────────────────────────────────────────────────────────────
       Distress signal — sends FCM to kin + WhatsApp fallback
    ───────────────────────────────────────────────────────────── */
    private suspend fun triggerDistressSignal() {
        val callerLabel = LocalTracker.getCallerLabel(this)
        val contacts    = EmergencyVault.getContacts(this)

        // Primary: FCM via Firebase Cloud Function (free tier, ~$0/month)
        sendFcmDistress(callerLabel)

        // Fallback: WhatsApp deep-link (fires even if Firebase is unreachable)
        contacts.filter { it.whatsapp }.forEach { c ->
            val phone = c.phone.replace(Regex("\\D"), "")
            val msg = "🚨 QUANTUM SHIELD — CIRCUIT BREAKER ALERT\n\n" +
                "Your contact has been in an unknown call ($callerLabel) for 6+ hours " +
                "and is unreachable from your number.\n\n" +
                "⚠️ Possible Virtual Kidnapping / Digital Arrest scam.\n\n" +
                "Call immediately or contact:\n• Cybercrime: 1930\n• Police: 100\n\n" +
                "— QuantumShield Anti-Isolation Protocol"

            val uri = Uri.parse("https://wa.me/$phone?text=${Uri.encode(msg)}")
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(intent)
        }

        // Show high-urgency notification on the victim's own device
        showDistressConfirmation()
    }

    private fun showDistressConfirmation() {
        val channelId = "QS_DISTRESS_SENT"
        val nm = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(channelId, "Distress Sent", NotificationManager.IMPORTANCE_DEFAULT)
        nm.createNotificationChannel(channel)
        nm.notify(
            6001,
            NotificationCompat.Builder(this, channelId)
                .setSmallIcon(android.R.drawable.stat_sys_warning)
                .setContentTitle("🚨 Circuit Breaker Activated")
                .setContentText("Distress alert sent to your Safety Circle.")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .build()
        )
    }

    /* ─────────────────────────────────────────────────────────────
       FCM relay call — calls the Firebase Cloud Function
    ───────────────────────────────────────────────────────────── */
    private fun sendFcmDistress(callerLabel: String) {
        // Implemented via okhttp3 POST to your Firebase Cloud Function URL.
        // The Cloud Function uses the Admin SDK to push high-priority FCM
        // to the kin's device token. See functions/main.py for server side.
        //
        // val json = """{"caller":"$callerLabel","tokens":${EmergencyVault.getFcmTokens(this)}}"""
        // OkHttpClient().newCall(Request.Builder()
        //     .url("https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/relayDistressSignal")
        //     .post(json.toRequestBody("application/json".toMediaType()))
        //     .build()
        // ).execute()
        //
        // Uncomment and configure when Firebase project is ready.
    }

    /* ─────────────────────────────────────────────────────────────
       Phonebook lookup — checks if [name] exists in device contacts
    ───────────────────────────────────────────────────────────── */
    private fun isCallerInPhonebook(name: String): Boolean {
        if (name.isBlank()) return false
        val uri = android.provider.ContactsContract.Contacts.CONTENT_URI
        val proj = arrayOf(android.provider.ContactsContract.Contacts.DISPLAY_NAME)
        val sel  = "${android.provider.ContactsContract.Contacts.DISPLAY_NAME} LIKE ?"
        return contentResolver.query(uri, proj, sel, arrayOf("%$name%"), null)?.use {
            it.count > 0
        } ?: false
    }

    /* ─────────────────────────────────────────────────────────────
       WorkManager heartbeat — scheduled via CircuitBreakerWorker
       (see WorkManager setup in MainActivity or Capacitor plugin)
    ───────────────────────────────────────────────────────────── */
    private fun scheduleHeartbeat() {
        // WorkManager periodic work is scheduled from MainActivity.
        // The 30-minute heartbeat re-calls evaluateDistressCriteria()
        // so the timer check survives even if this service is briefly
        // killed by the OS.
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        val pkg = sbn.packageName ?: return
        if (pkg in whatsappPackages && LocalTracker.isCurrentlyIsolated(this)) {
            // WhatsApp call notification removed = call likely ended
            LocalTracker.clearCall(this)
        }
    }
}
