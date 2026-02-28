"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/ai";
import { z } from "zod";

// --- Validation Schemas ---

const generateCoverLetterSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  userContext: z
    .string()
    .min(10, "Please provide at least a brief description of your skills")
    .max(5000, "Context is too long"),
});

const analyzeJobSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

const generateInsightsSchema = z.object({
  jobs: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      title: z.string(),
      status: z.string(),
      dateApplied: z.coerce.date(),
      url: z.string().nullable().optional(),
    })
  ),
  statuses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      label: z.string(),
    })
  ),
});

// --- Actions ---

export async function generateCoverLetter(input: {
  jobId: string;
  userContext: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = generateCoverLetterSchema.parse(input);

  const job = await prisma.job.findFirst({
    where: { id: parsed.jobId, userId: session.user.id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const prompt = `You are an expert career coach and professional cover letter writer.

Write a compelling, personalized cover letter for the following job application:

**Job Title:** ${job.title}
**Company:** ${job.company}
${job.url ? `**Job Listing URL:** ${job.url}` : ""}

**About the Applicant:**
${parsed.userContext}

Guidelines:
- Write a professional, engaging cover letter (3-4 paragraphs)
- Tailor it specifically to the job title and company
- Incorporate the applicant's skills and experience naturally
- Show enthusiasm for the role and company
- Keep it concise but impactful (under 400 words)
- Do NOT include placeholder brackets like [Your Name] — write it as a complete letter
- Use a professional but warm tone
- Start with "Dear Hiring Manager," and end with "Sincerely,"`;

  const coverLetter = await generateText(prompt);
  return coverLetter;
}

export async function analyzeJob(input: { jobId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = analyzeJobSchema.parse(input);

  const job = await prisma.job.findFirst({
    where: { id: parsed.jobId, userId: session.user.id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // Return cached summary if available
  if (job.aiSummary) {
    return job.aiSummary;
  }

  let jobDescription = "";

  // Try to fetch content from the job URL
  if (job.url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(job.url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; JobTracker/1.0; +http://localhost)",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        // Strip HTML tags and get text content (basic extraction)
        jobDescription = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000); // Limit to avoid token overflow
      }
    } catch {
      // URL fetch failed, proceed without it
    }
  }

  const prompt = `You are an expert job market analyst. Analyze the following job and provide a structured summary.

**Job Title:** ${job.title}
**Company:** ${job.company}
${job.url ? `**Job URL:** ${job.url}` : ""}
${jobDescription ? `\n**Job Description Content:**\n${jobDescription}` : "\n(No job description available — analyze based on the job title and company only)"}

Provide your analysis in the following format. Use "Not available" for any field you cannot determine:

## Key Requirements
- List 3-5 key requirements or qualifications

## Tech Stack
- List any technologies, tools, or frameworks mentioned

## Salary Range
- Estimated salary range (or "Not available")

## Location
- Job location and remote/hybrid/onsite status

## Experience Level
- Entry/Mid/Senior level and years of experience expected

## Summary
A 2-3 sentence summary of what makes this role notable and who it's ideal for.`;

  const summary = await generateText(prompt);

  // Cache the result in the database
  await prisma.job.update({
    where: { id: job.id, userId: session.user.id },
    data: { aiSummary: summary },
  });

  return summary;
}

export async function generateInsights(input: {
  jobs: {
    id: string;
    company: string;
    title: string;
    status: string;
    dateApplied: Date;
    url?: string | null;
  }[];
  statuses: { id: string; name: string; label: string }[];
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = generateInsightsSchema.parse(input);

  // Build aggregate data for the prompt
  const statusCounts: Record<string, number> = {};
  for (const status of parsed.statuses) {
    statusCounts[status.label] =
      parsed.jobs.filter((j) => j.status === status.name).length;
  }

  const companies = [...new Set(parsed.jobs.map((j) => j.company))];
  const titles = [...new Set(parsed.jobs.map((j) => j.title))];

  const sortedByDate = [...parsed.jobs].sort(
    (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
  );

  const recentJobs = sortedByDate.slice(0, 10).map((j) => ({
    title: j.title,
    company: j.company,
    status: j.status,
    dateApplied: new Date(j.dateApplied).toLocaleDateString(),
  }));

  const prompt = `You are a career analytics expert. Analyze this job search data and provide actionable insights.

**Total Applications:** ${parsed.jobs.length}
**Status Breakdown:** ${JSON.stringify(statusCounts)}
**Unique Companies:** ${companies.length} (examples: ${companies.slice(0, 10).join(", ")})
**Roles Applied For:** ${titles.slice(0, 10).join(", ")}
**Recent Applications:** ${JSON.stringify(recentJobs)}

${sortedByDate.length >= 2 ? `**Date Range:** ${new Date(sortedByDate[sortedByDate.length - 1].dateApplied).toLocaleDateString()} to ${new Date(sortedByDate[0].dateApplied).toLocaleDateString()}` : ""}

Provide your analysis in the following sections:

## Pipeline Health
Assess the overall health of the job search pipeline. Are applications progressing through stages? Any bottlenecks?

## Trends
What patterns do you see? Application frequency, types of roles, company diversity, etc.

## Suggestions
Provide 3-5 specific, actionable suggestions to improve the job search strategy.

## Motivation
A brief encouraging note based on the data — be realistic but supportive.

Keep each section concise (2-4 sentences max). Be specific to the data provided.`;

  const insights = await generateText(prompt);
  return insights;
}
