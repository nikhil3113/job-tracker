"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Validation Schemas ---

const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).trim(),
  email: z.string().email().max(300).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  role: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  linkedIn: z
    .string()
    .max(500)
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
      { message: "LinkedIn URL must be a valid http or https link" }
    )
    .optional()
    .or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  jobId: z.string().optional().or(z.literal("")),
});

const updateContactSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  email: z.string().email().max(300).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  role: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  linkedIn: z
    .string()
    .max(500)
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
      { message: "LinkedIn URL must be a valid http or https link" }
    )
    .optional()
    .or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  jobId: z.string().optional().or(z.literal("")).nullable(),
});

// --- Actions ---

export async function getContactsByJobId(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const contacts = await prisma.contact.findMany({
    where: { jobId, userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return contacts;
}

export async function createContact(input: {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  linkedIn?: string;
  notes?: string;
  jobId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = createContactSchema.parse(input);

  // If jobId provided, verify ownership
  if (data.jobId) {
    const job = await prisma.job.findFirst({
      where: { id: data.jobId, userId: session.user.id },
    });
    if (!job) {
      throw new Error("Job not found");
    }
  }

  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role || null,
      company: data.company || null,
      linkedIn: data.linkedIn || null,
      notes: data.notes || null,
      jobId: data.jobId || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return contact;
}

export async function updateContact(
  id: string,
  input: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    company?: string;
    linkedIn?: string;
    notes?: string;
    jobId?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = updateContactSchema.parse(input);

  // Verify ownership
  const existing = await prisma.contact.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    throw new Error("Contact not found");
  }

  const contact = await prisma.contact.update({
    where: { id, userId: session.user.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.role !== undefined && { role: data.role || null }),
      ...(data.company !== undefined && { company: data.company || null }),
      ...(data.linkedIn !== undefined && { linkedIn: data.linkedIn || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.jobId !== undefined && { jobId: data.jobId || null }),
    },
  });

  revalidatePath("/dashboard");
  return contact;
}

export async function deleteContact(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const deleted = await prisma.contact.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (deleted.count === 0) {
    throw new Error("Contact not found");
  }

  revalidatePath("/dashboard");
}
