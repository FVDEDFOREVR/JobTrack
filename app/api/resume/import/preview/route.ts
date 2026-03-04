import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseResumeText } from "@/lib/resume/parser";
import { validateResumeUpload } from "@/lib/resume/file-validation";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const dynamic = "force-dynamic";
// Vercel: increase body size limit for file uploads
export const maxDuration = 30;

function normalizeResumeText(raw: string) {
  const normalized = raw
    .replace(/\r\n?/g, "\n")
    .replace(/\t+/g, " ")
    .replace(/[ \u00A0]+$/gm, "")
    .replace(/^[ \u00A0]+/gm, "")
    .replace(/\n--\s*\d+\s+of\s+\d+\s*--\n?/gi, "\n")
    .replace(/[ \u00A0]{2,}/g, " ")
    .trim();

  const lines = normalized.split("\n");
  const out: string[] = [];

  const isBullet = (line: string) => /^[•\-*]\s+/.test(line);
  const endsSentence = (line: string) => /[.!?:;)"\]]$/.test(line.trim());
  const startsLower = (line: string) => /^[a-z0-9(]/.test(line.trim());

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (out.length > 0 && out[out.length - 1] !== "") out.push("");
      continue;
    }

    if (out.length === 0) {
      out.push(line);
      continue;
    }

    const prev = out[out.length - 1];
    if (prev === "") {
      out.push(line);
      continue;
    }

    const prevIsBullet = isBullet(prev);
    const currIsBullet = isBullet(line);

    // Join wrapped lines from PDF extraction while preserving paragraph and bullet boundaries.
    if (!currIsBullet && !endsSentence(prev) && startsLower(line)) {
      out[out.length - 1] = `${prev}${prev.endsWith("-") ? "" : " "}${line}`;
      continue;
    }

    // Continue bullet text that wrapped to the next visual line.
    if (prevIsBullet && !currIsBullet && !endsSentence(prev)) {
      out[out.length - 1] = `${prev} ${line}`;
      continue;
    }

    out.push(line);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validation = validateResumeUpload(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";
  const ext = "." + file.name.split(".").pop()?.toLowerCase();

  try {
    if (ext === ".pdf") {
      const { PDFParse } = await import("pdf-parse");
      // In Next.js dev + Turbopack, auto worker resolution can point to a non-existent chunk path.
      const workerPath = path.join(process.cwd(), "node_modules", "pdf-parse", "dist", "pdf-parse", "esm", "pdf.worker.mjs");
      PDFParse.setWorker(pathToFileURL(workerPath).href);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
  } catch (err) {
    console.error("File parse error:", err);
    return NextResponse.json({ error: "Failed to extract text from file" }, { status: 422 });
  }

  text = normalizeResumeText(text);

  if (!text.trim()) {
    return NextResponse.json({
      data: {
        title: null,
        fullName: null,
        email: null,
        phone: null,
        location: null,
        linkedinUrl: null,
        portfolioUrl: null,
        summary: null,
        rawText: "",
        workExperiences: [],
        educations: [],
        skills: [],
      },
      warnings: [
        {
          field: "rawText",
          message: "No readable text detected. You can still save the original file.",
        },
      ],
      rawText: "",
    });
  }

  // Parse structured data — never store raw text
  const { data, warnings } = parseResumeText(text);

  return NextResponse.json({ data: { ...data, rawText: text }, warnings, rawText: text });
}
