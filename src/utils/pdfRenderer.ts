import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Renders every page of a PDF document into a high-resolution image data URL
 * mimicking Android's native android.graphics.pdf.PdfRenderer
 */
export async function renderPdfToImages(pdfBytes: Uint8Array): Promise<string[]> {
  try {
    // Clone buffer to avoid detached ArrayBuffer issues
    const buffer = pdfBytes.slice(0).buffer;

    const loadingTask = pdfjsLib.getDocument({
      data: buffer,
      useSystemFonts: true,
    });

    const doc = await loadingTask.promise;
    const numPages = doc.numPages;
    const results: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      // Scale 1.5 gives crisp, high-DPI rendering for mobile simulators
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx) {
        // Fill white background first (PDFs might have transparent backgrounds)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas: canvas as unknown as HTMLCanvasElement,
        }).promise;

        results.push(canvas.toDataURL('image/jpeg', 0.90));
      }
    }

    return results;
  } catch (err) {
    console.warn('PDF.js rendering error or worker limitation, using canvas fallback:', err);
    return [];
  }
}
