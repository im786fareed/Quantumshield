# QuantumShield Native Android Agent — Specification

**Status:** Plan / specification (Phase 3). No code yet. This document is the
build contract for turning the QuantumShield web app into a device-aware
security app on Android.

**Guiding rule (unchanged):** never claim a capability we do not have. Android
is a sandbox, just like the browser — it is *less* restricted than a web page,
but far *more* restricted than a desktop antivirus. This spec is explicit about
which of those three worlds each feature lives in.

---

## 1. Why a native agent at all

The web app protects **on demand**: the user hands it a link, file, APK, or
message and gets an evidence-based verdict. A web page cannot run in the
background, cannot see other apps, and cannot react to things as they happen.

A native agent adds the one thing a browser fundamentally cannot: **presence on
the device** — the ability to look at what is *installed*, watch for risky
*state* (an unknown accessibility service, a sideloaded banking app), and check
things *as they arrive* (a new download, an incoming call).

The app already ships in a **Capacitor** Android shell, so the agent is not a
separate product — it is a **Capacitor plugin** (Kotlin) that exposes native
device signals to the JavaScript/TypeScript code we already have.

---

## 2. The honest capability map

Three buckets. This is the heart of the spec — everything else follows from it.

### ✅ CAN do (a normal Android app, with the right permission)

| Capability | Android mechanism | Permission / gate | Value |
|---|---|---|---|
| **Installed-app inventory** | `PackageManager.getInstalledPackages` | `QUERY_ALL_PACKAGES` (Play-restricted, see §6) or scoped queries | See every app + its *requested* permissions and signing cert |
| **Dangerous-permission audit of installed apps** | Read each package's `requestedPermissions` | same as above | Run our existing APK permission-combination engine on apps already on the phone |
| **Sideload / unknown-source detection** | `getInstallerPackageName` | none | Flag banking-type apps **not** installed from Play Store |
| **Accessibility-service abuse detection** | `Settings.Secure.enabled_accessibility_services` | none (read-only) | The single biggest banking-trojan signal — warn about unknown apps holding Accessibility |
| **Overlay-permission audit** | `Settings.canDrawOverlays` per app | none | Flag apps that can draw fake login/PIN screens |
| **On-download APK/file scan** | `DownloadManager` / `FileObserver` on the public Downloads dir | `READ_MEDIA_*` / scoped storage | Run the existing file + APK engines the moment something lands |
| **Scan a chosen file/APK** | Storage Access Framework picker | user picks the file | Same as web File tab but with real file access |
| **Scam-call screening** | `CallScreeningService` | user sets us as call-screening app | Check incoming numbers against the scam-number engine before the phone rings |
| **Notification scam scanning** | `NotificationListenerService` | explicit user grant | Read notification *text* (e.g. a smishing SMS preview) and run the message engine |
| **Wi-Fi / network posture** | `WifiManager`, `ConnectivityManager` | `ACCESS_NETWORK_STATE` | Warn on open/unencrypted Wi-Fi during banking |
| **Local VPN URL filtering** | `VpnService` (local, no remote server) | user grants VPN | Block known-malicious domains device-wide via the intel router |

### ⚠️ RESTRICTED (possible, but heavy Play Store / privacy gates — see §6)

| Capability | Why restricted |
|---|---|
| **Read SMS for scam scanning** | `READ_SMS`/`RECEIVE_SMS` are **Play-restricted permissions**; Google only approves them for apps whose *core* function is SMS, or the default SMS handler. High rejection risk. |
| **Read call log** | `READ_CALL_LOG` similarly restricted. |
| **`QUERY_ALL_PACKAGES`** | Allowed only with a declared, justified use (a security scanner qualifies, but you must file the declaration and it is reviewed). |
| **VPN-based filtering** | Allowed, but Play reviews VPN apps closely; also affects battery and must be clearly disclosed. |

### ❌ CANNOT do — even as a native Android app (no root)

