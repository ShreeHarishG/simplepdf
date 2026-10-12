export type ToolId =
  | "merge-pdf"
  | "pdf-compression"
  | "pdf-to-word"
  | "word-to-pdf"
  | "photo-to-pdf";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  color: string;
  lightBg: string;
  borderColor: string;
  hoverBorder: string;
  accept: string;
  acceptLabel: string;
  actionButtonText: string;
  multiple: boolean;
  supportedFormats: string[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  previewUrl?: string;
  status: "ready" | "processing" | "done" | "error";
  rawFile?: File;
}

export interface ToolOptions {
  // Compress PDF options
  compressionLevel?: "extreme" | "recommended" | "less";
  // Merge PDF options
  sortOrder?: "custom" | "az" | "za";
  // PDF to Word options
  ocrEnabled?: boolean;
  ocrLanguage?: string;
  // Word to PDF options
  pdfStandard?: "pdf1.7" | "pdf/a-1b" | "pdf/a-2b";
  // Photo to PDF options
  orientation?: "portrait" | "landscape";
  pageSize?: "fit" | "a4" | "letter";
  margin?: "none" | "small" | "big";
  mergeAllImages?: boolean;
}
