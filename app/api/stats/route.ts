import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalJobs, byStatus, upcomingTasks, recentActivities] = await Promise.all([
    prisma.job.count({ where: { userId } }),
    prisma.job.groupBy({ by: ["status"], where: { userId }, _count: { status: true } }),
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
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count.status]));
  return NextResponse.json({ totalJobs, statusMap, upcomingTasks, recentActivities });
}
