import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const jobs = await prisma.job.findMany({
    where: {
      userId,
      AND: [
        search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { companyName: { contains: search, mode: "insensitive" } }] } : {},
        status ? { status } : {},
      ],
    },
    include: { _count: { select: { activities: true, tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const job = await prisma.job.create({
    data: {
      userId,
      title: body.title,
      companyName: body.companyName,
      url: body.url || null,
      status: body.status || "bookmarked",
      salaryMin: body.salaryMin ? parseInt(body.salaryMin) : null,
      salaryMax: body.salaryMax ? parseInt(body.salaryMax) : null,
      location: body.location || null,
      locationType: body.locationType || null,
      dateApplied: body.dateApplied ? new Date(body.dateApplied) : null,
      notes: body.notes || null,
      resumeVersion: body.resumeVersion || null,
    },
  });
  return NextResponse.json(job, { status: 201 });
}
