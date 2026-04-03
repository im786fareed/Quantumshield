package com.quantumshield.app

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Handles the "I AM SAFE" action from the 5-hour pre-alert notification.
 * Resets the isolation timer so the distress signal is NOT sent.
 */
class CircuitBreakerResetReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        // Reset the timer — user confirmed they are safe
        LocalTracker.markCallStart(ctx, LocalTracker.getCallerLabel(ctx))

        // Dismiss the pre-alert notification
        ctx.getSystemService(NotificationManager::class.java)?.cancel(5001)
    }
}
