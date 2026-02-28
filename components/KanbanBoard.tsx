"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Job, Status } from "@prisma/client";
import { createJob, updateJob, deleteJob, updateJobOrder } from "@/actions/jobs";
import { getColorByName } from "@/lib/status-colors";
import KanbanColumn from "./KanbanColumn";
import AddJobDialog from "./AddJobDialog";
import EditJobDialog from "./EditJobDialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  initialJobs: Job[];
  statuses: Status[];
}

export default function KanbanBoard({ initialJobs, statuses }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const getJobsByStatusId = useCallback(
    (statusId: string) => {
      return jobs
        .filter((job) => job.statusId === statusId)
        .filter((job) => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return (
            job.company.toLowerCase().includes(query) ||
            job.title.toLowerCase().includes(query)
          );
        })
        .sort((a, b) => a.order - b.order);
    },
    [jobs, searchQuery]
  );

  const handleDragEnd = async (result: DropResult) => {
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

    // Get current columns
    const sourceJobs = getJobsByStatusId(sourceStatusId);
    const destJobs =
      sourceStatusId === destStatusId
        ? sourceJobs
        : getJobsByStatusId(destStatusId);

    // Find the dragged job
    const draggedJob = jobs.find((j) => j.id === draggableId);
    if (!draggedJob) return;

    // Remove from source
    const newSourceJobs = sourceJobs.filter((j) => j.id !== draggableId);

    // Insert at destination
    const updatedDraggedJob = { ...draggedJob, statusId: destStatusId };
    let newDestJobs: Job[];

    if (sourceStatusId === destStatusId) {
      newDestJobs = newSourceJobs;
      newDestJobs.splice(destination.index, 0, updatedDraggedJob);
    } else {
      newDestJobs = [...destJobs];
      newDestJobs.splice(destination.index, 0, updatedDraggedJob);
    }

    // Assign new order values
    const updatedJobs: { id: string; statusId: string; order: number }[] = [];

    newSourceJobs.forEach((job, idx) => {
      updatedJobs.push({ id: job.id, statusId: sourceStatusId, order: idx });
    });

    if (sourceStatusId !== destStatusId) {
      newDestJobs.forEach((job, idx) => {
        updatedJobs.push({ id: job.id, statusId: destStatusId, order: idx });
      });
    } else {
      newDestJobs.forEach((job, idx) => {
        updatedJobs.push({ id: job.id, statusId: destStatusId, order: idx });
      });
    }

    // Optimistic update
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

    // Persist to DB
    try {
      await updateJobOrder(updatedJobs);
    } catch {
      // Revert on error
      setJobs(initialJobs);
      toast.error("Failed to update job order");
    }
  };

  const handleAddJob = async (data: {
    company: string;
    title: string;
    statusId: string;
    url?: string;
    dateApplied?: string;
  }) => {
    const newJob = await createJob(data);
    setJobs((prev) => [...prev, newJob]);
    toast.success("Job added successfully");
    setAddDialogOpen(false);
  };

  const handleUpdateJob = async (
    id: string,
    data: {
      company?: string;
      title?: string;
      statusId?: string;
      url?: string;
      dateApplied?: string;
    }
  ) => {
    const updatedJob = await updateJob(id, data);
    setJobs((prev) => prev.map((j) => (j.id === id ? updatedJob : j)));
    toast.success("Job updated successfully");
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setEditDialogOpen(true);
  };

  const colCount = statuses.length;

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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company or title..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="text-sm text-muted-foreground mr-2 hidden sm:block whitespace-nowrap">
              <span className="font-medium text-foreground">{jobs.length}</span> Jobs
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 pb-4 h-full">
          <div
            className="flex flex-col lg:grid gap-6 h-full"
            style={{
              gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            }}
          >
            {statuses.map((s) => {
              const colorConfig = getColorByName(s.color);
              return (
                <KanbanColumn
                  key={s.id}
                  statusId={s.id}
                  label={s.label}
                  colorConfig={colorConfig}
                  jobs={getJobsByStatusId(s.id)}
                  onEdit={handleEdit}
                  onDelete={handleDeleteJob}
                />
              );
            })}
          </div>
        </div>
      </DragDropContext>

      <AddJobDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddJob}
        statuses={statuses}
      />

      <EditJobDialog
        job={editingJob}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleUpdateJob}
        statuses={statuses}
      />
    </div>
  );
}
