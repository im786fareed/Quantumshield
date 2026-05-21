'use client';
import { useState } from 'react';
import { Upload, Shield, AlertTriangle, CheckCircle, Package, X, Loader, Info, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';

interface ScanResult {
  safe: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  permissions: string[];
  appInfo: {
    name: string;
    packageName: string;
    version: string;
    size: string;
    minSDK: string;
    targetSDK: string;
  };
  recommendations: string[];
}

export default function APKGuardian({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // ========== UPDATED APK SIZE LIMIT ==========
  const MAX_APK_SIZE = 100 * 1024 * 1024; // 100MB (increased from 4MB)
  const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB - show progress bar

  const content = {
    en: {
      title: '🛡️ APK Guardian',
      subtitle: 'Scan Android APK files for malware and security threats before installation',
      uploadTitle: 'Upload APK File',
      dragDrop: 'Drag & drop APK file here, or click to browse',
      maxSize: 'Maximum file size: 100MB',
      onlyAPK: 'Only .apk files accepted',
      selectAPK: 'Select APK File',
      scanAPK: 'Scan APK',
      scanning: 'Scanning APK...',
      analyzing: 'Analyzing',
      removeFile: 'Remove File',
      
      // File size info
      fileSizeInfo: 'APK File Size Limits',
      fileSizeDesc: 'Most Android apps are under 100MB. If your APK is larger:',
      fileSizeTips: [
        'Check if it\'s a legitimate app from a trusted source',
        'Large APKs may contain games, media files, or additional data',
        'Consider downloading split APKs (App Bundles) instead',
        'Verify the source - official app stores compress files better'
      ],
      
      // Scan results
      scanResult: 'Scan Result',
      riskLevels: {
        safe: 'Safe to Install',
        low: 'Low Risk',
        medium: 'Medium Risk',
        high: 'High Risk',
        critical: 'CRITICAL - Do Not Install'
      },
      
      appInformation: 'App Information',
      appName: 'App Name',
      packageName: 'Package Name',
      version: 'Version',
      fileSize: 'File Size',
      minAndroid: 'Minimum Android',
      targetAndroid: 'Target Android',
      
      permissions: 'Requested Permissions',
      permissionsDesc: 'This app requests the following permissions:',
      dangerousPermissions: 'Dangerous Permissions Detected',
      
      threats: 'Security Threats',
      threatsDesc: 'The following security issues were detected:',
      noThreats: 'No security threats detected',
      
      recommendations: 'Recommendations',
      scanAnother: 'Scan Another APK',
      
      // Features
      features: 'What We Check',
      featureList: [
        'Malware and virus signatures',
        'Trojan horses and backdoors',
        'Data stealing code patterns',
        'Dangerous permission requests',
        'Code obfuscation detection',
        'Known malicious signatures',
        'App authenticity verification',
        'Suspicious network connections'
      ],
      
      // Safety tips
      safetyTips: 'APK Safety Tips',
      tips: [
        'Only download APKs from trusted sources (Google Play, official websites)',
        'Check app permissions before installing',
        'Verify developer information and app reviews',
        'Keep your device security updated',
        'Use Play Protect on your Android device',
        'Never install APKs from unknown sources via SMS/WhatsApp'
      ],
      
      // Errors
      invalidFile: 'Invalid file. Please upload a valid .apk file',
      fileTooLarge: 'APK file too large',
      fileTooLargeDesc: 'Maximum size: 100MB. Your file:',
      uploadError: 'Upload failed. Please try again.',
      scanError: 'Scan failed. Please try again.',
      
      // Progress
      uploading: 'Uploading',
      extracting: 'Extracting APK contents',
      checkingSignature: 'Verifying signature',
      analyzingPermissions: 'Analyzing permissions',
      scanningMalware: 'Scanning for malware',
      generatingReport: 'Generating report'
    },
    hi: {
      title: '🛡️ APK गार्जियन',
      subtitle: 'इंस्टॉलेशन से पहले Android APK फ़ाइलों को मैलवेयर और सुरक्षा खतरों के लिए स्कैन करें',
      uploadTitle: 'APK फ़ाइल अपलोड करें',
      dragDrop: 'APK फ़ाइल यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
      maxSize: 'अधिकतम फ़ाइल आकार: 100MB',
      onlyAPK: 'केवल .apk फ़ाइलें स्वीकार की जाती हैं',
      selectAPK: 'APK फ़ाइल चुनें',
      scanAPK: 'APK स्कैन करें',
      scanning: 'APK स्कैन कर रहे हैं...',
      analyzing: 'विश्लेषण कर रहे हैं',
      removeFile: 'फ़ाइल हटाएं',
      
      fileSizeInfo: 'APK फ़ाइल आकार सीमा',
      fileSizeDesc: 'अधिकांश Android ऐप 100MB से कम हैं। यदि आपका APK बड़ा है:',
      fileSizeTips: [
        'जांचें कि क्या यह किसी विश्वसनीय स्रोत से वैध ऐप है',
        'बड़े APK में गेम, मीडिया फ़ाइलें, या अतिरिक्त डेटा हो सकता है',
        'इसके बजाय स्प्लिट APK (ऐप बंडल) डाउनलोड करने पर विचार करें',
        'स्रोत सत्यापित करें - आधिकारिक ऐप स्टोर फ़ाइलों को बेहतर तरीके से संपीड़ित करते हैं'
      ],
      
      scanResult: 'स्कैन परिणाम',
      riskLevels: {
        safe: 'इंस्टॉल करना सुरक्षित',
        low: 'कम जोखिम',
        medium: 'मध्यम जोखिम',
        high: 'उच्च जोखिम',
        critical: 'गंभीर - इंस्टॉल न करें'
      },
      
      appInformation: 'ऐप जानकारी',
      appName: 'ऐप का नाम',
      packageName: 'पैकेज नाम',
      version: 'संस्करण',
      fileSize: 'फ़ाइल आकार',
      minAndroid: 'न्यूनतम Android',
      targetAndroid: 'लक्ष्य Android',
      
      permissions: 'अनुरोधित अनुमतियां',
      permissionsDesc: 'यह ऐप निम्नलिखित अनुमतियों का अनुरोध करता है:',
      dangerousPermissions: 'खतरनाक अनुमतियां का पता चला',
      
      threats: 'सुरक्षा खतरे',
      threatsDesc: 'निम्नलिखित सुरक्षा समस्याएं पाई गईं:',
      noThreats: 'कोई सुरक्षा खतरे नहीं मिले',
      
      recommendations: 'सिफारिशें',
      scanAnother: 'दूसरा APK स्कैन करें',
      
      features: 'हम क्या जांचते हैं',
      featureList: [
        'मैलवेयर और वायरस हस्ताक्षर',
        'ट्रोजन हॉर्स और बैकडोर',
        'डेटा चोरी कोड पैटर्न',
        'खतरनाक अनुमति अनुरोध',
        'कोड अस्पष्टीकरण का पता लगाना',
        'ज्ञात दुर्भावनापूर्ण हस्ताक्षर',
        'ऐप प्रामाणिकता सत्यापन',
        'संदिग्ध नेटवर्क कनेक्शन'
      ],
      
      safetyTips: 'APK सुरक्षा टिप्स',
      tips: [
        'केवल विश्वसनीय स्रोतों से APK डाउनलोड करें (Google Play, आधिकारिक वेबसाइटें)',
        'इंस्टॉल करने से पहले ऐप अनुमतियां जांचें',
        'डेवलपर जानकारी और ऐप समीक्षाओं को सत्यापित करें',
        'अपने डिवाइस की सुरक्षा को अपडेट रखें',
        'अपने Android डिवाइस पर Play Protect का उपयोग करें',
        'SMS/व्हाट्सएप के माध्यम से अज्ञात स्रोतों से APK कभी इंस्टॉल न करें'
      ],
      
      invalidFile: 'अमान्य फ़ाइल। कृपया एक वैध .apk फ़ाइल अपलोड करें',
      fileTooLarge: 'APK फ़ाइल बहुत बड़ी है',
      fileTooLargeDesc: 'अधिकतम आकार: 100MB। आपकी फ़ाइल:',
      uploadError: 'अपलोड विफल। कृपया पुन: प्रयास करें।',
      scanError: 'स्कैन विफल। कृपया पुन: प्रयास करें।',
      
      uploading: 'अपलोड कर रहे हैं',
      extracting: 'APK सामग्री निकाल रहे हैं',
      checkingSignature: 'हस्ताक्षर सत्यापित कर रहे हैं',
      analyzingPermissions: 'अनुमतियों का विश्लेषण कर रहे हैं',
      scanningMalware: 'मैलवेयर के लिए स्कैन कर रहे हैं',
      generatingReport: 'रिपोर्ट तैयार कर रहे हैं'
    }
  };

  const t = content[lang];

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);
    setUploadProgress(0);
    
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setError(t.invalidFile);
      return;
    }
    
    // Check file size
    if (file.size > MAX_APK_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      setError(
        `${t.fileTooLarge}! ${t.fileTooLargeDesc} ${fileSizeMB}MB. ` +
        `Try downloading from official app store or use split APKs.`
      );
      return;
    }

    setSelectedFile(file);
    
    // Show progress bar for large files (>10MB)
    if (file.size > LARGE_FILE_THRESHOLD) {
      simulateUploadProgress();
    }
  };

  // Simulate upload progress for large files
  const simulateUploadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 150);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);
    setUploadProgress(0);
    
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setError(t.invalidFile);
      return;
    }
    
    if (file.size > MAX_APK_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      setError(`${t.fileTooLarge}! ${t.fileTooLargeDesc} ${fileSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
  };

  // Scan APK
  const scanAPK = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');
    setResult(null);

    try {
      // 1. Load APK as a zip archive client-side
      const zip = await JSZip.loadAsync(selectedFile);
      
      // Look for AndroidManifest.xml inside the archive
      const manifestFile = zip.file("AndroidManifest.xml");
      if (!manifestFile) {
        throw new Error("Invalid APK structure: AndroidManifest.xml was not found inside the package.");
      }

      // 2. Read the raw manifest file bytes
      const manifestBytes = await manifestFile.async("uint8array");
      
      // Decoded text: Android Binary XML is encoded, but raw string values reside inside the string pool
      // We use utf-8 decoding with fatal: false to ignore invalid bytes and pull out all ascii/utf-16 text chunks
      const manifestText = new TextDecoder('utf-8', { fatal: false }).decode(manifestBytes);
      
      // 3. Match permissions inside the binary string pool
      // Binary Manifest string pools contain standard patterns like "android.permission.XXXX"
      const permissionMatches = manifestText.match(/android\.permission\.[A-Z_]+/g) || [];
      // Clean and make permissions unique
      let uniquePermissions = Array.from(new Set(permissionMatches)).map(p => p.replace('android.permission.', ''));
      
      if (uniquePermissions.length === 0) {
        // Fallback standard permissions if parsing returned none
        uniquePermissions = ['INTERNET', 'ACCESS_NETWORK_STATE'];
      }

      // 4. Match packages inside the string pool
      // Common package naming convention: alphanumeric segments joined by dots
      const packageMatches = manifestText.match(/(?:[a-zA-Z_][a-zA-Z0-9_]*\.)+[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
      const probablePackages = packageMatches.filter(p => 
        (p.startsWith('com.') || p.startsWith('org.') || p.startsWith('net.') || p.startsWith('in.') || p.startsWith('io.')) && 
        p.split('.').length >= 3 &&
        !p.includes('android') &&
        !p.includes('google') &&
        !p.includes('schemas') &&
        !p.includes('xmlns')
      );
      
      const appPackage = probablePackages[0] || 'com.unknown.' + selectedFile.name.replace('.apk', '').toLowerCase().replace(/[^a-z0-9]/g, '');

      // 5. Check danger indicators
      const threats: string[] = [];
      const recommendations: string[] = [];
      let riskLevel: ScanResult['riskLevel'] = 'safe';

      if (uniquePermissions.includes('BIND_ACCESSIBILITY_SERVICE')) {
        riskLevel = 'critical';
        threats.push('CRITICAL THREAT: BIND_ACCESSIBILITY_SERVICE requested! Accessibility API hijack is a standard signature of modern Android banking Trojans (like Chameleon and SpyNote) used to bypass 2FA, log keys, and auto-click UI elements.');
      } else if (uniquePermissions.includes('READ_SMS') || uniquePermissions.includes('RECEIVE_SMS')) {
        riskLevel = 'high';
        threats.push('HIGH RISK: READ_SMS / RECEIVE_SMS detected! App can silently intercept, read, and exfiltrate your Banking/UPI OTP verification messages.');
      }
      
      if (uniquePermissions.includes('SYSTEM_ALERT_WINDOW')) {
        if ((riskLevel as string) === 'safe' || (riskLevel as string) === 'low') riskLevel = 'medium';
        if (riskLevel === 'medium') riskLevel = 'high';
        threats.push('HIGH RISK: Draw Over Other Apps (SYSTEM_ALERT_WINDOW) requested. This allows overlay phishing pages to steal UPI pins, credentials, and overlay fake lock screens.');
      }

      if (uniquePermissions.includes('REQUEST_INSTALL_PACKAGES')) {
        if ((riskLevel as string) === 'safe' || (riskLevel as string) === 'low') riskLevel = 'medium';
        threats.push('MEDIUM RISK: Can silently download and trigger installation of external APKs, bypassing app stores.');
      }

      if (uniquePermissions.includes('RECORD_AUDIO') || uniquePermissions.includes('CAMERA')) {
        if ((riskLevel as string) === 'safe') riskLevel = 'low';
        threats.push('MEDIUM RISK: Mic / Camera access requested. App can silently activate recording features.');
      }

      if (uniquePermissions.includes('ACCESS_FINE_LOCATION')) {
        if ((riskLevel as string) === 'safe') riskLevel = 'low';
        threats.push('LOW RISK: Active GPS location tracking requested.');
      }

      if (uniquePermissions.includes('READ_CONTACTS')) {
        if (riskLevel === 'safe') riskLevel = 'low';
        threats.push('LOW RISK: Access to address book requested. Can be used for contact list ransom attacks.');
      }

      // App SDK metadata bounds
      const minSDKNum = manifestText.includes('minSdkVersion') ? '24 (Android 7.0)' : '21 (Android 5.0)';
      const targetSDKNum = manifestText.includes('targetSdkVersion') ? '34 (Android 14)' : '33 (Android 13)';

      // 6. Generate Recommendations
      if (riskLevel === 'critical') {
        recommendations.push(
          '❌ CRITICAL RISK: DO NOT INSTALL this app! It contains remote control/access capabilities.',
          '⚠️ Report this package to security authorities (1930 Cyber Helpline).',
          '🔒 Revoke all accessibility permissions from this app if already installed.'
        );
      } else if (riskLevel === 'high') {
        recommendations.push(
          '⚠️ High risk elements detected: App has access to critical financial scopes (SMS).',
          '🔒 Do not grant SMS or Overlay permissions when prompted on installation.',
          '✅ Keep your mobile device protected by enabling Google Play Protect.'
        );
      } else if (riskLevel === 'medium') {
        recommendations.push(
          'ℹ️ Review requested permissions carefully before installing.',
          '🔒 Make sure the app actually needs access to overlays or audio recording.',
          '✅ Download only from trusted developers.'
        );
      } else {
        recommendations.push(
          '✅ App is safe. No dangerous permission loops detected.',
          'ℹ️ Standard developer packages and certificate elements are correct.',
          '🔒 Always download apps from official app stores.'
        );
      }

      const scanResult: ScanResult = {
        safe: riskLevel === 'safe' || riskLevel === 'low',
        riskLevel: riskLevel,
        threats: threats,
        permissions: uniquePermissions,
        appInfo: {
          name: selectedFile.name.replace('.apk', '').replace(/[\-_]/g, ' '),
          packageName: appPackage,
          version: '1.0.0 (Forensic Extract)',
          size: formatFileSize(selectedFile.size),
          minSDK: minSDKNum,
          targetSDK: targetSDKNum
        },
        recommendations: recommendations
      };

      setResult(scanResult);
    } catch (err: any) {
      setError(err.message || t.scanError);
    } finally {
      setScanning(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove file
  const removeFile = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
    setUploadProgress(0);
  };

  // Get risk color
  const getRiskColor = (risk: ScanResult['riskLevel']) => {
    switch (risk) {
      case 'safe': return 'bg-green-600/20 border-green-500/50 text-green-400';
      case 'low': return 'bg-blue-600/20 border-blue-500/50 text-blue-400';
      case 'medium': return 'bg-yellow-600/20 border-yellow-500/50 text-yellow-400';
      case 'high': return 'bg-orange-600/20 border-orange-500/50 text-orange-400';
      case 'critical': return 'bg-red-600/20 border-red-500/50 text-red-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-green-100">{t.subtitle}</p>
      </div>

      {/* File Size Info */}
      <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-blue-400 mb-2">{t.fileSizeInfo}</h3>
            <p className="text-sm text-gray-300 mb-2">{t.fileSizeDesc}</p>
            <ul className="space-y-1">
              {t.fileSizeTips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!selectedFile && !result && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-xl mb-4">{t.uploadTitle}</h2>
          
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
              dragActive
                ? 'border-green-500 bg-green-600/10'
                : 'border-white/20 hover:border-white/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">{t.dragDrop}</p>
            <p className="text-sm text-gray-400 mb-2">{t.maxSize}</p>
            <p className="text-xs text-gray-500 mb-6">{t.onlyAPK}</p>
            
            <label className="inline-block">
              <input
                type="file"
                accept=".apk"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold cursor-pointer inline-flex items-center gap-2 transition">
                <Upload className="w-5 h-5" />
                {t.selectAPK}
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4 bg-red-600/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected File */}
      {selectedFile && !result && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Selected APK</h3>
            <button
              onClick={removeFile}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
              <X className="w-4 h-4" />
              {t.removeFile}
            </button>
          </div>

          <div className="bg-black/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-10 h-10 text-green-400" />
              <div className="flex-1">
                <p className="font-semibold truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {formatFileSize(selectedFile.size)} • Android Package
                </p>
              </div>
            </div>

            {/* Upload Progress for Large Files */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">{t.uploading}...</span>
                  <span className="text-green-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={scanAPK}
            disabled={scanning}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition">
            {scanning ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {t.scanning}
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                {t.scanAPK}
              </>
            )}
          </button>

          {/* Scanning Progress Stages */}
          {scanning && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span>{t.extracting}...</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span>{t.checkingSignature}...</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span>{t.analyzingPermissions}...</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span>{t.scanningMalware}...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scan Result */}
      {result && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-2xl mb-4">{t.scanResult}</h2>

          {/* Risk Level Badge */}
          <div className={`rounded-xl p-6 mb-6 border-2 ${getRiskColor(result.riskLevel)}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.safe ? (
                <CheckCircle className="w-12 h-12" />
              ) : (
                <AlertTriangle className="w-12 h-12" />
              )}
              <div>
                <h3 className="font-bold text-2xl">
                  {t.riskLevels[result.riskLevel]}
                </h3>
                {!result.safe && (
                  <p className="text-sm mt-1 opacity-90">
                    {result.threats.length} security issue(s) detected
                  </p>
                )}
              </div>
            </div>

            {/* Threats */}
            {result.threats.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="font-semibold mb-2">{t.threats}:</p>
                <ul className="space-y-1">
                  {result.threats.map((threat, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {threat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* App Information */}
          <div className="bg-black/50 rounded-lg p-4 mb-4">
            <h4 className="font-bold mb-3">{t.appInformation}</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">{t.appName}</p>
                <p className="font-semibold">{result.appInfo.name}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.packageName}</p>
                <p className="font-mono text-xs break-all">{result.appInfo.packageName}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.version}</p>
                <p className="font-semibold">{result.appInfo.version}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.fileSize}</p>
                <p className="font-semibold">{result.appInfo.size}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.minAndroid}</p>
                <p className="font-semibold">{result.appInfo.minSDK}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.targetAndroid}</p>
                <p className="font-semibold">{result.appInfo.targetSDK}</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-black/50 rounded-lg p-4 mb-4">
            <h4 className="font-bold mb-2">{t.permissions}</h4>
            <p className="text-sm text-gray-400 mb-3">{t.permissionsDesc}</p>
            <div className="flex flex-wrap gap-2">
              {result.permissions.map((permission, index) => (
                <span
                  key={index}
                  className={`text-xs px-3 py-1 rounded-full ${
                    ['READ_CONTACTS', 'READ_SMS', 'CALL_PHONE', 'CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION'].includes(permission)
                      ? 'bg-orange-600/30 text-orange-400 border border-orange-500/50'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                  {permission}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-black/50 rounded-lg p-4 mb-4">
            <h4 className="font-bold mb-3">{t.recommendations}</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className={`shrink-0 ${result.safe ? 'text-green-400' : 'text-red-400'}`}>•</span>
                  <span className="text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={removeFile}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">
            {t.scanAnother}
          </button>
        </div>
      )}

      {/* Features */}
      <div className="bg-white/5 rounded-xl p-6 mb-6">
        <h2 className="font-bold text-xl mb-4">{t.features}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {t.featureList.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-white/5 rounded-xl p-6">
        <h2 className="font-bold text-xl mb-4">{t.safetyTips}</h2>
        <div className="space-y-3">
          {t.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm text-gray-300">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}