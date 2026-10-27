"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import { ToolDefinition, ToolOptions, UploadedFile } from "@/types/tools";

interface ToolOptionsPanelProps {
  tool: ToolDefinition;
  options: ToolOptions;
  setOptions: (next: ToolOptions) => void;
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  onClearPick: () => void;
}

function ChoiceButton({
  active,
  onClick,
  children,
  activeClass = "border-[#ea580c] bg-orange-50 text-orange-950 font-bold",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 px-3 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
        active ? activeClass : "border-zinc-200 bg-white text-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function ToolOptionsPanel({
  tool,
  options,
  setOptions,
  files,
  setFiles,
  onClearPick,
}: ToolOptionsPanelProps) {
  if (tool.id === "merge-pdf") {
    return (
      <div className="space-y-4">
        <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">
          Sort Options
        </label>
        <div className="space-y-2">
          <button
            onClick={() => {
              setFiles([...files].sort((a, b) => a.name.localeCompare(b.name)));
              onClearPick();
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-between cursor-pointer"
          >
            <span>Sort A-Z Alphabetical</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <button
            onClick={() => {
              setFiles([...files].sort((a, b) => b.name.localeCompare(a.name)));
              onClearPick();
            }}
            className="w-full py-2 px-3 text-xs font-semibold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-between cursor-pointer"
          >
            <span>Sort Z-A Reverse</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
        <div className="p-3 bg-orange-50 rounded-xl border border-orange-200/60 text-xs text-orange-900">
          Files are merged in the exact order shown on the left.
        </div>
      </div>
    );
  }

  if (tool.id === "pdf-compression") {
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">
          Compression Level
        </label>
        {[
          { key: "extreme" as const, title: "Extreme Compression", desc: "Smallest file. Fine for archives and email." },
          { key: "recommended" as const, title: "Recommended Compression", desc: "Balanced quality for everyday sharing." },
          { key: "less" as const, title: "Less Compression", desc: "Keeps more visual detail." },
        ].map((level) => (
          <button
            key={level.key}
            type="button"
            onClick={() => setOptions({ ...options, compressionLevel: level.key })}
            className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all ${
              options.compressionLevel === level.key
                ? "border-emerald-500 bg-emerald-50/50 text-emerald-950"
                : "border-zinc-200 hover:border-zinc-300 bg-white"
            }`}
          >
            <div className="text-xs font-bold">{level.title}</div>
            <div className="text-[11px] text-zinc-500 font-normal mt-0.5">{level.desc}</div>
          </button>
        ))}
      </div>
    );
  }

  if (tool.id === "pdf-to-word") {
    return (
      <div className="space-y-3">
        <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/70">
          <div className="text-xs font-bold text-zinc-900">Digital text layout</div>
          <div className="text-[11px] text-zinc-600 mt-0.5">
            Extracts selectable text, tables, and images from the PDF.
          </div>
        </div>
        <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50">
          <div className="text-xs font-bold text-zinc-500">OCR for scanned pages</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Coming later as its own tool. Use Extract Text for digital PDFs today.
          </div>
        </div>
      </div>
    );
  }

  if (tool.id === "word-to-pdf") {
    return (
      <div className="space-y-4">
        <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">PDF Standard</label>
        <select
          value={options.pdfStandard}
          onChange={(e) =>
            setOptions({ ...options, pdfStandard: e.target.value as ToolOptions["pdfStandard"] })
          }
          className="w-full text-xs font-medium py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="pdf1.7">Standard PDF (v1.7) — web and print</option>
          <option value="pdf/a-1b">PDF/A-1b — long-term archival</option>
          <option value="pdf/a-2b">PDF/A-2b — modern archival</option>
        </select>
      </div>
    );
  }

  if (tool.id === "photo-to-pdf") {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block mb-1.5">
            Page Orientation
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["portrait", "landscape"] as const).map((ori) => (
              <ChoiceButton
                key={ori}
                active={options.orientation === ori}
                onClick={() => setOptions({ ...options, orientation: ori })}
                activeClass="border-amber-500 bg-amber-50 text-amber-950 font-bold"
              >
                {ori}
              </ChoiceButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block mb-1.5">Page Size</label>
          <select
            value={options.pageSize}
            onChange={(e) => setOptions({ ...options, pageSize: e.target.value as ToolOptions["pageSize"] })}
            className="w-full text-xs font-medium py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
          >
            <option value="fit">Fit image size (original aspect)</option>
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block mb-1.5">Margins</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["none", "small", "big"] as const).map((m) => (
              <ChoiceButton
                key={m}
                active={options.margin === m}
                onClick={() => setOptions({ ...options, margin: m })}
                activeClass="border-amber-500 bg-amber-50 text-amber-950 font-bold"
              >
                {m}
              </ChoiceButton>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tool.id === "split-pdf") {
    return (
      <div className="space-y-4">
        <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wide block">Split Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <ChoiceButton active={options.splitMode === "range"} onClick={() => setOptions({ ...options, splitMode: "range" })}>
            Page range
          </ChoiceButton>
          <ChoiceButton active={options.splitMode === "each"} onClick={() => setOptions({ ...options, splitMode: "each" })}>
            Every page
          </ChoiceButton>
        </div>
        {options.splitMode === "range" ? (
          <input
            type="text"
            value={options.pageRange}
            onChange={(e) => setOptions({ ...options, pageRange: e.target.value })}
            placeholder="e.g. 1-3, 5, 8-10"
            className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        ) : (
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200/60 text-xs text-teal-900">
            Each page becomes its own PDF, downloaded together as a ZIP.
          </div>
        )}
      </div>
    );
  }

  if (tool.id === "rotate-pdf") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {([90, 180, 270] as const).map((angle) => (
            <ChoiceButton
              key={angle}
              active={options.rotateAngle === angle}
              onClick={() => setOptions({ ...options, rotateAngle: angle })}
            >
              {angle}°
            </ChoiceButton>
          ))}
        </div>
        <input
          type="text"
          value={options.pageRange}
          onChange={(e) => setOptions({ ...options, pageRange: e.target.value })}
          placeholder="all or 1,3,5-7"
          className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>
    );
  }

  if (tool.id === "organize-pdf") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <ChoiceButton active={options.organizeMode === "keep"} onClick={() => setOptions({ ...options, organizeMode: "keep" })}>
            Keep pages
          </ChoiceButton>
          <ChoiceButton active={options.organizeMode === "delete"} onClick={() => setOptions({ ...options, organizeMode: "delete" })}>
            Delete pages
          </ChoiceButton>
        </div>
        <input
          type="text"
          value={options.pageRange}
          onChange={(e) => setOptions({ ...options, pageRange: e.target.value })}
          placeholder="e.g. 2, 4-6"
          className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      </div>
    );
  }

  if (tool.id === "pdf-to-image") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <ChoiceButton active={options.imagePages === "all"} onClick={() => setOptions({ ...options, imagePages: "all" })}>
            All pages
          </ChoiceButton>
          <ChoiceButton active={options.imagePages === "range"} onClick={() => setOptions({ ...options, imagePages: "range" })}>
            Range
          </ChoiceButton>
        </div>
        {options.imagePages === "range" && (
          <input
            type="text"
            value={options.pageRange}
            onChange={(e) => setOptions({ ...options, pageRange: e.target.value })}
            placeholder="e.g. 1 or 2-4"
            className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          {(["png", "jpg"] as const).map((fmt) => (
            <ChoiceButton key={fmt} active={options.imageFormat === fmt} onClick={() => setOptions({ ...options, imageFormat: fmt })}>
              {fmt.toUpperCase()}
            </ChoiceButton>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {([72, 150, 300] as const).map((dpi) => (
            <ChoiceButton key={dpi} active={options.imageDpi === dpi} onClick={() => setOptions({ ...options, imageDpi: dpi })}>
              {dpi} DPI
            </ChoiceButton>
          ))}
        </div>
      </div>
    );
  }

  if (tool.id === "pdf-to-excel") {
    return (
      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 text-xs text-emerald-900">
        Detects tables on each page and writes them as separate Excel sheets.
      </div>
    );
  }

  if (tool.id === "extract-text") {
    return (
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
        Pulls selectable digital text. OCR for scanned pages is a later tool.
      </div>
    );
  }

  if (tool.id === "watermark-pdf") {
    return (
      <div className="space-y-4">
        <input
          type="text"
          maxLength={80}
          value={options.watermarkText}
          onChange={(e) => setOptions({ ...options, watermarkText: e.target.value })}
          placeholder="CONFIDENTIAL"
          className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        <label className="text-xs font-semibold text-zinc-700 block">
          Opacity ({Math.round((options.watermarkOpacity || 0.25) * 100)}%)
        </label>
        <input
          type="range"
          min={0.1}
          max={0.6}
          step={0.05}
          value={options.watermarkOpacity}
          onChange={(e) => setOptions({ ...options, watermarkOpacity: Number(e.target.value) })}
          className="w-full accent-[#ea580c]"
        />
      </div>
    );
  }

  if (tool.id === "page-numbers") {
    return (
      <div className="space-y-4">
        <select
          value={options.pageNumberPosition}
          onChange={(e) =>
            setOptions({ ...options, pageNumberPosition: e.target.value as ToolOptions["pageNumberPosition"] })
          }
          className="w-full text-xs font-medium py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg"
        >
          <option value="footer-center">Footer center</option>
          <option value="footer-left">Footer left</option>
          <option value="footer-right">Footer right</option>
          <option value="header-center">Header center</option>
          <option value="header-left">Header left</option>
          <option value="header-right">Header right</option>
        </select>
        <select
          value={options.pageNumberFormat}
          onChange={(e) =>
            setOptions({ ...options, pageNumberFormat: e.target.value as ToolOptions["pageNumberFormat"] })
          }
          className="w-full text-xs font-medium py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg"
        >
          <option value="page-n-of-n">Page 1 of N</option>
          <option value="page-n">Page 1</option>
          <option value="number">1</option>
        </select>
        <input
          type="number"
          min={1}
          value={options.pageNumberStart}
          onChange={(e) => setOptions({ ...options, pageNumberStart: Number(e.target.value) || 1 })}
          className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg"
        />
      </div>
    );
  }

  if (tool.id === "protect-pdf") {
    return (
      <div className="space-y-4">
        <input
          type="password"
          value={options.password}
          onChange={(e) => setOptions({ ...options, password: e.target.value })}
          placeholder="Password (at least 4 characters)"
          className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg"
        />
        <input
          type="password"
          value={options.confirmPassword}
          onChange={(e) => setOptions({ ...options, confirmPassword: e.target.value })}
          placeholder="Confirm password"
          className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg"
        />
      </div>
    );
  }

  if (tool.id === "unlock-pdf") {
    return (
      <input
        type="password"
        value={options.password}
        onChange={(e) => setOptions({ ...options, password: e.target.value })}
        placeholder="Current PDF password"
        className="w-full text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg"
      />
    );
  }

  return (
    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600">
      Ready to process with Simple PDF.
    </div>
  );
}
