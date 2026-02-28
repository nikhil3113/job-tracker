"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function exportJobsCsv() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
    orderBy: { dateApplied: "desc" },
  });

  // CSV header
  const headers = [
    "Company",
    "Title",
    "Status",
    "Date Applied",
    "URL",
    "Tags",
    "Notes",
    "Created At",
    "Updated At",
  ];

  // Escape CSV field: wrap in quotes if it contains commas, quotes, or newlines
  const escapeField = (value: string | null | undefined): string => {
    if (!value) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = jobs.map((job) => {
    const extJob = job as typeof job & { notes?: string | null; tags?: string[] };
    return [
      escapeField(job.company),
      escapeField(job.title),
      escapeField(job.status),
      new Date(job.dateApplied).toISOString().split("T")[0],
      escapeField(job.url),
      escapeField((extJob.tags || []).join("; ")),
      escapeField(extJob.notes),
      new Date(job.createdAt).toISOString(),
      new Date(job.updatedAt).toISOString(),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
