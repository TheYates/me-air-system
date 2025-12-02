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
  Edit,
  Play,
  CheckCircle,
  User,
  DollarSign,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MaintenanceRecord } from "@/types/maintenance";

export default function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const maintenanceId = parseInt(id);
  const [newNote, setNewNote] = useState("");
  const [newPart, setNewPart] = useState({ part: "", quantity: "", cost: "" });

  // Fetch maintenance details
  const { data: maintenance, isLoading } = useQuery<MaintenanceRecord | undefined>({
    queryKey: ["maintenance", maintenanceId],
    queryFn: () => api.maintenance.getById(maintenanceId.toString()),
  });

  // Mock data for features not yet in backend
  const mockChecklist = [
    {
      item: "Initial inspection and assessment",
      completed: true,
      notes: "Completed initial visual inspection",
    },
    {
      item: "Perform required maintenance tasks",
      completed: false,
      notes: "",
    },
    {
      item: "Test equipment functionality",
      completed: false,
      notes: "",
    },
    { item: "Document all work performed", completed: false, notes: "" },
  ];

  const mockPartsUsed = [
    {
      part: "Standard Maintenance Kit",
      quantity: 1,
      unitCost: 50.0,
      totalCost: 50.0,
      supplier: "MaintenancePro",
    },
  ];

  const mockPhotos = [
    { name: "Equipment Photo", timestamp: new Date().toLocaleString() },
  ];

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

  // Calculate progress based on checklist
  const completedTasks = mockChecklist.filter((item) => item.completed).length;
  const progress = Math.round((completedTasks / mockChecklist.length) * 100);

  // Calculate costs
  const partsCost = mockPartsUsed.reduce(
    (sum, part) => sum + part.totalCost,
    0
  );
  const laborCost = maintenance.cost ? Number(maintenance.cost) - partsCost : 0;
  const totalCost = maintenance.cost ? Number(maintenance.cost) : partsCost;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/maintenance">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Maintenance
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {maintenance.type
                    ? maintenance.type.charAt(0).toUpperCase() +
                      maintenance.type.slice(1)
                    : "Unknown"}{" "}
                  Maintenance
                </h1>
                <p className="text-gray-600">
                  MT-{maintenance.id.toString().padStart(3, "0")} •{" "}
                  {maintenance.equipment_name || "Unknown Equipment"}
                </p>
              </div>
              <Badge
                className={getStatusColor(maintenance.status || "unknown")}
              >
                {maintenance.status
                  ? maintenance.status.charAt(0).toUpperCase() +
                    maintenance.status.slice(1).replace("-", " ")
                  : "Unknown"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {maintenance.status === "in-progress" && (
                <Button size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Task
                </Button>
              )}
              {maintenance.status === "scheduled" && (
                <Button size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Task
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Progress
                  </p>
                  <div className="flex items-center space-x-3">
                    <Progress value={progress} className="flex-1" />
                    <span className="text-lg font-bold">{progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedTasks} of {mockChecklist.length} tasks completed
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Assigned Technician
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {maintenance.technician || "Unassigned"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Scheduled Date
                  </p>
                  <p className="font-medium">
                    {maintenance.date
                      ? new Date(maintenance.date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {maintenance.status === "in-progress" && (
                    <p className="text-xs text-gray-500">
                      Started: {new Date(maintenance.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
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

          {/* Main Content Tabs */}
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
                  <div className="space-y-4">
                    {mockChecklist.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-4 border rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          className="h-5 w-5 mt-1"
                          onChange={() => {}}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              item.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {item.item}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.notes}
                            </p>
                          )}
                          {!item.completed && (
                            <div className="mt-2">
                              <Textarea
                                placeholder="Add notes for this task..."
                                className="text-sm"
                                rows={2}
                              />
                              <Button size="sm" className="mt-2">
                                Save Note
                              </Button>
                            </div>
                          )}
                        </div>
                        {item.completed && (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
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
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button>Add Note</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenance.notes ? (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">
                            {maintenance.technician || "Technician"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              maintenance.date || Date.now()
                            ).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{maintenance.notes}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p>No notes available</p>
                      <p className="text-sm mt-2">
                        Add notes to track maintenance progress
                      </p>
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
                      <Button>Add Part</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Parts Used</CardTitle>
                </CardHeader>
                <CardContent>
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
                      {mockPartsUsed.map((part, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {part.part}
                          </TableCell>
                          <TableCell>{part.supplier}</TableCell>
                          <TableCell>{part.quantity}</TableCell>
                          <TableCell>GHS {part.unitCost.toFixed(2)}</TableCell>
                          <TableCell>GHS {part.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                    <Button size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 text-center"
                      >
                        <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium">{photo.name}</p>
                        <p className="text-sm text-gray-600">
                          {photo.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
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
                        <p className="text-sm font-medium text-gray-600">
                          Type
                        </p>
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
                          {maintenance.date
                            ? new Date(maintenance.date).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Started
                        </p>
                        <p className="font-medium">
                          {maintenance.status === "in-progress" &&
                          maintenance.date
                            ? new Date(maintenance.date).toLocaleDateString()
                            : "Not started"}
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
    </div>
  );
}
