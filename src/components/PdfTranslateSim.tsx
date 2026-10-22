import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Languages, 
  FileText, 
  Sparkles, 
  Download, 
  Eye, 
  Check, 
  ArrowRightLeft, 
  BookOpen, 
  Copy,
  Layers,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TranslationPage, TranslationSettings } from '../types';
import { 
  SUPPORTED_LANGUAGES, 
  SAMPLE_DOCUMENTS_TO_TRANSLATE, 
  translateDocumentText, 
  createTranslatedPdf 
} from '../utils/pdfTranslator';

interface PdfTranslateSimProps {
  isDarkMode: boolean;
  onBack: () => void;
}

export default function PdfTranslateSim({ isDarkMode, onBack }: PdfTranslateSimProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('uk');
  const [mode, setMode] = useState<'translated_only' | 'bilingual'>('bilingual');
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'translated'>('side-by-side');

  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [translatedPages, setTranslatedPages] = useState<TranslationPage[] | null>(null);

  const [generatedPdf, setGeneratedPdf] = useState<{ url: string; size: number; pages: number; name: string } | null>(null);

  const currentDoc = SAMPLE_DOCUMENTS_TO_TRANSLATE[selectedDocIndex];

  const handleStartTranslation = async () => {
    setIsTranslating(true);
    setProgress(10);
    setProgressMessage('Ініціалізація Google ML Kit Translate (On-Device)...');

    try {
      const pagesToTranslate = currentDoc.pages.map(p => ({
        pageNumber: p.pageNumber,
        text: p.originalText,
      }));

      const settings: TranslationSettings = {
        sourceLang,
        targetLang,
        mode,
      };

      const result = await translateDocumentText(pagesToTranslate, settings, (p, msg) => {
        setProgress(p);
        setProgressMessage(msg);
      });

      setTranslatedPages(result);
    } catch (err: any) {
      alert(`Помилка перекладу: ${err.message || err}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExportPdf = async () => {
    if (!translatedPages) return;
    try {
      const settings: TranslationSettings = { sourceLang, targetLang, mode };
      const docName = `Translated_${currentDoc.fileName.replace('.pdf', '')}_${targetLang.toUpperCase()}.pdf`;
      const result = await createTranslatedPdf(translatedPages, settings, docName);

      setGeneratedPdf({
        url: result.url,
        size: result.sizeBytes,
        pages: result.pageCount,
        name: docName,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e: any) {
      alert(`Помилка експорту PDF: ${e.message || e}`);
    }
  };

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setTranslatedPages(null);
  };

  return (
    <div className="flex flex-col h-full relative">
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
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span>Переклад PDF</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                ML Kit
              </span>
            </h2>
            <p className="text-[10px] text-zinc-500">Автоматичний переклад документів</p>
          </div>
        </div>

        {translatedPages && (
          <button
            onClick={handleExportPdf}
            className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Експорт</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Language Selection Bar */}
        <div className={`p-3 rounded-2xl border transition-colors ${
          isDarkMode ? 'bg-[#1E1B24] border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between gap-2">
            {/* Source Lang */}
            <div className="flex-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                З мови:
              </label>
              <select
                value={sourceLang}
                onChange={e => {
                  setSourceLang(e.target.value);
                  setTranslatedPages(null);
                }}
                className={`w-full text-xs font-semibold py-1.5 px-2 rounded-xl border focus:outline-none ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-800'
                }`}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              className="mt-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-purple-600 transition"
              title="Поміняти мови місцями"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            {/* Target Lang */}
            <div className="flex-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                На мову:
              </label>
              <select
                value={targetLang}
                onChange={e => {
                  setTargetLang(e.target.value);
                  setTranslatedPages(null);
                }}
                className={`w-full text-xs font-semibold py-1.5 px-2 rounded-xl border focus:outline-none ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-300 text-zinc-800'
                }`}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Translation Mode */}
          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-500 font-medium">Режим виводу:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setMode('bilingual')}
                className={`text-[10px] px-2 py-0.8 rounded-lg font-semibold transition ${
                  mode === 'bilingual'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Двомовний
              </button>
              <button
                onClick={() => setMode('translated_only')}
                className={`text-[10px] px-2 py-0.8 rounded-lg font-semibold transition ${
                  mode === 'translated_only'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Лише переклад
              </button>
            </div>
          </div>
        </div>

        {/* Document Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            Документ для перекладу:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_DOCUMENTS_TO_TRANSLATE.map((doc, idx) => (
              <button
                key={doc.fileName}
                onClick={() => {
                  setSelectedDocIndex(idx);
                  setTranslatedPages(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedDocIndex === idx
                    ? 'border-purple-600 bg-purple-500/10 text-purple-900 dark:text-purple-200 font-medium'
                    : isDarkMode
                    ? 'border-zinc-800 hover:border-zinc-700 bg-[#1E1B24]'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="text-xs font-bold truncate">{doc.title}</span>
                </div>
                <span className="text-[10px] text-zinc-500">{doc.pages.length} стор. • {doc.fileName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Translation Trigger Action */}
        {!translatedPages && (
          <button
            onClick={handleStartTranslation}
            disabled={isTranslating}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Перекласти документ ({sourceLang.toUpperCase()} → {targetLang.toUpperCase()})</span>
          </button>
        )}

        {/* Translated Content Viewer */}
        {translatedPages && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Документ перекладено ({translatedPages.length} стор.)</span>
              </span>

              <button
                onClick={handleStartTranslation}
                className="text-[10px] text-purple-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Оновити</span>
              </button>
            </div>

            {/* Pages Accordion / List */}
            {translatedPages.map(page => (
              <div
                key={page.pageNumber}
                className={`p-3 rounded-2xl border transition ${
                  isDarkMode ? 'bg-[#1E1B24] border-zinc-800' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    Сторінка {page.pageNumber}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    {mode === 'bilingual' ? 'Двомовний вивід' : 'Повний переклад'}
                  </span>
                </div>

                {mode === 'bilingual' ? (
                  <div className="space-y-2 text-xs">
                    {/* Original Block */}
                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                        Оригінал ({sourceLang.toUpperCase()}):
                      </span>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                        {page.originalText}
                      </p>
                    </div>

                    {/* Translated Block */}
                    <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                        Переклад ({targetLang.toUpperCase()}):
                      </span>
                      <p className="text-[11px] text-purple-950 dark:text-purple-200 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                        {page.translatedText}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                    <p className="text-[11px] text-purple-950 dark:text-purple-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {page.translatedText}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar: Generate Translated PDF Button */}
      {translatedPages && (
        <div className={`p-3 border-t transition-colors ${
          isDarkMode ? 'border-zinc-800 bg-[#1D1B20]' : 'border-zinc-200 bg-white'
        }`}>
          <button
            onClick={handleExportPdf}
            className="w-full py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Зберегти перекладений PDF ({mode === 'bilingual' ? 'Двомовний' : 'Переклад'})</span>
          </button>
        </div>
      )}

      {/* Translation Progress Modal */}
      {isTranslating && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className={`w-full max-w-xs p-5 rounded-3xl space-y-3 text-center shadow-2xl ${
            isDarkMode ? 'bg-[#1E1B24] text-white' : 'bg-white text-zinc-900'
          }`}>
            <Languages className="w-8 h-8 text-purple-600 animate-pulse mx-auto" />
            <h4 className="text-sm font-bold">Переклад PDF документа...</h4>

            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{progressMessage}</p>
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
              <h4 className="text-sm font-bold">Перекладений PDF збережено!</h4>
              <p className="text-[11px] text-zinc-500 mt-1">
                Файл збережено в Scoped Storage (папка Завантаження).
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs text-left ${
              isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="font-semibold truncate">{generatedPdf.name}</div>
              <div className="text-[11px] text-zinc-500 flex justify-between mt-1">
                <span>{mode === 'bilingual' ? 'Двомовний' : 'Переклад'}</span>
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
                <span>Відкрити перегляд</span>
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
