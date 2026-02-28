"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from "@prisma/client";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";
import {
  MoreHorizontal,
  Calendar,
  ExternalLink,
  Building2,
  Trash2,
  Pencil,
  FileText,
  Brain,
  StickyNote,
  Clock,
  Users,
} from "lucide-react";

// Extended job type to handle fields that may not be in the base Prisma type cache
type JobWithExtras = Job & {
  aiSummary?: string | null;
  notes?: string | null;
  tags?: string[];
  _count?: { contacts?: number };
};

interface JobCardProps {
  job: Job;
  index: number;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onGenerateCoverLetter: (job: Job) => void;
  onAnalyze: (job: Job) => void;
}

export default function JobCard({
  job,
  index,
  onEdit,
  onDelete,
  onGenerateCoverLetter,
  onAnalyze,
}: JobCardProps) {
  const extJob = job as JobWithExtras;

  const dateText = formatDistanceToNow(new Date(job.dateApplied), {
    addSuffix: true,
  });

  const hasAiSummary = !!extJob.aiSummary;
  const hasNotes = !!extJob.notes;
  const tags = extJob.tags || [];
  const contactCount = extJob._count?.contacts || 0;

  // Stale calculation: >14 days since last update = red, >7 days = amber
  const daysSinceUpdate = differenceInDays(new Date(), new Date(job.updatedAt));
  const isVeryStale = daysSinceUpdate > 14;
  const isStale = daysSinceUpdate > 7;

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
        >
          <Card
            className={`group relative overflow-hidden transition-all hover:shadow-md ${
              snapshot.isDragging
                ? "shadow-lg ring-2 ring-primary/20 rotate-2 opacity-90"
                : "shadow-sm"
            } ${isVeryStale ? "border-red-300 dark:border-red-800" : isStale ? "border-amber-300 dark:border-amber-800" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1.5">
                  <h4 className="font-semibold leading-none tracking-tight">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[140px] font-medium">
                      {job.company}
                    </span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(job)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {job.url && (
                      <DropdownMenuItem asChild>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Link
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAnalyze(job)}>
                      <Users className="mr-2 h-4 w-4" />
                      Contacts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onGenerateCoverLetter(job)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAnalyze(job)}>
                      <Brain className="mr-2 h-4 w-4" />
                      AI Analyze
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(job.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="px-1.5 py-0 h-5 font-normal text-[10px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 h-5 font-normal text-[10px]"
                    >
                      +{tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={format(new Date(job.dateApplied), "MMM d, yyyy")}>
                  <Calendar className="h-3 w-3" />
                  <span>{dateText}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isStale && (
                    <span title={`No updates in ${daysSinceUpdate} days`}>
                      <Clock
                        className={`h-3.5 w-3.5 ${isVeryStale ? "text-red-500" : "text-amber-500"}`}
                      />
                    </span>
                  )}
                  {hasNotes && (
                    <span title="Has notes">
                      <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  )}
                  {contactCount > 0 && (
                    <span title={`${contactCount} contact(s)`}>
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  )}
                  {hasAiSummary && (
                    <Badge variant="secondary" className="px-1.5 py-0 h-5 font-normal text-[10px] gap-1">
                      <Brain className="h-2.5 w-2.5" />
                      AI
                    </Badge>
                  )}
                  {job.url && (
                    <Badge variant="secondary" className="px-1.5 py-0 h-5 font-normal text-[10px]">
                      Linked
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
