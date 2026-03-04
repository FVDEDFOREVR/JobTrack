import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const done = searchParams.get("done");

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(jobId ? { jobId } : {}),
      ...(done !== null ? { done: done === "true" } : {}),
    },
    include: {
      job: { select: { id: true, title: true, companyName: true } },
      contact: { select: { name: true } },
    },
    orderBy: [{ done: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      userId,
      title: body.title,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      jobId: body.jobId || null,
      contactId: body.contactId || null,
    },
    include: { job: { select: { id: true, title: true, companyName: true } } },
  });
  return NextResponse.json(task, { status: 201 });
}
