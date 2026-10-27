"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { ToolId } from "@/types/tools";
import { TOOLS_CONFIG } from "@/data/tools";

interface HeroProps {
  onSelectTool: (id: ToolId) => void;
}

const QUICK_TOOLS: ToolId[] = [
  "merge-pdf",
  "split-pdf",
  "pdf-compression",
  "pdf-to-excel",
  "watermark-pdf",
  "protect-pdf",
];

export default function Hero({ onSelectTool }: HeroProps) {
  const pills = QUICK_TOOLS.map((id) => TOOLS_CONFIG.find((tool) => tool.id === id)).filter(
    (tool): tool is NonNullable<typeof tool> => Boolean(tool)
  );

  return (
    <section className="pt-10 pb-8 sm:pt-14 sm:pb-12 text-center px-4 max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs sm:text-sm font-semibold text-[#ea580c] mb-6 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
        <span>Simple PDF</span>
        <span className="text-orange-200">|</span>
        <span className="text-zinc-600 font-medium">{TOOLS_CONFIG.length} everyday PDF tools</span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
        Every small PDF job, in one simple place
      </h1>

      <p className="mt-4 sm:mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
        Merge, split, rotate, convert, watermark, number, lock, and unlock —
        without extra clutter. OCR for scans comes later.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        {pills.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTool(item.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:border-[#ea580c] hover:text-[#ea580c] hover:shadow-xs transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}
