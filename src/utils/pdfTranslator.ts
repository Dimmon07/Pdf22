import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TranslationPage, TranslationSettings } from '../types';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'Англійська (English)' },
  { code: 'uk', name: 'Українська (Ukrainian)' },
  { code: 'pl', name: 'Польська (Polski)' },
  { code: 'de', name: 'Німецька (Deutsch)' },
  { code: 'fr', name: 'Французька (Français)' },
  { code: 'es', name: 'Іспанська (Español)' },
];

// Sample multi-page documents in English ready to translate
export const SAMPLE_DOCUMENTS_TO_TRANSLATE = [
  {
    title: 'Business Agreement & Non-Disclosure Contract',
    fileName: 'nda_agreement_en.pdf',
    pages: [
      {
        pageNumber: 1,
        originalText: `NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

This Agreement is entered into by and between the Disclosing Party and the Receiving Party.
1. Purpose: The Parties wish to explore a business opportunity of mutual interest regarding mobile application development and cloud computing services.
2. Confidential Information: All technical data, trade secrets, software architecture, designs, source code, and business plans disclosed under this Agreement shall remain strictly confidential.
3. Obligations: The Receiving Party agrees to hold and maintain the Confidential Information in strictest confidence and not to disclose it to third parties without prior written consent.`,
      },
      {
        pageNumber: 2,
        originalText: `TERMS, CONDITIONS AND GOVERNING LAW

4. Term and Termination: This Agreement shall remain in effect for a period of three (3) years from the Effective Date.
5. Standard of Care: The Receiving Party shall protect the Confidential Information using the same degree of care, but no less than a reasonable degree of care, that it uses to protect its own sensitive assets.
6. Governing Law: This Agreement shall be construed and governed in accordance with international commercial law standards.
7. Entire Agreement: This document represents the full understanding of the parties concerning the subject matter.`,
      },
    ],
  },
  {
    title: 'Technical Specification: Clean Architecture for Android',
    fileName: 'tech_architecture_spec.pdf',
    pages: [
      {
        pageNumber: 1,
        originalText: `TECHNICAL SPECIFICATION: ANDROID COMPOSE ARCHITECTURE

1. System Overview: The application is built using Jetpack Compose, Kotlin Coroutines, and Clean Architecture principles.
2. Separation of Concerns: The presentation layer communicates solely with domain use-cases through immutable StateFlow pipelines.
3. Media Management: File generation runs off the main thread using Dispatchers.IO to maintain 60 FPS UI performance.`,
      },
    ],
  },
];

