"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Calendar,
  ExternalLink,
  Building2,
  Trash2,
  Pencil,
} from "lucide-react";

interface JobCardProps {
  job: Job;
  index: number;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export default function JobCard({
  job,
  index,
  onEdit,
  onDelete,
}: JobCardProps) {
  const dateText = formatDistanceToNow(new Date(job.dateApplied), {
    addSuffix: true,
  });

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
            }`}
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

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={new Date(job.dateApplied).toLocaleDateString()}>
                  <Calendar className="h-3 w-3" />
                  <span>{dateText}</span>
                </div>
                {job.url && (
                  <Badge variant="secondary" className="px-1.5 py-0 h-5 font-normal text-[10px]">
                    Linked
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
