"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJobs() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });

  return jobs;
}

export async function createJob(data: {
  company: string;
  title: string;
  statusId: string;
  url?: string;
  dateApplied?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Look up the status to get its name
  const statusRecord = await prisma.status.findFirst({
    where: { id: data.statusId, userId: session.user.id },
  });

  if (!statusRecord) {
    throw new Error("Invalid status");
  }

  // Get the max order for the target status column
  const maxOrderJob = await prisma.job.findFirst({
    where: { userId: session.user.id, statusId: data.statusId },
    orderBy: { order: "desc" },
  });

  const newOrder = (maxOrderJob?.order ?? -1) + 1;

  const job = await prisma.job.create({
    data: {
      company: data.company,
      title: data.title,
      status: statusRecord.name,
      statusId: data.statusId,
      url: data.url || null,
      dateApplied: data.dateApplied ? new Date(data.dateApplied) : new Date(),
      order: newOrder,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return job;
}

export async function updateJob(
  id: string,
  data: {
    company?: string;
    title?: string;
    statusId?: string;
    url?: string;
    dateApplied?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.job.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Job not found");
  }

  // If status is changing, look up the new status name
  let statusFields: { status?: string; statusId?: string } = {};
  if (data.statusId !== undefined) {
    const statusRecord = await prisma.status.findFirst({
      where: { id: data.statusId, userId: session.user.id },
    });
    if (!statusRecord) {
      throw new Error("Invalid status");
    }
    statusFields = { status: statusRecord.name, statusId: data.statusId };
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(data.company !== undefined && { company: data.company }),
      ...(data.title !== undefined && { title: data.title }),
      ...statusFields,
      ...(data.url !== undefined && { url: data.url || null }),
      ...(data.dateApplied !== undefined && {
        dateApplied: new Date(data.dateApplied),
      }),
    },
  });

  revalidatePath("/dashboard");
  return job;
}

export async function deleteJob(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.job.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Job not found");
  }

  await prisma.job.delete({ where: { id } });

  revalidatePath("/dashboard");
}

export async function updateJobOrder(
  jobs: { id: string; statusId: string; order: number }[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Look up all status names at once for the batch update
  const statusIds = [...new Set(jobs.map((j) => j.statusId))];
  const statuses = await prisma.status.findMany({
    where: { id: { in: statusIds }, userId: session.user.id },
  });
  const statusMap = new Map(statuses.map((s) => [s.id, s.name]));

  // Batch update all jobs
  await Promise.all(
    jobs.map((job) =>
      prisma.job.update({
        where: { id: job.id },
        data: {
          statusId: job.statusId,
          status: statusMap.get(job.statusId) ?? "",
          order: job.order,
        },
      })
    )
  );

  revalidatePath("/dashboard");
}
