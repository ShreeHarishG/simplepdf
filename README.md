# Simple PDF — TFRENZY

A full-stack online PDF toolkit built with **Next.js 16** on the frontend and a **FastAPI** Python backend. Five core tools handle the most common PDF tasks entirely in the browser or via the Python API.

---

## Tools

| Tool | Description | Backend Library |
|---|---|---|
| Merge PDF | Combine multiple PDFs into one | `pypdf` |
| PDF Compression | Reduce file size while preserving quality | `pypdf` |
| PDF to Word | Convert PDF to editable `.docx` | `pdf2docx` + `PyMuPDF` |
| Word to PDF | Convert `.doc`/`.docx` to PDF | LibreOffice headless / `docx2pdf` |
| Photo to PDF | Convert JPG, PNG, WebP images to PDF | `Pillow` |

Additional backend endpoints (not yet wired to the UI) cover PDF to Image, PDF to Excel, OCR, and PDF watermarking.

---

## Project Structure

```
simplepdf/
├── app/                  # Next.js App Router pages and layout
├── components/           # React UI components
├── data/tools.ts         # Tool configuration (IDs, colors, accepted formats)
├── types/tools.ts        # TypeScript types
├── lib/backendApi.ts     # Frontend → Python API client
├── context/              # React context providers
├── backend/
│   ├── main.py           # FastAPI application (all 9 API endpoints)
│   └── requirements.txt  # Python dependencies
├── public/               # Static assets and logos
├── render.yaml           # Render.com deployment config for the backend
└── next.config.ts        # Next.js configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- (Optional) Tesseract OCR engine for the OCR endpoint
- (Optional) LibreOffice for the Word → PDF endpoint on Linux/macOS

### Frontend

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

The frontend reads the backend URL from environment variables:

```env
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/merge-pdf` | Merge 2+ PDF files |
| POST | `/api/compress-pdf` | Compress a PDF |
| POST | `/api/pdf-to-word` | Convert PDF → DOCX |
| POST | `/api/word-to-pdf` | Convert DOCX → PDF |
| POST | `/api/photo-to-pdf` | Convert images → PDF |
| POST | `/api/pdf-to-image` | Render a PDF page as PNG |
| POST | `/api/pdf-to-excel` | Extract tables to XLSX |
| POST | `/api/ocr-pdf` | OCR a scanned PDF to text |
| POST | `/api/watermark-pdf` | Stamp a text watermark on a PDF |

---

## Deployment

### Frontend — Vercel

```bash
vercel deploy
```

Set `NEXT_PUBLIC_BACKEND_URL` to your backend's public URL in the Vercel project settings.

### Backend — Render

The `render.yaml` at the project root configures a Render.com web service:

- **Runtime:** Python 3.11
- **Build:** `pip install -r backend/requirements.txt`
- **Start:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

Push to your connected repo and Render will build and deploy automatically.

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Lucide React

**Backend**
- FastAPI + Uvicorn
- pypdf, PyMuPDF, pdf2docx, pdfplumber, pandas, ReportLab, Pillow, pytesseract

---

## Scripts

```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
