"use client";

import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Draggable } from "@hello-pangea/dnd";
import { Job } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getColorByName } from "@/lib/status-colors";
import { cn } from "@/lib/utils";
import { Droppable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  Brain,
  StickyNote,
  Users,
  ExternalLink,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

const DEMO_STATUSES = [
  { id: "applied", name: "APPLIED", label: "Applied", color: "blue", order: 0 },
  { id: "interview", name: "INTERVIEW", label: "Interview", color: "amber", order: 1 },
  { id: "offer", name: "OFFER", label: "Offer", color: "green", order: 2 },
];

type DemoJob = Job & { tags?: string[]; _count?: { contacts: number } };

const INITIAL_DEMO_JOBS: DemoJob[] = [
  {
    id: "1",
    userId: "demo",
    company: "TechCorp Inc.",
    title: "Senior Frontend Developer",
    status: "INTERVIEW",
    statusId: "interview",
    order: 0,
    dateApplied: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    url: "https://example.com/job/1",
    notes: "Had a great phone screen with HR. Moving to technical round.",
    aiSummary: "Senior role requiring 5+ years experience. Strong emphasis on system design.",
    tags: ["React", "TypeScript", "Remote"],
    _count: { contacts: 2 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "demo",
    company: "StartupXYZ",
    title: "Full Stack Engineer",
    status: "INTERVIEW",
    statusId: "interview",
    order: 1,
    dateApplied: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    url: "https://example.com/job/2",
    notes: null,
    aiSummary: null,
    tags: ["Node.js", "React", "PostgreSQL"],
    _count: { contacts: 1 },
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    userId: "demo",
    company: "BigTech Co.",
    title: "Software Engineer II",
    status: "APPLIED",
    statusId: "applied",
    order: 0,
    dateApplied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    url: "https://example.com/job/3",
    notes: null,
    aiSummary: null,
    tags: ["Python", "AWS"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    userId: "demo",
    company: "CloudScale",
    title: "DevOps Engineer",
    status: "APPLIED",
    statusId: "applied",
    order: 1,
    dateApplied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    url: null,
    notes: null,
    aiSummary: null,
    tags: ["Kubernetes", "Docker", "Terraform"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    userId: "demo",
    company: "DataFlow",
    title: "Backend Developer",
    status: "APPLIED",
    statusId: "applied",
    order: 2,
    dateApplied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    url: "https://example.com/job/5",
    notes: null,
    aiSummary: null,
    tags: ["Go", "Kafka", "Redis"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    userId: "demo",
    company: "InnovateTech",
    title: "React Developer",
    status: "OFFER",
    statusId: "offer",
    order: 0,
    dateApplied: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    url: "https://example.com/job/6",
    notes: "They made an offer! Salary negotiation in progress.",
    aiSummary: "Startup with equity. Fast-paced environment, great culture.",
    tags: ["React", "Next.js", "Tailwind"],
    _count: { contacts: 3 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function DemoJobCard({
  job,
  index,
}: {
  job: DemoJob;
  index: number;
}) {
  const dateText = format(new Date(job.dateApplied), "MMM d, yyyy");
  const hasAiSummary = !!job.aiSummary;
  const hasNotes = !!job.notes;
  const tags = job.tags || [];
  const contactCount = job._count?.contacts || 0;

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
            className={cn(
              "group relative overflow-hidden transition-all hover:shadow-md shadow-sm",
              snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 rotate-2 opacity-90"
            )}
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
              </div>

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
                <div
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  title={dateText}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{dateText}</span>
                </div>
                <div className="flex items-center gap-1">
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
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 h-5 font-normal text-[10px] gap-1"
                    >
                      <Brain className="h-2.5 w-2.5" />
                      AI
                    </Badge>
                  )}
                  {job.url && (
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 h-5 font-normal text-[10px]"
                    >
                      <ExternalLink className="h-2.5 w-2.5 mr-1" />
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

function DemoColumn({
  statusId,
  label,
  colorConfig,
  jobs,
}: {
  statusId: string;
  label: string;
  colorConfig: ReturnType<typeof getColorByName>;
  jobs: DemoJob[];
}) {
  return (
    <div className="flex w-full flex-col rounded-xl border bg-card/50 shadow-sm h-full max-h-[calc(100vh-18rem)]">
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-3 rounded-t-xl sticky top-0 bg-background/95 backdrop-blur z-10",
          colorConfig.borderColor
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", colorConfig.dotColor)} />
          <h3 className={cn("font-semibold text-sm", colorConfig.color)}>
            {label}
          </h3>
          <Badge
            variant="secondary"
            className="ml-auto h-5 px-1.5 text-[10px] font-mono"
          >
            {jobs.length}
          </Badge>
        </div>
      </div>

      <Droppable droppableId={statusId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 overflow-y-auto p-3 transition-colors h-full scrollbar-hide",
              snapshot.isDraggingOver ? "bg-accent/50" : "",
              colorConfig.bgColor
            )}
          >
            <div className="flex flex-col gap-3 min-h-[150px]">
              {jobs.map((job, index) => (
                <DemoJobCard key={job.id} job={job} index={index} />
              ))}
              {provided.placeholder}

              {jobs.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/10 p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Drag jobs here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function DemoBoard() {
  const [jobs, setJobs] = useState<DemoJob[]>(INITIAL_DEMO_JOBS);

  const getJobsByStatusId = (statusId: string) => {
    return jobs
      .filter((job) => job.statusId === statusId)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStatusId = source.droppableId;
    const destStatusId = destination.droppableId;

    const sourceJobs = getJobsByStatusId(sourceStatusId);
    const destJobs =
      sourceStatusId === destStatusId
        ? sourceJobs
        : getJobsByStatusId(destStatusId);

    const draggedJob = jobs.find((j) => j.id === draggableId);
    if (!draggedJob) return;

    const newSourceJobs = sourceJobs.filter((j) => j.id !== draggableId);
    let newDestJobs: DemoJob[];

    const updatedDraggedJob = { ...draggedJob, statusId: destStatusId };

    if (sourceStatusId === destStatusId) {
      newDestJobs = [...newSourceJobs];
      newDestJobs.splice(destination.index, 0, updatedDraggedJob);
    } else {
      newDestJobs = [...destJobs];
      newDestJobs.splice(destination.index, 0, updatedDraggedJob);
    }

    const updatedJobs: { id: string; statusId: string; order: number }[] = [];

    newSourceJobs.forEach((job, idx) => {
      updatedJobs.push({ id: job.id, statusId: sourceStatusId, order: idx });
    });

    newDestJobs.forEach((job, idx) => {
      updatedJobs.push({ id: job.id, statusId: destStatusId, order: idx });
    });

    setJobs((prev) => {
      const updated = [...prev];
      updatedJobs.forEach((uj) => {
        const idx = updated.findIndex((j) => j.id === uj.id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], statusId: uj.statusId, order: uj.order };
        }
      });
      return updated;
    });
  };

  const handleReset = () => {
    setJobs(INITIAL_DEMO_JOBS);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job applications and track your progress.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="text-sm text-muted-foreground mr-2 hidden sm:block whitespace-nowrap">
            <span className="font-medium text-foreground">{jobs.length}</span>{" "}
            Jobs
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Demo
          </Button>
          <Button disabled>
            <Sparkles className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-4 mb-2">
        <strong>Interactive Demo:</strong> Try dragging and dropping job cards between columns!
        Sign up for free to unlock all features including AI analysis, notes, contacts, and more.
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 pb-4 h-full">
          <div
            className="flex flex-col lg:grid gap-6 h-full"
            style={{
              gridTemplateColumns: `repeat(${DEMO_STATUSES.length}, 1fr)`,
            }}
          >
            {DEMO_STATUSES.map((s) => {
              const colorConfig = getColorByName(s.color);
              return (
                <DemoColumn
                  key={s.id}
                  statusId={s.id}
                  label={s.label}
                  colorConfig={colorConfig}
                  jobs={getJobsByStatusId(s.id)}
                />
              );
            })}
          </div>
        </div>
      </DragDropContext>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Want to keep your changes and access more features?
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/register">Create Free Account</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
