"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import { Menu, X, ChevronRight } from "lucide-react";
import { ToolId } from "@/types/tools";
import { TOOLS_CONFIG } from "@/data/tools";

interface NavbarProps {
  activeTool: ToolId | null;
  onSelectTool: (id: ToolId | null) => void;
  onOpenBackendModal?: () => void;
}

function NavbarComponent({
  activeTool,
  onSelectTool,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 shrink-0">
          {/* LEFT: Simple PDF Branding */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0">
            <button
              onClick={() => onSelectTool(null)}
              className="flex items-center gap-2.5 group text-left cursor-pointer transition-transform active:scale-98 select-none"
              title="Simple PDF Home"
            >
              {/* Clean Orange Hexagon Emblem */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                <Image
                  src="/logo-emblem.png"
                  alt="Simple PDF"
                  fill
                  sizes="36px"
                  className="object-contain drop-shadow-2xs"
                  priority
                />
              </div>

              {/* Brand Typography */}
              <div className="flex items-baseline">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                  Simple
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#ea580c] ml-1 tracking-tight">
                  PDF
                </span>
              </div>
            </button>

            {/* Desktop Navigation Tools - Constant border to prevent layout shifts */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {TOOLS_CONFIG.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer border ${
                      isActive
                        ? "bg-orange-50 text-[#ea580c] font-bold border-orange-200 shadow-2xs"
                        : "border-transparent text-zinc-700 hover:text-[#ea580c] hover:bg-orange-50/50"
                    }`}
                  >
                    {tool.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Logo Emblem & Mobile menu button */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Clean Emblem Icon on Right Side */}
            <div className="flex items-center shrink-0">
              <div
                onClick={() => onSelectTool(null)}
                className="cursor-pointer flex items-center transition-opacity hover:opacity-90 select-none"
                title="Simple PDF"
              >
                <div className="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center shrink-0">
                  <Image
                    src="/logo-emblem.png"
                    alt="Simple PDF Emblem"
                    fill
                    sizes="36px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-3 py-2">
            Task For Today Tools
          </div>
          <div className="grid gap-1">
            {TOOLS_CONFIG.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium text-zinc-800 hover:bg-orange-50/60 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tool.color }}
                  />
                  {tool.name}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(NavbarComponent);
