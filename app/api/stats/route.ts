import { NextResponse } from "next/server";
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

    const [totalJobs, jobs, upcomingTasks, recentActivities] = await withDbRetry(() =>
      Promise.all([
        prisma.job.count({ where: { userId } }),
        prisma.job.findMany({ where: { userId }, select: { status: true } }),
        prisma.task.findMany({
          where: { userId, done: false, dueDate: { gte: new Date() } },
          orderBy: { dueDate: "asc" },
          take: 5,
          include: { job: { select: { title: true, companyName: true } } },
        }),
        prisma.activity.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          take: 8,
          include: { job: { select: { title: true, companyName: true } } },
        }),
      ]),
    );

    const statusMap = jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ totalJobs, statusMap, upcomingTasks, recentActivities });
  } catch (error) {
    console.error("GET /api/stats failed:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
