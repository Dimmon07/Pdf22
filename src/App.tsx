/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  FileCode2, 
  Layers, 
  Download, 
  Sun,
  Moon,
  Sparkles,
  Languages,
  QrCode
} from 'lucide-react';
import AndroidSimulator from './components/AndroidSimulator';
import CodeExplorer from './components/CodeExplorer';
import ArchitectureGuide from './components/ArchitectureGuide';
import InstallApkModal from './components/InstallApkModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { downloadAndroidProjectZip } from './utils/zipDownloader';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'architecture'>('simulator');
  const [targetCodeFile, setTargetCodeFile] = useState<string>('app/build.gradle.kts');
  const [isZipping, setIsZipping] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  
  // Theme state: dark or light theme
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync dark class on document root
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAndroidProjectZip();
    } catch (e: any) {
      alert(`Помилка генерації ZIP: ${e.message || e}`);
    } finally {
      setIsZipping(false);
    }
  };

  const handleOpenCodeForFile = (filePath?: string) => {
    if (filePath) setTargetCodeFile(filePath);
    setActiveTab('code');
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
      isDarkTheme ? 'dark bg-[#0e0e11] text-zinc-100' : 'bg-zinc-100 text-zinc-900'
    }`}>
      {/* Top Application Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div 
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition">
              <span className="font-extrabold text-sm tracking-tight">PDF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                  PDF Master
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Android Compose
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Image to PDF • PDF Editor • PDF Translator (Google ML Kit)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Емулятор</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Код проєкту</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'architecture'
                  ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Архітектура</span>
            </button>
          </nav>

          {/* Top Right Actions: Theme + PWA + APK + ZIP */}
          <div className="flex items-center gap-2">
            {/* Direct PWA / WebAPK install button */}
            <PWAInstallButton variant="primary" label="Встановити на Android" className="hidden lg:flex" />

            {/* Test on real device / APK modal button */}
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm shadow-emerald-600/20 transition"
              title="Способи запуску на смартфоні та збірки .APK"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Тестувати на смартфоні / APK</span>
              <span className="sm:hidden">APK</span>
            </button>

            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title={isDarkTheme ? 'Перемкнути на світлу тему' : 'Перемкнути на темну тему'}
              aria-label="Перемикач теми"
            >
              {isDarkTheme ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Завантажити ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Content */}
      <main className="flex-1 p-3 sm:p-6 flex flex-col items-center">
        {activeTab === 'simulator' && (
          <AndroidSimulator
            onOpenCodeExplorer={handleOpenCodeForFile}
            onOpenArchitecture={() => setActiveTab('architecture')}
            onDownloadProjectZip={handleDownloadZip}
            onOpenApkModal={() => setIsApkModalOpen(true)}
            isGlobalDark={isDarkTheme}
            onToggleGlobalDark={() => setIsDarkTheme(!isDarkTheme)}
          />
        )}

        {activeTab === 'code' && (
          <CodeExplorer
            initialFilePath={targetCodeFile}
            onDownloadProjectZip={handleDownloadZip}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureGuide
            onGoToCode={handleOpenCodeForFile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">PDF Master Android</span>
            <span>•</span>
            <span>Image to PDF • PDF Editor • PDF Translator (ML Kit)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('code')}
              className="hover:underline text-purple-600 dark:text-purple-400 font-medium"
            >
              build.gradle.kts
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('architecture')}
              className="hover:underline text-purple-600 dark:text-purple-400 font-medium"
            >
              Scoped Storage & ML Kit
            </button>
          </div>
        </div>
      </footer>

      {/* APK & Real Device Testing Modal */}
      <InstallApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        isDarkMode={isDarkTheme}
      />

      {/* PWA Offline indicator */}
      <OfflineIndicator />
    </div>
  );
}
