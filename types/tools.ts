export type ToolId =
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "organize-pdf"
  | "pdf-compression"
  | "pdf-to-word"
  | "word-to-pdf"
  | "pdf-to-excel"
  | "pdf-to-image"
  | "photo-to-pdf"
  | "extract-text"
  | "watermark-pdf"
  | "page-numbers"
  | "protect-pdf"
  | "unlock-pdf";

export type ToolCategory = "organize" | "convert" | "optimize" | "edit" | "secure";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  color: string;
  lightBg: string;
  borderColor: string;
  hoverBorder: string;
  accept: string;
  acceptLabel: string;
  actionButtonText: string;
  successTitle: string;
  downloadLabel: string;
  multiple: boolean;
  supportedFormats: string[];
}

export interface ToolGroup {
  id: ToolCategory;
  title: string;
  description: string;
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
  compressionLevel?: "extreme" | "recommended" | "less";
  sortOrder?: "custom" | "az" | "za";
  pdfStandard?: "pdf1.7" | "pdf/a-1b" | "pdf/a-2b";
  orientation?: "portrait" | "landscape";
  pageSize?: "fit" | "a4" | "letter";
  margin?: "none" | "small" | "big";
  mergeAllImages?: boolean;
  splitMode?: "range" | "each";
  pageRange?: string;
  organizeMode?: "keep" | "delete";
  rotateAngle?: 90 | 180 | 270;
  watermarkText?: string;
  watermarkOpacity?: number;
  pageNumberPosition?: "header-left" | "header-center" | "header-right" | "footer-left" | "footer-center" | "footer-right";
  pageNumberStart?: number;
  pageNumberFormat?: "number" | "page-n" | "page-n-of-n";
  imageFormat?: "png" | "jpg";
  imageDpi?: 72 | 150 | 300;
  imagePages?: "all" | "range";
  password?: string;
  confirmPassword?: string;
  ocrEnabled?: boolean;
}
