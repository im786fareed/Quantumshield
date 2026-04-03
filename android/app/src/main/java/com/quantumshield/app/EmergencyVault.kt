package com.quantumshield.app

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONArray
import org.json.JSONObject

/**
 * EmergencyVault — stores the user's Safety Circle contacts on-device.
 *
 * Contacts are set via the QuantumShield web layer (localStorage) and mirrored
 * here by the Capacitor bridge on app launch, or can be written directly
 * from the Android-native onboarding flow.
 */
object EmergencyVault {

    private const val PREFS_FILE   = "qs_emergency_vault"
    private const val KEY_CONTACTS = "safety_circle"

    data class EmergencyContact(
        val id: String,
        val name: String,
        val phone: String,
        val relation: String,
        val whatsapp: Boolean = true,
        val fcmToken: String? = null,
    )

    private fun prefs(ctx: Context) = EncryptedSharedPreferences.create(
        ctx,
        PREFS_FILE,
        MasterKey.Builder(ctx).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    /* ── Write ── */

    fun saveContacts(ctx: Context, contacts: List<EmergencyContact>) {
        val arr = JSONArray()
        contacts.forEach { c ->
            arr.put(JSONObject().apply {
                put("id", c.id)
                put("name", c.name)
                put("phone", c.phone)
                put("relation", c.relation)
                put("whatsapp", c.whatsapp)
                if (c.fcmToken != null) put("fcmToken", c.fcmToken)
            })
        }
        prefs(ctx).edit().putString(KEY_CONTACTS, arr.toString()).apply()
    }

    fun updateFcmToken(ctx: Context, contactId: String, token: String) {
        val contacts = getContacts(ctx).map {
            if (it.id == contactId) it.copy(fcmToken = token) else it
        }
        saveContacts(ctx, contacts)
    }

    /* ── Read ── */

    fun getContacts(ctx: Context): List<EmergencyContact> {
        val raw = prefs(ctx).getString(KEY_CONTACTS, null) ?: return emptyList()
        return runCatching {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { i ->
                val o = arr.getJSONObject(i)
                EmergencyContact(
                    id       = o.getString("id"),
                    name     = o.getString("name"),
                    phone    = o.getString("phone"),
                    relation = o.getString("relation"),
                    whatsapp = o.optBoolean("whatsapp", true),
                    fcmToken = o.optString("fcmToken").takeIf { it.isNotBlank() },
                )
            }
        }.getOrElse { emptyList() }
    }

    /**
     * Returns true if [callerName] or [callerPhone] matches any stored Safety Circle contact.
     * Used by CircuitBreakerService to determine if the caller is "known."
     */
    fun isKnownContact(ctx: Context, callerName: String?, callerPhone: String?): Boolean {
        if (callerName.isNullOrBlank() && callerPhone.isNullOrBlank()) return false
        return getContacts(ctx).any { c ->
            (!callerName.isNullOrBlank() && c.name.equals(callerName, ignoreCase = true)) ||
            (!callerPhone.isNullOrBlank() && c.phone.replace(Regex("\\D"), "") ==
                callerPhone.replace(Regex("\\D"), ""))
        }
    }

    fun isEmergencyContact(ctx: Context, name: String?, phone: String?): Boolean =
        isKnownContact(ctx, name, phone)

    fun hasContacts(ctx: Context): Boolean = getContacts(ctx).isNotEmpty()

    fun getFcmTokens(ctx: Context): List<String> =
        getContacts(ctx).mapNotNull { it.fcmToken }
}
