"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface ResumeItem {
  id: string;
  title: string;
  fullName: string | null;
  rawText: string | null;
  sourceFileName: string | null;
  sourceFileType: string | null;
  sourceFileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

function parseJsonObject(text: string): Record<string, unknown> {
  if (!text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function isResumeItem(value: unknown): value is ResumeItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    (typeof item.fullName === "string" || item.fullName === null) &&
    (typeof item.rawText === "string" || item.rawText === null) &&
    (typeof item.sourceFileName === "string" || item.sourceFileName === null) &&
    (typeof item.sourceFileType === "string" || item.sourceFileType === null) &&
    (typeof item.sourceFileSize === "number" || item.sourceFileSize === null) &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

export default function ResumeView({
  refreshKey,
  onReplace,
  onSavedStateChange,
}: {
  refreshKey: number;
  onReplace: () => void;
  onSavedStateChange?: (hasSaved: boolean) => void;
}) {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selected = useMemo(
    () => resumes.find((r) => r.id === selectedId) ?? null,
    [resumes, selectedId],
  );

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/resume");
      const text = await res.text();
      const json = parseJsonObject(text);

      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Failed to load saved resumes");
        setResumes([]);
        setSelectedId(null);
        return;
      }

      const next: ResumeItem[] = Array.isArray(json.resumes) ? json.resumes.filter(isResumeItem) : [];
      setResumes(next);
      setSelectedId((current) => {
        if (current && next.some((r) => r.id === current)) return current;
        return next[0]?.id ?? null;
      });
      onSavedStateChange?.(next.length > 0);
    } catch {
      setError("Failed to load saved resumes");
      setResumes([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [onSavedStateChange]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes, refreshKey]);

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Delete \"${selected.title}\"? This cannot be undone.`)) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/resume?id=${encodeURIComponent(selected.id)}`, { method: "DELETE" });
      const text = await res.text();
      const json = parseJsonObject(text);
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Failed to delete resume");
        return;
      }
      await fetchResumes();
    } catch {
      setError("Failed to delete resume");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-white/25">Loading saved resumes...</div>;

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-bold text-white">Saved Resumes</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onReplace}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium rounded-xl transition-colors border border-white/[0.08]"
          >
            Import New
          </button>
          {selected && (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm font-medium rounded-xl transition-colors border border-red-500/30 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              {(selected.sourceFileType || "").startsWith("application/pdf") && (
                <a
                  href={`/api/resume/file?id=${encodeURIComponent(selected.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium rounded-xl transition-colors border border-white/[0.08]"
                >
                  Open Original
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {resumes.length === 0 ? (
        <p className="text-white/35 text-sm">No saved resumes yet. Import one above.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {resumes.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedId === r.id
                    ? "text-violet-300 border-violet-500/40 bg-violet-500/20"
                    : "text-white/45 border-white/15 hover:text-white/70"
                }`}
              >
                {selectedId === r.id ? `Viewing: ${r.title}` : r.title}
              </button>
            ))}
          </div>

          {selected && (
            <div className="print-area">
              {(selected.sourceFileType || "").startsWith("application/pdf") ? (
                <iframe
                  src={`/api/resume/file?id=${encodeURIComponent(selected.id)}`}
                  title="Saved Resume PDF"
                  className="w-full h-[900px] rounded-xl border border-white/10 bg-black/20"
                />
              ) : selected.sourceFileName ? (
                <div className="space-y-3">
                  <p className="text-white/65 text-sm">
                    Original file is saved as {selected.sourceFileName} ({selected.sourceFileType ?? "unknown type"}).
                  </p>
                  <a
                    href={`/api/resume/file?id=${encodeURIComponent(selected.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white/75 text-sm font-medium rounded-xl transition-colors border border-white/[0.08]"
                  >
                    Open Original File
                  </a>
                </div>
              ) : (
                <pre className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed max-h-[900px] overflow-auto bg-black/20 border border-white/10 rounded-xl p-4">
                  {selected.rawText ?? "No preview available"}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
