import React from 'react';
import { 
  FileImage, 
  FileEdit, 
  Languages, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Cpu,
  Layers,
  ScanLine
} from 'lucide-react';

interface HomeScreenSimProps {
  isDarkMode: boolean;
  onNavigateToImageToPdf: () => void;
  onNavigateToPdfEditor: () => void;
  onNavigateToPdfTranslate: () => void;
  onNavigateToDocScanner: () => void;
}

export default function HomeScreenSim({
  isDarkMode,
  onNavigateToImageToPdf,
  onNavigateToPdfEditor,
  onNavigateToPdfTranslate,
  onNavigateToDocScanner,
}: HomeScreenSimProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Top App Bar (Material 3 style) */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b transition-colors shrink-0 ${
        isDarkMode ? 'border-zinc-800 bg-[#1D1B20]' : 'border-purple-100 bg-white'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-xs">
            <span className="font-extrabold text-[10px]">PDF</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight">PDF Master</h1>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium">Jetpack Compose • M3</p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
          v1.2.0
        </span>
      </div>

      {/* Main Body - Fits without scrolling */}
      <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden gap-2">
        {/* Compact Welcome Banner */}
        <div className={`p-2.5 px-3 rounded-2xl border transition-all shrink-0 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-950/50 to-zinc-900 border-purple-900/40 text-purple-200' 
            : 'bg-gradient-to-r from-purple-100/70 to-indigo-50/70 border-purple-200 text-purple-900'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-[11px] font-bold">Робота з PDF на Android</span>
            </div>
            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-purple-600/15 text-purple-700 dark:text-purple-300">
              Clean Architecture
            </span>
          </div>
          <p className="text-[10px] opacity-80 mt-0.5">
            Створення, посторінкове редагування та On-Device переклад документів.
          </p>
        </div>

        {/* Modules List - Compact Menu Cards */}
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            Оберіть модуль:
          </div>

          {/* Module 1: Image to PDF */}
          <div
            onClick={onNavigateToImageToPdf}
            className={`p-2.5 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between gap-2.5 shadow-2xs ${
              isDarkMode 
                ? 'bg-[#1E1B24] border-zinc-800/90 hover:border-purple-600/50 hover:bg-[#25222c]' 
                : 'bg-white border-zinc-200 hover:border-purple-400 hover:bg-purple-50/30'
            }`}
          >
            {/* Smaller Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <FileImage className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  Зображення в PDF
                </h4>
                <span className="text-[8px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0">
                  A4, A3, A5, Фото
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                Photo Picker, зміна порядку, кадрування, стиснення
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>

          {/* Module 2: PDF Editor */}
          <div
            onClick={onNavigateToPdfEditor}
            className={`p-2.5 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between gap-2.5 shadow-2xs ${
              isDarkMode 
                ? 'bg-[#1E1B24] border-zinc-800/90 hover:border-indigo-600/50 hover:bg-[#25222c]' 
                : 'bg-white border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/30'
            }`}
          >
            {/* Smaller Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileEdit className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  Редактор PDF
                </h4>
                <span className="text-[8px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shrink-0">
                  PdfRenderer
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                Поворот сторінок, вилучення, перестановка, Merge
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>

          {/* Module 3: PDF Translator */}
          <div
            onClick={onNavigateToPdfTranslate}
            className={`p-2.5 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between gap-2.5 shadow-2xs ${
              isDarkMode 
                ? 'bg-[#1E1B24] border-zinc-800/90 hover:border-teal-600/50 hover:bg-[#25222c]' 
                : 'bg-white border-zinc-200 hover:border-teal-400 hover:bg-teal-50/30'
            }`}
          >
            {/* Smaller Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <Languages className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  Переклад PDF
                </h4>
                <span className="text-[8px] font-semibold px-1.5 py-0.2 rounded-md bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 shrink-0">
                  ML Kit On-Device
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                Офлайн-переклад (UK, EN, PL, DE), двомовний вивід
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>

          {/* Module 4: Google ML Kit Document Scanner */}
          <div
            onClick={onNavigateToDocScanner}
            className={`p-2.5 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between gap-2.5 shadow-2xs ${
              isDarkMode 
                ? 'bg-[#1E1B24] border-zinc-800/90 hover:border-emerald-600/50 hover:bg-[#25222c]' 
                : 'bg-white border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50/30'
            }`}
          >
            {/* Scanner Icon Container */}
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ScanLine className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  ML Kit Сканер Документів
                </h4>
                <span className="text-[8px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0">
                  Edge Detection
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                Виявлення меж, 4-точкова перспектива, фільтри паперу
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>
        </div>

        {/* Compact System Badge Footer */}
        <div className={`p-2 px-3 rounded-xl border text-[10px] flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-zinc-900/70 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Scoped Storage & MediaStore</span>
          </div>
          <span className="font-semibold text-purple-600 dark:text-purple-400">Android 15 (API 35)</span>
        </div>
      </div>
    </div>
  );
}
