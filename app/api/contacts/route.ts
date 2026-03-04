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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const contacts = await withDbRetry(() =>
      prisma.contact.findMany({
        where: {
          userId,
          ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { companyName: { contains: search, mode: "insensitive" } }] } : {}),
        },
        include: { jobs: { include: { job: { select: { title: true, companyName: true, status: true } } } } },
        orderBy: { name: "asc" },
      }),
    );

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("GET /api/contacts failed:", error);
    return NextResponse.json({ error: "Failed to load contacts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const contact = await withDbRetry(() =>
      prisma.contact.create({
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
      }),
    );
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("POST /api/contacts failed:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
