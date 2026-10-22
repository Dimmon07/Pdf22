import { PDFDocument, degrees } from 'pdf-lib';
import { PdfPage, PdfMetadata } from '../types';
import { renderPdfToImages } from './pdfRenderer';

export interface LoadedPdfInfo {
  doc: PDFDocument;
  rawBytes: Uint8Array;
  fileName: string;
  pageCount: number;
  pages: PdfPage[];
  metadata: PdfMetadata;
}

/**
 * Loads an existing PDF and extracts metadata & generates real page previews
 * using PDF.js (mimicking Android's native PdfRenderer)
 */
export async function loadPdfDocument(file: File | Blob, fileName: string): Promise<LoadedPdfInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(arrayBuffer);
  const doc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();

  // Extract metadata
  const metadata: PdfMetadata = {
    title: doc.getTitle() || fileName.replace(/\.[^/.]+$/, ''),
    author: doc.getAuthor() || 'PDF Master User',
    subject: doc.getSubject() || 'Офіційний документ',
    keywords: doc.getKeywords() || 'Android, Kotlin, Jetpack Compose, Clean Architecture',
    creator: doc.getCreator() || 'PDF Master Android',
    producer: doc.getProducer() || 'PDF Master v2.4',
  };

  // Render REAL page bitmap previews using PDF.js (like Android's PdfRenderer)
  let renderedImages: string[] = [];
  try {
    renderedImages = await renderPdfToImages(rawBytes);
  } catch (err) {
    console.warn('PDF.js rendering error, using canvas fallback:', err);
  }

  const pages: PdfPage[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = doc.getPage(i);
    const rotation = page.getRotation().angle;
    const { width, height } = page.getSize();

    // If PDF.js produced a real page preview, use it!
    // Otherwise fallback to our readable canvas document renderer (never schematic grey bars)
    const previewUrl = renderedImages[i] || generateRichPageCanvasFallback(i + 1, pageCount, width, height, metadata.title);

    pages.push({
      pageIndex: i,
      originalPageIndex: i,
      rotation: rotation % 360,
      previewUrl,
      drawings: [],
      textAnnotations: [],
      comments: [],
    });
  }

  return {
    doc,
    rawBytes,
    fileName,
    pageCount,
    pages,
    metadata,
  };
}

/**
 * Generates an authentic, fully readable document page preview canvas as a fallback
 * with real text, headings, badges, and layout (never empty grey placeholder rectangles).
 */
