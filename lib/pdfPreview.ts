import { PdfPageItem } from "@/types/tools";

export async function renderPdfPages(file: File, maxPages = 60): Promise<PdfPageItem[]> {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const count = Math.min(doc.numPages, maxPages);
  const pages: PdfPageItem[] = [];

  for (let number = 1; number <= count; number += 1) {
    const page = await doc.getPage(number);
    const viewport = page.getViewport({ scale: 1.35 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const context = canvas.getContext("2d");
    if (!context) continue;
    await page.render({ canvasContext: context, viewport, canvas }).promise;
    pages.push({
      id: `page-${number - 1}-${file.lastModified}-${file.size}`,
      sourceIndex: number - 1,
      rotate: 0,
      selected: true,
      thumbUrl: canvas.toDataURL("image/jpeg", 0.84),
    });
  }

  return pages;
}
