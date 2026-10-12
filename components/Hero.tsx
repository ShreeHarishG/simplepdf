"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { ToolId } from "@/types/tools";

interface HeroProps {
  onSelectTool: (id: ToolId) => void;
}

export default function Hero({ onSelectTool }: HeroProps) {
  return (
    <section className="pt-10 pb-8 sm:pt-14 sm:pb-12 text-center px-4 max-w-5xl mx-auto">
      {/* Simple PDF Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs sm:text-sm font-semibold text-[#ea580c] mb-6 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-[#ea580c]" />
        <span>Simple PDF</span>
        <span className="text-orange-200">|</span>
        <span className="text-zinc-600 font-medium">Task for today: 5 Core Tools</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
        Every tool you need to work with PDFs in one place
      </h1>

      {/* Subtitle */}
      <p className="mt-4 sm:mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
        Simple, fast, and 100% free online document toolkit. Merge,
        compress, convert Word, and transform photos in just a few clicks.
      </p>

      {/* Quick Task Pills */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        {[
          { id: "merge-pdf" as ToolId, label: "Merge PDF", color: "#ea580c" },
          { id: "pdf-compression" as ToolId, label: "PDF compression", color: "#10b981" },
          { id: "pdf-to-word" as ToolId, label: "PDF to Word", color: "#0284c7" },
          { id: "word-to-pdf" as ToolId, label: "Word to PDF", color: "#2563eb" },
          { id: "photo-to-pdf" as ToolId, label: "Photo to PDF", color: "#f59e0b" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTool(item.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-zinc-200 text-zinc-700 hover:border-[#ea580c] hover:text-[#ea580c] hover:shadow-xs transition-all cursor-pointer"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
