"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Plus,
  CalendarIcon,
  Edit,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MaintenanceRecord } from "@/types/maintenance";
import type { Equipment } from "@/types/equipment";

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceRecord | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const router = useRouter();

  // Fetch maintenance data
  const { data: maintenanceResponse, isLoading: isLoadingMaintenance } =
    useQuery({
      queryKey: ["maintenance", statusFilter, typeFilter],
      queryFn: () =>
        api.maintenance.list({
          status: statusFilter !== "all" ? statusFilter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
        }),
    });

  const maintenanceData = maintenanceResponse?.data || [];

  // Fetch equipment list for dropdown
  const { data: equipmentResponse } = useQuery({
    queryKey: ["equipment-list"],
    queryFn: () => api.equipment.list({}),
  });

  const equipmentList = equipmentResponse?.data || [];

  // Filter maintenance data
  const filteredMaintenance = maintenanceData.filter(
    (maintenance: MaintenanceRecord) => {
      const matchesSearch =
        maintenance.equipment_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        maintenance.id
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        maintenance.technician
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesSearch;
    }
  );

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort maintenance data
  const sortedMaintenanceData = [...filteredMaintenance].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any = a[sortColumn as keyof MaintenanceRecord];
    let bValue: any = b[sortColumn as keyof MaintenanceRecord];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 inline" />
    );
  };

  // Calculate stats
  const stats = {
    scheduled: maintenanceData.filter(
      (m: MaintenanceRecord) => m.status === "scheduled"
    ).length,
    inProgress: maintenanceData.filter(
      (m: MaintenanceRecord) => m.status === "in-progress"
    ).length,
    completed: maintenanceData.filter(
      (m: MaintenanceRecord) => m.status === "completed"
    ).length,
    cancelled: maintenanceData.filter(
      (m: MaintenanceRecord) => m.status === "cancelled"
    ).length,
  };

  const MaintenanceForm = ({
    maintenance,
    isEdit = false,
  }: {
    maintenance?: MaintenanceRecord;
    isEdit?: boolean;
  }) => (
    <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="equipment">Equipment *</Label>
        <Select defaultValue={maintenance?.equipmentId?.toString()}>
          <SelectTrigger>
            <SelectValue placeholder="Select equipment" />
          </SelectTrigger>
          <SelectContent>
            {equipmentList.map((eq: Equipment) => (
              <SelectItem key={eq.id} value={eq.id.toString()}>
                EQ-{eq.id.toString().padStart(3, "0")} - {eq.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Maintenance Type *</Label>
        <Select defaultValue={maintenance?.type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preventive">Preventive</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="corrective">Corrective</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority *</Label>
        <Select defaultValue={maintenance?.priority}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="technician">Assign Technician *</Label>
        <Input
          id="technician"
          placeholder="Technician name"
          defaultValue={maintenance?.technician}
        />
      </div>
      <div className="space-y-2">
        <Label>Scheduled Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-transparent"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Estimated Duration</Label>
        <Input
          id="duration"
          placeholder="e.g., 2 hours"
          defaultValue={maintenance?.estimatedDuration}
        />
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter maintenance description and procedures"
          defaultValue={maintenance?.description}
        />
      </div>
    </div>
  );

  if (isLoadingMaintenance) {
    return <MaintenanceSkeleton />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Maintenance Management
              </h1>
              <Badge variant="secondary">{maintenanceData.length} tasks</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Maintenance</DialogTitle>
                  </DialogHeader>
                  <MaintenanceForm />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(false)}>
                      Schedule Maintenance
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-white"> 
                      Scheduled
                    </p>
                    <p className="text-2xl font-bold">{stats.scheduled}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-white">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                  <Play className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-white">
                      Completed
                    </p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-white ">
                      Cancelled
                    </p>
                    <p className="text-2xl font-bold">{stats.cancelled}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search maintenance tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("equipment_name")}
                    >
                      Equipment {renderSortIcon("equipment_name")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("type")}
                    >
                      Type {renderSortIcon("type")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      Status {renderSortIcon("status")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("priority")}
                    >
                      Priority {renderSortIcon("priority")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("technician")}
                    >
                      Assigned To {renderSortIcon("technician")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("date")}
                    >
                      Scheduled Date {renderSortIcon("date")}
                    </TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMaintenanceData.length > 0 ? (
                    sortedMaintenanceData.map((maintenance) => (
                      <TableRow key={maintenance.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {maintenance.equipment_name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {maintenance.equipmentId
                                ? `EQ-${maintenance.equipmentId
                                    .toString()
                                    .padStart(3, "0")}`
                                : "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {maintenance.type
                            ? maintenance.type.charAt(0).toUpperCase() +
                              maintenance.type.slice(1)
                            : "Not Specified"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(maintenance.status || "unknown")}
                            <Badge
                              className={getStatusColor(
                                maintenance.status || "unknown"
                              )}
                            >
                              {maintenance.status
                                ? maintenance.status.charAt(0).toUpperCase() +
                                  maintenance.status.slice(1).replace("-", " ")
                                : "Unknown"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPriorityColor(
                              maintenance.priority || "medium"
                            )}
                          >
                            {maintenance.priority
                              ? maintenance.priority.charAt(0).toUpperCase() +
                                maintenance.priority.slice(1)
                              : "Medium"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>
                              {maintenance.technician || "Unassigned"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {maintenance.date
                            ? new Date(maintenance.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <Progress
                              value={maintenance.progress || 0}
                              className="w-16"
                            />
                            <span className="text-xs text-gray-600">
                              {maintenance.progress || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/maintenance/${maintenance.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {maintenance.status === "scheduled" && (
                              <Button variant="outline" size="sm">
                                Start
                              </Button>
                            )}
                            {maintenance.status === "in-progress" && (
                              <Button variant="outline" size="sm">
                                Complete
                              </Button>
                            )}

                            <Dialog
                              open={
                                isEditDialogOpen &&
                                selectedMaintenance?.id === maintenance.id
                              }
                              onOpenChange={setIsEditDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedMaintenance(maintenance)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Edit Maintenance - MT-
                                    {selectedMaintenance?.id
                                      .toString()
                                      .padStart(3, "0")}
                                  </DialogTitle>
                                </DialogHeader>
                                <MaintenanceForm
                                  maintenance={selectedMaintenance || undefined}
                                  isEdit={true}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => setIsEditDialogOpen(false)}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-10 text-gray-500"
                      >
                        No maintenance tasks found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
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

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return <Clock className="h-4 w-4" />;
    case "in-progress":
      return <Play className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <XCircle className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function MaintenanceSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
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
