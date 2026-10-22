import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { ImageItem, PdfSettings } from '../types';

/**
 * Creates a valid PDF from an array of images using pdf-lib
 * Supports orientation, margins, compression quality simulation, and page numbering
 */
export async function generatePdfFromImages(
  images: ImageItem[],
  settings: PdfSettings,
  onProgress?: (progress: number, stage: string) => void
): Promise<{ blob: Blob; url: string; sizeBytes: number; pageCount: number }> {
  if (images.length === 0) {
    throw new Error('Немає зображень для генерації PDF');
  }

  onProgress?.(10, 'Ініціалізація PDF документа...');
  const pdfDoc = await PDFDocument.create();

  // Dimensions in points (72 points = 1 inch)
  // A3: 841.89 x 1190.55
  // A4: 595.28 x 841.89
  // A5: 419.53 x 595.28
  let baseWidth = 595.28;
  let baseHeight = 841.89;

  if (settings.pageFormat === 'A3') {
    baseWidth = 841.89;
    baseHeight = 1190.55;
  } else if (settings.pageFormat === 'A5') {
    baseWidth = 419.53;
    baseHeight = 595.28;
  } else if (settings.pageFormat === 'A4') {
    baseWidth = 595.28;
    baseHeight = 841.89;
  }

  // Margin sizes
  let marginPt = 0;
  if (settings.margin === 'SMALL') {
    marginPt = 20;
  } else if (settings.margin === 'LARGE') {
    marginPt = 40;
  }

  const total = images.length;

  for (let i = 0; i < total; i++) {
    const imgItem = images[i];
    const progressPercent = Math.round(15 + ((i + 1) / total) * 75);
    onProgress?.(progressPercent, `Обробка сторінки ${i + 1} з ${total}...`);

    // Prepare image element to apply rotation and compression via canvas
    const processedDataUrl = await processImageForPdf(imgItem, settings.compression);
    const imageBytes = await fetch(processedDataUrl).then(res => res.arrayBuffer());

    let embeddedImage;
    if (processedDataUrl.startsWith('data:image/png')) {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = baseWidth;
    let pageHeight = baseHeight;

    if (settings.pageFormat === 'FIT_TO_IMAGE') {
      pageWidth = imgWidth + marginPt * 2;
      pageHeight = imgHeight + marginPt * 2;
    } else {
      // Determine orientation
      let isLandscape = false;
      if (settings.orientation === 'LANDSCAPE') {
        isLandscape = true;
      } else if (settings.orientation === 'PORTRAIT') {
        isLandscape = false;
      } else {
        // AUTO
        isLandscape = imgWidth > imgHeight;
      }

      if (isLandscape) {
        pageWidth = Math.max(baseWidth, baseHeight);
        pageHeight = Math.min(baseWidth, baseHeight);
      } else {
        pageWidth = Math.min(baseWidth, baseHeight);
        pageHeight = Math.max(baseWidth, baseHeight);
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate image fitting with margins
    const availableWidth = pageWidth - marginPt * 2;
    const availableHeight = pageHeight - marginPt * 2;

    const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = marginPt + (availableWidth - drawWidth) / 2;
    const y = marginPt + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });

    if (settings.includePageNumbers) {
      page.drawText(`${i + 1} / ${total}`, {
        x: pageWidth / 2 - 15,
        y: Math.max(10, marginPt / 2),
        size: 9,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }

  onProgress?.(95, 'Фіналізація та компресія PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  onProgress?.(100, 'Готово!');
  return {
    blob,
    url,
    sizeBytes: blob.size,
    pageCount: total,
  };
}

/**
 * Preprocess image on a canvas with rotation and compression scale
 */
async function processImageForPdf(imageItem: ImageItem, compression: 'HIGH' | 'MEDIUM' | 'LOW'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageItem.url);
        return;
      }

      // Max dimension by compression
      let maxDim = 2048; // HIGH quality
      let quality = 0.92;
      if (compression === 'MEDIUM') {
        maxDim = 1400;
        quality = 0.8;
      } else if (compression === 'LOW') {
        maxDim = 900;
        quality = 0.65;
      }

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const rot = (imageItem.rotation || 0) % 360;
      if (rot === 90 || rot === 270) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error('Помилка завантаження зображення'));
    img.src = imageItem.url;
  });
}
