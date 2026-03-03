import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const activity = await prisma.activity.create({
    data: {
      userId,
      type: body.type,
      title: body.title,
      notes: body.notes || null,
      date: body.date ? new Date(body.date) : new Date(),
      jobId: body.jobId || null,
      contactId: body.contactId || null,
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