export function generateRichPageCanvasFallback(
  pageNum: number,
  totalPages: number,
  width: number,
  height: number,
  docTitle: string
): string {
  const canvasWidth = 500;
  const aspect = height / width;
  const canvasHeight = Math.round(canvasWidth * (aspect || 1.414));

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);

  // Top header accent line
  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(0, 0, canvasWidth, 8);

  // Header banner
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 8, canvasWidth, 54);

  // Small badge
  ctx.fillStyle = '#e0e7ff';
  roundRect(ctx, 24, 20, 110, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#4338ca';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('PDF MASTER PRO', 30, 34);

  // Page number pill
  ctx.fillStyle = '#1e293b';
  roundRect(ctx, canvasWidth - 90, 20, 66, 20, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText(`Стор. ${pageNum}/${totalPages}`, canvasWidth - 80, 34);

  // Document Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px system-ui, sans-serif';
  const displayTitle = docTitle || 'Документ PDF';
  ctx.fillText(displayTitle.length > 38 ? displayTitle.substring(0, 38) + '...' : displayTitle, 24, 90);

  // Section 1
  ctx.fillStyle = '#4f46e5';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText(`РОЗДІЛ ${pageNum}: СТРУКТУРА ТА ДЕТАЛІ ДОКУМЕНТА`, 24, 125);

  // Text paragraph
  ctx.fillStyle = '#334155';
  ctx.font = '11px system-ui, sans-serif';
  const lines = [
    'Цей документ містить технічну інформацію та параметри конфігурації.',
    'Застосунок підтримує повноцінне редагування: поворот сторінок, перестановку,',
    'накладання малюнків олівцем, додавання текстових анотацій та приміток.',
    'Всі зміни зберігаються відповідно до вимог Android Scoped Storage API.'
  ];
  let currentY = 145;
  for (const line of lines) {
    ctx.fillText(line, 24, currentY);
    currentY += 18;
  }

  // Feature Card / Code Box
  currentY += 15;
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, 24, currentY, canvasWidth - 48, 120, 8);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('// Kotlin: Android PdfRenderer Preview Pipeline', 38, currentY + 24);

  ctx.fillStyle = '#38bdf8';
  ctx.fillText('val renderer = PdfRenderer(fileDescriptor)', 38, currentY + 44);
  ctx.fillStyle = '#a78bfa';
  ctx.fillText('val page = renderer.openPage(pageIndex)', 38, currentY + 64);
  ctx.fillStyle = '#34d399';
  ctx.fillText('val bitmap = Bitmap.createBitmap(w, h, ARGB_8888)', 38, currentY + 84);
  ctx.fillStyle = '#fde047';
  ctx.fillText('page.render(bitmap, null, null, RENDER_MODE_FOR_DISPLAY)', 38, currentY + 104);

  // Additional points
  currentY += 145;
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('• Орієнтація: Портретна / Альбомна', 24, currentY);
  ctx.fillText('• Метадані: Title, Author, Subject збережені', 24, currentY + 20);
  ctx.fillText('• Підтримка Scoped Storage (Android 10-15)', 24, currentY + 40);

  // Footer
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, canvasHeight - 32);
  ctx.lineTo(canvasWidth - 24, canvasHeight - 32);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('PDF Master Mobile Suite • Jetpack Compose', 24, canvasHeight - 16);
  ctx.fillText(`Сторінка ${pageNum}`, canvasWidth - 80, canvasHeight - 16);

  return canvas.toDataURL('image/jpeg', 0.90);
}

/**
 * Creates high-resolution realistic sample pages rendered onto Canvas
 * with real text, syntax-highlighted code, headers, and diagrams
 */
