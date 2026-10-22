import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  ScanLine, 
  Check, 
  RotateCw, 
  Sparkles, 
  Sliders, 
  Layers, 
  Sun, 
  Maximize2, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Zap, 
  Info,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { ImageItem } from '../types';

interface DocumentScannerSimProps {
  isDarkMode: boolean;
  onBack: () => void;
  onScanCompleted: (scannedImages: ImageItem[]) => void;
}

interface CornerPoint {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

type FilterMode = 'COLOR' | 'GRAYSCALE' | 'ENHANCED_BW' | 'ORIGINAL';

interface SampleDocumentScene {
  id: string;
  title: string;
  category: string;
  sourceUrl: string;
  defaultCorners: [CornerPoint, CornerPoint, CornerPoint, CornerPoint]; // TL, TR, BR, BL
  angleDeg: number;
}

// Preset realistic document scenes (receipt, contract, diagram, report)
const SAMPLE_SCENES: SampleDocumentScene[] = [
  {
    id: 'contract',
    title: 'Юридичний контракт',
    category: 'A4 Текст',
    sourceUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=900&q=80',
    defaultCorners: [
      { x: 18, y: 14 },
      { x: 82, y: 11 },
      { x: 88, y: 84 },
      { x: 14, y: 88 },
    ],
    angleDeg: -2.5,
  },
  {
    id: 'certificate',
    title: 'Сертифікат відповідності',
    category: 'Офіційний бланк',
    sourceUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80',
    defaultCorners: [
      { x: 15, y: 16 },
      { x: 84, y: 12 },
      { x: 87, y: 82 },
      { x: 16, y: 86 },
    ],
    angleDeg: 1.8,
  },
  {
    id: 'report',
    title: 'Технічний звіт & графік',
    category: 'Діаграма & Таблиця',
    sourceUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    defaultCorners: [
      { x: 20, y: 12 },
      { x: 86, y: 15 },
      { x: 82, y: 87 },
      { x: 14, y: 82 },
    ],
    angleDeg: -1.2,
  },
  {
    id: 'invoice',
    title: 'Рахунок-фактура (Invoice)',
    category: 'Фінансовий документ',
    sourceUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80',
    defaultCorners: [
      { x: 16, y: 15 },
      { x: 85, y: 13 },
      { x: 89, y: 85 },
      { x: 13, y: 87 },
    ],
    angleDeg: 0,
  },
];

export default function DocumentScannerSim({
  isDarkMode,
  onBack,
  onScanCompleted,
}: DocumentScannerSimProps) {
  // Scanner Workflow Steps:
  // 1. 'VIEWFINDER': Live camera stream / document detection with ML Kit boundary polygon & auto-capture
  // 2. 'CORNERS': Interactive edge detection & 4-corner perspective adjustment with magnifying loupe
  // 3. 'ENHANCE': Filter enhancement (Clean Color, Grayscale, Sharp B&W, Shadow removal) + rotation
  // 4. 'PAGES_QUEUE': Multi-page batch preview before sending to PDF generator
  const [step, setStep] = useState<'VIEWFINDER' | 'CORNERS' | 'ENHANCE' | 'BATCH'>('VIEWFINDER');

  // Multi-page batch of captured pages
  const [scannedPages, setScannedPages] = useState<ImageItem[]>([]);

  // Current Scene & Source
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const currentScene = SAMPLE_SCENES[selectedSceneIndex];
  
  // Real Camera Stream State
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ML Kit Detection Simulation in Viewfinder
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedConfidence, setDetectedConfidence] = useState(98);
  const [isAutoCaptureEnabled, setIsAutoCaptureEnabled] = useState(true);
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState<number | null>(null);
  const [flashAnimation, setFlashAnimation] = useState(false);

  // Corner adjustment state (normalized 0-100)
  const [corners, setCorners] = useState<[CornerPoint, CornerPoint, CornerPoint, CornerPoint]>(currentScene.defaultCorners);
  const [activeCornerDrag, setActiveCornerDrag] = useState<number | null>(null);
  const cornerContainerRef = useRef<HTMLDivElement>(null);

  // Captured image bitmap (canvas dataUrl)
  const [capturedImageUrl, setCapturedImageUrl] = useState<string>(currentScene.sourceUrl);
  const [dewarpedCanvasUrl, setDewarpedCanvasUrl] = useState<string>('');

