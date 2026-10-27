"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToolCard from "@/components/ToolCard";
import ToolWorkspace from "@/components/ToolWorkspace";
import Footer from "@/components/Footer";
import { TOOLS_CONFIG, TOOL_GROUPS } from "@/data/tools";
import { ToolId } from "@/types/tools";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialToolParam = searchParams.get("tool") as ToolId | null;

  const [activeToolId, setActiveToolId] = useState<ToolId | null>(
    TOOLS_CONFIG.some((t) => t.id === initialToolParam) ? initialToolParam : null
  );

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
      <Navbar activeTool={activeToolId} onSelectTool={handleSelectTool} />

      <main className="flex-1 flex flex-col">
        {activeTool ? (
          <ToolWorkspace tool={activeTool} onBack={() => handleSelectTool(null)} />
        ) : (
          <div className="flex-1 flex flex-col">
            <Hero onSelectTool={handleSelectTool} />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">PDF tools</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Small jobs that save time — convert, organize, stamp, and lock.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-[#ea580c] border border-orange-200/60 rounded-full">
                  {TOOLS_CONFIG.length} Tools Available
                </span>
              </div>

              {TOOL_GROUPS.map((group) => (
                <div key={group.id}>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-zinc-900">{group.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{group.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {TOOLS_CONFIG.filter((tool) => tool.category === group.id).map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={() => handleSelectTool(tool.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>

      <Footer onSelectTool={handleSelectTool} />
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
