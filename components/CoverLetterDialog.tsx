"use client";

import { useState } from "react";
import { Job } from "@prisma/client";
import { generateCoverLetter } from "@/actions/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Copy, FileText } from "lucide-react";

interface CoverLetterDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CoverLetterDialog({
  job,
  open,
  onOpenChange,
}: CoverLetterDialogProps) {
  const [userContext, setUserContext] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!job) return;

    if (userContext.trim().length < 10) {
      toast.error("Please provide at least a brief description of your skills");
      return;
    }

    setLoading(true);
    setCoverLetter("");

    try {
      const result = await generateCoverLetter({
        jobId: job.id,
        userContext: userContext.trim(),
      });
      setCoverLetter(result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate cover letter"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      toast.success("Cover letter copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCoverLetter("");
      setUserContext("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Cover Letter
          </DialogTitle>
          <DialogDescription>
            {job
              ? `For ${job.title} at ${job.company}`
              : "Select a job to generate a cover letter"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {!coverLetter && (
            <div className="space-y-2">
              <Label htmlFor="userContext">
                Your Skills & Experience
              </Label>
              <textarea
                id="userContext"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Describe your relevant skills, experience, and what interests you about this role. For example: '5 years of React/TypeScript experience, led a team of 3 at a SaaS startup, passionate about developer tools...'"
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                disabled={loading}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                The more detail you provide, the more personalized the cover letter will be.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Generating your cover letter...
              </p>
            </div>
          )}

          {coverLetter && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Cover Letter</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <div className="rounded-md border bg-muted/50 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {coverLetter}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!coverLetter ? (
            <Button onClick={handleGenerate} disabled={loading || !userContext.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCoverLetter("");
                }}
              >
                Regenerate
              </Button>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