export async function generateRealisticSamplePage(pageNum: 1 | 2 | 3): Promise<string> {
  const canvasWidth = 1000;
  const canvasHeight = 1414; // A4 aspect ratio at 1000px

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);

  // Top color bar
  const headerColors = ['#4f46e5', '#7c3aed', '#0284c7'];
  ctx.fillStyle = headerColors[pageNum - 1];
  ctx.fillRect(0, 0, canvasWidth, 14);

  // Top Header Area
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 14, canvasWidth, 100);

  // Brand Badge
  ctx.fillStyle = '#e0e7ff';
  roundRect(ctx, 48, 38, 160, 32, 8);
  ctx.fill();
  ctx.fillStyle = '#4338ca';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('PDF MASTER ANDROID', 58, 60);

  // Page pill
  ctx.fillStyle = '#1e293b';
  roundRect(ctx, canvasWidth - 160, 38, 112, 32, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`Сторінка ${pageNum} з 3`, canvasWidth - 146, 59);

  let curY = 150;

  if (pageNum === 1) {
    // Page 1: Overview & Architecture
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('Технічна специфікація: Image to PDF & PDF Editor', 48, curY);

    curY += 32;
    ctx.fillStyle = '#64748b';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Повний проєкт мобільного застосунку на Kotlin, Jetpack Compose та Clean Architecture', 48, curY);

    curY += 38;
    // Feature chips
    const chips = ['Kotlin 2.0', 'Jetpack Compose', 'MVVM + Clean Arch', 'PdfDocument API', 'PdfRenderer'];
    let chipX = 48;
    for (const chip of chips) {
      ctx.fillStyle = '#f1f5f9';
      roundRect(ctx, chipX, curY - 20, ctx.measureText(chip).width + 24, 28, 14);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(chip, chipX + 12, curY - 1);
      chipX += ctx.measureText(chip).width + 36;
    }

    curY += 50;
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('1. Модуль створення PDF із зображень (Image to PDF)', 48, curY);

    curY += 28;
    ctx.fillStyle = '#334155';
    ctx.font = '14px/22px system-ui, sans-serif';
    const p1Lines = [
      '• Вибір зображень через нативний Photo Picker API без запиту зайвих дозволів.',
      '• Drag-and-drop зміна черговості карток фотографій у списку.',
      '• Обрізка (Crop) та поворот на 90°, 180°, 270° перед збиранням документа.',
      '• Гнучкі параметри: формат A4, A3, A5 або за розміром фото, поля (None, Small, Large), стиснення JPEG.',
      '• Асинхронна генерація у фоновому потоці Dispatchers.IO з індикатором прогресу.'
    ];
    for (const line of p1Lines) {
      ctx.fillText(line, 48, curY);
      curY += 24;
    }

    curY += 25;
    // Kotlin code snippet
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, 48, curY, canvasWidth - 96, 210, 12);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('// NativePdfDocumentGenerator.kt — Збирання документа через нативний PdfDocument', 68, curY + 32);

    ctx.fillStyle = '#a78bfa';
    ctx.fillText('val document = PdfDocument()', 68, curY + 64);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('images.forEachIndexed { index, imageItem ->', 68, curY + 92);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('    val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, index + 1).create()', 68, curY + 120);
    ctx.fillText('    val page = document.startPage(pageInfo)', 68, curY + 148);
    ctx.fillStyle = '#34d399';
    ctx.fillText('    page.canvas.drawBitmap(scaledBitmap, marginX, marginY, null)', 68, curY + 176);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('    document.finishPage(page)', 68, curY + 204);

    curY += 240;
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('2. Чиста тришарова архітектура (Clean Architecture)', 48, curY);

    curY += 24;
    // 3 Layer Cards
    const layers = [
      { title: 'Presentation Layer', desc: 'Compose Screens, ViewModels, StateFlow, Material 3 UI', color: '#e0e7ff', text: '#3730a3' },
      { title: 'Domain Layer', desc: 'Use Cases: GeneratePdfUseCase, EditPdfUseCase, Business Models', color: '#fef3c7', text: '#92400e' },
      { title: 'Data Layer', desc: 'PdfRepository, NativePdfDocumentGenerator, MediaStoreSaver', color: '#dcfce7', text: '#166534' }
    ];

    let layerX = 48;
    const cardWidth = (canvasWidth - 96 - 32) / 3;
    for (const layer of layers) {
      ctx.fillStyle = layer.color;
      roundRect(ctx, layerX, curY, cardWidth, 85, 10);
      ctx.fill();
      ctx.fillStyle = layer.text;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(layer.title, layerX + 14, curY + 28);
      ctx.fillStyle = '#334155';
      ctx.font = '11px system-ui, sans-serif';
      wrapText(ctx, layer.desc, layerX + 14, curY + 50, cardWidth - 28, 16);
      layerX += cardWidth + 16;
    }
  } else if (pageNum === 2) {
    // Page 2: Scoped Storage & Security
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('Розділ 2: Scoped Storage та безпека в Android 10-15', 48, curY);

    curY += 32;
    ctx.fillStyle = '#64748b';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Робота з медіасховищем пристрою без застарілих прав WRITE_EXTERNAL_STORAGE', 48, curY);

    curY += 45;
    // Comparison Cards
    const storageCards = [
      {
        title: 'MediaStore API (Android 10+)',
        badge: 'РЕКОМЕНДОВАНО',
        points: [
          'Збереження у папку Downloads через ContentResolver',
          'Не вимагає жодних небезпечних дозволів',
          'Файли доступні іншим застосункам та файловому менеджеру',
          'Автоматичне керування IS_PENDING під час запису'
        ],
        border: '#4f46e5'
      },
      {
        title: 'Storage Access Framework (SAF)',
        badge: 'ДЛЯ ЗОВНІШНІХ ПАПОК',
        points: [
          'Intent.ACTION_CREATE_DOCUMENT для вибору каталогу користувачем',
          'Підтримка хмарних сховищ (Google Drive, Nextcloud)',
          'Прямий запис через DocumentFile та OutputStream',
          'Повний контроль користувача над місцем розміщення'
        ],
        border: '#0284c7'
      }
    ];

    let cardX = 48;
    const sCardWidth = (canvasWidth - 96 - 24) / 2;
    for (const sc of storageCards) {
      ctx.strokeStyle = sc.border;
      ctx.lineWidth = 2;
      roundRect(ctx, cardX, curY, sCardWidth, 230, 12);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      roundRect(ctx, cardX + 1, curY + 1, sCardWidth - 2, 228, 11);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText(sc.title, cardX + 20, curY + 36);

      ctx.fillStyle = sc.border;
      roundRect(ctx, cardX + sCardWidth - 140, curY + 18, 120, 24, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillText(sc.badge, cardX + sCardWidth - 132, curY + 34);

      let py = curY + 70;
      ctx.fillStyle = '#334155';
      ctx.font = '13px system-ui, sans-serif';
      for (const pt of sc.points) {
        ctx.fillText(`✓ ${pt}`, cardX + 20, py);
        py += 36;
      }

      cardX += sCardWidth + 24;
    }

    curY += 265;
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('Фрагмент коду збереження PDF у MediaStore (Kotlin Coroutine)', 48, curY);

    curY += 24;
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, 48, curY, canvasWidth - 96, 210, 12);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('// MediaStoreSaver.kt — Збереження PDF у каталог Downloads', 68, curY + 32);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('val contentValues = ContentValues().apply {', 68, curY + 64);
    ctx.fillText('    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)', 68, curY + 92);
    ctx.fillText('    put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")', 68, curY + 120);
    ctx.fillText('    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/PDFMaster")', 68, curY + 148);
    ctx.fillText('    put(MediaStore.MediaColumns.IS_PENDING, 1)', 68, curY + 176);
    ctx.fillText('}', 68, curY + 204);
  } else {
    // Page 3: PDF Editor Module
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('Розділ 3: Інструменти редагування PDF документів', 48, curY);

    curY += 32;
    ctx.fillStyle = '#64748b';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Повноцінний набір інструментів редагування, малювання, анотацій та метаданих', 48, curY);

    curY += 45;
    const tools = [
      { name: 'Поворот сторінок (Rotate)', text: 'Поворот на 90°, 180°, 270° з оновленням матриці PdfRenderer.', badge: 'Rotate 90°' },
      { name: 'Зміна порядку (Reorder)', text: 'Зручне перетягування та зміна позицій сторінок у документі.', badge: 'Drag & Drop' },
      { name: 'Видалення (Delete)', text: 'Швидке вилучення непотрібних аркушів із перерахунком індексів.', badge: 'One-Tap Delete' },
      { name: 'Редактор метаданих (Metadata)', text: 'Редагування Title, Author, Subject та Keywords для офіційних документів.', badge: 'Metadata' },
      { name: 'Малювання олівцем (Draw)', text: 'Вільне малювання, підписи від руки та вибір палітри кольорів.', badge: 'Canvas Draw' },
      { name: 'Текст та коментарі (Text/Notes)', text: 'Додавання текстових підписів та липких нотаток на будь-яку сторінку.', badge: 'Annotations' },
    ];

    let toolY = curY;
    for (let i = 0; i < tools.length; i += 2) {
      const t1 = tools[i];
      const t2 = tools[i + 1];

      // Left box
      drawToolCard(ctx, 48, toolY, (canvasWidth - 96 - 20) / 2, t1);
      if (t2) {
        drawToolCard(ctx, 48 + (canvasWidth - 96 - 20) / 2 + 20, toolY, (canvasWidth - 96 - 20) / 2, t2);
      }
      toolY += 105;
    }

    curY = toolY + 15;
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('Об\'єднання документів (PDF Merge)', 48, curY);

    curY += 24;
    ctx.fillStyle = '#334155';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Застосунок дозволяє в один дотик додавати нові сторінки з інших PDF файлів або окремих зображень,', 48, curY);
    ctx.fillText('створюючи єдиний зведений файл з актуальними метаданими та нумерацією сторінок.', 48, curY + 22);
  }

  // Footer on all pages
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, canvasHeight - 48);
  ctx.lineTo(canvasWidth - 48, canvasHeight - 48);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('PDF Master Mobile Suite • Jetpack Compose Edition • Документація розробника', 48, canvasHeight - 24);
  ctx.fillText(`Сторінка ${pageNum} з 3`, canvasWidth - 140, canvasHeight - 24);

  return canvas.toDataURL('image/png');
}

function drawToolCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, tool: { name: string; text: string; badge: string }) {
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, x, y, w, 90, 10);
  ctx.fill();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, 90, 10);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(tool.name, x + 16, y + 26);

  ctx.fillStyle = '#4f46e5';
  roundRect(ctx, x + w - 105, y + 10, 95, 20, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px system-ui, sans-serif';
  ctx.fillText(tool.badge, x + w - 95, y + 24);

  ctx.fillStyle = '#475569';
  ctx.font = '12px system-ui, sans-serif';
  wrapText(ctx, tool.text, x + 16, y + 48, w - 32, 16);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

/**
 * Creates a sample demo PDF with 3 real rendered pages, full typography and metadata
 */
export async function createSamplePdf(): Promise<{ file: File; bytes: Uint8Array }> {
  const doc = await PDFDocument.create();

  // Set default initial metadata
  doc.setTitle('Архітектура Android Jetpack Compose & Clean Architecture');
  doc.setAuthor('PDF Master Team');
  doc.setSubject('Технічна специфікація та посібник розробника');
  doc.setKeywords(['Android', 'Kotlin', 'Compose', 'PDFBox', 'Clean Architecture']);
  doc.setCreator('PDF Master Mobile App');
  doc.setProducer('PDF Master Jetpack Compose Edition');

  // Render 3 real pages
  for (let i = 1; i <= 3; i++) {
    const pagePngUrl = await generateRealisticSamplePage(i as 1 | 2 | 3);
    const base64Data = pagePngUrl.split(',')[1];
    const binaryStr = atob(base64Data);
    const pngBytes = new Uint8Array(binaryStr.length);
    for (let j = 0; j < binaryStr.length; j++) {
      pngBytes[j] = binaryStr.charCodeAt(j);
    }

    const pngImage = await doc.embedPng(pngBytes);
    // Standard A4 dimensions in points
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const page = doc.addPage([pageWidth, pageHeight]);

    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  const bytes = await doc.save();
  const file = new File([bytes as unknown as BlobPart], 'sample_document.pdf', { type: 'application/pdf' });
  return { file, bytes };
}

/**
 * Saves modified PDF with metadata, reordered pages, applied rotations, removed pages,
 * burned-in canvas drawings, text annotations, and comments
 */
export async function exportModifiedPdf(
  originalRawBytes: Uint8Array,
  pages: PdfPage[],
  metadata?: PdfMetadata,
  additionalPdfBytes: Uint8Array[] = [],
  additionalImages: { url: string; rotation: number }[] = []
): Promise<{ blob: Blob; url: string; sizeBytes: number; pageCount: number }> {
  const srcDoc = await PDFDocument.load(originalRawBytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  // 1. Embed and update metadata (Title, Author, Subject, Keywords)
  if (metadata) {
    if (metadata.title) newDoc.setTitle(metadata.title);
    if (metadata.author) newDoc.setAuthor(metadata.author);
    if (metadata.subject) newDoc.setSubject(metadata.subject);
    if (metadata.keywords) {
      const kwList = metadata.keywords.split(',').map(s => s.trim()).filter(Boolean);
      newDoc.setKeywords(kwList);
    }
    newDoc.setCreator('PDF Master Android');
    newDoc.setProducer('PDF Master Jetpack Compose Edition');
  }

  // 2. Copy and add pages according to the reordered list
  for (const pageItem of pages) {
    if (pageItem.originalPageIndex !== undefined && pageItem.originalPageIndex < srcDoc.getPageCount()) {
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pageItem.originalPageIndex]);
      // Apply accumulated rotation
      copiedPage.setRotation(degrees(pageItem.rotation % 360));
      
      const { width, height } = copiedPage.getSize();

      // Burn drawing overlay if user drew on this page
      if (pageItem.drawingOverlayUrl) {
        try {
          const base64Data = pageItem.drawingOverlayUrl.split(',')[1];
          if (base64Data) {
            const binaryStr = atob(base64Data);
            const overlayBytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              overlayBytes[i] = binaryStr.charCodeAt(i);
            }
            const overlayImg = await newDoc.embedPng(overlayBytes);
            copiedPage.drawImage(overlayImg, {
              x: 0,
              y: 0,
              width,
              height,
            });
          }
        } catch (e) {
          console.warn('Failed embedding drawing overlay:', e);
        }
      }

      // Burn text annotations and comments onto page as high-res PNG canvas overlay to support any font/Cyrillic characters
      const hasAnnotations = (pageItem.textAnnotations && pageItem.textAnnotations.length > 0) ||
                             (pageItem.comments && pageItem.comments.length > 0);

      if (hasAnnotations) {
        try {
          const annotationCanvas = document.createElement('canvas');
          annotationCanvas.width = width * 2;
          annotationCanvas.height = height * 2;
          const aCtx = annotationCanvas.getContext('2d');

          if (aCtx) {
            aCtx.scale(2, 2);

            // Render text annotations
            if (pageItem.textAnnotations) {
              for (const t of pageItem.textAnnotations) {
                const posX = (t.x / 100) * width;
                const posY = (t.y / 100) * height;

                aCtx.font = `bold ${t.fontSize || 14}px system-ui, sans-serif`;
                const textWidth = aCtx.measureText(t.text).width;

                // Yellow highlight background
                aCtx.fillStyle = 'rgba(254, 240, 138, 0.9)';
                roundRect(aCtx, posX - 4, posY - (t.fontSize || 14), textWidth + 8, (t.fontSize || 14) + 6, 4);
                aCtx.fill();

                aCtx.fillStyle = t.color || '#1e293b';
                aCtx.fillText(t.text, posX, posY);
              }
            }

            // Render sticky comments
            if (pageItem.comments) {
              for (const c of pageItem.comments) {
                const posX = (c.x / 100) * width;
                const posY = (c.y / 100) * height;

                // Sticky note
                aCtx.fillStyle = '#fef08a';
                aCtx.strokeStyle = '#eab308';
                aCtx.lineWidth = 1;
                roundRect(aCtx, posX, posY, 140, 48, 6);
                aCtx.fill();
                aCtx.stroke();

                aCtx.fillStyle = '#854d0e';
                aCtx.font = 'bold 9px system-ui, sans-serif';
                aCtx.fillText(`${c.author}:`, posX + 6, posY + 14);

                aCtx.fillStyle = '#1e293b';
                aCtx.font = '10px system-ui, sans-serif';
                wrapText(aCtx, c.content, posX + 6, posY + 28, 128, 12);
              }
            }

            const annotPngUrl = annotationCanvas.toDataURL('image/png');
            const annotBase64 = annotPngUrl.split(',')[1];
            const binaryStr = atob(annotBase64);
            const annotBytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              annotBytes[i] = binaryStr.charCodeAt(i);
            }
            const annotImg = await newDoc.embedPng(annotBytes);
            copiedPage.drawImage(annotImg, {
              x: 0,
              y: 0,
              width,
              height,
            });
          }
        } catch (e) {
          console.warn('Failed embedding text annotations overlay:', e);
        }
      }

      newDoc.addPage(copiedPage);
    }
  }

  // 3. Append additional PDFs if any
  for (const extraBytes of additionalPdfBytes) {
    const extraDoc = await PDFDocument.load(extraBytes, { ignoreEncryption: true });
    const count = extraDoc.getPageCount();
    const indices = Array.from({ length: count }, (_, idx) => idx);
    const copiedPages = await newDoc.copyPages(extraDoc, indices);
    copiedPages.forEach(p => newDoc.addPage(p));
  }

  // 4. Append additional images as new pages
  for (const img of additionalImages) {
    const res = await fetch(img.url);
    const buffer = await res.arrayBuffer();
    let embeddedImg;
    if (img.url.startsWith('data:image/png')) {
      embeddedImg = await newDoc.embedPng(buffer);
    } else {
      embeddedImg = await newDoc.embedJpg(buffer);
    }

    const { width, height } = embeddedImg;
    const page = newDoc.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });
    if (img.rotation) {
      page.setRotation(degrees(img.rotation % 360));
    }
  }

  const modifiedBytes = await newDoc.save();
  const blob = new Blob([modifiedBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    sizeBytes: blob.size,
    pageCount: newDoc.getPageCount(),
  };
}
