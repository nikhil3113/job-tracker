"use client";

import { useState } from "react";
import { Job } from "@prisma/client";
import { analyzeJob } from "@/actions/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Brain,
  Building2,
  Calendar,
  ExternalLink,
} from "lucide-react";

interface JobDetailDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyzed: (jobId: string, summary: string) => void;
}

export default function JobDetailDialog({
  job,
  open,
  onOpenChange,
  onAnalyzed,
}: JobDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!job) return;

    setLoading(true);
    try {
      const result = await analyzeJob({ jobId: job.id });
      setSummary(result);
      onAnalyzed(job.id, result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze job"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSummary(null);
    }
    onOpenChange(isOpen);
  };

  // Show cached summary or freshly fetched one
  const displaySummary = summary || job?.aiSummary;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Job Analysis
          </DialogTitle>
          <DialogDescription>
            {job
              ? `${job.title} at ${job.company}`
              : "Select a job to analyze"}
          </DialogDescription>
        </DialogHeader>

        {job && (
          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {/* Job Info Header */}
            <div className="flex flex-col gap-2 rounded-md border p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{job.company}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Applied {new Date(job.dateApplied).toLocaleDateString()}
                </span>
              </div>
              {job.url && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {job.url}
                  </a>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {displaySummary ? (
              <div className="rounded-md border bg-muted/50 p-4 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                {displaySummary.split("\n").map((line: string, i: number) => {
                  if (line.startsWith("## ")) {
                    return (
                      <h3 key={i} className="text-base font-semibold mt-4 mb-2 first:mt-0">
                        {line.replace("## ", "")}
                      </h3>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li key={i} className="ml-4 list-disc">
                        {line.replace("- ", "")}
                      </li>
                    );
                  }
                  if (line.trim() === "") {
                    return <br key={i} />;
                  }
                  return <p key={i} className="mb-1">{line}</p>;
                })}
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Analyzing job listing...
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.url
                    ? "Fetching and analyzing job description"
                    : "Analyzing based on job title and company"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Brain className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">No analysis yet</p>
                  <p className="text-xs text-muted-foreground">
                    Click below to generate an AI-powered analysis of this job
                  </p>
                </div>
                <Button onClick={handleAnalyze}>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Job
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
