# QuantumShield — Release Keystore Generator
# Run this ONCE to create your signing keystore for Google Play.
# Keep quantumshield-release.jks and keystore.properties PRIVATE — never commit them.
#
# Usage: Right-click → "Run with PowerShell"  OR  powershell -ExecutionPolicy Bypass -File generate-keystore.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   QuantumShield — Release Keystore Generator    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Find keytool (bundled with JDK) ──────────────────────────────────────────
$keytool = $null

# Check JAVA_HOME first
if ($env:JAVA_HOME) {
    $candidate = Join-Path $env:JAVA_HOME "bin\keytool.exe"
    if (Test-Path $candidate) { $keytool = $candidate }
}

# Search common JDK locations
if (-not $keytool) {
    $jdkPaths = @(
        "C:\Program Files\Java\*\bin\keytool.exe",
        "C:\Program Files\Eclipse Adoptium\*\bin\keytool.exe",
        "C:\Program Files\Microsoft\jdk-*\bin\keytool.exe",
        "$env:LOCALAPPDATA\Programs\Microsoft VS Code\*\keytool.exe"
    )
    foreach ($pattern in $jdkPaths) {
        $found = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) { $keytool = $found.FullName; break }
    }
}

# Try Android Studio's bundled JDK
if (-not $keytool) {
    $asJdk = Get-Item "$env:LOCALAPPDATA\Google\AndroidStudio*\jbr\bin\keytool.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($asJdk) { $keytool = $asJdk.FullName }
}

if (-not $keytool) {
    Write-Host "ERROR: keytool not found." -ForegroundColor Red
    Write-Host "Please install Android Studio or JDK 17, then re-run this script." -ForegroundColor Yellow
    Write-Host "Download Android Studio: https://developer.android.com/studio" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found keytool at: $keytool" -ForegroundColor Green
Write-Host ""

# ── Collect parameters ────────────────────────────────────────────────────────
$keystoreFile = "..\android\quantumshield-release.jks"
$alias        = "quantumshield"

Write-Host "Enter keystore password (min 6 chars, SAVE THIS SECURELY):" -ForegroundColor Yellow
$storePass = Read-Host -AsSecureString
$storePlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePass))

Write-Host "Re-enter keystore password:" -ForegroundColor Yellow
$storePass2 = Read-Host -AsSecureString
$storePlain2 = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($storePass2))

if ($storePlain -ne $storePlain2) {
    Write-Host "ERROR: Passwords do not match." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Enter key password (can be same as keystore password):" -ForegroundColor Yellow
$keyPass = Read-Host -AsSecureString
$keyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPass))

Write-Host ""
Write-Host "Your name (e.g. QuantumShield Dev):" -ForegroundColor Yellow
$name = Read-Host

Write-Host "Organisation (e.g. QuantumShield Technologies):" -ForegroundColor Yellow
$org = Read-Host

Write-Host "City:" -ForegroundColor Yellow
$city = Read-Host

Write-Host "State (e.g. Maharashtra):" -ForegroundColor Yellow
$state = Read-Host

Write-Host "Country code (e.g. IN):" -ForegroundColor Yellow
$country = Read-Host

$dname = "CN=$name, OU=$org, O=$org, L=$city, ST=$state, C=$country"

# ── Generate keystore ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Generating keystore..." -ForegroundColor Cyan

& $keytool -genkeypair `
    -v `
    -keystore $keystoreFile `
    -alias $alias `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -storepass $storePlain `
    -keypass $keyPlain `
    -dname $dname

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Keystore generation failed." -ForegroundColor Red
    exit 1
}

# ── Write keystore.properties ─────────────────────────────────────────────────
$propsFile = "..\android\keystore.properties"
@"
storeFile=../quantumshield-release.jks
storePassword=$storePlain
keyAlias=$alias
keyPassword=$keyPlain
"@ | Out-File -FilePath $propsFile -Encoding ASCII

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  SUCCESS! Keystore created.                                 ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  android\quantumshield-release.jks   ← KEEP SECRET         ║" -ForegroundColor Green
Write-Host "║  android\keystore.properties         ← KEEP SECRET         ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  NEXT STEPS:                                                ║" -ForegroundColor Yellow
Write-Host "║  1. Backup the .jks file somewhere SAFE (not in Git)        ║" -ForegroundColor Yellow
Write-Host "║  2. Add GitHub Secrets (see SETUP_GUIDE.md)                 ║" -ForegroundColor Yellow
Write-Host "║  3. Push to main → GitHub Actions builds the AAB for you    ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ── Generate base64 for GitHub Secret ────────────────────────────────────────
$jksBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $keystoreFile))
$base64   = [System.Convert]::ToBase64String($jksBytes)
$b64File  = "..\android\keystore-base64.txt"
$base64 | Out-File -FilePath $b64File -Encoding ASCII -NoNewline

Write-Host "GitHub Secret value (KEYSTORE_BASE64) saved to:" -ForegroundColor Cyan
Write-Host "  android\keystore-base64.txt" -ForegroundColor White
Write-Host ""
Write-Host "Copy that file's content into GitHub → Settings → Secrets → Actions" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close"
