"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
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
  status: JobStatus;
  url?: string;
  dateApplied?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the max order for the target status column
  const maxOrderJob = await prisma.job.findFirst({
    where: { userId: session.user.id, status: data.status },
    orderBy: { order: "desc" },
  });

  const newOrder = (maxOrderJob?.order ?? -1) + 1;

  const job = await prisma.job.create({
    data: {
      company: data.company,
      title: data.title,
      status: data.status,
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
    status?: JobStatus;
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

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(data.company !== undefined && { company: data.company }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.status !== undefined && { status: data.status }),
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
  jobs: { id: string; status: JobStatus; order: number }[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Batch update all jobs
  await Promise.all(
    jobs.map((job) =>
      prisma.job.update({
        where: { id: job.id },
        data: { status: job.status, order: job.order },
      })
    )
  );

  revalidatePath("/dashboard");
}
