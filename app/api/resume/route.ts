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

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resumes = await withDbRetry(() =>
      prisma.resumeDocument.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          fullName: true,
          rawText: true,
          sourceFileName: true,
          sourceFileType: true,
          sourceFileSize: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    );

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("GET /api/resume failed:", error);
    return NextResponse.json({ error: "Failed to load resumes" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing resume id" }, { status: 400 });
    }

    const result = await withDbRetry(() => prisma.resumeDocument.deleteMany({ where: { id, userId } }));
    if (result.count === 0) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/resume failed:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
