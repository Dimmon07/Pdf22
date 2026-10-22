import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  FileUp, 
  Layers, 
  Check, 
  Download, 
  Eye, 
  Sparkles, 
  FileText,
  Tag,
  PenTool,
  Type,
  MessageSquare,
  Eraser,
  X,
  Palette,
  Edit3,
  ZoomIn,
  Stamp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PdfPage, PdfMetadata, TextAnnotation, CommentAnnotation } from '../types';
import { loadPdfDocument, exportModifiedPdf, createSamplePdf, LoadedPdfInfo } from '../utils/pdfEditor';

interface PdfEditorSimProps {
  isDarkMode: boolean;
  onBack: () => void;
}

export default function PdfEditorSim({ isDarkMode, onBack }: PdfEditorSimProps) {
  const [docInfo, setDocInfo] = useState<LoadedPdfInfo | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(0);
  const [savingMessage, setSavingMessage] = useState('');
  const [exportedPdf, setExportedPdf] = useState<{ url: string; size: number; pages: number; name: string } | null>(null);

  // Active Modals & Tools
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [activeEditingPageIdx, setActiveEditingPageIdx] = useState<number | null>(null);
  const [previewingPageIdx, setPreviewingPageIdx] = useState<number | null>(null);
  const [editorTool, setEditorTool] = useState<'draw' | 'text' | 'comment'>('draw');

  // Drawing Canvas State
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [penWidth, setPenWidth] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Text & Comment input state for modal
  const [newTextInput, setNewTextInput] = useState('');
  const [newCommentInput, setNewCommentInput] = useState('');
  const [commentAuthor] = useState('Редактор');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // Automatically load sample PDF on first mount
  useEffect(() => {
    loadSample();
  }, []);

  // Restore drawing canvas when activeEditingPageIdx changes
  useEffect(() => {
    if (activeEditingPageIdx !== null && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const existingOverlay = pages[activeEditingPageIdx]?.drawingOverlayUrl;
        if (existingOverlay) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = existingOverlay;
        }
      }
    }
  }, [activeEditingPageIdx]);

  const loadSample = async () => {
    setIsLoading(true);
    try {
      const sample = await createSamplePdf();
      const loaded = await loadPdfDocument(sample.file, 'sample_document.pdf');
      setDocInfo(loaded);
      setPages(loaded.pages);
      setMetadata(loaded.metadata);
    } catch (e: any) {
      console.error('Error loading sample PDF:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const loaded = await loadPdfDocument(file, file.name);
      setDocInfo(loaded);
      setPages(loaded.pages);
      setMetadata(loaded.metadata);
    } catch (err: any) {
      alert(`Помилка відкриття PDF: ${err.message || err}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRotatePage = (index: number) => {
    setPages(prev =>
      prev.map((p, idx) => (idx === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('Документ повинен містити щонайменше 1 сторінку.');
      return;
    }
    setPages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMovePage = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= pages.length) return;

    const nextPages = [...pages];
    const [moved] = nextPages.splice(fromIndex, 1);
    nextPages.splice(toIndex, 0, moved);
    setPages(nextPages);
  };

  const handleMergePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docInfo) return;

    setIsLoading(true);
    try {
      const extraLoaded = await loadPdfDocument(file, file.name);
      const extraPagesShifted: PdfPage[] = extraLoaded.pages.map((p, idx) => ({
        ...p,
        pageIndex: pages.length + idx,
        originalPageIndex: p.originalPageIndex,
        sourceDocId: file.name,
      }));

      setPages(prev => [...prev, ...extraPagesShifted]);
    } catch (err: any) {
      alert(`Помилка об'єднання: ${err.message || err}`);
    } finally {
      setIsLoading(false);
      if (mergeInputRef.current) mergeInputRef.current.value = '';
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (editorTool !== 'draw') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || editorTool !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Complete page editing and bake drawing into preview
  const handleFinishEditingPage = () => {
    if (activeEditingPageIdx === null) return;
    const canvas = canvasRef.current;

    if (canvas) {
      const drawingOverlayUrl = canvas.toDataURL('image/png');
      setPages(prev =>
        prev.map((p, idx) =>
          idx === activeEditingPageIdx
            ? { ...p, drawingOverlayUrl }
            : p
        )
      );
    }

    setActiveEditingPageIdx(null);
  };

  // Add text annotation to active page
  const handleAddTextAnnotation = (customText?: string) => {
    const textToAdd = (customText || newTextInput).trim();
    if (!textToAdd || activeEditingPageIdx === null) return;

    const newText: TextAnnotation = {
      id: `text-${Date.now()}-${Math.random()}`,
      x: 15 + Math.random() * 40,
      y: 20 + Math.random() * 45,
      text: textToAdd,
      fontSize: 14,
      color: penColor,
    };

    setPages(prev =>
      prev.map((p, idx) =>
        idx === activeEditingPageIdx
          ? { ...p, textAnnotations: [...(p.textAnnotations || []), newText] }
          : p
      )
    );
    setNewTextInput('');
  };

  const handleDeleteTextAnnotation = (id: string) => {
    if (activeEditingPageIdx === null) return;
    setPages(prev =>
      prev.map((p, idx) =>
        idx === activeEditingPageIdx
          ? { ...p, textAnnotations: (p.textAnnotations || []).filter(t => t.id !== id) }
          : p
      )
    );
  };

  // Add comment annotation to active page
  const handleAddComment = () => {
    if (!newCommentInput.trim() || activeEditingPageIdx === null) return;
    const newComment: CommentAnnotation = {
      id: `comment-${Date.now()}`,
      x: 20 + Math.random() * 35,
      y: 25 + Math.random() * 35,
      content: newCommentInput.trim(),
      author: commentAuthor || 'Користувач',
      createdAt: new Date(),
      color: '#f59e0b',
    };

    setPages(prev =>
      prev.map((p, idx) =>
        idx === activeEditingPageIdx
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      )
    );
    setNewCommentInput('');
  };

  const handleDeleteComment = (id: string) => {
    if (activeEditingPageIdx === null) return;
    setPages(prev =>
      prev.map((p, idx) =>
        idx === activeEditingPageIdx
          ? { ...p, comments: (p.comments || []).filter(c => c.id !== id) }
          : p
      )
    );
  };

  // Save modified PDF with metadata & annotations
  const handleSavePdf = async () => {
    if (!docInfo) return;

    setIsSaving(true);
    setSavingProgress(20);
    setSavingMessage('Застосування метаданих та орієнтації...');

    try {
      setTimeout(() => {
        setSavingProgress(55);
        setSavingMessage('Запікання малюнків, анотацій та коментарів...');
      }, 250);

      setTimeout(async () => {
        try {
          const result = await exportModifiedPdf(docInfo.rawBytes, pages, metadata);
          setSavingProgress(100);
          setSavingMessage('PDF успішно сформовано!');

          const editedName = metadata.title 
            ? `${metadata.title.replace(/\s+/g, '_')}.pdf`
            : `Edited_${docInfo.fileName || 'document.pdf'}`;

          setExportedPdf({
            url: result.url,
            size: result.sizeBytes,
            pages: result.pageCount,
            name: editedName,
          });

          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (error: any) {
          alert(`Помилка: ${error.message || error}`);
        } finally {
          setIsSaving(false);
        }
      }, 600);
    } catch (err: any) {
      setIsSaving(false);
      alert(`Помилка збереження: ${err.message || err}`);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleOpenPdf}
      />
      <input
        ref={mergeInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleMergePdf}
      />

      {/* Top App Bar */}
      <div className={`px-3 py-2 flex items-center justify-between border-b transition-colors shrink-0 ${
        isDarkMode ? 'border-zinc-800 bg-[#1D1B20]' : 'border-zinc-200 bg-white'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold truncate max-w-[140px]">
              {metadata.title || 'Редактор PDF'}
            </h2>
            <p className="text-[10px] text-zinc-500">
              {docInfo ? `${pages.length} стор. • ${metadata.author || 'Автор не вказаний'}` : 'Оберіть файл'}
            </p>
          </div>
        </div>

        {/* Action icons: Metadata Editor & Merge */}
        {docInfo && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMetadataModalOpen(true)}
              className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
                isDarkMode 
                  ? 'border-zinc-700 bg-zinc-800 text-amber-300 hover:bg-zinc-700' 
                  : 'border-zinc-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
              title="Редагувати метадані PDF (Title, Author, Subject)"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="text-[10px]">Метадані</span>
            </button>

            <button
              onClick={() => mergeInputRef.current?.click()}
              className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
                isDarkMode 
                  ? 'border-zinc-700 bg-zinc-800 text-indigo-300 hover:bg-zinc-700' 
                  : 'border-zinc-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
              title="Об'єднати з іншим PDF"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[10px]">Merge</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Quick action bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Відкрити PDF</span>
            </button>

            <button
              onClick={loadSample}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                isDarkMode 
                  ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' 
                  : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              Зразок
            </button>
          </div>

          {pages.length > 0 && (
            <span className="text-[10px] text-zinc-500 font-medium">
              Всього: {pages.length} стор.
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="h-64 flex flex-col items-center justify-center space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs text-zinc-500">Посторінковий рендеринг сторінок (PdfRenderer)...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !docInfo && (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl">
            <FileText className="w-12 h-12 text-zinc-400 mb-2 stroke-[1.5]" />
            <h3 className="text-sm font-bold">PDF файл не завантажено</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[220px]">
              Натисніть "Відкрити PDF" для вибору файлу з пристрою або відкрийте "Зразок".
            </p>
          </div>
        )}

        {/* REAL PAGES GRID (Showing actual high-resolution document pages, not schematic placeholders) */}
        {!isLoading && docInfo && (
          <div className="grid grid-cols-2 gap-3">
            {pages.map((page, idx) => {
              const hasDrawing = Boolean(page.drawingOverlayUrl);
              const textCount = page.textAnnotations?.length || 0;
              const commentCount = page.comments?.length || 0;

              return (
                <div
                  key={`${page.originalPageIndex}-${idx}`}
                  className={`rounded-2xl border overflow-hidden flex flex-col relative transition-all shadow-sm ${
                    isDarkMode ? 'bg-[#1E1B24] border-zinc-800' : 'bg-white border-zinc-200'
                  }`}
                >
                  {/* Real Page Image Thumbnail Area */}
                  <div 
                    onClick={() => setActiveEditingPageIdx(idx)}
                    className="h-44 sm:h-48 bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden flex items-center justify-center p-1.5 cursor-pointer group"
                    title="Натисніть для малювання, тексту та коментарів"
                  >
                    {/* The REAL rendered PDF page image */}
                    <img
                      src={page.previewUrl}
                      alt={`Сторінка ${idx + 1}`}
                      className="max-h-full max-w-full object-contain shadow-sm bg-white rounded transition-transform duration-200"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    />

                    {/* Hand-drawn overlay if user drew on this page */}
                    {hasDrawing && (
                      <img
                        src={page.drawingOverlayUrl}
                        alt="Hand drawing overlay"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none p-1.5 transition-transform duration-200"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                    )}

                    {/* Page number badge */}
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-md">
                      #{idx + 1}
                    </span>

                    {/* Badges for annotations & drawings */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {hasDrawing && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-0.5 shadow-xs">
                          <PenTool className="w-2.5 h-2.5" />
                          <span>Малюнок</span>
                        </span>
                      )}
                      {textCount > 0 && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white flex items-center gap-0.5 shadow-xs">
                          <Type className="w-2.5 h-2.5" />
                          <span>{textCount}</span>
                        </span>
                      )}
                      {commentCount > 0 && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white flex items-center gap-0.5 shadow-xs">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{commentCount}</span>
                        </span>
                      )}
                    </div>

                    {/* Action buttons on card hover/corner */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {/* Zoom Preview */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewingPageIdx(idx);
                        }}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-black/90 transition shadow-sm"
                        title="Збільшити та переглянути"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(idx);
                        }}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition shadow-sm"
                        title="Видалити сторінку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Hover edit hint overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold pointer-events-none">
                      <Edit3 className="w-4 h-4" />
                      <span>Малювати / Редагувати</span>
                    </div>
                  </div>

                  {/* Card bottom controls: Rotate & Reorder */}
                  <div className="p-1.5 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    {/* Rotate */}
                    <button
                      onClick={() => handleRotatePage(idx)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
                      title="Повернути на 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => setActiveEditingPageIdx(idx)}
                      className="px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] flex items-center gap-1 transition"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Редагувати</span>
                    </button>

                    {/* Move Left */}
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMovePage(idx, 'left')}
                      className={`p-1.5 rounded-lg ${
                        idx === 0 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                      title="Перемістити ліворуч"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Right */}
                    <button
                      disabled={idx === pages.length - 1}
                      onClick={() => handleMovePage(idx, 'right')}
                      className={`p-1.5 rounded-lg ${
                        idx === pages.length - 1 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                      title="Перемістити праворуч"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Button Bar */}
      {docInfo && pages.length > 0 && (
        <div className={`p-3 border-t transition-colors shrink-0 ${
          isDarkMode ? 'border-zinc-800 bg-[#1D1B20]' : 'border-zinc-200 bg-white'
        }`}>
          <button
            onClick={handleSavePdf}
            disabled={isSaving}
            className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>Зберегти PDF (з метаданими та анотаціями)</span>
          </button>
        </div>
      )}

      {/* MODAL 1: FULL PAGE ZOOM PREVIEW */}
      {previewingPageIdx !== null && pages[previewingPageIdx] && (
        <div className="absolute inset-0 bg-black/85 z-50 flex flex-col p-3 justify-between">
          <div className="flex items-center justify-between text-white pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-bold">
              Повний перегляд: Сторінка #{previewingPageIdx + 1}
            </h3>
            <button
              onClick={() => setPreviewingPageIdx(null)}
              className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
            <div className="relative max-h-[460px] aspect-[1/1.414] bg-white rounded-lg shadow-2xl overflow-hidden border">
              <img
                src={pages[previewingPageIdx].previewUrl}
                alt="Full Page"
                className="w-full h-full object-contain"
                style={{ transform: `rotate(${pages[previewingPageIdx].rotation}deg)` }}
              />
              {pages[previewingPageIdx].drawingOverlayUrl && (
                <img
                  src={pages[previewingPageIdx].drawingOverlayUrl}
                  alt="Drawings"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ transform: `rotate(${pages[previewingPageIdx].rotation}deg)` }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={() => handleRotatePage(previewingPageIdx)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Повернути 90°</span>
            </button>

            <button
              onClick={() => {
                const targetIdx = previewingPageIdx;
                setPreviewingPageIdx(null);
                setActiveEditingPageIdx(targetIdx);
              }}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Редагувати сторінку</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: PDF METADATA EDITOR (Title, Author, Subject, Keywords) */}
      {isMetadataModalOpen && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-[#1E1B24] text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold">Метадані PDF документа</h3>
              </div>
              <button
                onClick={() => setIsMetadataModalOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Title */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Назва документа (Title)
                </label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={e => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="Введіть заголовок..."
                  className={`w-full py-2 px-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>

              {/* Author */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Автор (Author)
                </label>
                <input
                  type="text"
                  value={metadata.author}
                  onChange={e => setMetadata({ ...metadata, author: e.target.value })}
                  placeholder="Ім'я автора або організації..."
                  className={`w-full py-2 px-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Тема / Опис (Subject)
                </label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={e => setMetadata({ ...metadata, subject: e.target.value })}
                  placeholder="Тематика документа..."
                  className={`w-full py-2 px-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Ключові слова (Keywords, через кому)
                </label>
                <input
                  type="text"
                  value={metadata.keywords}
                  onChange={e => setMetadata({ ...metadata, keywords: e.target.value })}
                  placeholder="договір, звіт, android, pdf..."
                  className={`w-full py-2 px-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300'
                  }`}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsMetadataModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
              >
                Зберегти метадані
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INTERACTIVE PAGE EDITOR (Draw, Text, Comments) */}
      {activeEditingPageIdx !== null && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col p-3 justify-between">
          {/* Header */}
          <div className="flex items-center justify-between text-white pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <span>Редагування сторінки #{activeEditingPageIdx + 1}</span>
              </h3>
              <p className="text-[9px] text-zinc-400">Малюйте олівцем, пишіть текст або залишайте коментарі</p>
            </div>

            <button
              onClick={handleFinishEditingPage}
              className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher: Draw | Text | Comment */}
          <div className="flex items-center justify-center gap-1 my-1 bg-zinc-900 p-1 rounded-xl self-center text-xs">
            <button
              onClick={() => setEditorTool('draw')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 font-semibold transition ${
                editorTool === 'draw' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Малювати</span>
            </button>
            <button
              onClick={() => setEditorTool('text')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 font-semibold transition ${
                editorTool === 'text' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Type className="w-3 h-3" />
              <span>Текст</span>
            </button>
            <button
              onClick={() => setEditorTool('comment')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 font-semibold transition ${
                editorTool === 'comment' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Коментар</span>
            </button>
          </div>

          {/* Canvas & Real Page Display Area */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden my-1">
            <div className="relative border-2 border-zinc-700 rounded-xl overflow-hidden shadow-2xl bg-white max-h-[380px] aspect-[1/1.414]">
              {/* Underlying REAL Page Preview */}
              <img
                src={pages[activeEditingPageIdx]?.previewUrl}
                alt="Real PDF Page"
                className="w-full h-full object-contain pointer-events-none select-none bg-white"
                style={{ transform: `rotate(${pages[activeEditingPageIdx]?.rotation}deg)` }}
              />

              {/* Overlay Canvas for Freehand Drawing */}
              <canvas
                ref={canvasRef}
                width={500}
                height={707}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`absolute inset-0 w-full h-full ${
                  editorTool === 'draw' ? 'cursor-crosshair' : 'pointer-events-none'
                }`}
              />

              {/* Render Existing Text Annotations */}
              {pages[activeEditingPageIdx]?.textAnnotations?.map(t => (
                <div
                  key={t.id}
                  style={{ top: `${t.y}%`, left: `${t.x}%`, color: t.color }}
                  className="absolute p-1 bg-amber-100/95 text-zinc-900 border border-amber-300 rounded font-bold text-[10px] shadow-sm flex items-center gap-1 group/annot"
                >
                  <span>{t.text}</span>
                  <button
                    onClick={() => handleDeleteTextAnnotation(t.id)}
                    className="opacity-0 group-hover/annot:opacity-100 hover:text-rose-600 text-zinc-400"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {/* Render Existing Comments */}
              {pages[activeEditingPageIdx]?.comments?.map(c => (
                <div
                  key={c.id}
                  style={{ top: `${c.y}%`, left: `${c.x}%` }}
                  className="absolute p-1.5 bg-yellow-200 text-zinc-900 border border-yellow-400 rounded-lg text-[9px] shadow-md max-w-[130px] group/comment"
                >
                  <div className="flex items-center justify-between font-bold text-[8px] opacity-75 mb-0.5">
                    <span>{c.author}:</span>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="opacity-0 group-hover/comment:opacity-100 hover:text-rose-600"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div>{c.content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-tools controls bar based on active tool */}
          <div className="bg-zinc-900 p-2.5 rounded-2xl space-y-2 border border-zinc-800 text-white shrink-0">
            {editorTool === 'draw' && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-zinc-400" />
                  {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#000000'].map(c => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        penColor === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                    />
                  ))}
                  {/* Pen stroke width */}
                  <select
                    value={penWidth}
                    onChange={e => setPenWidth(Number(e.target.value))}
                    className="text-[10px] bg-zinc-800 border border-zinc-700 text-white rounded px-1.5 py-0.5 ml-1"
                  >
                    <option value={2}>Тонкий (2px)</option>
                    <option value={4}>Звичайний (4px)</option>
                    <option value={8}>Маркер (8px)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCanvas}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Очистити</span>
                  </button>
                </div>
              </div>
            )}

            {editorTool === 'text' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Введіть текст для накладання..."
                    value={newTextInput}
                    onChange={e => setNewTextInput(e.target.value)}
                    className="flex-1 text-xs py-1.5 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddTextAnnotation()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shrink-0"
                  >
                    Додати
                  </button>
                </div>

                {/* Quick Stamp / Stickers */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                  <span className="text-[9px] text-zinc-400 flex items-center gap-0.5 shrink-0">
                    <Stamp className="w-2.5 h-2.5" />
                    <span>Штампи:</span>
                  </span>
                  {['✅ СХВАЛЕНО', '✍️ ПІДПИС', '⚡ ТЕРМІНОВО', '📋 КОПІЯ ВІРНА'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleAddTextAnnotation(s)}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[9px] font-bold text-zinc-200 shrink-0 border border-zinc-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {editorTool === 'comment' && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Текст коментаря / нотатки..."
                  value={newCommentInput}
                  onChange={e => setNewCommentInput(e.target.value)}
                  className="flex-1 text-xs py-1.5 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shrink-0"
                >
                  Залишити
                </button>
              </div>
            )}

            <button
              onClick={handleFinishEditingPage}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
            >
              Завершити редагування сторінки
            </button>
          </div>
        </div>
      )}

      {/* Saving Dialog */}
      {isSaving && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className={`w-full max-w-xs p-5 rounded-3xl space-y-3 text-center shadow-2xl ${
            isDarkMode ? 'bg-[#1E1B24] text-white' : 'bg-white text-zinc-900'
          }`}>
            <Layers className="w-8 h-8 text-indigo-600 animate-pulse mx-auto" />
            <h4 className="text-sm font-bold">Збереження змін...</h4>

            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${savingProgress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{savingMessage}</p>
          </div>
        </div>
      )}

      {/* Export Success Modal */}
      {exportedPdf && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-xs p-5 rounded-3xl space-y-4 text-center shadow-2xl ${
            isDarkMode ? 'bg-[#1E1B24] text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div>
              <h4 className="text-sm font-bold">Відредагований PDF збережено!</h4>
              <p className="text-[11px] text-zinc-500 mt-1">
                Файл збережено з оновленими метаданими, малюнками та анотаціями.
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs text-left ${
              isDarkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="font-semibold truncate">{exportedPdf.name}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                Автор: {metadata.author || 'Не вказано'} • Тема: {metadata.subject || 'Не вказано'}
              </div>
              <div className="text-[11px] text-zinc-500 flex justify-between mt-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span>Сторінок: {exportedPdf.pages}</span>
                <span>{(exportedPdf.size / 1024).toFixed(1)} КБ</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={exportedPdf.url}
                download={exportedPdf.name}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Завантажити PDF на пристрій</span>
              </a>

              <a
                href={exportedPdf.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Відкрити перегляд</span>
              </a>

              <button
                onClick={() => setExportedPdf(null)}
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
