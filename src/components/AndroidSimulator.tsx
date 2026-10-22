import React, { useState } from 'react';
import { 
  Smartphone, 
  Sun, 
  Moon, 
  Wifi, 
  Battery, 
  Signal, 
  FileCode2, 
  HelpCircle, 
  Sparkles,
  Download,
  Languages,
  ScanLine
} from 'lucide-react';
import { ActiveScreen, ImageItem } from '../types';
import HomeScreenSim from './HomeScreenSim';
import ImageToPdfSim from './ImageToPdfSim';
import PdfEditorSim from './PdfEditorSim';
import PdfTranslateSim from './PdfTranslateSim';
import DocumentScannerSim from './DocumentScannerSim';

interface AndroidSimulatorProps {
  onOpenCodeExplorer: (filePath?: string) => void;
  onOpenArchitecture: () => void;
  onDownloadProjectZip: () => void;
  onOpenApkModal?: () => void;
  isGlobalDark?: boolean;
  onToggleGlobalDark?: () => void;
}

export default function AndroidSimulator({
  onOpenCodeExplorer,
  onOpenArchitecture,
  onDownloadProjectZip,
  onOpenApkModal,
  isGlobalDark = false,
  onToggleGlobalDark,
}: AndroidSimulatorProps) {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [isDarkMode, setIsDarkMode] = useState(isGlobalDark);
  const [scannedImagesForPdf, setScannedImagesForPdf] = useState<ImageItem[] | undefined>(undefined);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleToggleDark = () => {
    setIsDarkMode(!isDarkMode);
    onToggleGlobalDark?.();
  };

  const handleScanCompleted = (images: ImageItem[]) => {
    setScannedImagesForPdf(images);
    setActiveScreen('image-to-pdf');
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 py-4 px-2 w-full max-w-7xl mx-auto">
      {/* Phone Emulator Container */}
      <div className="relative group">
        {/* Outer Mobile Frame */}
        <div className={`w-[380px] sm:w-[410px] h-[780px] rounded-[48px] p-3 shadow-2xl border-4 transition-colors duration-300 relative flex flex-col ${
          isDarkMode 
            ? 'bg-zinc-900 border-zinc-700 shadow-purple-950/40' 
            : 'bg-zinc-100 border-zinc-300 shadow-zinc-400/40'
        }`}>
          {/* Inner Screen */}
          <div className={`w-full h-full rounded-[40px] overflow-hidden flex flex-col relative transition-colors duration-200 select-none ${
            isDarkMode ? 'bg-[#141218] text-[#E6E1E5]' : 'bg-[#FEF7FF] text-[#1D1B20]'
          }`}>
            
            {/* Android Status Bar */}
            <div className={`h-8 px-6 pt-1 flex items-center justify-between text-xs font-medium z-30 transition-colors ${
              isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              <span>{currentTime}</span>
              
              {/* Dynamic Camera Punch Hole */}
              <div className="w-4 h-4 bg-black rounded-full mx-auto -ml-3" />

              <div className="flex items-center space-x-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Screen Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
              {activeScreen === 'home' && (
                <HomeScreenSim
                  isDarkMode={isDarkMode}
                  onNavigateToImageToPdf={() => setActiveScreen('image-to-pdf')}
                  onNavigateToPdfEditor={() => setActiveScreen('pdf-editor')}
                  onNavigateToPdfTranslate={() => setActiveScreen('pdf-translate')}
                  onNavigateToDocScanner={() => setActiveScreen('doc-scanner')}
                />
              )}

              {activeScreen === 'image-to-pdf' && (
                <ImageToPdfSim
                  isDarkMode={isDarkMode}
                  onBack={() => setActiveScreen('home')}
                  onOpenScanner={() => setActiveScreen('doc-scanner')}
                  initialScannedImages={scannedImagesForPdf}
                />
              )}

              {activeScreen === 'pdf-editor' && (
                <PdfEditorSim
                  isDarkMode={isDarkMode}
                  onBack={() => setActiveScreen('home')}
                />
              )}

              {activeScreen === 'pdf-translate' && (
                <PdfTranslateSim
                  isDarkMode={isDarkMode}
                  onBack={() => setActiveScreen('home')}
                />
              )}

              {activeScreen === 'doc-scanner' && (
                <DocumentScannerSim
                  isDarkMode={isDarkMode}
                  onBack={() => setActiveScreen('home')}
                  onScanCompleted={handleScanCompleted}
                />
              )}
            </div>

            {/* Android Navigation Gesture Pill */}
            <div className="h-5 flex items-center justify-center pb-1">
              <div 
                onClick={() => setActiveScreen('home')}
                className={`w-32 h-1 rounded-full cursor-pointer hover:opacity-80 transition-all ${
                  isDarkMode ? 'bg-zinc-600' : 'bg-zinc-400'
                }`} 
                title="Натисніть для виходу на головний екран"
              />
            </div>
          </div>
        </div>

        {/* Floating Quick Action Badge */}
        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/20">
          <Sparkles className="w-3 h-3 animate-spin text-amber-300" />
          <span>Jetpack Compose M3</span>
        </div>
      </div>

      {/* Side Control & Companion Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Device Controls Box */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between mb-3">
            <span>Керування емулятором</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
              Android 15 (API 35)
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={handleToggleDark}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Світла тема</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Темна тема</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveScreen('home')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            >
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Головний екран</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation to Screens */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Швидке тестування модулів
          </h4>

          <div className="space-y-2">
            <button
              onClick={() => setActiveScreen('image-to-pdf')}
              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                activeScreen === 'image-to-pdf'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 font-medium text-purple-700 dark:text-purple-300'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div>
                <div className="text-sm font-semibold">1. Зображення в PDF</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">A4, A3, A5, Фото, Reorder, Crop</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Перейти</span>
            </button>

            <button
              onClick={() => setActiveScreen('pdf-editor')}
              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                activeScreen === 'pdf-editor'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 font-medium text-indigo-700 dark:text-indigo-300'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div>
                <div className="text-sm font-semibold">2. Редактор PDF</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">PdfRenderer, Поворот, Видалення, Merge</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Перейти</span>
            </button>

            <button
              onClick={() => setActiveScreen('pdf-translate')}
              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                activeScreen === 'pdf-translate'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 font-medium text-teal-700 dark:text-teal-300'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-teal-600" />
                  <span>3. Переклад PDF</span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">ML Kit On-Device, Двомовний режим</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Перейти</span>
            </button>

            <button
              onClick={() => setActiveScreen('doc-scanner')}
              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                activeScreen === 'doc-scanner'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-medium text-emerald-700 dark:text-emerald-300'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <ScanLine className="w-4 h-4 text-emerald-600" />
                  <span>4. ML Kit Сканер</span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Edge Detection, Dewarp, Фільтри</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">Перейти</span>
            </button>
          </div>
        </div>

        {/* Source Code & Architecture Actions */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-purple-950 dark:text-purple-200 mb-2">
            Готовий проєкт для Android Studio
          </h4>
          <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mb-4">
            Повний набір Kotlin файлів: ImageToPdf, PdfEditor, PdfTranslator з інтеграцією Google ML Kit.
          </p>

          <div className="space-y-2">
            {onOpenApkModal && (
              <button
                onClick={onOpenApkModal}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>📲 Тестувати на смартфоні / Збірка APK</span>
              </button>
            )}

            <button
              onClick={() => onOpenCodeExplorer()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Огляд коду (Code Explorer)</span>
            </button>

            <button
              onClick={onDownloadProjectZip}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-sm py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm transition"
            >
              <Download className="w-4 h-4 text-purple-600" />
              <span>Завантажити ZIP проєкт</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="w-full flex items-center justify-center gap-2 text-xs text-purple-700 dark:text-purple-300 hover:underline py-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Схема архітектури та налаштування дозволів</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
