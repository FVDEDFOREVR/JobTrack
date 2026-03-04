const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB
const RESUME_ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const RESUME_ALLOWED_EXTS = new Set([".pdf", ".docx"]);

export interface ResumeFileValidationResult {
  ok: boolean;
  error?: string;
  status?: number;
}

export function validateResumeUpload(file: File): ResumeFileValidationResult {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!RESUME_ALLOWED_EXTS.has(ext)) {
    return { ok: false, error: "Only .pdf and .docx files are supported", status: 415 };
  }

  if (file.type && !RESUME_ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Unsupported file type", status: 415 };
  }

  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, error: "File exceeds 5MB limit", status: 413 };
  }

  return { ok: true };
}

