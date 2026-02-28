"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Job, JobStatus } from "@prisma/client";
import JobCard from "./JobCard";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  JobStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  APPLIED: {
    label: "Applied",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  INTERVIEW: {
    label: "Interview",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  OFFER: {
    label: "Offer",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50/50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50/50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
};

interface KanbanColumnProps {
  status: JobStatus;
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({
  status,
  jobs,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const config = statusConfig[status];

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl border bg-card/50 shadow-sm lg:w-full h-full max-h-[calc(100vh-14rem)]">
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-3 rounded-t-xl sticky top-0 bg-background/95 backdrop-blur z-10",
          config.borderColor
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", config.bgColor.replace("bg-", "bg-opacity-100 bg-").replace("/50", "").replace("/20", ""))}></div>
          <h3 className={cn("font-semibold text-sm", config.color)}>
            {config.label}
          </h3>
          <Badge
            variant="secondary"
            className="ml-auto h-5 px-1.5 text-[10px] font-mono"
          >
            {jobs.length}
          </Badge>
        </div>
      </div>
      
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 overflow-y-auto p-3 transition-colors h-full scrollbar-hide",
              snapshot.isDraggingOver ? "bg-accent/50" : "",
              config.bgColor
            )}
          >
            <div className="flex flex-col gap-3 min-h-[150px]">
              {jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {provided.placeholder}
              
              {jobs.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/10 p-4">
                  <p className="text-xs text-muted-foreground text-center">Drag jobs here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
