"use client";

import { useEffect, useRef, useState } from "react";
import ImportTab from "./ImportTab";
import ResumeView from "./ResumeView";

function parseJsonObject(text: string): Record<string, unknown> {
  if (!text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default function ResumePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showImport, setShowImport] = useState(true);
  const [importKey, setImportKey] = useState(0);
  const [pendingScroll, setPendingScroll] = useState(false);
  const importSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSavedState = async () => {
      try {
        const res = await fetch("/api/resume");
        const text = await res.text();
        const json = parseJsonObject(text);
        if (!res.ok || cancelled) return;
        const resumes = Array.isArray(json.resumes) ? json.resumes : [];
        const hasSaved = resumes.length > 0;
        setShowImport(!hasSaved);
      } catch {
        // Keep importer visible if initial status check fails.
      }
    };

    fetchSavedState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showImport || !pendingScroll) return;
    requestAnimationFrame(() => {
      importSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingScroll(false);
    });
  }, [showImport, pendingScroll]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Resume</h1>
        <p className="text-white/35 text-sm mt-1">Import your resume and view the saved version</p>
      </div>

      {showImport && (
        <div ref={importSectionRef} className="mb-8">
          <ImportTab
            key={importKey}
            onImported={() => {
              setShowImport(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        </div>
      )}

      <ResumeView
        refreshKey={refreshKey}
        onReplace={() => {
          setShowImport(true);
          setImportKey((k) => k + 1);
          setPendingScroll(true);
        }}
        onSavedStateChange={(hasSaved) => {
          if (!hasSaved) setShowImport(true);
        }}
      />
    </div>
  );
}
