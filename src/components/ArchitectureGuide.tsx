import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Database, 
  Smartphone, 
  CheckCircle, 
  ExternalLink,
  Code2,
  FileCheck2,
  BookOpen
} from 'lucide-react';

interface ArchitectureGuideProps {
  onGoToCode: (filePath: string) => void;
}

export default function ArchitectureGuide({ onGoToCode }: ArchitectureGuideProps) {
  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 space-y-6">
      {/* Intro Hero */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-purple-200">
            Архітектурний гайд
          </span>
          <h2 className="text-2xl font-black mt-3">
            Архітектура MVVM та Clean Architecture для Android
          </h2>
          <p className="text-sm text-purple-200/90 mt-2 leading-relaxed">
            Повне пояснення розподілу шарів (Data, Domain, Presentation), роботи з нативними PDF API та сучасної моделі дозволів Scoped Storage на Android 10-15.
          </p>
        </div>
      </div>

      {/* 3-Tier Clean Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Presentation Layer */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-pink-600">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              1. Presentation Layer
            </span>
            <h3 className="text-base font-bold mt-0.5">Jetpack Compose & ViewModel</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Декларативний UI на Jetpack Compose без застарілих XML Layouts. ViewModel транслює StateFlow стани (<code className="text-purple-600 font-mono">ImageToPdfUiState</code>, <code className="text-purple-600 font-mono">PdfEditorUiState</code>).
          </p>
          <button
            onClick={() => onGoToCode('app/src/main/java/com/pdfmaster/app/ui/screens/imagetopdf/ImageToPdfScreen.kt')}
            className="text-xs text-pink-600 dark:text-pink-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Переглянути екран Compose</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Domain Layer */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              2. Domain Layer
            </span>
            <h3 className="text-base font-bold mt-0.5">Моделі та Use Cases</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Чистий бізнес-шар без залежності від Android SDK (крім легких Parcelable моделей). Містить сутності <code className="text-purple-600 font-mono">ImageItem</code>, <code className="text-purple-600 font-mono">PdfPageItem</code>, <code className="text-purple-600 font-mono">PdfSettings</code>.
          </p>
          <button
            onClick={() => onGoToCode('app/src/main/java/com/pdfmaster/app/domain/model/PdfModels.kt')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Переглянути моделі домену</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Data Layer */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              3. Data Layer
            </span>
            <h3 className="text-base font-bold mt-0.5">Генератори та Scoped Storage</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Реалізація створення PDF через <code className="text-purple-600 font-mono">PdfDocument</code>, рендерингу прев'ю через <code className="text-purple-600 font-mono">PdfRenderer</code>, та запису файлів у публічний каталог MediaStore.
          </p>
          <button
            onClick={() => onGoToCode('app/src/main/java/com/pdfmaster/app/data/pdf/NativePdfDocumentGenerator.kt')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Переглянути PdfDocumentGenerator</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Deep-Dive: Permissions & Scoped Storage */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Налаштування дозволів та Scoped Storage (Android 10-15+)</h3>
            <p className="text-xs text-zinc-500">Чому застарілі дозволи більше не потрібні та як уникнути помилок</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Сучасний підхід (Реалізовано в проєкті)</span>
            </h4>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-300">
              <li>
                <strong>1. Photo Picker API:</strong> Використовує нативний контракт <code className="font-mono bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded">ActivityResultContracts.PickMultipleVisualMedia()</code>. Не вимагає <strong>жодних дозволів</strong> у маніфесті на Android 13+ (і має зворотну сумісність через Google Play Services аж до Android 4.4).
              </li>
              <li>
                <strong>2. MediaStore.Downloads:</strong> Збереження згенерованих PDF у публічну папку Downloads здійснюється через <code className="font-mono bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded">ContentResolver.insert()</code>. На Android 10+ (API 29+) це не потребує дозволу на запис.
              </li>
              <li>
                <strong>3. Storage Access Framework (SAF):</strong> Дозволяє користувачеві самостійно вказати папку збереження через <code className="font-mono bg-zinc-200 dark:bg-zinc-700 px-1 py-0.5 rounded">CreateDocument("application/pdf")</code>.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h4 className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Конфігурація AndroidManifest.xml</span>
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              У маніфесті оголошено лише захисні директиви для старих версій:
            </p>
            <div className="font-mono text-[11px] bg-zinc-900 text-zinc-200 p-3 rounded-xl overflow-x-auto space-y-1">
              <div>&lt;!-- Для Android 9 і нижче --&gt;</div>
              <div className="text-amber-400">&lt;uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" /&gt;</div>
              <div>&lt;!-- Для FileProvider (Шеринг PDF) --&gt;</div>
              <div className="text-purple-400">&lt;provider android:name="androidx.core.content.FileProvider" ... /&gt;</div>
            </div>
            <button
              onClick={() => onGoToCode('app/src/main/AndroidManifest.xml')}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1 pt-1"
            >
              <span>Відкрити повний AndroidManifest.xml</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table of PDF APIs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <span>Порівняння PDF API в Android</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Бібліотека / API</th>
                <th className="py-2.5 px-3">Призначення у проєкті</th>
                <th className="py-2.5 px-3">Переваги</th>
                <th className="py-2.5 px-3">Коли використовувати</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-purple-600">android.graphics.pdf.PdfDocument</td>
                <td className="py-3 px-3">Створення нового PDF з Bitmap</td>
                <td className="py-3 px-3">Нативне API Android (0 байт до розміру APK), висока швидкість</td>
                <td className="py-3 px-3">Модуль 1: Зображення в PDF</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-indigo-600">android.graphics.pdf.PdfRenderer</td>
                <td className="py-3 px-3">Рендеринг прев'ю сторінок у Bitmap</td>
                <td className="py-3 px-3">Швидкий апаратний рендеринг сторінок без сторонніх важких бібліотек</td>
                <td className="py-3 px-3">Модуль 2: Прев'ю сторінок у редакторі</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-emerald-600">com.tom-roush:pdfbox-android</td>
                <td className="py-3 px-3">Парсинг структури PDF, поворот сторінок, Merge файлів</td>
                <td className="py-3 px-3">Повна підтримка об'єктної моделі PDF (PDDocument, PDPage)</td>
                <td className="py-3 px-3">Модуль 2: Об'єднання декількох PDF та реорганізація</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-teal-600">com.google.mlkit:translate</td>
                <td className="py-3 px-3">Автоматичний переклад документів на 59+ мов</td>
                <td className="py-3 px-3">On-Device машинний переклад, офлайн робота, нульовий витік конфіденційних даних</td>
                <td className="py-3 px-3">Модуль 3: Переклад PDF (двомовний або повний)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-emerald-600">com.google.android.gms:play-services-mlkit-document-scanner</td>
                <td className="py-3 px-3">Виявлення контурів, виправлення перспективи (dewarping), фільтри очищення тіней/паперу</td>
                <td className="py-3 px-3">Нативне ML API від Google з апаратним прискоренням NPU/GPU, автоматичне захоплення кадру</td>
                <td className="py-3 px-3">Модуль 4: Реальний сканер документів (заміна стандартної камери)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