| Not possible | Why |
|---|---|
| Real-time scanning of **other apps' private files** | Android app sandbox — each app's data is isolated. |
| Reading **other apps' network traffic** | Not accessible without a VPN interception or root. |
| **Blocking** a malicious app from running / auto-uninstalling it | Only the user (or a Device-Owner MDM) can uninstall; we can only warn and deep-link to the uninstall screen. |
| **Process / behaviour monitoring** of other apps (like desktop EDR) | No `ptrace`, no syscall hooks without root. |
| **Shadow-copy / ransomware rollback** of the whole filesystem | Scoped storage; we only see media + our own files. |
| Silent, **fully-automatic** background protection | Android kills background services aggressively (Doze, battery optimisation); "real-time" means *event-driven* (broadcasts, listeners), not a constant scan loop. |

> **Honesty consequence for the UI:** the native app must **not** show a
> desktop-AV style "Real-Time Protection: ON, scanning everything." The honest
> framing is **"Device Watch"** — QuantumShield reacts to *events it is allowed
> to see* (new downloads, incoming calls, notifications, risky app state) and
> checks *what you install*. That is genuinely valuable and genuinely truthful.

---

## 3. Architecture — one Detection Core, two front ends

The agent adds **no new detection logic**. It is a *sensor* that emits the same
`SecuritySignal` objects the web app already uses, into the same risk engine.

```
        ANDROID DEVICE                         EXISTING SHARED CODE (unchanged)
 ┌─────────────────────────────┐
 │ Capacitor plugin (Kotlin)   │   observations   ┌───────────────────────────┐
 │  • installed-app scanner    │ ───────────────► │ src/lib/security/*         │
 │  • accessibility watcher    │   (JSON events)  │  apkAnalysis / fileAnalysis│
 │  • download observer        │                  │  scamPatterns / brands     │
 │  • call-screening service   │ ◄─────────────── │  intel router              │
 │  • notification listener    │   verdicts       │  computeVerdict  ◄── ONE   │
 │  • local VPN filter         │                  │  risk engine               │
 └─────────────────────────────┘                  └───────────────────────────┘
                                                              │
                                                   same VerdictCard UI +
                                                   Protection Center dashboard
```

- **Kotlin plugin responsibilities:** collect raw facts (package lists,
  permission arrays, file paths, phone numbers, notification text) and hand them
  to the TypeScript layer. It does *no scoring*.
- **TypeScript Detection Core (already built):** all analysis, correlation,
  intel lookups, and the final verdict. A malicious-permission APK detected on
  the device runs through the *exact same* `apkAnalysis` + `computeVerdict` as
  one uploaded on the web — so results are identical and there is nothing to
  keep in sync.
- **Result surface:** the existing `VerdictCard` and the new **Protection
  Center** dashboard become live — the posture ring can now reflect real device
  state (unknown accessibility services, sideloaded apps) instead of only
  browser checks.

New TypeScript seam to add later: a `DeviceSignalSource` that receives plugin
events and feeds them to `computeVerdict`, plus a `deviceObservations` capacitor
plugin interface. No change to the risk engine itself.

---

## 4. Privacy model (must hold, or we break our own promise)

1. **On-device first.** Every analysis that can run locally (permissions, file
   hashing, macro/PDF inspection) runs on the phone. Only *indicators* (a hash,
   a domain) ever go to the server intel router — never file contents, never
   SMS bodies, never the app inventory.
2. **Explicit, per-feature consent.** Each sensitive sensor (notifications,
   call screening, VPN, package query) is **off by default** and turned on by
   the user in-app, with a plain-language explanation of what it sees and why.
3. **No silent collection.** The app inventory and notification text are
   analysed in memory and discarded; nothing is uploaded or retained unless the
   user explicitly saves an item to the on-device Evidence Vault.
4. **Revocable.** Every permission can be turned off from within the app, and
   the app degrades gracefully (matches the web behaviour: "not checked" is
   stated honestly, never faked as "safe").

