const rawBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
export const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "");

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_FILES = 30;

export interface BackendHealthResponse {
  isOnline: boolean;
  latencyMs: number;
  service?: string;
  status?: string;
  toolMatrix?: Record<string, { library: string; dependency: string }>;
  error?: string;
}

export interface FileResult {
  blob: Blob;
  filename: string;
}

async function postForm(path: string, formData: FormData, fallbackName: string): Promise<FileResult> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const raw = await response.text();
    let detail = response.statusText;
    if (raw) {
      try {
        const data = JSON.parse(raw);
        detail = typeof data.detail === "string" ? data.detail : raw;
      } catch {
        detail = raw;
      }
    }
    throw new Error(detail || "Backend request failed");
  }

  const blob = await response.blob();
  const filename = extractFilenameFromHeader(response) || fallbackName;
  return { blob, filename };
}

export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${BACKEND_URL}/`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (response.ok) {
      const data = await response.json();
      return {
        isOnline: true,
        latencyMs,
        service: data.service,
        status: data.status,
        toolMatrix: data.tool_matrix,
      };
    }

    return {
      isOnline: false,
      latencyMs,
      error: `HTTP ${response.status} ${response.statusText}`,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as { name?: string; message?: string };
    return {
      isOnline: false,
      latencyMs: 0,
      error: error.name === "AbortError" ? "Connection timed out" : error.message || "Backend unreachable",
    };
  }
}

export async function apiMergePdf(files: File[]): Promise<FileResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return postForm("/api/merge-pdf", formData, "simplepdf_merged.pdf");
}

export async function apiCompressPdf(
  file: File,
  level: string = "recommended"
): Promise<FileResult & { originalSize: number; compressedSize: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("level", level);
  const result = await postForm("/api/compress-pdf", formData, `compressed_${file.name}`);
  return { ...result, originalSize: file.size, compressedSize: result.blob.size };
}

export async function apiPdfToWord(file: File): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  return postForm("/api/pdf-to-word", formData, `${file.name.replace(/\.[^/.]+$/, "")}.docx`);
}

export async function apiWordToPdf(file: File, pdfStandard: string = "pdf1.7"): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pdf_standard", pdfStandard);
  return postForm("/api/word-to-pdf", formData, `${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
}

export async function apiPhotoToPdf(
  files: File[],
  orientation: string = "portrait",
  pageSize: string = "a4",
  margin: string = "small"
): Promise<FileResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("orientation", orientation);
  formData.append("page_size", pageSize);
  formData.append("margin", margin);
  return postForm("/api/photo-to-pdf", formData, "simplepdf_photos.pdf");
}

export async function apiPdfToImage(
  file: File,
  pages: string = "all",
  imageFormat: string = "png",
  dpi: number = 150
): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pages", pages);
  formData.append("image_format", imageFormat);
  formData.append("dpi", String(dpi));
  return postForm("/api/pdf-to-image", formData, "simplepdf_pages.zip");
}

export async function apiPdfToExcel(file: File): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  return postForm("/api/pdf-to-excel", formData, `${file.name.replace(/\.[^/.]+$/, "")}.xlsx`);
}

export async function apiWatermarkPdf(file: File, watermarkText: string, opacity: number): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("watermark_text", watermarkText);
  formData.append("opacity", String(opacity));
  return postForm("/api/watermark-pdf", formData, "watermarked.pdf");
}

export async function apiSplitPdf(file: File, mode: string, pages: string): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);
  formData.append("pages", pages);
  return postForm("/api/split-pdf", formData, "simplepdf_split.pdf");
}

export async function apiRotatePdf(file: File, angle: number, pages: string): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("angle", String(angle));
  formData.append("pages", pages);
  return postForm("/api/rotate-pdf", formData, "simplepdf_rotated.pdf");
}

export async function apiOrganizePdf(file: File, mode: string, pages: string): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);
  formData.append("pages", pages);
  return postForm("/api/organize-pdf", formData, "simplepdf_organized.pdf");
}

export async function apiProtectPdf(file: File, password: string): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  return postForm("/api/protect-pdf", formData, "simplepdf_protected.pdf");
}

export async function apiUnlockPdf(file: File, password: string): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  return postForm("/api/unlock-pdf", formData, "simplepdf_unlocked.pdf");
}

export async function apiPageNumbers(
  file: File,
  position: string,
  start: number,
  numberFormat: string
): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("position", position);
  formData.append("start", String(start));
  formData.append("number_format", numberFormat);
  return postForm("/api/page-numbers", formData, "simplepdf_numbered.pdf");
}

export async function apiExtractText(file: File): Promise<FileResult> {
  const formData = new FormData();
  formData.append("file", file);
  return postForm("/api/extract-text", formData, `${file.name.replace(/\.[^/.]+$/, "")}.txt`);
}

function extractFilenameFromHeader(response: Response): string | null {
  const disposition = response.headers.get("content-disposition");
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match ? match[1] : null;
}

export function createMockValidFile(name: string, type: string): File {
  if (name.endsWith(".pdf") || type.includes("pdf")) {
    const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
192
%%EOF`;
    return new File([minimalPdf], name, { type: "application/pdf" });
  }

  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || type.includes("image")) {
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const byteCharacters = atob(pngBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new File([new Uint8Array(byteNumbers)], name, { type: "image/png" });
  }

  return new File(["Simple PDF Document Content"], name, { type });
}
