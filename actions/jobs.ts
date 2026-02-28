"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schemas ---

const createJobSchema = z.object({
  company: z.string().min(1, "Company is required").max(200).trim(),
  title: z.string().min(1, "Title is required").max(200).trim(),
  statusId: z.string().min(1, "Status is required"),
  url: z
    .string()
    .max(2000)
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = new URL(val);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: "URL must be a valid http or https link" }
    )
    .optional()
    .or(z.literal("")),
  dateApplied: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        return !isNaN(new Date(val).getTime());
      },
      { message: "Invalid date" }
    )
    .optional(),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.array(z.string().max(50).trim()).max(10).optional(),
});

const updateJobSchema = z.object({
  company: z.string().min(1).max(200).trim().optional(),
  title: z.string().min(1).max(200).trim().optional(),
  statusId: z.string().min(1).optional(),
  url: z
    .string()
    .max(2000)
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = new URL(val);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: "URL must be a valid http or https link" }
    )
    .optional()
    .or(z.literal("")),
  dateApplied: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        return !isNaN(new Date(val).getTime());
      },
      { message: "Invalid date" }
    )
    .optional(),
  notes: z.string().max(5000).optional().or(z.literal("")),
  tags: z.array(z.string().max(50).trim()).max(10).optional(),
});

const updateJobOrderSchema = z.array(
  z.object({
    id: z.string().min(1),
    statusId: z.string().min(1),
    order: z.number().int().min(0),
  })
);

// --- Actions ---

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

export async function createJob(input: {
  company: string;
  title: string;
  statusId: string;
  url?: string;
  dateApplied?: string;
  notes?: string;
  tags?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = createJobSchema.parse(input);

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
      notes: data.notes || null,
      tags: data.tags?.filter((t) => t.trim()) ?? [],
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
  input: {
    company?: string;
    title?: string;
    statusId?: string;
    url?: string;
    dateApplied?: string;
    notes?: string;
    tags?: string[];
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = updateJobSchema.parse(input);

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
    where: { id, userId: session.user.id },
    data: {
      ...(data.company !== undefined && { company: data.company }),
      ...(data.title !== undefined && { title: data.title }),
      ...statusFields,
      ...(data.url !== undefined && { url: data.url || null }),
      ...(data.dateApplied !== undefined && {
        dateApplied: new Date(data.dateApplied),
      }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.tags !== undefined && { tags: data.tags.filter((t) => t.trim()) }),
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

  // Verify ownership and delete in one operation
  const deleted = await prisma.job.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (deleted.count === 0) {
    throw new Error("Job not found");
  }

  revalidatePath("/dashboard");
}

export async function updateJobOrder(
  input: { id: string; statusId: string; order: number }[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const jobs = updateJobOrderSchema.parse(input);

  // Verify all job IDs belong to the current user
  const jobIds = jobs.map((j) => j.id);
  const ownedJobs = await prisma.job.findMany({
    where: { id: { in: jobIds }, userId },
    select: { id: true },
  });

  if (ownedJobs.length !== jobIds.length) {
    throw new Error("Unauthorized: some jobs don't belong to you");
  }

  // Verify all status IDs belong to the current user
  const statusIds = [...new Set(jobs.map((j) => j.statusId))];
  const statuses = await prisma.status.findMany({
    where: { id: { in: statusIds }, userId },
  });

  if (statuses.length !== statusIds.length) {
    throw new Error("Unauthorized: invalid status");
  }

  const statusMap = new Map(statuses.map((s) => [s.id, s.name]));

  // Batch update all jobs
  await Promise.all(
    jobs.map((job) =>
      prisma.job.update({
        where: { id: job.id, userId },
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
