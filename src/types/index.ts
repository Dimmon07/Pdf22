export interface ImageItem {
  id: string;
  name: string;
  url: string;
  originalWidth: number;
  originalHeight: number;
  rotation: number; // 0, 90, 180, 270
  sizeBytes: number;
}

export type PageOrientation = 'PORTRAIT' | 'LANDSCAPE' | 'AUTO';
export type PageMargin = 'NONE' | 'SMALL' | 'LARGE';
export type CompressionLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type PageFormat = 'A4' | 'A3' | 'A5' | 'FIT_TO_IMAGE';

export interface PdfSettings {
  fileName: string;
  orientation: PageOrientation;
  margin: PageMargin;
  compression: CompressionLevel;
  pageFormat: PageFormat;
  includePageNumbers: boolean;
  password?: string;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface TextAnnotation {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  text: string;
  fontSize: number;
  color: string;
  bgColor?: string;
}

export interface CommentAnnotation {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  content: string;
  author: string;
  createdAt: Date;
  color: string;
}

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator?: string;
  producer?: string;
}

export interface PdfPage {
  pageIndex: number; // 0-based
  rotation: number; // 0, 90, 180, 270
  previewUrl: string;
  sourceDocId?: string;
  originalPageIndex?: number;
  drawings?: DrawingPath[];
  drawingOverlayUrl?: string;
  textAnnotations?: TextAnnotation[];
  comments?: CommentAnnotation[];
}

export interface TranslationPage {
  pageNumber: number;
  originalText: string;
  translatedText: string;
}

export interface TranslationSettings {
  sourceLang: string;
  targetLang: string;
  mode: 'translated_only' | 'bilingual';
}

export interface GeneratedPdfResult {
  name: string;
  sizeBytes: number;
  pageCount: number;
  blobUrl: string;
  createdAt: Date;
}

export type ActiveScreen = 'home' | 'image-to-pdf' | 'pdf-editor' | 'pdf-translate' | 'doc-scanner';
