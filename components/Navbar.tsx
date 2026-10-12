"use client";

import React, { useState, memo } from "react";
import Image from "next/image";
import { Terminal, Menu, X, ChevronRight, Wifi, WifiOff, Activity } from "lucide-react";
import { ToolId } from "@/types/tools";
import { TOOLS_CONFIG } from "@/data/tools";
import { useBackendStatus } from "@/context/BackendStatusContext";

interface NavbarProps {
  activeTool: ToolId | null;
  onSelectTool: (id: ToolId | null) => void;
  onOpenBackendModal: () => void;
}

function NavbarComponent({
  activeTool,
  onSelectTool,
  onOpenBackendModal,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOnline, latencyMs } = useBackendStatus();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 shrink-0">
          {/* LEFT: Simple PDF Branding using TFRENZY Orange */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0">
            <button
              onClick={() => onSelectTool(null)}
              className="flex items-center gap-2.5 group text-left cursor-pointer transition-transform active:scale-98 select-none"
              title="Simple PDF Home"
            >
              {/* TFRENZY Orange Hexagon Icon */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none drop-shadow-xs">
                  <polygon
                    points="50,4 90,26 90,74 50,96 10,74 10,26"
                    fill="#ea580c"
                  />
                  <polygon
                    points="50,20 76,34 76,66 50,80 24,66 24,34"
                    fill="#ffffff"
                  />
                  <polygon
                    points="50,32 66,41 66,59 50,68 34,59 34,41"
                    fill="#ea580c"
                  />
                </svg>
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

          {/* RIGHT: Company Logo (TFRENZY) & Python Backend status */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Live Python Backend Status Indicator */}
            <button
              onClick={onOpenBackendModal}
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer group shadow-2xs shrink-0 border ${
                isOnline === true
                  ? "bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border-emerald-300"
                  : isOnline === false
                  ? "bg-amber-50 hover:bg-amber-100/90 text-amber-900 border-amber-300"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
              }`}
              title={
                isOnline === true
                  ? `Python Backend Online on port 8000 (${latencyMs}ms). Click for details.`
                  : "Python Backend Offline (Demo Mode). Click for start instructions."
              }
            >
              {isOnline === true ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Python Suite Online</span>
                  {latencyMs !== null && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200/80 text-emerald-800 rounded font-mono font-medium">
                      {latencyMs}ms
                    </span>
                  )}
                </>
              ) : isOnline === false ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-amber-900">Suite Offline (Demo Mode)</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-400 animate-pulse"></span>
                  </span>
                  <Activity className="w-3.5 h-3.5 text-zinc-500 animate-spin shrink-0" />
                  <span className="font-medium text-zinc-700">Connecting Suite...</span>
                </>
              )}
            </button>

            {/* TFRENZY Company Logo on Right Side */}
            <div className="flex items-center pl-3 sm:pl-4 border-l border-zinc-200 shrink-0">
              <div
                onClick={() => onSelectTool(null)}
                className="cursor-pointer flex items-center transition-opacity hover:opacity-90 select-none"
                title="TFRENZY - प्रौद्योगिकी करणीयम्"
              >
                <div className="relative h-10 sm:h-12 w-36 sm:w-44 flex items-center justify-end shrink-0">
                  <Image
                    src="/tfrenzy-logo.png"
                    alt="TFRENZY Logo"
                    fill
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-contain object-right"
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

          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenBackendModal();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between w-full py-2.5 px-3 text-xs font-semibold rounded-lg cursor-pointer border ${
                isOnline === true
                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                  : isOnline === false
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-zinc-50 text-zinc-700 border-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {isOnline === true ? (
                  <>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    <span>Python Suite Online</span>
                  </>
                ) : isOnline === false ? (
                  <>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    <WifiOff className="w-4 h-4 text-amber-600" />
                    <span>Python Suite Offline (Demo Mode)</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-zinc-500 animate-spin" />
                    <span>Connecting Backend Suite...</span>
                  </>
                )}
              </div>
              {latencyMs !== null && isOnline && (
                <span className="font-mono text-[10px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.5 rounded">
                  {latencyMs}ms
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(NavbarComponent);
