"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Job, JobStatus } from "@prisma/client";
import { createJob, updateJob, deleteJob, updateJobOrder } from "@/actions/jobs";
import KanbanColumn from "./KanbanColumn";
import AddJobDialog from "./AddJobDialog";
import EditJobDialog from "./EditJobDialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSES: JobStatus[] = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

interface KanbanBoardProps {
  initialJobs: Job[];
}

export default function KanbanBoard({ initialJobs }: KanbanBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const getJobsByStatus = useCallback(
    (status: JobStatus) => {
      return jobs
        .filter((job) => job.status === status)
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

    const sourceStatus = source.droppableId as JobStatus;
    const destStatus = destination.droppableId as JobStatus;

    // Get current columns
    const sourceJobs = getJobsByStatus(sourceStatus);
    const destJobs =
      sourceStatus === destStatus
        ? sourceJobs
        : getJobsByStatus(destStatus);

    // Find the dragged job
    const draggedJob = jobs.find((j) => j.id === draggableId);
    if (!draggedJob) return;

    // Remove from source
    const newSourceJobs = sourceJobs.filter((j) => j.id !== draggableId);

    // Insert at destination
    const updatedDraggedJob = { ...draggedJob, status: destStatus };
    let newDestJobs: Job[];

    if (sourceStatus === destStatus) {
      newDestJobs = newSourceJobs;
      newDestJobs.splice(destination.index, 0, updatedDraggedJob);
    } else {
      newDestJobs = [...destJobs];
      newDestJobs.splice(destination.index, 0, updatedDraggedJob);
    }

    // Assign new order values
    const updatedJobs: { id: string; status: JobStatus; order: number }[] = [];

    newSourceJobs.forEach((job, idx) => {
      updatedJobs.push({ id: job.id, status: sourceStatus, order: idx });
    });

    if (sourceStatus !== destStatus) {
      newDestJobs.forEach((job, idx) => {
        updatedJobs.push({ id: job.id, status: destStatus, order: idx });
      });
    } else {
      newDestJobs.forEach((job, idx) => {
        updatedJobs.push({ id: job.id, status: destStatus, order: idx });
      });
    }

    // Optimistic update
    setJobs((prev) => {
      const updated = [...prev];
      updatedJobs.forEach((uj) => {
        const idx = updated.findIndex((j) => j.id === uj.id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], status: uj.status, order: uj.order };
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
    status: JobStatus;
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
      status?: JobStatus;
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
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
           <div className="flex gap-6 h-full min-w-[1000px] lg:min-w-0 lg:grid lg:grid-cols-4">
            {STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                jobs={getJobsByStatus(status)}
                onEdit={handleEdit}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      <AddJobDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onAdd={handleAddJob} 
      />
      
      <EditJobDialog
        job={editingJob}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleUpdateJob}
      />
    </div>
  );
}
