import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { validateResumeUpload } from "@/lib/resume/file-validation";
import { CommitResumeSchema } from "@/lib/resume/schemas";

export const dynamic = "force-dynamic";

async function withDbRetry<T>(operation: () => Promise<T>, retries = 1): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionClosed = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1017";
      if (!isConnectionClosed || attempt >= retries) throw error;
      attempt += 1;
      await prisma.$disconnect();
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
}

function formatDefaultTitle(fileName: string | null, fullName: string | null | undefined) {
  if (fullName && fullName.trim()) return fullName.trim();
  if (fileName && fileName.trim()) return fileName.trim();
  return `Resume ${new Date().toLocaleDateString("en-US")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";
    let body: unknown;
    let sourceFileName: string | null = null;
    let sourceFileType: string | null = null;
    let sourceFileSize: number | null = null;
    let sourceFileData: Uint8Array<ArrayBuffer> | null = null;

    if (contentType.includes("multipart/form-data")) {
      let form: FormData;
      try {
        form = await req.formData();
      } catch {
        return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
      }

      const rawData = form.get("data");
      if (typeof rawData !== "string") {
        return NextResponse.json({ error: "Missing resume data payload" }, { status: 400 });
      }

      try {
        body = JSON.parse(rawData);
      } catch {
        return NextResponse.json({ error: "Invalid resume data payload" }, { status: 400 });
      }

      const file = form.get("file");
      if (file instanceof File) {
        const validation = validateResumeUpload(file);
        if (!validation.ok) {
          return NextResponse.json({ error: validation.error }, { status: validation.status ?? 400 });
        }
        sourceFileName = file.name || null;
        sourceFileType = file.type || "application/octet-stream";
        sourceFileSize = file.size ?? null;
        sourceFileData = new Uint8Array(await file.arrayBuffer());
      }
    } else {
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    }

    const parsed = CommitResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 });
    }

    const { title, fullName, rawText } = parsed.data;

    const created = await withDbRetry(() =>
      prisma.resumeDocument.create({
        data: {
          userId,
          title: title?.trim() || formatDefaultTitle(sourceFileName, fullName ?? null),
          fullName: fullName ?? null,
          rawText: rawText ?? null,
          sourceFileName,
          sourceFileType,
          sourceFileSize,
          sourceFileData,
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      }),
    );

    return NextResponse.json({ success: true, resume: created });
  } catch (error) {
    console.error("POST /api/resume/import/commit failed:", error);
    return NextResponse.json({ error: "Failed to save imported resume" }, { status: 500 });
  }
}
