"use client";

import React from "react";
import {
  Layers,
  Minimize2,
  FileText,
  FileCheck2,
  Image as ImageIcon,
  ArrowRight,
  Scissors,
  RotateCw,
  LayoutGrid,
  Table2,
  Images,
  FileSearch,
  Stamp,
  Hash,
  Lock,
  Unlock,
  Sheet,
  Presentation,
} from "lucide-react";
import { ToolDefinition } from "@/types/tools";

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: () => void;
}

function ToolIcon({ tool }: { tool: ToolDefinition }) {
  const className = "w-8 h-8";
  const style = { color: tool.color };
  switch (tool.id) {
    case "merge-pdf":
      return <Layers className={className} style={style} />;
    case "split-pdf":
      return <Scissors className={className} style={style} />;
    case "rotate-pdf":
      return <RotateCw className={className} style={style} />;
    case "organize-pdf":
      return <LayoutGrid className={className} style={style} />;
    case "pdf-compression":
      return <Minimize2 className={className} style={style} />;
    case "pdf-to-word":
      return <FileText className={className} style={style} />;
    case "word-to-pdf":
      return <FileCheck2 className={className} style={style} />;
    case "excel-to-pdf":
      return <Sheet className={className} style={style} />;
    case "ppt-to-pdf":
      return <Presentation className={className} style={style} />;
    case "pdf-to-excel":
      return <Table2 className={className} style={style} />;
    case "pdf-to-image":
      return <Images className={className} style={style} />;
    case "photo-to-pdf":
      return <ImageIcon className={className} style={style} />;
    case "extract-text":
      return <FileSearch className={className} style={style} />;
    case "watermark-pdf":
      return <Stamp className={className} style={style} />;
    case "page-numbers":
      return <Hash className={className} style={style} />;
    case "protect-pdf":
      return <Lock className={className} style={style} />;
    case "unlock-pdf":
      return <Unlock className={className} style={style} />;
    default:
      return <FileText className={className} style={style} />;
  }
}

export default function ToolCard({ tool, onSelect }: ToolCardProps) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="group relative flex flex-col justify-between p-6 sm:p-7 bg-white rounded-2xl border border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(234,88,12,0.10)] transition-all duration-200 hover:-translate-y-1.5 cursor-pointer text-left overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#ea580c]/40"
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: tool.color }}
      />
      <div>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: tool.lightBg }}
        >
          <ToolIcon tool={tool} />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">{tool.name}</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">{tool.description}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-700 transition-colors">
          Simple PDF Tool
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold group-hover:translate-x-1 transition-all" style={{ color: tool.color }}>
          Open Tool
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
