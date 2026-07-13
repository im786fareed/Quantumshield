package in.quantumshield.app

import android.content.Context
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * DistressRelay — sends the Circuit Breaker distress signal to the
 * relayDistressSignal Cloud Function (functions/main.py), which pushes a
 * high-priority FCM alert to every paired Safety Circle device.
 *
 * Honesty contract: the caller MUST branch on the returned [Result] and never
 * tell the user an alert was delivered unless it actually was. Every failure
 * path (not configured, no paired devices, no auth, network error) returns
 * [Result.NotSent] with a reason.
 *
 * Configuration: the function URL lives in res/values/strings.xml as
 * `qs_relay_url` and is EMPTY until the Firebase project is deployed. The
 * server requires a Firebase ID token; an anonymous sign-in satisfies it
 * (enable Anonymous auth in the Firebase console).
 */
object DistressRelay {

    private const val MAX_TOKENS = 20        // mirror of the server-side cap
    private const val MAX_LABEL_LENGTH = 100 // mirror of the server-side cap

    sealed class Result {
        data class Sent(val delivered: Int, val failed: Int) : Result()
        data class NotSent(val reason: String) : Result()
    }

    suspend fun send(ctx: Context, callerLabel: String): Result = withContext(Dispatchers.IO) {
        val relayUrl = ctx.getString(R.string.qs_relay_url)
        if (relayUrl.isBlank()) {
            return@withContext Result.NotSent("automatic relay not configured yet")
        }

        val tokens = EmergencyVault.getFcmTokens(ctx)
        if (tokens.isEmpty()) {
            return@withContext Result.NotSent("no Safety Circle device is paired for automatic alerts")
        }

        val idToken = firebaseIdToken()
            ?: return@withContext Result.NotSent("could not sign in to the alert service")

        val payload = JSONObject().apply {
            put("caller", callerLabel.take(MAX_LABEL_LENGTH))
            put("tokens", JSONArray(tokens.take(MAX_TOKENS)))
        }

        runCatching {
            val conn = (URL(relayUrl).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 15_000
                readTimeout = 15_000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer $idToken")
            }
            conn.outputStream.use { it.write(payload.toString().toByteArray()) }

            val code = conn.responseCode
            val body = (if (code in 200..299) conn.inputStream else conn.errorStream)
                ?.bufferedReader()?.use { it.readText() }.orEmpty()
            conn.disconnect()

            if (code !in 200..299) {
                return@runCatching Result.NotSent("alert service responded with error $code")
            }
            val json = runCatching { JSONObject(body) }.getOrNull()
            val delivered = json?.optInt("sent", 0) ?: 0
            val failed = json?.optInt("failed", 0) ?: 0
            if (delivered > 0) {
                Result.Sent(delivered, failed)
            } else {
                Result.NotSent("no Safety Circle device accepted the alert")
            }
        }.getOrElse { Result.NotSent("network error — ${it.message ?: "unreachable"}") }
    }

    /**
     * Returns a fresh Firebase ID token, signing in anonymously on first use.
     * Returns null when Firebase is not initialised (no google-services.json)
     * or sign-in fails — callers treat that as NotSent, never as success.
     */
    private suspend fun firebaseIdToken(): String? = suspendCoroutine { cont ->
        runCatching {
            val auth = FirebaseAuth.getInstance()
            val user = auth.currentUser
            if (user != null) {
                user.getIdToken(false)
                    .addOnSuccessListener { cont.resume(it.token) }
                    .addOnFailureListener { cont.resume(null) }
            } else {
                auth.signInAnonymously()
                    .addOnSuccessListener { result ->
                        val newUser = result.user
                        if (newUser == null) {
                            cont.resume(null)
                        } else {
                            newUser.getIdToken(false)
                                .addOnSuccessListener { cont.resume(it.token) }
                                .addOnFailureListener { cont.resume(null) }
                        }
                    }
                    .addOnFailureListener { cont.resume(null) }
            }
        }.getOrElse { cont.resume(null) }
    }
}