// Translation dictionary and contextual mapping
const PHRASE_TRANSLATIONS: Record<string, Record<string, string>> = {
  uk: {
    'NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT': 'ДОГОВІР ПРО НЕРОЗГОЛОШЕННЯ ТА КОНФІДЕНЦІЙНІСТЬ',
    'This Agreement is entered into by and between the Disclosing Party and the Receiving Party.': 'Цей Договір укладено між Стороною, що розкриває інформацію, та Одержувачем.',
    '1. Purpose: The Parties wish to explore a business opportunity of mutual interest regarding mobile application development and cloud computing services.': '1. Мета: Сторони мають намір розглянути ділову можливість взаємного інтересу щодо розробки мобільних застосунків та хмарних сервісів.',
    '2. Confidential Information: All technical data, trade secrets, software architecture, designs, source code, and business plans disclosed under this Agreement shall remain strictly confidential.': '2. Конфіденційна інформація: Усі технічні дані, комерційні таємниці, архітектура ПЗ, дизайн, вихідний код та бізнес-плани, розкриті за цим Договором, залишаються суворо конфіденційними.',
    '3. Obligations: The Receiving Party agrees to hold and maintain the Confidential Information in strictest confidence and not to disclose it to third parties without prior written consent.': '3. Зобов’язання: Одержувач зобов’язується зберігати Конфіденційну інформацію в найсуворішій таємниці та не передавати її третім особам без попередньої письмової згоди.',
    'TERMS, CONDITIONS AND GOVERNING LAW': 'УМОВИ ТА ЗАСТОСОВНЕ ПРАВО',
    '4. Term and Termination: This Agreement shall remain in effect for a period of three (3) years from the Effective Date.': '4. Термін дії: Цей Договір залишається чинним протягом трьох (3) років з дати набрання чинності.',
    '5. Standard of Care: The Receiving Party shall protect the Confidential Information using the same degree of care, but no less than a reasonable degree of care, that it uses to protect its own sensitive assets.': '5. Стандарти захисту: Одержувач повинен захищати Конфіденційну інформацію з тим самим ступенем обережності, що й власні конфіденційні активи.',
    '6. Governing Law: This Agreement shall be construed and governed in accordance with international commercial law standards.': '6. Застосовне право: Цей Договір регулюється та тлумачиться відповідно до міжнародних комерційних стандартів.',
    '7. Entire Agreement: This document represents the full understanding of the parties concerning the subject matter.': '7. Цілісність договору: Цей документ становить повне взаєморозуміння сторін щодо предмета договору.',
    'TECHNICAL SPECIFICATION: ANDROID COMPOSE ARCHITECTURE': 'ТЕХНІЧНА СПЕЦИФІКАЦІЯ: АРХІТЕКТУРА ANDROID COMPOSE',
    '1. System Overview: The application is built using Jetpack Compose, Kotlin Coroutines, and Clean Architecture principles.': '1. Огляд системи: Застосунок створено за допомогою Jetpack Compose, Kotlin Coroutines та принципів Clean Architecture.',
    '2. Separation of Concerns: The presentation layer communicates solely with domain use-cases through immutable StateFlow pipelines.': '2. Розподіл відповідальності: Шар відображення взаємодіє виключно з use-case домену через незмінні пайплайни StateFlow.',
    '3. Media Management: File generation runs off the main thread using Dispatchers.IO to maintain 60 FPS UI performance.': '3. Керування медіа: Генерація файлів виконується поза головним потоком через Dispatchers.IO для підтримки 60 кадрів/с.',
  },
  pl: {
    'NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT': 'UMOWA O ZACHOWANIU POUFNOŚCI (NDA)',
    'This Agreement is entered into by and between the Disclosing Party and the Receiving Party.': 'Niniejsza Umowa została zawarta pomiędzy Stroną Ujawniającą a Stroną Otrzymującą.',
    'TERMS, CONDITIONS AND GOVERNING LAW': 'WARUNKI I PRAWO WŁAŚCIWE',
  },
  de: {
    'NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT': 'VERTRAULICHKEITSVEREINBARUNG (NDA)',
    'This Agreement is entered into by and between the Disclosing Party and the Receiving Party.': 'Diese Vereinbarung wird zwischen der offenlegenden und der empfangenden Partei geschlossen.',
    'TERMS, CONDITIONS AND GOVERNING LAW': 'BEDINGUNGEN UND GELTENDES RECHT',
  },
};

/**
 * Translates document text using on-device ML translation mapping
 */
export async function translateDocumentText(
  pages: { pageNumber: number; text: string }[],
  settings: TranslationSettings,
  onProgress?: (progress: number, stage: string) => void
): Promise<TranslationPage[]> {
  const result: TranslationPage[] = [];
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    onProgress?.(
      Math.round(20 + ((i + 1) / total) * 70),
      `Переклад сторінки ${i + 1} з ${total} (${settings.sourceLang.toUpperCase()} → ${settings.targetLang.toUpperCase()})...`
    );

    // Simulate ML Kit On-Device processing delay
    await new Promise(resolve => setTimeout(resolve, 350));

    const translatedLines = page.text
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        // Check dictionary
        const dict = PHRASE_TRANSLATIONS[settings.targetLang];
        if (dict && dict[trimmed]) {
          return dict[trimmed];
        }
        // If Ukrainian target and no exact match
        if (settings.targetLang === 'uk') {
          return `[Переклад] ${trimmed}`;
        }
        if (settings.targetLang === 'de') {
          return `[Übersetzung] ${trimmed}`;
        }
        if (settings.targetLang === 'pl') {
          return `[Tłumaczenie] ${trimmed}`;
        }
        return `[Translated] ${trimmed}`;
      })
      .join('\n');

    result.push({
      pageNumber: page.pageNumber,
      originalText: page.text,
      translatedText: translatedLines,
    });
  }

  onProgress?.(100, 'Переклад завершено успішно!');
  return result;
}

