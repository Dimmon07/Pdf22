import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  QrCode, 
  Github, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Terminal,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { downloadAndroidProjectZip } from '../utils/zipDownloader';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function InstallApkModal({ isOpen, onClose, isDarkMode }: InstallApkModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'ci' | 'studio' | 'pwabuilder'>('qr');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  // Use the canonical production shared URL or current location
  const appUrl = typeof window !== 'undefined' 
    ? (window.location.hostname.includes('ais-dev')
        ? window.location.href.replace('ais-dev', 'ais-pre')
        : window.location.href)
    : 'https://ais-pre-xpidmtghphebptrayou7cz-241293664586.europe-west2.run.app';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(appUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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

  const handleDownloadWorkflow = () => {
    const yaml = `name: Build Android APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build Debug & Release APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew || true

      - name: Build Debug APK with Gradle
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: PdfMaster-Debug-APK
          path: app/build/outputs/apk/debug/app-debug.apk
`;
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-zinc-900 dark:text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm shadow-purple-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                Тестування на смартфоні та збірка .APK
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Способи запуску застосунку PDF Master у реальних умовах
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/40 p-1.5 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>1. Встановити WebAPK на телефон</span>
          </button>
          <button
            onClick={() => setActiveTab('ci')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'ci'
                ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>2. Збірка APK через GitHub CI</span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Android Studio (ZIP)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'bg-white dark:bg-zinc-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>4. PWABuilder (.apk)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: QR & WebAPK */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/80 dark:border-purple-800/80">
                {/* QR Code Container */}
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-purple-200">
                    <img 
                      src={qrImageUrl} 
                      alt="QR Code for testing on phone"
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-2">
                    Наведіть камеру смартфона
                  </span>
                </div>

                {/* Instructions */}
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Найшвидший спосіб (Без компіляції)
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    Встановлення справжнього Android-додатку (WebAPK)
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Коли ви відкриваєте це посилання у <strong>Google Chrome на Android</strong> і натискаєте <strong>«Встановити додаток»</strong>, Google Play Services автоматично генерує та встановлює повноцінний <strong>.apk</strong> пакет безпосередньо у систему Android!
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Прямий доступ до камери для Google ML Kit Document Scanner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Справжнє створення та експорт .pdf файлів у пам’ять пристрою</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Автономна робота офлайн без підключення до мережі</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <PWAInstallButton variant="primary" label="Встановити на цей пристрій" />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Скопійовано!' : 'Копіювати URL для телефону'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Link box */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                <div className="truncate font-mono text-zinc-600 dark:text-zinc-300 select-all">
                  {appUrl}
                </div>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 font-semibold shrink-0 transition flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Відкрити</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: GitHub Actions CI */}
          {activeTab === 'ci' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                  <Github className="w-4 h-4 text-purple-600" />
                  <span>Безкоштовна хмарна компіляція .APK через GitHub Actions</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Оскільки хмарний веб-контейнер не містить 4 ГБ Android SDK та JDK 17, ми підготували готовий скрипт <strong>GitHub Actions CI</strong> (вже включений у ZIP-архів проєкту за шляхом <code>.github/workflows/build-apk.yml</code>).
                </p>

                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs space-y-2 border border-zinc-200/80 dark:border-zinc-700/80 font-mono">
                  <div className="font-sans font-bold text-zinc-700 dark:text-zinc-300">Як отримати готовий .apk файл:</div>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400 font-sans">
                    <li>Створіть репозиторій на GitHub та завантажте туди розпакований ZIP нашого проєкту.</li>
                    <li>Вкладка <strong>Actions</strong> автоматично запустить збірку через JDK 17 та Gradle.</li>
                    <li>Через 2 хвилини у секції <strong>Artifacts</strong> буде готовий для завантаження файл <code>PdfMaster-Debug-APK.zip</code> з файлом <strong>app-debug.apk</strong> всередині!</li>
                  </ol>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    onClick={handleDownloadWorkflow}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Завантажити build-apk.yml</span>
                  </button>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isZipping ? 'Пакування...' : 'Завантажити повний ZIP проєкту'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Android Studio */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>Локальна збірка APK у Android Studio</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Проєкт PDF Master повністю налаштований за стандартом Clean Architecture з Gradle Version Catalog (<code>libs.versions.toml</code>), Jetpack Compose, CameraX та Google ML Kit Document Scanner.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-center font-bold text-xs leading-5">1</div>
                    <div className="font-bold">Завантажте ZIP</div>
                    <p className="text-zinc-500 text-[11px]">Натисніть кнопку завантаження повного ZIP-архіву проєкту.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-center font-bold text-xs leading-5">2</div>
                    <div className="font-bold">Відкрийте в Studio</div>
                    <p className="text-zinc-500 text-[11px]">Open Project -&gt; зачекайте синхронізації Gradle Sync.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-center font-bold text-xs leading-5">3</div>
                    <div className="font-bold">Build APK</div>
                    <p className="text-zinc-500 text-[11px]">Меню <code>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</code>.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isZipping ? 'Генерація ZIP...' : 'Завантажити Android Studio ZIP (Kotlin/Compose)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PWABuilder */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>Генерація підписаного APK через PWABuilder (Google / Microsoft)</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  <strong>PWABuilder</strong> — офіційний open-source інструмент від команди Microsoft та Google, який упаковує PWA у нативний Android APK (Trusted Web Activity) для тестування або публікації в Google Play Store.
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                  <div className="font-bold text-zinc-700 dark:text-zinc-200">Як згенерувати APK в 1 клік:</div>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                    <li>Перейдіть на сайт <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-purple-600 underline font-semibold">pwabuilder.com</a></li>
                    <li>Вставте посилання нашого застосунку: <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 select-all font-mono text-[11px]">{appUrl}</code></li>
                    <li>Натисніть <strong>«Package for Stores» &gt; «Android»</strong> і завантажте згенерований <strong>.apk</strong> пакет!</li>
                  </ol>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={`https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
                  >
                    <span>Відкрити PWABuilder для генерації APK</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-500">
          <span>Версія: 1.2.0 • Android Jetpack Compose & PWA</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-semibold text-zinc-800 dark:text-zinc-200 transition"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
