"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Job } from "@prisma/client";
import JobCard from "./JobCard";
import { cn } from "@/lib/utils";
import type { StatusColor } from "@/lib/status-colors";

interface KanbanColumnProps {
  statusId: string;
  label: string;
  colorConfig: StatusColor;
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({
  statusId,
  label,
  colorConfig,
  jobs,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex w-full flex-col rounded-xl border bg-card/50 shadow-sm h-full max-h-[calc(100vh-14rem)]">
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
