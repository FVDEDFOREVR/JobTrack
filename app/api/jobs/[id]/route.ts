import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { id, userId },
    include: {
      activities: { orderBy: { date: "desc" } },
      tasks: { orderBy: { dueDate: "asc" } },
      contacts: { include: { contact: true } },
    },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const job = await prisma.job.updateMany({
    where: { id, userId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.companyName !== undefined && { companyName: body.companyName }),
      ...(body.url !== undefined && { url: body.url }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.salaryMin !== undefined && { salaryMin: body.salaryMin ? parseInt(body.salaryMin) : null }),
      ...(body.salaryMax !== undefined && { salaryMax: body.salaryMax ? parseInt(body.salaryMax) : null }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.locationType !== undefined && { locationType: body.locationType }),
      ...(body.dateApplied !== undefined && { dateApplied: body.dateApplied ? new Date(body.dateApplied) : null }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.resumeVersion !== undefined && { resumeVersion: body.resumeVersion }),
    },
  });
  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.job.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