  // Enhancement controls
  const [filterMode, setFilterMode] = useState<FilterMode>('COLOR');
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(120);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isProcessingFilter, setIsProcessingFilter] = useState(false);

  // Upload custom photo from file
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  // Reset corners when scene changes
  useEffect(() => {
    setCorners(currentScene.defaultCorners);
    if (!useRealCamera) {
      setCapturedImageUrl(currentScene.sourceUrl);
    }
  }, [selectedSceneIndex, useRealCamera, currentScene]);

  // Handle Real Camera stream initiation
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setUseRealCamera(true);
    } catch (err: any) {
      console.warn('Real camera not available or permission denied:', err);
      setCameraError('Камера недоступна або заборонено доступ. Перемикаємо на емулятор ML Kit.');
      setUseRealCamera(false);
      setCameraActive(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ML Kit live boundary pulse simulation
  useEffect(() => {
    if (step !== 'VIEWFINDER') return;
    const interval = setInterval(() => {
      setDetectedConfidence(prev => Math.floor(94 + Math.random() * 5));
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  // Capture current frame from camera or sample
  const performCapture = useCallback(() => {
    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 300);

    if (useRealCamera && videoRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImageUrl(dataUrl);
      }
    } else {
      setCapturedImageUrl(currentScene.sourceUrl);
    }

    // Set initial detected corners
    setCorners(currentScene.defaultCorners);
    setStep('CORNERS');
  }, [useRealCamera, cameraActive, currentScene]);

  // Auto-capture timer simulation
  const triggerAutoCapture = () => {
    setAutoCaptureCountdown(3);
    const timer = setInterval(() => {
      setAutoCaptureCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          performCapture();
          return null;
        }
        return prev - 1;
      });
    }, 700);
  };

  // Perspective correction & Dewarping algorithm using HTML5 Canvas & Homography/Bilinear warp
  const computeDewarpedImage = useCallback((
    sourceUrl: string, 
    pts: [CornerPoint, CornerPoint, CornerPoint, CornerPoint],
    filter: FilterMode,
    rot: number
  ) => {
    setIsProcessingFilter(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceUrl;
    img.onload = () => {
      // Standard output A4 ratio
      const outWidth = 900;
      const outHeight = 1270;
      const canvas = document.createElement('canvas');
      
      // If rotated 90 or 270, swap dimensions
      if (rot % 180 === 90) {
        canvas.width = outHeight;
        canvas.height = outWidth;
      } else {
        canvas.width = outWidth;
        canvas.height = outHeight;
      }
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Temporary canvas to render corrected source
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = outWidth;
      tempCanvas.height = outHeight;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;

      // Extract bounding quad and apply perspective correction via mesh subdivision
      const srcW = img.naturalWidth || 800;
      const srcH = img.naturalHeight || 600;

      // Convert percentage points to absolute pixels
      const p0 = { x: (pts[0].x / 100) * srcW, y: (pts[0].y / 100) * srcH }; // TL
      const p1 = { x: (pts[1].x / 100) * srcW, y: (pts[1].y / 100) * srcH }; // TR
      const p2 = { x: (pts[2].x / 100) * srcW, y: (pts[2].y / 100) * srcH }; // BR
      const p3 = { x: (pts[3].x / 100) * srcW, y: (pts[3].y / 100) * srcH }; // BL

      // Piecewise affine transformation across a 16x16 grid for high fidelity dewarping
      const subdivisions = 12;
      for (let y = 0; y < subdivisions; y++) {
        for (let x = 0; x < subdivisions; x++) {
          const u0 = x / subdivisions;
          const v0 = y / subdivisions;
          const u1 = (x + 1) / subdivisions;
          const v1 = (y + 1) / subdivisions;

          // Target grid box
          const dx0 = u0 * outWidth;
          const dy0 = v0 * outHeight;
          const dx1 = u1 * outWidth;
          const dy1 = v1 * outHeight;

          // Bilinear interpolate source coordinates
          const interp = (u: number, v: number) => {
            const topX = p0.x + (p1.x - p0.x) * u;
            const topY = p0.y + (p1.y - p0.y) * u;
            const botX = p3.x + (p2.x - p3.x) * u;
            const botY = p3.y + (p2.y - p3.y) * u;
            return {
              x: topX + (botX - topX) * v,
              y: topY + (botY - topY) * v,
            };
          };

          const s00 = interp(u0, v0);
          const s10 = interp(u1, v0);
          const s01 = interp(u0, v1);
          const s11 = interp(u1, v1);

          // Draw clipped slice
          tCtx.save();
          tCtx.beginPath();
          tCtx.rect(dx0, dy0, dx1 - dx0 + 1, dy1 - dy0 + 1);
          tCtx.clip();

          // Approximate affine mapping
          const sx = Math.min(s00.x, s01.x, s10.x, s11.x);
          const sy = Math.min(s00.y, s10.y, s01.y, s11.y);
          const sw = Math.max(s00.x, s01.x, s10.x, s11.x) - sx + 1;
          const sh = Math.max(s00.y, s10.y, s01.y, s11.y) - sy + 1;

          tCtx.drawImage(img, sx, sy, sw, sh, dx0, dy0, dx1 - dx0, dy1 - dy0);
          tCtx.restore();
        }
      }

      // Rotate if necessary
      ctx.save();
      if (rot !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.drawImage(tempCanvas, -outWidth / 2, -outHeight / 2);
      } else {
        ctx.drawImage(tempCanvas, 0, 0);
      }
      ctx.restore();

      // Apply Google ML Kit Document Scanner post-processing filters
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      if (filter === 'GRAYSCALE') {
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
      } else if (filter === 'ENHANCED_BW') {
        // High contrast document binarization with adaptive paper whitening
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // S-curve binarization
          const val = gray > 140 ? Math.min(255, gray * 1.35) : Math.max(0, gray * 0.7);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
      } else if (filter === 'COLOR') {
        // Color Document: Enhance text contrast and whiten background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          if (brightness > 180) {
            // Whitening paper background
            data[i] = Math.min(255, r * 1.12);
            data[i + 1] = Math.min(255, g * 1.12);
            data[i + 2] = Math.min(255, b * 1.12);
          } else {
            // Deepen text ink
            data[i] = r * 0.92;
            data[i + 1] = g * 0.92;
            data[i + 2] = b * 0.92;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setDewarpedCanvasUrl(canvas.toDataURL('image/jpeg', 0.92));
      setIsProcessingFilter(false);
    };
    img.onerror = () => {
      // Fallback
      setDewarpedCanvasUrl(sourceUrl);
      setIsProcessingFilter(false);
    };
  }, []);

  // When moving to ENHANCE, compute the corrected perspective
  const handleConfirmCorners = () => {
    computeDewarpedImage(capturedImageUrl, corners, filterMode, currentRotation);
    setStep('ENHANCE');
  };

  // Re-run filter enhancement when filter or rotation changes
  const handleApplyFilter = (mode: FilterMode) => {
    setFilterMode(mode);
    computeDewarpedImage(capturedImageUrl, corners, mode, currentRotation);
  };

  const handleRotateDewarped = () => {
    const nextRot = (currentRotation + 90) % 360;
    setCurrentRotation(nextRot);
    computeDewarpedImage(capturedImageUrl, corners, filterMode, nextRot);
  };

  // Drag corner points handler for touch/mouse
  const handleCornerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeCornerDrag === null || !cornerContainerRef.current) return;
    const rect = cornerContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));

    setCorners(prev => {
      const next: [CornerPoint, CornerPoint, CornerPoint, CornerPoint] = [...prev];
      next[activeCornerDrag] = { x: Math.round(x), y: Math.round(y) };
      return next;
    });
  };

  // Add the current page to the batch
  const handleSaveScannedPage = (addAnother: boolean = false) => {
    const newPage: ImageItem = {
      id: `scan-${Date.now()}-${scannedPages.length + 1}`,
      name: `Скан_MLKit_Стор_${scannedPages.length + 1}.jpg`,
      url: dewarpedCanvasUrl || capturedImageUrl,
      originalWidth: 900,
      originalHeight: 1270,
      rotation: 0,
      sizeBytes: 240000,
    };

    const updatedBatch = [...scannedPages, newPage];
    setScannedPages(updatedBatch);

    if (addAnother) {
      // Select next scene for realism
      setSelectedSceneIndex(prev => (prev + 1) % SAMPLE_SCENES.length);
      setFilterMode('COLOR');
      setCurrentRotation(0);
      setStep('VIEWFINDER');
    } else {
      // Done with batch -> return directly to Image to PDF module
      onScanCompleted(updatedBatch);
    }
  };

  // Handle local file upload
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedImageUrl(url);
    setUseRealCamera(false);
    stopCamera();
    // Set default detection bounding box
    setCorners([
      { x: 12, y: 12 },
      { x: 88, y: 12 },
      { x: 88, y: 88 },
      { x: 12, y: 88 },
    ]);
    setStep('CORNERS');
  };

  return (
    <div className="flex flex-col h-full relative bg-black text-white select-none overflow-hidden">
      {/* Hidden file input for uploading custom photo */}
      <input
        ref={fileUploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCustomFileUpload}
      />

      {/* TOP HEADER */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-30">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              stopCamera();
              if (scannedPages.length > 0 && step !== 'BATCH') {
                setStep('BATCH');
              } else {
                onBack();
              }
            }}
            className="p-1.5 rounded-full hover:bg-zinc-800 transition active:scale-95"
            title="Назад"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
                <span>Google ML Kit Scanner</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  AI Edge
                </span>
              </h2>
            </div>
            <p className="text-[9px] text-zinc-400">
              {step === 'VIEWFINDER' && 'Автовиявлення меж документа'}
              {step === 'CORNERS' && 'Корекція 4 точок перспективи'}
              {step === 'ENHANCE' && 'Фільтри освітлення & контрасту'}
              {step === 'BATCH' && `${scannedPages.length} відсканованих сторінок`}
            </p>
          </div>
        </div>

        {/* Action icons / Switchers */}
        <div className="flex items-center space-x-1.5">
          {step === 'VIEWFINDER' && (
            <button
              onClick={() => {
                if (cameraActive) {
                  stopCamera();
                  setUseRealCamera(false);
                } else {
                  startCamera();
                }
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                cameraActive
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <Camera className="w-3 h-3 text-purple-400" />
              <span>{cameraActive ? 'Вимк. веб-камеру' : 'Веб-камера'}</span>
            </button>
          )}

          {scannedPages.length > 0 && (
            <button
              onClick={() => onScanCompleted(scannedPages)}
              className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Check className="w-3 h-3" />
              <span>Готово ({scannedPages.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* FLASH ANIMATION */}
      {flashAnimation && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-300" />
      )}

      {/* ========================================================================= */}
      {/* STEP 1: VIEWFINDER (Live camera / simulated ML Kit edge detection)        */}
      {/* ========================================================================= */}
      {step === 'VIEWFINDER' && (
        <div className="flex-1 flex flex-col justify-between relative overflow-hidden bg-zinc-950">
          {/* Preset Scene Selector Bar */}
          <div className="px-3 pt-2 pb-1 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Зразок:
            </span>
            {SAMPLE_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  stopCamera();
                  setUseRealCamera(false);
                  setSelectedSceneIndex(idx);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-medium border shrink-0 transition ${
                  !useRealCamera && selectedSceneIndex === idx
                    ? 'border-purple-500 bg-purple-600/30 text-purple-200 font-bold'
                    : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white'
                }`}
              >
                {scene.title}
              </button>
            ))}
          </div>

          {/* Camera Viewport */}
          <div className="flex-1 relative flex items-center justify-center p-3 overflow-hidden">
            <div className="relative w-full max-w-xs h-[360px] rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl flex items-center justify-center">
              {useRealCamera && cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={currentScene.sourceUrl}
                  alt="Document Preview"
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: `rotate(${currentScene.angleDeg}deg) scale(0.96)` }}
                />
              )}

              {/* ML Kit Edge Detection Overlay Box */}
              {isDetecting && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    padding: '8%',
                  }}
                >
                  <div className="w-full h-full relative border-2 border-emerald-400/90 rounded-lg shadow-[0_0_20px_rgba(52,211,153,0.3)] bg-emerald-500/10 backdrop-blur-[0.5px]">
                    {/* Corner Reticle Brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-emerald-300 -mt-1 -ml-1 rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-emerald-300 -mt-1 -mr-1 rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-emerald-300 -mb-1 -ml-1 rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-emerald-300 -mb-1 -mr-1 rounded-br-sm" />

                    {/* Scanning Laser Beam Effect */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse top-1/2" />

                    {/* AI ML Kit Badge in center */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-full border border-emerald-500/40 text-[9px] text-emerald-300 font-bold backdrop-blur-xs">
                      <ScanLine className="w-3 h-3 text-emerald-400 animate-spin" />
                      <span>ML Kit Quad: {detectedConfidence}%</span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded-full text-[9px] text-zinc-300 font-medium">
                      Кут: {Math.abs(currentScene.angleDeg)}°
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown overlay if active */}
              {autoCaptureCountdown !== null && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center text-2xl font-black text-white bg-purple-900/60 animate-bounce">
                    {autoCaptureCountdown}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Live Controls */}
          <div className="p-4 bg-zinc-950/90 border-t border-zinc-800/80 z-20 space-y-3">
            {/* Auto-capture toggle & Tips */}
            <div className="flex items-center justify-between text-xs px-2">
              <button
                onClick={() => setIsAutoCaptureEnabled(!isAutoCaptureEnabled)}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white"
              >
                <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border ${
                  isAutoCaptureEnabled ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-600'
                }`}>
                  {isAutoCaptureEnabled && <Check className="w-2.5 h-2.5" />}
                </div>
                <span className="text-[11px]">Автозахоплення при стабілізації</span>
              </button>

              <button
                onClick={() => fileUploadInputRef.current?.click()}
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Завантажити фото</span>
              </button>
            </div>

            {/* Shutter Button & Batch Queue Counter */}
            <div className="flex items-center justify-around">
              {/* Batch Preview Pill */}
              <div className="w-12 flex justify-center">
                {scannedPages.length > 0 && (
                  <button
                    onClick={() => setStep('BATCH')}
                    className="relative w-10 h-10 rounded-xl border border-purple-500 overflow-hidden group shadow-md"
                    title="Переглянути чергу скан-копій"
                  >
                    <img
                      src={scannedPages[scannedPages.length - 1].url}
                      alt="Last scan"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white">
                      {scannedPages.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Shutter Capture Button */}
              <button
                onClick={() => {
                  if (isAutoCaptureEnabled) {
                    triggerAutoCapture();
                  } else {
                    performCapture();
                  }
                }}
                className="w-16 h-16 rounded-full border-4 border-white/80 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-purple-900/30 group"
                title="Зробити скан"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 group-hover:from-purple-500 group-hover:to-indigo-400 transition" />
              </button>

              {/* Direct Manual Scan bypass */}
              <div className="w-12 flex justify-center">
                <button
                  onClick={performCapture}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                  title="Миттєве захоплення без таймера"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CORNERS (Perspective Dewarping & 4-Corner Edge Tuning)           */}
      {/* ========================================================================= */}
      {step === 'CORNERS' && (
        <div className="flex-1 flex flex-col justify-between relative bg-zinc-950 p-3">
          {/* Step guidance banner */}
          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[10px] text-purple-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ScanLine className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Потягніть кутові маркери для точного кадрування документа</span>
            </span>
            <button
              onClick={() => setCorners(currentScene.defaultCorners)}
              className="text-[9px] text-purple-300 font-bold hover:underline"
            >
              Скинути межі
            </button>
          </div>

          {/* Interactive Document Image Container with 4 Corner Handles */}
          <div className="flex-1 flex items-center justify-center relative p-2 overflow-hidden">
            <div
              ref={cornerContainerRef}
              onPointerMove={handleCornerPointerMove}
              onPointerUp={() => setActiveCornerDrag(null)}
              className="relative w-full max-w-xs h-[380px] bg-black border border-zinc-800 rounded-2xl overflow-hidden touch-none select-none shadow-2xl"
            >
              <img
                src={capturedImageUrl}
                alt="Captured document"
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* SVG Polygon Connecting the 4 Corners */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polygon
                  points={`${corners[0].x}%,${corners[0].y}% ${corners[1].x}%,${corners[1].y}% ${corners[2].x}%,${corners[2].y}% ${corners[3].x}%,${corners[3].y}%`}
                  fill="rgba(168, 85, 247, 0.22)"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              </svg>

              {/* 4 Interactive Corner Drag Knobs */}
              {corners.map((corner, idx) => {
                const labels = ['TL', 'TR', 'BR', 'BL'];
                const isDragging = activeCornerDrag === idx;
                return (
                  <div
                    key={idx}
                    onPointerDown={e => {
                      e.stopPropagation();
                      (e.target as HTMLElement).setPointerCapture(e.pointerId);
                      setActiveCornerDrag(idx);
                    }}
                    onPointerUp={e => {
                      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                      setActiveCornerDrag(null);
                    }}
                    style={{
                      left: `${corner.x}%`,
                      top: `${corner.y}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-30 transition-transform ${
                      isDragging ? 'scale-125' : 'hover:scale-110'
                    }`}
                  >
                    {/* Circular Handle */}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-600 shadow-lg flex items-center justify-center text-[9px] font-bold text-white">
                      {labels[idx]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleConfirmCorners}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>Застосувати корекцію перспективи (Dewarp)</span>
            </button>

            <button
              onClick={() => setStep('VIEWFINDER')}
              className="w-full py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs transition"
            >
              Перезняти кадр
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: ENHANCE (ML Kit Post-Processing Filters: Color, BW, Grayscale)     */}
      {/* ========================================================================= */}
      {step === 'ENHANCE' && (
        <div className="flex-1 flex flex-col justify-between relative bg-zinc-950 p-3">
          {/* Top Preview Card */}
          <div className="flex-1 flex items-center justify-center relative p-1 overflow-hidden">
            <div className="relative w-full max-w-xs h-[360px] bg-white rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl flex items-center justify-center">
              {isProcessingFilter ? (
                <div className="flex flex-col items-center gap-2 text-zinc-900">
                  <Sparkles className="w-6 h-6 text-purple-600 animate-spin" />
                  <span className="text-xs font-bold">Очищення сторінки & вирівнювання...</span>
                </div>
              ) : (
                <img
                  src={dewarpedCanvasUrl || capturedImageUrl}
                  alt="Enhanced document"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Filter badge */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-white border border-white/20">
                {filterMode === 'COLOR' && 'Очищений кольоровий'}
                {filterMode === 'GRAYSCALE' && 'Відтінки сірого'}
                {filterMode === 'ENHANCED_BW' && 'Ч/Б Документ'}
                {filterMode === 'ORIGINAL' && 'Оригінал'}
              </div>
            </div>
          </div>

          {/* Filter Options Selection Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3 h-3 text-purple-400" />
                <span>Фільтри сканера ML Kit:</span>
              </span>

              <button
                onClick={handleRotateDewarped}
                className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>Поворот 90°</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {(
                [
                  { id: 'COLOR', label: 'Колір', sub: 'Whitened' },
                  { id: 'ENHANCED_BW', label: 'Ч/Б', sub: 'High-contrast' },
                  { id: 'GRAYSCALE', label: 'Сірий', sub: 'Grayscale' },
                  { id: 'ORIGINAL', label: 'Фото', sub: 'Без фільтра' },
                ] as const
              ).map(f => (
                <button
                  key={f.id}
                  onClick={() => handleApplyFilter(f.id)}
                  className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                    filterMode === f.id
                      ? 'border-purple-500 bg-purple-600/30 text-purple-300 font-bold shadow-xs'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold">{f.label}</span>
                  <span className="text-[8px] opacity-75">{f.sub}</span>
                </button>
              ))}
            </div>

            {/* Save Page & Continue Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleSaveScannedPage(true)}
                className="py-2.5 rounded-xl border border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/50 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Додати ще сторінку</span>
              </button>

              <button
                onClick={() => handleSaveScannedPage(false)}
                className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Завершити скан</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: BATCH QUEUE REVIEW (Review all scanned pages before PDF creation) */}
      {/* ========================================================================= */}
      {step === 'BATCH' && (
        <div className="flex-1 flex flex-col justify-between bg-zinc-950 p-3">
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Черга сторінок документа ({scannedPages.length})</span>
              </h3>

              <button
                onClick={() => {
                  setStep('VIEWFINDER');
                }}
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Сканувати ще</span>
              </button>
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-2 gap-3">
              {scannedPages.map((page, index) => (
                <div
                  key={page.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden relative group shadow-sm flex flex-col"
                >
                  <div className="h-40 bg-white relative flex items-center justify-center">
                    <img
                      src={page.url}
                      alt={page.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="p-2 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-300 truncate max-w-[90px]">
                      {page.name}
                    </span>
                    <button
                      onClick={() => {
                        const updated = scannedPages.filter((_, i) => i !== index);
                        setScannedPages(updated);
                        if (updated.length === 0) setStep('VIEWFINDER');
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-3">
            <button
              onClick={() => onScanCompleted(scannedPages)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>Передати {scannedPages.length} стор. у генератор PDF</span>
            </button>

            <button
              onClick={() => setStep('VIEWFINDER')}
              className="w-full py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs"
            >
              Продовжити сканування
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