---

## 5. Build sequence (proposed)

Each stage ships independently and is useful on its own.

| Stage | Deliverable | Depends on | Effort (rough) |
|---|---|---|---|
| **N0** | Capacitor plugin scaffold + `deviceObservations` TS bridge; wire ONE trivial signal (device model / OS patch level) end-to-end into a verdict | Capacitor Android (already present) | small |
| **N1** | **Installed-app audit**: inventory + run existing APK permission engine over installed apps; sideload + accessibility-service + overlay checks. Surfaces in Protection Center. | N0 | medium — highest value, lowest Play-policy risk |
| **N2** | **On-download scan**: observe Downloads, auto-run file/APK engines on new files, push a notification with the verdict | N0 | medium |
| **N3** | **Call screening** against the scam-number engine (opt-in) | N0 | medium; needs `CallScreeningService` |
| **N4** | **Notification scanning** for smishing (opt-in), reuses message engine | N0 | medium; sensitive, needs clear consent UI |
| **N5** | **Local VPN domain filter** via intel router (opt-in) | intel router (built) | large; Play review + battery care |
| **N6** | Play Store permission declarations, privacy-policy updates, data-safety form | N1–N5 | required before release of restricted features |

**Recommended first build: N0 + N1.** The installed-app audit — especially
"which apps hold Accessibility / overlay / SMS permissions, and which were
sideloaded" — is the most Bitdefender-like capability that is genuinely
achievable, reuses the entire existing engine, and carries the lowest Play
Store risk.

---

## 6. Play Store reality check (do not skip)

These are real gates that will block a release if ignored:

- **Restricted permissions** (`READ_SMS`, `RECEIVE_SMS`, `READ_CALL_LOG`,
  `QUERY_ALL_PACKAGES`) require a **Permissions Declaration** in Play Console
  with a justified use case and often a demo video. A security scanner is an
  accepted use for `QUERY_ALL_PACKAGES`; SMS/Call-Log are much harder and may
  force us to design N3/N4 around the *user's own action* (e.g. share a message
  into the app) instead of passive reading.
- **Accessibility API**: we only *read the list* of enabled services (allowed).
  We must **not** request the Accessibility permission ourselves for automation
  — apps that do are heavily scrutinised, and it would contradict our own
  "banking-trojan pattern" warning.
- **VPN**: allowed but reviewed; requires a clear privacy policy and disclosure
  that it is a local filter, not a data-routing VPN.
- **Data safety form**: must accurately declare that app-inventory / notification
  / call data is processed on-device and not shared.

---

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Play rejection for restricted permissions | Ship N1 (no restricted perms beyond the declarable `QUERY_ALL_PACKAGES`) first; design N3/N4 around user-initiated sharing if declarations are denied |
| Background-service kills (Doze/OEM battery managers) | Use event-driven APIs (broadcasts, `JobScheduler`, listener services), not a persistent scan loop; set honest expectations in UI |
| Battery / performance complaints (esp. VPN) | Make N5 opt-in, off by default, with a clear battery note |
| Users expecting desktop-AV "blocks everything" | "Device Watch" framing (see §2) — react + warn, never over-promise blocking |
| Duplicated logic drift | Enforced by design: the plugin does zero scoring; all analysis stays in `src/lib/security/*` |

---

## 8. What does NOT change

- No detection logic moves into Kotlin. The risk engine, intel router, scam
  corpus, brand registry, and file/APK analysers stay in TypeScript and remain
  the single source of truth for web and native alike.
- The honesty rules, the evidence-based `VerdictCard`, and the "on device /
  server / third-party / AI" source labelling all carry over unchanged.

---

*Phase 3 deliverable for the QuantumShield Defence Depth upgrade. Companion to
the audit at the project root. Written against public Android platform
capabilities only — no proprietary or reverse-engineered material.*
