import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  RotateCw, 
  Crop, 
  Trash2, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  FileCheck, 
  Download, 
  Sparkles,
  Image as ImageIcon,
  Check,
  Eye,
  Layers,
  ScanLine,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageItem, PdfSettings, PageFormat } from '../types';
import { generatePdfFromImages } from '../utils/pdfGenerator';

interface ImageToPdfSimProps {
  isDarkMode: boolean;
  onBack: () => void;
  onOpenScanner?: () => void;
  initialScannedImages?: ImageItem[];
}

// Sample preset images for quick testing
const SAMPLE_IMAGES: { name: string; url: string }[] = [
  {
    name: 'Документ-Сертифікат',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Скетч-Діаграма',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Сторінка-Звіт',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  },
];

export default function ImageToPdfSim({ 
  isDarkMode, 
  onBack, 
  onOpenScanner,
  initialScannedImages 
}: ImageToPdfSimProps) {
  const [images, setImages] = useState<ImageItem[]>(() => {
    if (initialScannedImages && initialScannedImages.length > 0) {
      return initialScannedImages;
    }
    return [
      {
        id: 'sample-1',
        name: 'Звіт_Проєкт_2026.jpg',
        url: SAMPLE_IMAGES[0].url,
        originalWidth: 800,
        originalHeight: 600,
        rotation: 0,
        sizeBytes: 142000,
      },
      {
        id: 'sample-2',
        name: 'Схема_Архітектури.jpg',
        url: SAMPLE_IMAGES[1].url,
        originalWidth: 800,
        originalHeight: 533,
        rotation: 0,
        sizeBytes: 198000,
      },
    ];
  });

  const [settings, setSettings] = useState<PdfSettings>({
    fileName: 'Document_' + Math.floor(1000 + Math.random() * 9000),
    orientation: 'PORTRAIT',
    margin: 'SMALL',
    compression: 'MEDIUM',
    pageFormat: 'A4',
    includePageNumbers: true,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [generatedPdf, setGeneratedPdf] = useState<{ url: string; size: number; pages: number; name: string } | null>(null);

  // Crop modal state
  const [cropTarget, setCropTarget] = useState<ImageItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = [];
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      newItems.push({
        id: `uploaded-${Date.now()}-${index}`,
        name: file.name,
        url,
        originalWidth: 800,
        originalHeight: 800,
        rotation: 0,
        sizeBytes: file.size,
      });
    });

    setImages(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSampleImage = () => {
    const nextSample = SAMPLE_IMAGES[images.length % SAMPLE_IMAGES.length];
    setImages(prev => [
      ...prev,
      {
        id: `sample-${Date.now()}`,
        name: `${nextSample.name}_${prev.length + 1}.jpg`,
        url: nextSample.url,
        originalWidth: 800,
        originalHeight: 600,
        rotation: 0,
        sizeBytes: 180000,
      },
    ]);
  };

  const handleRotate = (id: string) => {
    setImages(prev =>
      prev.map(img => (img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img))
    );
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleMove = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;

    const nextList = [...images];
    const [moved] = nextList.splice(fromIndex, 1);
    nextList.splice(toIndex, 0, moved);
    setImages(nextList);
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    setProgress(5);
    setProgressStage('Підготовка зображень...');

    try {
      const result = await generatePdfFromImages(images, settings, (p, stage) => {
        setProgress(p);
        setProgressStage(stage);
      });

      const pdfResult = {
        url: result.url,
        size: result.sizeBytes,
        pages: result.pageCount,
        name: `${settings.fileName}.pdf`,
      };

      setGeneratedPdf(pdfResult);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(`Помилка: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top App Bar */}
      <div className={`px-4 py-3 flex items-center justify-between border-b transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-[#1D1B20]' : 'border-zinc-200 bg-white'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold">Зображення в PDF</h2>
            <p className="text-[10px] text-zinc-500">{images.length} {images.length === 1 ? 'фото' : 'фотографій'}</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`p-2 rounded-full border transition flex items-center gap-1.5 text-xs font-semibold ${
            isDarkMode 
              ? 'border-zinc-700 bg-zinc-800 text-purple-300 hover:bg-zinc-700' 
              : 'border-zinc-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
          title="Налаштування PDF"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">Параметри</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Quick action bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Додати фото</span>
            </button>

            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                title="Сканувати документ через Google ML Kit API"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Скан ML Kit</span>
              </button>
            )}

            <button
              onClick={addSampleImage}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                isDarkMode 
                  ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' 
                  : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              + Зразок
            </button>
          </div>

          {images.length > 0 && (
            <button
              onClick={() => setImages([])}
              className="text-[11px] text-rose-500 hover:underline px-1"
            >
              Очистити все
            </button>
          )}
        </div>

        {/* Page Format Selector Bar (A4, A3, A5, Самі фото) */}
        <div className={`p-2.5 rounded-2xl border ${
          isDarkMode ? 'bg-[#1E1B24] border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-600" />
              <span>Формат сторінки:</span>
            </label>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              {settings.pageFormat === 'FIT_TO_IMAGE' ? 'За розміром фото' : settings.pageFormat}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {(
              [
                { id: 'A4', label: 'A4', sub: '210×297 мм' },
                { id: 'A3', label: 'A3', sub: '297×420 мм' },
                { id: 'A5', label: 'A5', sub: '148×210 мм' },
                { id: 'FIT_TO_IMAGE', label: 'Самі фото', sub: 'Без рамок' },
              ] as const
            ).map(fmt => {
              const isSelected = settings.pageFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSettings({ ...settings, pageFormat: fmt.id as PageFormat })}
                  className={`py-1.5 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                      : isDarkMode
                      ? 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                      : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{fmt.label}</span>
                  <span className="text-[8px] opacity-75">{fmt.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Images Grid */}
        {images.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-zinc-400 mb-2 stroke-[1.5]" />
            <h3 className="text-sm font-bold">Немає доданих зображень</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
              Натисніть "Додати фото" або скористайтесь кнопкою "+ Зразок" для тесту.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`rounded-2xl border overflow-hidden flex flex-col relative group transition-all ${
                  isDarkMode ? 'bg-[#1E1B24] border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                {/* Image Preview with rotation */}
                <div className="h-32 bg-zinc-950/20 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `rotate(${img.rotation}deg)` }}
                  />

                  {/* Page number badge */}
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
                    #{idx + 1}
                  </span>

                  {/* Rotation badge if rotated */}
                  {img.rotation > 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold px-1 py-0.2 rounded bg-purple-600/90 text-white">
                      {img.rotation}°
                    </span>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition"
                    title="Видалити"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Card footer controls */}
                <div className="p-1.5 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  {/* Rotate 90 deg */}
                  <button
                    onClick={() => handleRotate(img.id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    title="Повернути на 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Open crop tool */}
                  <button
                    onClick={() => setCropTarget(img)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    title="Кадрувати фото"
                  >
                    <Crop className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Left */}
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'left')}
                    className={`p-1.5 rounded-lg ${
                      idx === 0 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                    title="Перемістити ліворуч"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Right */}
                  <button
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className={`p-1.5 rounded-lg ${
                      idx === images.length - 1 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}
                    title="Перемістити праворуч"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Convert to PDF Button Bar */}
      {images.length > 0 && (
        <div className={`p-3 border-t transition-colors ${
          isDarkMode ? 'border-zinc-800 bg-[#1D1B20]' : 'border-zinc-200 bg-white'
        }`}>
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>
              Конвертувати в PDF ({settings.pageFormat === 'FIT_TO_IMAGE' ? 'Фото' : settings.pageFormat}, {images.length} стор.)
            </span>
          </button>
        </div>
      )}

      {/* Settings Bottom Sheet Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/60 z-40 flex flex-col justify-end">
          <div className={`p-4 rounded-t-3xl max-h-[85%] overflow-y-auto space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-[#1E1B24] text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold">Параметри створення PDF</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 font-semibold"
              >
                Зберегти
              </button>
            </div>

            {/* File Name */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Назва PDF файлу
              </label>
              <input
                type="text"
                value={settings.fileName}
                onChange={e => setSettings({ ...settings, fileName: e.target.value })}
                className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
                }`}
              />
            </div>

            {/* Page Format */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Формат сторінки (A4, A3, A5, Самі фото)
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(
                  [
                    { id: 'A4', label: 'A4' },
                    { id: 'A3', label: 'A3' },
                    { id: 'A5', label: 'A5' },
                    { id: 'FIT_TO_IMAGE', label: 'Фото' },
                  ] as const
                ).map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setSettings({ ...settings, pageFormat: fmt.id as PageFormat })}
                    className={`py-2 px-1 rounded-xl border font-medium text-center transition ${
                      settings.pageFormat === fmt.id
                        ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Orientation */}
            {settings.pageFormat !== 'FIT_TO_IMAGE' && (
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Орієнтація сторінки
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['PORTRAIT', 'LANDSCAPE', 'AUTO'] as const).map(ori => (
                    <button
                      key={ori}
                      onClick={() => setSettings({ ...settings, orientation: ori })}
                      className={`py-2 px-1 rounded-xl border font-medium text-center transition ${
                        settings.orientation === ori
                          ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {ori === 'PORTRAIT' ? 'Портретна' : ori === 'LANDSCAPE' ? 'Альбомна' : 'Авто'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Margins */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Поля сторінки (Margins)
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['NONE', 'SMALL', 'LARGE'] as const).map(margin => (
                  <button
                    key={margin}
                    onClick={() => setSettings({ ...settings, margin })}
                    className={`py-2 px-1 rounded-xl border font-medium text-center transition ${
                      settings.margin === margin
                        ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {margin === 'NONE' ? 'Без полів' : margin === 'SMALL' ? 'Малі' : 'Великі'}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Compression */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Стиснення зображень (розмір файлу)
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['HIGH', 'MEDIUM', 'LOW'] as const).map(comp => (
                  <button
                    key={comp}
                    onClick={() => setSettings({ ...settings, compression: comp })}
                    className={`py-2 px-1 rounded-xl border font-medium text-center transition ${
                      settings.compression === comp
                        ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                        : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {comp === 'HIGH' ? 'Макс. якість' : comp === 'MEDIUM' ? 'Оптимально' : 'Мінім. вага'}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Numbering */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold">Додавати номери сторінок</span>
              <input
                type="checkbox"
                checked={settings.includePageNumbers}
                onChange={e => setSettings({ ...settings, includePageNumbers: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Crop / Edit Modal */}
      {cropTarget && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col p-4 justify-between">
          <div className="flex items-center justify-between text-white">
            <h3 className="text-xs font-bold">Кадрування: {cropTarget.name}</h3>
            <button
              onClick={() => setCropTarget(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Скасувати
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 relative">
            <div className="relative border-2 border-purple-500 rounded-xl overflow-hidden max-h-64 shadow-2xl">
              <img
                src={cropTarget.url}
                alt="Crop preview"
                className="max-h-60 object-contain"
                style={{ transform: `rotate(${cropTarget.rotation}deg)` }}
              />
              <div className="absolute inset-0 border border-white/60 pointer-events-none grid grid-cols-3 grid-rows-3">
                <div className="border border-white/20" />
                <div className="border border-white/20" />
                <div className="border border-white/20" />
                <div className="border border-white/20" />
                <div className="border border-white/20" />
                <div className="border border-white/20" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleRotate(cropTarget.id)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-white text-xs font-medium flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Повернути +90°</span>
              </button>
            </div>

            <button
              onClick={() => setCropTarget(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
            >
              Застосувати кадрування (uCrop)
            </button>
          </div>
        </div>
      )}

      {/* Progress Dialog */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className={`w-full max-w-xs p-5 rounded-3xl space-y-3 text-center shadow-2xl ${
            isDarkMode ? 'bg-[#1E1B24] text-white' : 'bg-white text-zinc-900'
          }`}>
            <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <h4 className="text-sm font-bold">Створення PDF ({settings.pageFormat})...</h4>
            
            {/* Linear Progress Indicator */}
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{progressStage}</p>
            <span className="text-xs font-bold text-purple-600">{progress}%</span>
          </div>
        </div>
      )}

      {/* Generated Success Modal */}
      {generatedPdf && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-xs p-5 rounded-3xl space-y-4 text-center shadow-2xl ${
            isDarkMode ? 'bg-[#1E1B24] text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <h4 className="text-sm font-bold">PDF успішно створено!</h4>
              <p className="text-[11px] text-zinc-500 mt-1">
                Файл збережено в Scoped Storage (папка Завантаження) та додано до останніх файлів.
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs text-left ${
              isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="font-semibold truncate">{generatedPdf.name}</div>
              <div className="text-[11px] text-zinc-500 flex justify-between mt-1">
                <span>Формат: {settings.pageFormat}</span>
                <span>{generatedPdf.pages} стор. • {(generatedPdf.size / 1024).toFixed(1)} КБ</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={generatedPdf.url}
                download={generatedPdf.name}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Завантажити PDF на пристрій</span>
              </a>

              <a
                href={generatedPdf.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Переглянути PDF</span>
              </a>

              <button
                onClick={() => setGeneratedPdf(null)}
                className="text-xs text-zinc-500 hover:underline pt-1"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