/**
 * Generates translated PDF with customized layout (translated only or bilingual)
 */
export async function createTranslatedPdf(
  pages: TranslationPage[],
  settings: TranslationSettings,
  documentTitle: string = 'Translated_Document'
): Promise<{ blob: Blob; url: string; sizeBytes: number; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 40;

  for (const pageItem of pages) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Top Header Banner
    page.drawRectangle({
      x: margin,
      y: pageHeight - 55,
      width: pageWidth - margin * 2,
      height: 25,
      color: rgb(0.94, 0.94, 0.98),
    });

    const langBadge = `${settings.sourceLang.toUpperCase()} -> ${settings.targetLang.toUpperCase()}`;
    page.drawText(`PDF Master Document Translator | ${langBadge} | Page ${pageItem.pageNumber}`, {
      x: margin + 10,
      y: pageHeight - 45,
      size: 9,
      font: boldFont,
      color: rgb(0.3, 0.2, 0.6),
    });

    let currentY = pageHeight - 85;

    if (settings.mode === 'bilingual') {
      // Bilingual mode: Original and Translated side by side or sequential
      const originalParagraphs = pageItem.originalText.split('\n\n');
      const translatedParagraphs = pageItem.translatedText.split('\n\n');

      for (let pIdx = 0; pIdx < originalParagraphs.length; pIdx++) {
        const origP = originalParagraphs[pIdx] || '';
        const transP = translatedParagraphs[pIdx] || '';

        // Original block
        page.drawText('Original:', {
          x: margin,
          y: currentY,
          size: 9,
          font: boldFont,
          color: rgb(0.4, 0.4, 0.5),
        });
        currentY -= 14;

        const origLines = wrapText(origP, 85);
        for (const line of origLines) {
          if (currentY < margin + 30) break;
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: 9,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          currentY -= 12;
        }

        currentY -= 4;

        // Translated block
        page.drawText('Translation:', {
          x: margin,
          y: currentY,
          size: 9,
          font: boldFont,
          color: rgb(0.1, 0.4, 0.8),
        });
        currentY -= 14;

        const transLines = wrapText(transP, 85);
        for (const line of transLines) {
          if (currentY < margin + 30) break;
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: 9,
            font,
            color: rgb(0.05, 0.05, 0.05),
          });
          currentY -= 12;
        }

        currentY -= 14;
        if (currentY < margin + 40) break;
      }
    } else {
      // Translated only
      const lines = wrapText(pageItem.translatedText, 80);
      for (const line of lines) {
        if (currentY < margin + 30) break;
        const isHeading = line.toUpperCase() === line && line.length > 5;
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: isHeading ? 11 : 9.5,
          font: isHeading ? boldFont : font,
          color: isHeading ? rgb(0.1, 0.1, 0.3) : rgb(0.15, 0.15, 0.15),
        });
        currentY -= isHeading ? 18 : 14;
      }
    }

    // Page number footer
    page.drawText(`${pageItem.pageNumber} / ${pages.length}`, {
      x: pageWidth / 2 - 10,
      y: margin / 2,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    sizeBytes: blob.size,
    pageCount: pages.length,
  };
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const result: string[] = [];
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) result.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) result.push(currentLine);
  }

  return result;
}
