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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    await withDbRetry(() =>
      prisma.contact.updateMany({
        where: { id, userId },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.role !== undefined && { role: body.role }),
          ...(body.linkedIn !== undefined && { linkedIn: body.linkedIn }),
          ...(body.companyName !== undefined && { companyName: body.companyName }),
          ...(body.notes !== undefined && { notes: body.notes }),
        },
      }),
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/contacts/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await withDbRetry(() => prisma.contact.deleteMany({ where: { id, userId } }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
