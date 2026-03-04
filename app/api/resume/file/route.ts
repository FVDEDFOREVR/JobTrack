import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing resume id" }, { status: 400 });

    const resume = await withDbRetry(() =>
      prisma.resumeDocument.findFirst({
        where: { id, userId },
        select: {
          sourceFileData: true,
          sourceFileType: true,
          sourceFileName: true,
        },
      }),
    );

    if (!resume?.sourceFileData) {
      return NextResponse.json({ error: "No source file found" }, { status: 404 });
    }

    const fileName = (resume.sourceFileName || "resume").replace(/["\\\r\n]/g, "");
    const fileType = resume.sourceFileType || "application/octet-stream";

    return new NextResponse(new Uint8Array(resume.sourceFileData), {
      status: 200,
      headers: {
        "Content-Type": fileType,
        "Content-Disposition": `inline; filename="${fileName.replace(/\"/g, "")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/resume/file failed:", error);
    return NextResponse.json({ error: "Failed to load source resume file" }, { status: 500 });
  }
}
