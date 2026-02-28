"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Status } from "@prisma/client";
import {
  createStatus,
  updateStatus,
  deleteStatus,
  reorderStatuses,
  reassignAndDeleteStatus,
} from "@/actions/statuses";
import { getColorByName } from "@/lib/status-colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface StatusManagerProps {
  initialStatuses: Status[];
}

export default function StatusManager({ initialStatuses }: StatusManagerProps) {
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
  const [newLabel, setNewLabel] = useState("");
  const [addingStatus, setAddingStatus] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStatus, setDeletingStatus] = useState<Status | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState("");
  const [jobCount, setJobCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleAddStatus = async () => {
    if (!newLabel.trim()) return;

    setLoading(true);
    try {
      const name = newLabel.trim().toUpperCase().replace(/\s+/g, "_");
      const status = await createStatus({ name, label: newLabel.trim() });
      setStatuses((prev) => [...prev, status]);
      setNewLabel("");
      setAddingStatus(false);
      toast.success("Status created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create status");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string) => {
    if (!editLabel.trim()) return;

    setLoading(true);
    try {
      const name = editLabel.trim().toUpperCase().replace(/\s+/g, "_");
      const updated = await updateStatus(id, { label: editLabel.trim(), name });
      setStatuses((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      toast.success("Status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (status: Status) => {
    // We need to check if there are jobs — we'll try to delete and catch the error
    setDeletingStatus(status);

    try {
      await deleteStatus(status.id);
      setStatuses((prev) => prev.filter((s) => s.id !== status.id));
      toast.success("Status deleted");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      // If jobs exist, show reassign dialog
      const match = msg.match(/(\d+) job\(s\)/);
      if (match) {
        setJobCount(parseInt(match[1]));
        // Set default reassign target to the first status that isn't the one being deleted
        const otherStatuses = statuses.filter((s) => s.id !== status.id);
        setReassignTargetId(otherStatuses[0]?.id ?? "");
        setDeleteDialogOpen(true);
      } else {
        toast.error(msg || "Failed to delete status");
        setDeletingStatus(null);
      }
    }
  };

  const handleReassignAndDelete = async () => {
    if (!deletingStatus || !reassignTargetId) return;

    setLoading(true);
    try {
      await reassignAndDeleteStatus(deletingStatus.id, reassignTargetId);
      setStatuses((prev) => prev.filter((s) => s.id !== deletingStatus.id));
      setDeleteDialogOpen(false);
      setDeletingStatus(null);
      toast.success("Jobs reassigned and status deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reassign jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const newStatuses = Array.from(statuses);
    const [movedStatus] = newStatuses.splice(sourceIndex, 1);
    newStatuses.splice(destIndex, 0, movedStatus);

    setStatuses(newStatuses);

    try {
      await reorderStatuses(newStatuses.map((s) => s.id));
    } catch {
      setStatuses(statuses); // revert
      toast.error("Failed to reorder statuses");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Statuses (Max 6)</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Add, edit, reorder, or remove statuses. Each status becomes a column on your Kanban board.
              </p>
            </div>
            {!addingStatus && (
              <Button
                onClick={() => setAddingStatus(true)}
                size="sm"
                disabled={statuses.length >= 6}
                title={
                  statuses.length >= 6
                    ? "Maximum of 6 statuses allowed"
                    : "Add a new status"
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Status
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="statuses">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {statuses.map((status, index) => {
                    const colorConfig = getColorByName(status.color);
                    const isEditing = editingId === status.id;

                    return (
                      <Draggable
                        key={status.id}
                        draggableId={status.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-accent/50 transition-colors",
                              snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 opacity-90 z-50 bg-background"
                            )}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>

                            <div
                              className={cn(
                                "w-3 h-3 rounded-full shrink-0",
                                colorConfig.dotColor
                              )}
                            />

                            {isEditing ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editLabel}
                                  onChange={(e) => setEditLabel(e.target.value)}
                                  className="h-8"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleUpdateStatus(status.id);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => handleUpdateStatus(status.id)}
                                  disabled={loading}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => setEditingId(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <span
                                    className={cn(
                                      "font-medium text-sm",
                                      colorConfig.color
                                    )}
                                  >
                                    {status.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({status.name})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setEditingId(status.id);
                                      setEditLabel(status.label);
                                    }}
                                    title="Edit status"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteClick(status)}
                                    title="Delete status"
                                    disabled={statuses.length <= 1}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add new status form */}
          {addingStatus && (
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-3 bg-muted/30">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30 shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <Label htmlFor="new-status" className="sr-only">
                    New status label
                  </Label>
                  <Input
                    id="new-status"
                    placeholder="e.g. Phone Screen, Take Home, Final Round..."
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="h-8"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddStatus();
                      if (e.key === "Escape") {
                        setAddingStatus(false);
                        setNewLabel("");
                      }
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAddStatus}
                  disabled={loading || !newLabel.trim()}
                >
                  {loading ? "Adding..." : "Add"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingStatus(false);
                    setNewLabel("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassign & Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setDeletingStatus(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Jobs</DialogTitle>
            <DialogDescription>
              The status &quot;{deletingStatus?.label}&quot; has {jobCount} job(s) using it.
              Choose a status to move them to before deleting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>Move jobs to:</Label>
            <Select value={reassignTargetId} onValueChange={setReassignTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statuses
                  .filter((s) => s.id !== deletingStatus?.id)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReassignAndDelete}
              disabled={loading || !reassignTargetId}
            >
              {loading ? "Processing..." : "Reassign & Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
