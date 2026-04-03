package com.quantumshield.app

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * LocalTracker — persists Circuit Breaker state in EncryptedSharedPreferences.
 *
 * Survives device reboots. All data stays on-device; nothing is sent to any
 * server until the 6-hour + missed-call threshold is met.
 */
object LocalTracker {

    private const val PREFS_FILE    = "qs_circuit_breaker"
    private const val KEY_START     = "call_start_time"
    private const val KEY_MISSED    = "missed_emergency_calls"
    private const val KEY_ACTIVE    = "isolation_active"
    private const val KEY_CALLER    = "caller_label"
    private const val KEY_GUARDIAN  = "guardian_active"

    private fun prefs(ctx: Context) = EncryptedSharedPreferences.create(
        ctx,
        PREFS_FILE,
        MasterKey.Builder(ctx).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    /* ── Write ── */

    fun markCallStart(ctx: Context, callerLabel: String = "Unknown") {
        prefs(ctx).edit()
            .putLong(KEY_START, System.currentTimeMillis())
            .putInt(KEY_MISSED, 0)
            .putBoolean(KEY_ACTIVE, true)
            .putString(KEY_CALLER, callerLabel)
            .apply()
    }

    fun clearCall(ctx: Context) {
        prefs(ctx).edit()
            .remove(KEY_START)
            .remove(KEY_MISSED)
            .putBoolean(KEY_ACTIVE, false)
            .remove(KEY_CALLER)
            .apply()
    }

    fun incrementMissedCalls(ctx: Context) {
        val p = prefs(ctx)
        val current = p.getInt(KEY_MISSED, 0)
        p.edit().putInt(KEY_MISSED, current + 1).apply()
    }

    fun setGuardianActive(ctx: Context, active: Boolean) {
        prefs(ctx).edit().putBoolean(KEY_GUARDIAN, active).apply()
    }

    /* ── Read ── */

    fun getCallStartTime(ctx: Context): Long = prefs(ctx).getLong(KEY_START, 0L)

    fun getMissedCallsCount(ctx: Context): Int = prefs(ctx).getInt(KEY_MISSED, 0)

    fun isCurrentlyIsolated(ctx: Context): Boolean = prefs(ctx).getBoolean(KEY_ACTIVE, false)

    fun isGuardianActive(ctx: Context): Boolean = prefs(ctx).getBoolean(KEY_GUARDIAN, false)

    fun getCallerLabel(ctx: Context): String = prefs(ctx).getString(KEY_CALLER, "Unknown") ?: "Unknown"

    /* ── Derived ── */

    fun getElapsedMs(ctx: Context): Long {
        val start = getCallStartTime(ctx)
        return if (start > 0L) System.currentTimeMillis() - start else 0L
    }

    fun isDistressThresholdMet(ctx: Context): Boolean {
        val sixHours = 6L * 60 * 60 * 1000
        return isCurrentlyIsolated(ctx)
            && getElapsedMs(ctx) >= sixHours
            && getMissedCallsCount(ctx) > 0
    }

    fun isPreAlertThresholdMet(ctx: Context): Boolean {
        val fiveHours = 5L * 60 * 60 * 1000
        return isCurrentlyIsolated(ctx) && getElapsedMs(ctx) >= fiveHours
    }
}
