import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const contacts = await prisma.contact.findMany({
    where: {
      userId,
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { companyName: { contains: search, mode: "insensitive" } }] } : {}),
    },
    include: { jobs: { include: { job: { select: { title: true, companyName: true, status: true } } } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const contact = await prisma.contact.create({
    data: {
      userId,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      role: body.role || null,
      linkedIn: body.linkedIn || null,
      companyName: body.companyName || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(contact, { status: 201 });
}
