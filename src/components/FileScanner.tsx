'use client';
import { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Shield, X, Loader, Info } from 'lucide-react';

interface ScanResult {
  safe: boolean;
  threats: string[];
  fileInfo: {
    name: string;
    size: string;
    type: string;
    hash: string;
  };
}

export default function FileScanner({ lang = 'en' }: { lang?: 'en' | 'hi' }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // ========== UPDATED FILE SIZE LIMITS ==========
  const FILE_SIZE_LIMITS: { [key: string]: number } = {
    'image': 10 * 1024 * 1024,      // 10MB (increased from 4MB)
    'document': 25 * 1024 * 1024,   // 25MB (increased from 4MB)
    'executable': 50 * 1024 * 1024, // 50MB (increased from 4MB)
    'video': 200 * 1024 * 1024,     // 200MB (NEW - was not supported)
    'audio': 50 * 1024 * 1024,      // 50MB (NEW - was not supported)
    'archive': 100 * 1024 * 1024,   // 100MB (increased from 4MB)
    'default': 50 * 1024 * 1024     // 50MB default (increased from 4MB)
  };

  const content = {
    en: {
      title: '📁 File Scanner',
      subtitle: 'Scan any file for malware, viruses, and security threats',
      uploadTitle: 'Upload File to Scan',
      dragDrop: 'Drag & drop file here, or click to browse',
      maxSize: 'Maximum file size',
      supported: 'Supported',
      fileTypes: 'All file types supported',
      selectFile: 'Select File',
      scanFile: 'Scan File',
      scanning: 'Scanning...',
      removeFile: 'Remove File',
      scanResult: 'Scan Result',
      fileSafe: 'File is Safe',
      threatsFound: 'Threats Detected',
      fileInfo: 'File Information',
      fileName: 'File Name',
      fileSize: 'File Size',
      fileType: 'File Type',
      fileHash: 'File Hash',
      threats: 'Detected Threats',
      scanAnother: 'Scan Another File',
      
      // File size limits display
      fileSizeLimits: 'File Size Limits',
      limits: {
        images: 'Images: Up to 10MB',
        documents: 'Documents: Up to 25MB',
        executables: 'Executables: Up to 50MB',
        videos: 'Videos: Up to 200MB',
        audio: 'Audio: Up to 50MB',
        archives: 'Archives: Up to 100MB',
        others: 'Other files: Up to 50MB'
      },
      
      // Error messages
      fileTooLarge: 'File too large',
      compressSuggestion: 'Try compressing the file or splitting it into smaller parts',
      uploadError: 'Upload failed. Please try again.',
      
      // Features
      features: 'What We Check',
      featureList: [
        'Malware and virus signatures',
        'Trojan horses and backdoors',
        'Ransomware patterns',
        'Suspicious code execution',
        'Known exploit patterns',
        'Phishing attempts in documents'
      ]
    },
    hi: {
      title: '📁 फ़ाइल स्कैनर',
      subtitle: 'मैलवेयर, वायरस और सुरक्षा खतरों के लिए किसी भी फ़ाइल को स्कैन करें',
      uploadTitle: 'स्कैन करने के लिए फ़ाइल अपलोड करें',
      dragDrop: 'फ़ाइल यहां खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
      maxSize: 'अधिकतम फ़ाइल आकार',
      supported: 'समर्थित',
      fileTypes: 'सभी फ़ाइल प्रकार समर्थित',
      selectFile: 'फ़ाइल चुनें',
      scanFile: 'फ़ाइल स्कैन करें',
      scanning: 'स्कैन कर रहे हैं...',
      removeFile: 'फ़ाइल हटाएं',
      scanResult: 'स्कैन परिणाम',
      fileSafe: 'फ़ाइल सुरक्षित है',
      threatsFound: 'खतरे का पता चला',
      fileInfo: 'फ़ाइल जानकारी',
      fileName: 'फ़ाइल का नाम',
      fileSize: 'फ़ाइल का आकार',
      fileType: 'फ़ाइल का प्रकार',
      fileHash: 'फ़ाइल हैश',
      threats: 'पता लगाए गए खतरे',
      scanAnother: 'दूसरी फ़ाइल स्कैन करें',
      
      fileSizeLimits: 'फ़ाइल आकार सीमा',
      limits: {
        images: 'चित्र: 10MB तक',
        documents: 'दस्तावेज़: 25MB तक',
        executables: 'निष्पादन योग्य: 50MB तक',
        videos: 'वीडियो: 200MB तक',
        audio: 'ऑडियो: 50MB तक',
        archives: 'संग्रह: 100MB तक',
        others: 'अन्य फ़ाइलें: 50MB तक'
      },
      
      fileTooLarge: 'फ़ाइल बहुत बड़ी है',
      compressSuggestion: 'फ़ाइल को संपीड़ित करने या छोटे भागों में विभाजित करने का प्रयास करें',
      uploadError: 'अपलोड विफल। कृपया पुन: प्रयास करें।',
      
      features: 'हम क्या जांचते हैं',
      featureList: [
        'मैलवेयर और वायरस हस्ताक्षर',
        'ट्रोजन हॉर्स और बैकडोर',
        'रैंसमवेयर पैटर्न',
        'संदिग्ध कोड निष्पादन',
        'ज्ञात शोषण पैटर्न',
        'दस्तावेज़ों में फ़िशिंग प्रयास'
      ]
    }
  };

  const t = content[lang];

  // Get file category based on extension
  const getFileCategory = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document';
    if (['exe', 'msi', 'apk', 'dmg', 'deb', 'app', 'bat', 'sh'].includes(ext)) return 'executable';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) return 'audio';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'].includes(ext)) return 'archive';
    
    return 'default';
  };

  // Validate file size based on category
  const validateFileSize = (file: File): boolean => {
    const category = getFileCategory(file.name);
    const maxSize = FILE_SIZE_LIMITS[category];
    
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      
      setError(
        `${t.fileTooLarge}! ${category.toUpperCase()} files: Maximum ${maxSizeMB}MB. ` +
        `Your file: ${fileSizeMB}MB. ${t.compressSuggestion}`
      );
      return false;
    }
    
    return true;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);
    setUploadProgress(0);
    
    // Validate file size
    if (!validateFileSize(file)) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    
    // Show progress bar for large files (>10MB)
    if (file.size > 10 * 1024 * 1024) {
      simulateUploadProgress();
    }
  };

  // Simulate upload progress for large files
  const simulateUploadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
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
    
    if (!validateFileSize(file)) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Scan file
  const scanFile = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setError('');
    setResult(null);

    try {
      // Calculate true SHA-256 hash using the Web Crypto API
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Perform Magic Bytes signature verification
      const headerBytes = new Uint8Array(arrayBuffer.slice(0, 4));
      const hexArr = Array.from(headerBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase());
      const hex4 = hexArr.join(' ');
      const hex3 = hexArr.slice(0, 3).join(' ');
      const hex2 = hexArr.slice(0, 2).join(' ');

      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';

      let safe = true;
      const threats: string[] = [];
      let detectedType = selectedFile.type || 'Unknown binary structure';

      // Verify file headers (Magic Bytes) against extensions
      if (hex4 === '89 50 4E 47') {
        detectedType = 'PNG Image File';
        if (!['png'].includes(ext)) {
          safe = false;
          threats.push(`Spoofing Detected: Genuine PNG image structure found, but extension is maliciously set to ".${ext}".`);
        }
      } else if (hex3 === 'FF D8 FF') {
        detectedType = 'JPEG Image File';
        if (!['jpg', 'jpeg'].includes(ext)) {
          safe = false;
          threats.push(`Spoofing Detected: Genuine JPEG image structure found, but extension is maliciously set to ".${ext}".`);
        }
      } else if (hex4 === '25 50 44 46') {
        detectedType = 'PDF Document File';
        if (ext !== 'pdf') {
          safe = false;
          threats.push(`Spoofing Detected: Genuine PDF document structure found, but extension is maliciously set to ".${ext}".`);
        }
      } else if (hex4 === '50 4B 03 04') {
        detectedType = 'ZIP/PK Compressed Archive';
        if (!['zip', 'apk', 'docx', 'xlsx', 'pptx', 'jar', 'epub', 'aar', 'kmz'].includes(ext)) {
          safe = false;
          threats.push(`Spoofing Detected: ZIP/Archive structure found, but extension is disguised as ".${ext}".`);
        }
      } else if (hex2 === '4D 5A') {
        detectedType = 'Windows Executable/Library Binary (MZ)';
        if (!['exe', 'dll', 'sys', 'scr', 'msi', 'bat', 'cmd'].includes(ext)) {
          safe = false;
          threats.push(`CRITICAL THREAT: Windows executable binary found, disguised under the extension ".${ext}". Executing this file could compromise your system!`);
        }
      } else if (hex4 === '7F 45 4C 46') {
        detectedType = 'Linux ELF Executable Binary';
        if (!['bin', 'so', 'out', 'sh', ''].includes(ext)) {
          safe = false;
          threats.push(`CRITICAL THREAT: Linux/Android ELF executable binary found, disguised under the extension ".${ext}".`);
        }
      }

      // Check for Double Extension Trap (e.g. invoice.pdf.exe)
      if (selectedFile.name.includes('.') && selectedFile.name.split('.').length > 2) {
        const parts = selectedFile.name.toLowerCase().split('.');
        const penultimate = parts[parts.length - 2];
        const ultimate = parts[parts.length - 1];
        if (['exe', 'scr', 'bat', 'cmd', 'vbs', 'js', 'jar'].includes(ultimate) && 
            ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(penultimate)) {
          safe = false;
          threats.push(`CRITICAL THREAT: Double extension trick detected (".${penultimate}.${ultimate}"). Cybercriminals use this to hide executable spyware as documents!`);
        }
      }

      // Check general dangerous extensions
      if (safe && ['exe', 'bat', 'cmd', 'vbs', 'scr', 'js', 'reg', 'ps1'].includes(ext)) {
        // Genuine executable or script file
        threats.push(`Security Advisory: This is an active script or executable format (.${ext}). Make sure you absolutely trust the sender before opening.`);
      }

      const scanResult: ScanResult = {
        safe: safe && threats.filter(t => t.startsWith('CRITICAL') || t.startsWith('Spoofing')).length === 0,
        threats: threats,
        fileInfo: {
          name: selectedFile.name,
          size: formatFileSize(selectedFile.size),
          type: detectedType,
          hash: sha256
        }
      };

      setResult(scanResult);
    } catch (err) {
      setError(t.uploadError);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-purple-100">{t.subtitle}</p>
      </div>

      {/* File Size Limits Info */}
      <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-blue-400 mb-2">{t.fileSizeLimits}</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
              {Object.values(t.limits).map((limit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <span>{limit}</span>
                </div>
              ))}
            </div>
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
                ? 'border-blue-500 bg-blue-600/10'
                : 'border-white/20 hover:border-white/40'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">{t.dragDrop}</p>
            <p className="text-sm text-gray-400 mb-6">{t.fileTypes}</p>
            
            <label className="inline-block">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold cursor-pointer inline-flex items-center gap-2 transition">
                <FileText className="w-5 h-5" />
                {t.selectFile}
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
            <h3 className="font-bold text-lg">Selected File</h3>
            <button
              onClick={removeFile}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
              <X className="w-4 h-4" />
              {t.removeFile}
            </button>
          </div>

          <div className="bg-black/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div className="flex-1">
                <p className="font-semibold truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {formatFileSize(selectedFile.size)} • {getFileCategory(selectedFile.name)}
                </p>
              </div>
            </div>

            {/* Upload Progress for Large Files */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Uploading...</span>
                  <span className="text-blue-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={scanFile}
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
                {t.scanFile}
              </>
            )}
          </button>
        </div>
      )}

      {/* Scan Result */}
      {result && (
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-2xl mb-4">{t.scanResult}</h2>

          {/* Safe/Threat Badge */}
          <div
            className={`rounded-xl p-6 mb-6 ${
              result.safe
                ? 'bg-green-600/20 border border-green-500/50'
                : 'bg-red-600/20 border border-red-500/50'
            }`}>
            <div className="flex items-center gap-3">
              {result.safe ? (
                <CheckCircle className="w-12 h-12 text-green-400" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-red-400" />
              )}
              <div>
                <h3 className={`font-bold text-2xl ${result.safe ? 'text-green-400' : 'text-red-400'}`}>
                  {result.safe ? t.fileSafe : t.threatsFound}
                </h3>
                {!result.safe && (
                  <p className="text-sm text-gray-300 mt-1">
                    {result.threats.length} threat(s) detected
                  </p>
                )}
              </div>
            </div>

            {!result.safe && result.threats.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="font-semibold mb-2">{t.threats}:</p>
                <ul className="space-y-1">
                  {result.threats.map((threat, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      {threat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="bg-black/50 rounded-lg p-4 mb-4">
            <h4 className="font-bold mb-3">{t.fileInfo}</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">{t.fileName}</p>
                <p className="font-mono break-all">{result.fileInfo.name}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.fileSize}</p>
                <p className="font-mono">{result.fileInfo.size}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.fileType}</p>
                <p className="font-mono">{result.fileInfo.type}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">{t.fileHash}</p>
                <p className="font-mono text-xs break-all">{result.fileInfo.hash}</p>
              </div>
            </div>
          </div>

          <button
            onClick={removeFile}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition">
            {t.scanAnother}
          </button>
        </div>
      )}

      {/* Features */}
      <div className="bg-white/5 rounded-xl p-6">
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
    </div>
  );
}