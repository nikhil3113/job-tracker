"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DEFAULT_STATUSES, getColorByIndex } from "@/lib/status-colors";

/**
 * Ensures the current user has statuses.
 * If they have none, creates the 4 defaults.
 * Returns all statuses ordered by `order`.
 */
export async function getOrCreateStatuses() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if user already has statuses
  const existing = await prisma.status.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  if (existing.length > 0) {
    return existing;
  }

  // Seed default statuses for this user
  await prisma.status.createMany({
    data: DEFAULT_STATUSES.map((s) => ({
      name: s.name,
      label: s.label,
      color: s.color,
      order: s.order,
      userId,
    })),
  });

  // Also backfill any existing jobs that have a status string but no statusId.
  // This handles the migration from the old enum-based system.
  const statuses = await prisma.status.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  const statusMap = new Map(statuses.map((s) => [s.name, s.id]));

  const jobsToMigrate = await prisma.job.findMany({
    where: {
      userId,
      statusId: undefined,
    },
  });

  if (jobsToMigrate.length > 0) {
    await Promise.all(
      jobsToMigrate.map((job) => {
        const statusId = statusMap.get(job.status) ?? statuses[0].id;
        return prisma.job.update({
          where: { id: job.id },
          data: { statusId },
        });
      })
    );
  }

  return statuses;
}

/** Returns all statuses for the current user, ordered by `order`. */
export async function getStatuses() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return prisma.status.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });
}

/** Creates a new custom status for the current user. */
export async function createStatus(data: { name: string; label: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Normalize the name: uppercase, replace spaces with underscores
  const name = data.name.trim().toUpperCase().replace(/\s+/g, "_");

  if (!name) {
    throw new Error("Status name is required");
  }

  // Check for duplicates
  const existing = await prisma.status.findUnique({
    where: { userId_name: { userId, name } },
  });

  if (existing) {
    throw new Error("A status with this name already exists");
  }

  // Determine the next order value
  const lastStatus = await prisma.status.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
  });
  const nextOrder = (lastStatus?.order ?? -1) + 1;

  // Auto-assign color from palette based on the count of existing statuses
  const count = await prisma.status.count({ where: { userId } });
  
  if (count >= 6) {
    throw new Error("You can only have up to 6 statuses");
  }

  const colorEntry = getColorByIndex(count);

  const status = await prisma.status.create({
    data: {
      name,
      label: data.label.trim(),
      color: colorEntry.name,
      order: nextOrder,
      userId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return status;
}

/** Updates an existing status (label only — name is the stable key). */
export async function updateStatus(
  id: string,
  data: { label?: string; name?: string }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.status.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Status not found");
  }

  const updateData: { label?: string; name?: string } = {};

  if (data.label !== undefined) {
    updateData.label = data.label.trim();
  }

  if (data.name !== undefined) {
    const newName = data.name.trim().toUpperCase().replace(/\s+/g, "_");
    if (!newName) throw new Error("Status name is required");

    // Check for duplicate name
    const duplicate = await prisma.status.findFirst({
      where: {
        userId: session.user.id,
        name: newName,
        id: { not: id },
      },
    });
    if (duplicate) {
      throw new Error("A status with this name already exists");
    }

    updateData.name = newName;

    // Also update the status string on all jobs that reference this status
    await prisma.job.updateMany({
      where: { statusId: id },
      data: { status: newName },
    });
  }

  const status = await prisma.status.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return status;
}

/** Deletes a status. Fails if any jobs still use it. */
export async function deleteStatus(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existing = await prisma.status.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Status not found");
  }

  // Check if any jobs use this status
  const jobCount = await prisma.job.count({
    where: { statusId: id },
  });

  if (jobCount > 0) {
    throw new Error(
      `Cannot delete this status. ${jobCount} job(s) are still using it. Reassign them first.`
    );
  }

  // Ensure user keeps at least one status
  const totalStatuses = await prisma.status.count({
    where: { userId: session.user.id },
  });

  if (totalStatuses <= 1) {
    throw new Error("You must have at least one status");
  }

  await prisma.status.delete({ where: { id } });

  // Re-order remaining statuses to close gaps
  const remaining = await prisma.status.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });

  await Promise.all(
    remaining.map((s, idx) =>
      prisma.status.update({ where: { id: s.id }, data: { order: idx } })
    )
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

/** Batch-update the order of all statuses. */
export async function reorderStatuses(orderedIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.status.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

/** Reassign all jobs from one status to another, then delete the source status. */
export async function reassignAndDeleteStatus(
  fromStatusId: string,
  toStatusId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership of both statuses
  const [fromStatus, toStatus] = await Promise.all([
    prisma.status.findFirst({
      where: { id: fromStatusId, userId: session.user.id },
    }),
    prisma.status.findFirst({
      where: { id: toStatusId, userId: session.user.id },
    }),
  ]);

  if (!fromStatus || !toStatus) {
    throw new Error("Status not found");
  }

  if (fromStatusId === toStatusId) {
    throw new Error("Cannot reassign to the same status");
  }

  // Reassign all jobs
  await prisma.job.updateMany({
    where: { statusId: fromStatusId },
    data: { statusId: toStatusId, status: toStatus.name },
  });

  // Now delete the empty status
  await prisma.status.delete({ where: { id: fromStatusId } });

  // Re-order remaining statuses
  const remaining = await prisma.status.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
  });

  await Promise.all(
    remaining.map((s, idx) =>
      prisma.status.update({ where: { id: s.id }, data: { order: idx } })
    )
  );

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}
