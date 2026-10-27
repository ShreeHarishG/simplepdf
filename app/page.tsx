"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToolCard from "@/components/ToolCard";
import ToolWorkspace from "@/components/ToolWorkspace";
import Footer from "@/components/Footer";
import { TOOLS_CONFIG } from "@/data/tools";
import { ToolId } from "@/types/tools";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialToolParam = searchParams.get("tool") as ToolId | null;

  const [activeToolId, setActiveToolId] = useState<ToolId | null>(
    TOOLS_CONFIG.some((t) => t.id === initialToolParam)
      ? initialToolParam
      : null
  );

  // Sync with search params if changed
  useEffect(() => {
    const param = searchParams.get("tool") as ToolId | null;
    if (param && TOOLS_CONFIG.some((t) => t.id === param)) {
      setActiveToolId(param);
    }
  }, [searchParams]);

  const activeTool = TOOLS_CONFIG.find((t) => t.id === activeToolId) || null;

  const handleSelectTool = (id: ToolId | null) => {
    setActiveToolId(id);
    if (id) {
      window.history.pushState(null, "", `?tool=${id}`);
      window.scrollTo(0, 0);
    } else {
      window.history.pushState(null, "", "/");
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      {/* Navigation Bar */}
      <Navbar
        activeTool={activeToolId}
        onSelectTool={handleSelectTool}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTool ? (
          <ToolWorkspace
            tool={activeTool}
            onBack={() => handleSelectTool(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Hero Section */}
            <Hero onSelectTool={handleSelectTool} />

            {/* Core PDF Tools Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    Core PDF Tools
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Click any tool to start converting, merging, or compressing
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-[#ea580c] border border-orange-200/60 rounded-full">
                  {TOOLS_CONFIG.length} Tools Available
                </span>
              </div>

              {/* Grid: Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {TOOLS_CONFIG.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={() => handleSelectTool(tool.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTool={handleSelectTool}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafc]">
          <div className="w-8 h-8 border-3 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
