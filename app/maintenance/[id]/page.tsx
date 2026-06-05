"use client";

import { use, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ArrowLeft,
  Play,
  CheckCircle,
  User,
  DollarSign,
  Camera,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MaintenanceRecord } from "@/types/maintenance";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ChecklistItem = {
  id: number;
  itemDescription: string | null;
  isCompleted: number | null;
};

type MaintenanceNote = {
  id: number;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
};

type MaintenancePart = {
  id: number;
  partName: string | null;
  partNumber: string | null;
  quantity: number | null;
  cost: string | number | null;
  supplier: string | null;
};

type MaintenancePhoto = {
  id: number;
  photoUrl: string | null;
  description: string | null;
  createdAt: string;
};

export default function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const maintenanceId = parseInt(id);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newPart, setNewPart] = useState({ part: "", quantity: "", cost: "" });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: maintenance, isLoading } = useQuery<MaintenanceRecord | undefined>(
    {
      queryKey: ["maintenance", maintenanceId],
      queryFn: () => api.maintenance.getById(maintenanceId),
    }
  );

  const { data: checklist = [], isLoading: isLoadingChecklist } = useQuery<
    ChecklistItem[]
  >({
    queryKey: ["maintenance", maintenanceId, "checklist"],
    queryFn: () => api.maintenanceChecklist.list(maintenanceId),
    enabled: !!maintenanceId,
  });

  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<
    MaintenanceNote[]
  >({
    queryKey: ["maintenance", maintenanceId, "notes"],
    queryFn: () => api.maintenance.listNotes(maintenanceId),
    enabled: !!maintenanceId,
  });

  const { data: partsUsed = [], isLoading: isLoadingParts } = useQuery<
    MaintenancePart[]
  >({
    queryKey: ["maintenance", maintenanceId, "parts"],
    queryFn: () => api.maintenance.listParts(maintenanceId),
    enabled: !!maintenanceId,
  });

  const { data: photos = [], isLoading: isLoadingPhotos } = useQuery<
    MaintenancePhoto[]
  >({
    queryKey: ["maintenance", maintenanceId, "photos"],
    queryFn: () => api.maintenance.listPhotos(maintenanceId),
    enabled: !!maintenanceId,
  });

  const invalidateMaintenance = () => {
    queryClient.invalidateQueries({ queryKey: ["maintenance", maintenanceId] });
    queryClient.invalidateQueries({ queryKey: ["maintenance"] });
  };

  const handleDeleteMaintenance = async () => {
    setIsDeleting(true);
    try {
      await api.maintenance.delete(maintenanceId);
      await queryClient.invalidateQueries({ queryKey: ["maintenance", maintenanceId] });
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      await queryClient.invalidateQueries({ queryKey: ["maintenanceHistory"] });
      await queryClient.invalidateQueries({ queryKey: ["maintenanceRequests"] });
      await queryClient.invalidateQueries({ queryKey: ["upcomingMaintenance"] });
      await queryClient.invalidateQueries({ queryKey: ["healthStats"] });
      toast.success("Maintenance record deleted");
      setIsDeleteDialogOpen(false);
      router.push("/maintenance");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete maintenance record"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setIsUpdatingStatus(true);
    try {
      await api.maintenance.update(maintenanceId, { status });
      invalidateMaintenance();
      toast.success(`Status updated to ${status.replace("-", " ")}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleChecklistItem = async (item: ChecklistItem) => {
    try {
      await api.maintenanceChecklist.toggleComplete(
        maintenanceId,
        item.id,
        !item.isCompleted
      );
      queryClient.invalidateQueries({
        queryKey: ["maintenance", maintenanceId, "checklist"],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update checklist"
      );
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      await api.maintenance.createNote(maintenanceId, {
        note: newNote.trim(),
        createdBy: maintenance?.technician || undefined,
      });
      setNewNote("");
      queryClient.invalidateQueries({
        queryKey: ["maintenance", maintenanceId, "notes"],
      });
      toast.success("Note added");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add note"
      );
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAddPart = async () => {
    if (!newPart.part.trim()) return;
    setIsAddingPart(true);
    try {
      await api.maintenance.createPart(maintenanceId, {
        partName: newPart.part.trim(),
        quantity: newPart.quantity ? Number(newPart.quantity) : 1,
        cost: newPart.cost ? Number(newPart.cost) : undefined,
      });
      setNewPart({ part: "", quantity: "", cost: "" });
      queryClient.invalidateQueries({
        queryKey: ["maintenance", maintenanceId, "parts"],
      });
      toast.success("Part added");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add part"
      );
    } finally {
      setIsAddingPart(false);
    }
  };

  if (isLoading) {
    return <MaintenanceDetailSkeleton />;
  }

  if (!maintenance) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Maintenance Task Not Found</h1>
        <Link href="/maintenance">
          <Button className="mt-4">Back to Maintenance</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const completedTasks = checklist.filter((item) => item.isCompleted).length;
  const progress =
    checklist.length > 0
      ? Math.round((completedTasks / checklist.length) * 100)
      : maintenance.progress ?? 0;

  const partsCost = partsUsed.reduce((sum, part) => {
    const unitCost = Number(part.cost ?? 0);
    const qty = Number(part.quantity ?? 1);
    return sum + unitCost * qty;
  }, 0);

  const totalCost = maintenance.cost ? Number(maintenance.cost) : partsCost;
  const laborCost = Math.max(0, totalCost - partsCost);

  const scheduledDate = maintenance.scheduledDate || maintenance.date;
  const allNotes = [
    ...notes,
    ...(maintenance.notes &&
    !notes.some((n) => n.note === maintenance.notes)
      ? [
          {
            id: -1,
            note: maintenance.notes,
            createdBy: maintenance.technician || "Technician",
            createdAt: maintenance.createdAt,
          },
        ]
      : []),
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/maintenance">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Maintenance
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {maintenance.type
                  ? maintenance.type.charAt(0).toUpperCase() +
                    maintenance.type.slice(1)
                  : "Unknown"}{" "}
                Maintenance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                MT-{maintenance.id.toString().padStart(3, "0")} •{" "}
                {maintenance.equipment_name || "Unknown Equipment"}
              </p>
            </div>
            <Badge className={getStatusColor(maintenance.status || "unknown")}>
              {maintenance.status
                ? maintenance.status.charAt(0).toUpperCase() +
                  maintenance.status.slice(1).replace("-", " ")
                : "Unknown"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {maintenance.status === "in-progress" && (
              <Button
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange("completed")}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Task
              </Button>
            )}
            {maintenance.status === "scheduled" && (
              <Button
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange("in-progress")}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Task
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete maintenance record</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                {maintenance
                  ? `MT-${maintenance.id
                      .toString()
                      .padStart(3, "0")} - ${
                      maintenance.equipment_name || "this record"
                    }`
                  : "this record"}{" "}
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMaintenance}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-200 mb-2">
                  Progress
                </p>
                <div className="flex items-center space-x-3">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-lg font-bold">{progress}%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {checklist.length > 0
                    ? `${completedTasks} of ${checklist.length} tasks completed`
                    : "Based on maintenance record progress"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
                  Assigned Technician
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium">
                    {maintenance.technician || "Unassigned"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
                  Scheduled Date
                </p>
                <p className="font-medium">
                  {scheduledDate
                    ? new Date(scheduledDate).toLocaleDateString()
                    : "N/A"}
                </p>
                {maintenance.completedDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Completed:{" "}
                    {new Date(maintenance.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
                  Total Cost
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-lg">
                    GHS {totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="checklist" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="parts">Parts & Costs</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingChecklist ? (
                  <Skeleton className="h-32 w-full" />
                ) : checklist.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>No checklist items for this maintenance task.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-3 p-4 border rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(item.isCompleted)}
                          className="h-5 w-5 mt-1"
                          onChange={() => handleToggleChecklistItem(item)}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              item.isCompleted
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {item.itemDescription}
                          </p>
                        </div>
                        {item.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter maintenance notes..."
                    value={newNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewNote(e.target.value)
                    }
                    rows={3}
                  />
                  <Button onClick={handleAddNote} disabled={isAddingNote}>
                    {isAddingNote ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Note"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNotes ? (
                  <Skeleton className="h-24 w-full" />
                ) : allNotes.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>No notes available</p>
                    <p className="text-sm mt-2">
                      Add notes to track maintenance progress
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">
                            {note.createdBy || "Technician"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Parts Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="part">Part Name</Label>
                    <Input
                      id="part"
                      placeholder="Enter part name"
                      value={newPart.part}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPart({ ...newPart, part: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Qty"
                      value={newPart.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPart({ ...newPart, quantity: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Unit Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="GHS 0.00"
                      value={newPart.cost}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPart({ ...newPart, cost: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddPart} disabled={isAddingPart}>
                      {isAddingPart ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Part"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parts Used</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingParts ? (
                  <Skeleton className="h-32 w-full" />
                ) : partsUsed.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <p>No parts recorded for this maintenance task.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part Name</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partsUsed.map((part) => {
                        const unitCost = Number(part.cost ?? 0);
                        const qty = Number(part.quantity ?? 1);
                        return (
                          <TableRow key={part.id}>
                            <TableCell className="font-medium">
                              {part.partName}
                            </TableCell>
                            <TableCell>{part.supplier || "—"}</TableCell>
                            <TableCell>{qty}</TableCell>
                            <TableCell>GHS {unitCost.toFixed(2)}</TableCell>
                            <TableCell>
                              GHS {(unitCost * qty).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Labor Cost:</span>
                    <span className="font-medium">
                      GHS {laborCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parts Cost:</span>
                    <span className="font-medium">
                      GHS {partsCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total Cost:</span>
                    <span>GHS {totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Maintenance Photos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPhotos ? (
                  <Skeleton className="h-32 w-full" />
                ) : photos.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Camera className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                    <p>No photos uploaded for this maintenance task.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="border rounded-lg p-4 text-center"
                      >
                        {photo.photoUrl ? (
                          <img
                            src={photo.photoUrl}
                            alt={photo.description || "Maintenance photo"}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="font-medium">
                          {photo.description || "Maintenance photo"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(photo.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Task ID
                      </p>
                      <p className="font-medium">
                        MT-{maintenance.id.toString().padStart(3, "0")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Equipment
                      </p>
                      <p className="font-medium">
                        {maintenance.equipment_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Type</p>
                      <p className="font-medium">
                        {maintenance.type
                          ? maintenance.type.charAt(0).toUpperCase() +
                            maintenance.type.slice(1)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Department
                      </p>
                      <p className="font-medium">
                        {maintenance.department || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Scheduled Date
                      </p>
                      <p className="font-medium">
                        {scheduledDate
                          ? new Date(scheduledDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Priority
                      </p>
                      <p className="font-medium">
                        {maintenance.priority || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {maintenance.description ||
                      "No description provided for this maintenance task."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MaintenanceDetailSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
