"use client";

import { useEffect, useRef, useState } from "react";
import { ResumeProfileSchema, type ResumeProfile } from "@/lib/resume/schemas";

interface ParseWarning {
  field: string;
  message: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function parseJsonObject(text: string): Record<string, unknown> {
  if (!text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function parseWarnings(value: unknown): ParseWarning[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ParseWarning => {
    return Boolean(
      item &&
        typeof item === "object" &&
        "field" in item &&
        "message" in item &&
        typeof (item as { field: unknown }).field === "string" &&
        typeof (item as { message: unknown }).message === "string",
    );
  });
}

function hasDraftData(draft: ResumeProfile) {
  return Boolean(
    draft.rawText ||
    draft.fullName ||
    draft.summary ||
    draft.workExperiences.length > 0 ||
    draft.educations.length > 0 ||
    draft.skills.length > 0,
  );
}

export default function ImportTab({ onImported }: { onImported: (resumeId?: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ParseWarning[]>([]);
  const [draft, setDraft] = useState<ResumeProfile | null>(null);
  const [title, setTitle] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceFile || sourceFile.type !== "application/pdf") {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(sourceFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [sourceFile]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (![".pdf", ".docx"].includes(ext)) {
      setError("Only .pdf and .docx files are supported");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File exceeds 5MB limit");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setError(null);
    setWarnings([]);
    setDraft(null);
    setTitle("");
    setSourceFile(file);
    setParsing(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/resume/import/preview", { method: "POST", body: form });
      const text = await res.text();
      const json = parseJsonObject(text);

      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Parse failed");
        return;
      }

      const parsedDraft = ResumeProfileSchema.safeParse(json.data);
      const parsed = parsedDraft.success ? parsedDraft.data : null;
      setDraft(parsed);
      if (parsed) {
        const baseFileName = file.name.replace(/\.[^.]+$/, "").trim();
        setTitle(parsed.title?.trim() || parsed.fullName?.trim() || baseFileName || "Imported Resume");
      }
      setWarnings(parseWarnings(json.warnings));
    } catch {
      setError("Network error - please try again");
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!draft || !sourceFile) return;
    setSaving(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", sourceFile);
      form.append(
        "data",
        JSON.stringify({
          ...draft,
          title: title.trim() || null,
        }),
      );
      const res = await fetch("/api/resume/import/commit", {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      const json = parseJsonObject(text);

      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Save failed");
        return;
      }

      setDraft(null);
      setWarnings([]);
      setTitle("");
      setSourceFile(null);
      if (fileRef.current) fileRef.current.value = "";
      const resume = json.resume;
      const resumeId =
        resume && typeof resume === "object" && "id" in resume && typeof (resume as { id: unknown }).id === "string"
          ? (resume as { id: string }).id
          : undefined;
      onImported(resumeId);
    } catch {
      setError("Network error - please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {!draft && (
        <div
          className="border-2 border-dashed border-white/[0.12] rounded-2xl p-12 text-center hover:border-violet-500/40 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <div className="text-4xl mb-4 text-violet-400">◧</div>
          <p className="text-white/60 font-semibold mb-1">Drop your resume here or click to browse</p>
          <p className="text-white/25 text-sm">PDF or DOCX - Max 5MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {parsing && (
        <div className="text-center py-12 text-white/40">
          <div className="text-2xl mb-3 animate-pulse">◧</div>
          Parsing resume...
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {warnings.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-1">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-2">Parsing warnings</p>
          {warnings.map((w, i) => (
            <p key={i} className="text-yellow-300/70 text-sm">- {w.message}</p>
          ))}
        </div>
      )}

      {draft && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setDraft(null);
                setWarnings([]);
                setTitle("");
                setSourceFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              ← Upload a different file
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all glow-btn disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
            >
              {saving ? "Saving..." : "Save Resume"}
            </button>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <div className="mb-4">
              <label htmlFor="resume-title" className="block text-xs font-semibold uppercase tracking-wider text-white/55 mb-2">
                Resume name
              </label>
              <input
                id="resume-title"
                type="text"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., SWE Resume - 2026"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
              />
            </div>
            <h3 className="text-sm font-semibold text-white/80 mb-3">Imported Resume Preview (1:1)</h3>
            {!hasDraftData(draft) ? (
              <p className="text-white/35 text-sm">No readable text was found in this file.</p>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                title="Imported PDF Preview"
                className="w-full h-[760px] rounded-xl border border-white/10 bg-black/20"
              />
            ) : (
              <pre className="text-sm text-white/75 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-auto bg-black/20 border border-white/10 rounded-xl p-4">
                {draft.rawText ?? ""}
              </pre>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
