import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { validateResumeUpload } from "@/lib/resume/file-validation";

export const dynamic = "force-dynamic";
// Vercel: increase body size limit for file uploads
export const maxDuration = 30;

const EMPTY_DRAFT = {
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
};

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

  return NextResponse.json({
    data: EMPTY_DRAFT,
    warnings: [],
    rawText: "",
  });
}
