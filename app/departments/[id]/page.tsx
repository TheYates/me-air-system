"use client";

import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { use } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast as sonnerToast } from "sonner";
import type { Department } from "@/types/department";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  Users,
  Package,
  Wrench,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Building,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Printer,
  Download,
  Eye,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";

// Mock data for demonstration - will be replaced with backend data
const mockDepartmentDetail = {
  id: "DEPT-001",
  name: "Manufacturing",
  manager: "Robert Johnson",
  email: "robert.johnson@company.com",
  phone: "+1 (555) 123-4567",
  equipmentCount: 89,
  activeMaintenanceCount: 12,
  totalValue: "$1,250,000",
  description:
    "Primary manufacturing operations including production lines and quality control. Responsible for the production of all company products with a focus on efficiency, quality, and safety standards.",
  subUnits: [
    {
      id: "SU-001",
      name: "Production Line A",
      equipmentCount: 34,
      status: "Operational",
      efficiency: 92,
    },
    {
      id: "SU-002",
      name: "Production Line B",
      equipmentCount: 28,
      status: "Operational",
      efficiency: 88,
    },
    {
      id: "SU-003",
      name: "Quality Control",
      equipmentCount: 15,
      status: "Operational",
      efficiency: 95,
    },
    {
      id: "SU-004",
      name: "Packaging",
      equipmentCount: 12,
      status: "Under Maintenance",
      efficiency: 78,
    },
  ],
  equipment: [
    {
      id: "EQ-001",
      name: "Industrial Printer A1",
      subUnit: "Production Line A",
      status: "Operational",
      lastMaintenance: "2023-12-01",
      nextMaintenance: "2024-01-15",
      value: "$15,000",
    },
    {
      id: "EQ-002",
      name: "Conveyor Belt System",
      subUnit: "Production Line A",
      status: "Operational",
      lastMaintenance: "2023-11-20",
      nextMaintenance: "2024-01-20",
      value: "$25,000",
    },
    {
      id: "EQ-003",
      name: "Quality Scanner QS-100",
      subUnit: "Quality Control",
      status: "Under Maintenance",
      lastMaintenance: "2023-12-10",
      nextMaintenance: "2024-01-10",
      value: "$18,000",
    },
    {
      id: "EQ-004",
      name: "Packaging Machine PM-200",
      subUnit: "Packaging",
      status: "Operational",
      lastMaintenance: "2023-11-25",
      nextMaintenance: "2024-01-25",
      value: "$22,000",
    },
    {
      id: "EQ-005",
      name: "Assembly Robot AR-300",
      subUnit: "Production Line A",
      status: "Operational",
      lastMaintenance: "2023-12-05",
      nextMaintenance: "2024-01-30",
      value: "$45,000",
    },
    {
      id: "EQ-006",
      name: "Testing Equipment TE-400",
      subUnit: "Quality Control",
      status: "Operational",
      lastMaintenance: "2023-11-30",
      nextMaintenance: "2024-01-12",
      value: "$32,000",
    },
    {
      id: "EQ-007",
      name: "Labeling Machine LM-500",
      subUnit: "Packaging",
      status: "Operational",
      lastMaintenance: "2023-12-08",
      nextMaintenance: "2024-01-18",
      value: "$12,000",
    },
    {
      id: "EQ-008",
      name: "Sorting System SS-600",
      subUnit: "Production Line B",
      status: "Under Maintenance",
      lastMaintenance: "2023-12-12",
      nextMaintenance: "2024-01-05",
      value: "$28,000",
    },
    {
      id: "EQ-009",
      name: "Welding Station WS-700",
      subUnit: "Production Line A",
      status: "Operational",
      lastMaintenance: "2023-11-28",
      nextMaintenance: "2024-01-22",
      value: "$19,000",
    },
    {
      id: "EQ-010",
      name: "Inspection Camera IC-800",
      subUnit: "Quality Control",
      status: "Operational",
      lastMaintenance: "2023-12-03",
      nextMaintenance: "2024-01-14",
      value: "$24,000",
    },
    {
      id: "EQ-011",
      name: "Cutting Machine CM-900",
      subUnit: "Production Line B",
      status: "Operational",
      lastMaintenance: "2023-11-22",
      nextMaintenance: "2024-01-28",
      value: "$35,000",
    },
    {
      id: "EQ-012",
      name: "Polishing Unit PU-1000",
      subUnit: "Production Line B",
      status: "Operational",
      lastMaintenance: "2023-12-07",
      nextMaintenance: "2024-01-16",
      value: "$16,000",
    },
  ],
  maintenanceActivities: [
    {
      id: "MT-001",
      equipmentId: "EQ-001",
      equipmentName: "Industrial Printer A1",
      type: "Preventive",
      status: "Scheduled",
      scheduledDate: "2024-01-15",
      technician: "John Smith",
      priority: "Medium",
    },
    {
      id: "MT-002",
      equipmentId: "EQ-003",
      equipmentName: "Quality Scanner QS-100",
      type: "Repair",
      status: "In Progress",
      scheduledDate: "2024-01-10",
      technician: "Mike Davis",
      priority: "High",
    },
    {
      id: "MT-003",
      equipmentId: "EQ-004",
      equipmentName: "Packaging Machine PM-200",
      type: "Calibration",
      status: "Completed",
      scheduledDate: "2023-12-20",
      technician: "Sarah Johnson",
      priority: "Low",
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: "equipment",
      title: "New equipment added",
      description: "Industrial Printer A1 installed",
      timestamp: "2024-01-10 14:30",
      user: "Alice Cooper",
    },
    {
      id: 2,
      type: "maintenance",
      title: "Maintenance completed",
      description: "Quality Scanner QS-100 serviced",
      timestamp: "2024-01-09 11:15",
      user: "Mike Davis",
    },
    {
      id: 3,
      type: "equipment",
      title: "Equipment status updated",
      description: "Sorting System SS-600 under maintenance",
      timestamp: "2024-01-08 09:00",
      user: "Bob Wilson",
    },
    {
      id: 4,
      type: "maintenance",
      title: "Preventive maintenance scheduled",
      description: "Assembly Robot AR-300 maintenance planned",
      timestamp: "2024-01-05 16:45",
      user: "John Smith",
    },
  ],
};

export default function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const departmentId = parseInt(id);
  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddSubUnitDialogOpen, setIsAddSubUnitDialogOpen] = useState(false);
  const [isEditSubUnitDialogOpen, setIsEditSubUnitDialogOpen] = useState(false);
  const [isViewSubUnitDialogOpen, setIsViewSubUnitDialogOpen] = useState(false);
  const [selectedSubUnit, setSelectedSubUnit] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  // Handle URL parameters for tab navigation
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get("tab");
      if (tab && tab !== activeTab) {
        setActiveTab(tab);
        // Clear the URL parameter after a short delay to ensure tab is set
        setTimeout(() => {
          window.history.replaceState({}, "", window.location.pathname);
        }, 100);
      }
    }
  }, []); // Empty dependency array to run only once

  // Fetch department data from backend
  const { data: department, isLoading: isDepartmentLoading } =
    useQuery<Department>({
      queryKey: ["department", departmentId],
      queryFn: () => api.departments.getById(departmentId),
      enabled: !!departmentId,
    });

  // Fetch equipment for this department
  const { data: equipmentResponse, isLoading: isEquipmentLoading } = useQuery({
    queryKey: ["department-equipment", departmentId],
    queryFn: () => api.equipment.list({ department: departmentId }),
    enabled: !!departmentId,
  });

  const allEquipment = equipmentResponse?.data || [];

  // Fetch maintenance for this department
  const { data: maintenanceResponse } = useQuery({
    queryKey: ["department-maintenance", departmentId],
    queryFn: () => api.maintenance.list({}),
    enabled: !!departmentId,
  });

  const maintenanceData = maintenanceResponse?.data || [];

  const departmentMaintenance = maintenanceData.filter((m: any) =>
    allEquipment.some((eq: any) => eq.id === m.equipmentId)
  );

  // Get sub-units from department data
  const subUnitsFromDept = department?.sub_units || [];

  // Create sub-unit objects with equipment counts
  const subUnits = subUnitsFromDept.map((name: string) => {
    const equipmentCount = allEquipment.filter(
      (eq: any) => eq.subUnit === name
    ).length;
    return {
      id: name,
      name,
      equipmentCount,
      status: equipmentCount > 0 ? "Operational" : "Inactive",
    };
  });

  const [isSubUnitsModified, setIsSubUnitsModified] = useState(false);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort icon helper function
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  // Filter and sort equipment
  let filteredEquipment = allEquipment.filter(
    (eq: any) =>
      eq.name.toLowerCase().includes(equipmentSearchTerm.toLowerCase()) ||
      eq.id.toString().includes(equipmentSearchTerm) ||
      (eq.subUnit || "")
        .toLowerCase()
        .includes(equipmentSearchTerm.toLowerCase())
  );

  // Apply sorting
  if (sortField) {
    filteredEquipment = [...filteredEquipment].sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === "name") {
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      } else if (sortField === "subUnit") {
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      } else if (sortField === "status") {
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      } else if (sortField === "last_service_date" || sortField === "created_at") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (sortField === "purchase_cost") {
        aValue = Number(aValue || 0);
        bValue = Number(bValue || 0);
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  // Pagination for equipment
  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEquipment = filteredEquipment.slice(startIndex, endIndex);

  // Note: Sub-unit management would be handled through the backend API
  const handleAddSubUnit = (newSubUnit: any) => {
    // TODO: Call API to add sub-unit to department
    console.log("Add sub-unit:", newSubUnit);
    setIsAddSubUnitDialogOpen(false);
  };

  const handleEditSubUnit = (updatedSubUnit: any) => {
    // TODO: Call API to update sub-unit
    console.log("Edit sub-unit:", updatedSubUnit);
    setIsEditSubUnitDialogOpen(false);
    setSelectedSubUnit(null);
  };

  const handleDeleteSubUnit = (subUnitId: string) => {
    // TODO: Call API to delete sub-unit
    console.log("Delete sub-unit:", subUnitId);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "under maintenance":
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "broken":
        return "bg-red-100 text-red-800";
      case "retired":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Print function for equipment table
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tableHTML = `
      <html>
        <head>
          <title>Equipment List - ${department?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header-info { margin-bottom: 20px; }
            .header-info p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Equipment List</h1>
          <div class="header-info">
            <p><strong>Department:</strong> ${department?.name}</p>
            <p><strong>Manager:</strong> ${department?.manager || "N/A"}</p>
            <p><strong>Total Equipment:</strong> ${
              filteredEquipment.length
            } items</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Sub-unit</th>
                <th>Status</th>
                <th>Last Maintenance</th>
                <th>Next Maintenance</th>
                <th>Value (GHS)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEquipment
                .map(
                  (equipment: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${equipment.name}</td>
                  <td>${equipment.subUnit || "Not Specified"}</td>
                  <td>${equipment.status || "Unknown"}</td>
                  <td>${
                    equipment.last_service_date
                      ? new Date(
                          equipment.last_service_date
                        ).toLocaleDateString()
                      : "Not Set"
                  }</td>
                  <td>${
                    equipment.next_maintenance_date
                      ? new Date(
                          equipment.next_maintenance_date
                        ).toLocaleDateString()
                      : "Not Set"
                  }</td>
                  <td>${(equipment.purchase_cost || 0).toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  // Export to CSV function
  const handleExport = () => {
    const headers = [
      "#",
      "Name",
      "Sub-unit",
      "Status",
      "Last Maintenance",
      "Next Maintenance",
      "Value (GHS)",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredEquipment.map((equipment: any, index: number) =>
        [
          index + 1,
          `"${equipment.name}"`,
          `"${equipment.subUnit || "Not Specified"}"`,
          `"${equipment.status || "Unknown"}"`,
          `"${
            equipment.last_service_date
              ? new Date(equipment.last_service_date).toLocaleDateString()
              : "Not Set"
          }"`,
          `"${
            equipment.next_maintenance_date
              ? new Date(equipment.next_maintenance_date).toLocaleDateString()
              : "Not Set"
          }"`,
          equipment.purchase_cost || 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `equipment-list-${department?.name?.replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick status update function
  const handleStatusUpdate = async (equipmentId: number, newStatus: string) => {
    try {
      // Optimistically update the local cache
      const currentQueryKey = ["department-equipment", departmentId];
      const previousData = queryClient.getQueryData<any>(currentQueryKey);

      // Update the cache optimistically
      if (previousData && previousData.data) {
        queryClient.setQueryData(currentQueryKey, {
          ...previousData,
          data: previousData.data.map((item: any) =>
            item.id === equipmentId ? { ...item, status: newStatus } : item
          ),
        });
      }

      // Make the API call
      const response = await api.equipment.updateStatus(equipmentId, newStatus);

      // Update the cache with the server response to ensure consistency
      if (previousData && previousData.data) {
        queryClient.setQueryData(currentQueryKey, {
          ...previousData,
          data: previousData.data.map((item: any) =>
            item.id === equipmentId
              ? { ...item, status: response.status }
              : item
          ),
        });
      }

      // Also update the equipment detail query if it exists
      queryClient.setQueryData(["equipment", equipmentId], response);

      sonnerToast.success(
        `Status updated to ${
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
        }`,
        {
          description: "Equipment status has been successfully changed",
          duration: 3000,
        }
      );
    } catch (error) {
      // Revert the optimistic update on error
      queryClient.invalidateQueries({
        queryKey: ["equipment"],
      });

      sonnerToast.error("Failed to update status", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the status",
        duration: 4000,
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "equipment":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      case "staff":
        return <Users className="h-4 w-4 text-green-500" />;
      case "budget":
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isDepartmentLoading || isEquipmentLoading) {
    return <DepartmentDetailSkeleton />;
  }

  if (!department) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Department Not Found</h1>
          <Link href="/departments">
            <Button className="mt-4">Back to Departments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/departments">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Departments
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {department.name}
                </h1>
                <p className="text-gray-600">
                  DEPT-{department.id.toString().padStart(3, "0")} • Managed by{" "}
                  {department.manager || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Department
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      Edit Department - {department.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Department Name</Label>
                      <Input id="name" defaultValue={department.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager">Manager</Label>
                      <Input id="manager" defaultValue={department.manager} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={department.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue={department.phone} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        defaultValue={department.description}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsEditDialogOpen(false)}>
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Equipment
                    </p>
                    <p className="text-2xl font-bold">
                      {department.equipment_count || allEquipment.length}
                    </p>
                    <p className="text-xs text-gray-500">In this department</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Maintenance
                    </p>
                    <p className="text-2xl font-bold">
                      {department.active_maintenance_count ||
                        departmentMaintenance.filter(
                          (m: any) =>
                            m.status === "scheduled" ||
                            m.status === "in-progress"
                        ).length}
                    </p>
                    <p className="text-xs text-gray-500">
                      Scheduled & In Progress
                    </p>
                  </div>
                  <Wrench className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Equipment Value
                    </p>
                    <p className="text-2xl font-bold">
                      GHS{" "}
                      {(
                        department.total_value ||
                        allEquipment.reduce(
                          (sum: number, eq: any) =>
                            sum + (eq.purchase_cost || 0),
                          0
                        )
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total asset value</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subunits">Sub-units</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5" />
                      <span>Department Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Department ID
                        </p>
                        <p className="font-medium">
                          DEPT-{department.id.toString().padStart(3, "0")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Manager
                        </p>
                        <p className="font-medium">
                          {department.manager || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Sub-Units
                        </p>
                        <p className="font-medium">{subUnits.length}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Equipment
                        </p>
                        <p className="font-medium">
                          {allEquipment.length} items
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Contact Information
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{department.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{department.phone || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Equipment Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Equipment
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {allEquipment.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Value
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          GHS{" "}
                          {allEquipment
                            .reduce(
                              (sum: number, eq: any) =>
                                sum + (eq.purchase_cost || 0),
                              0
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">
                        Equipment by Sub-Unit
                      </p>
                      {subUnits.length > 0 ? (
                        subUnits.slice(0, 4).map((subUnit: any) => (
                          <div
                            key={subUnit.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600 truncate">
                              {subUnit.name}
                            </span>
                            <span className="font-medium ml-2">
                              {subUnit.equipmentCount} items
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No sub-units</p>
                      )}
                      {subUnits.length > 4 && (
                        <p className="text-xs text-gray-500 pt-1">
                          +{subUnits.length - 4} more sub-units
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {department.description || "No description available."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subunits" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sub-units Overview</h3>
                <Button
                  size="sm"
                  onClick={() => setIsAddSubUnitDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sub-unit
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subUnits.map((subUnit) => (
                  <Card key={subUnit.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{subUnit.name}</h4>
                      <Badge
                        className={getStatusColor(subUnit.status)}
                        variant="secondary"
                      >
                        {subUnit.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Equipment</span>
                        <span className="font-medium">
                          {subUnit.equipmentCount} items
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sub-unit ID</span>
                        <span className="font-medium text-gray-500">
                          {subUnit.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs bg-transparent"
                        onClick={() => {
                          setSelectedSubUnit(subUnit);
                          setIsViewSubUnitDialogOpen(true);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setSelectedSubUnit(subUnit);
                          setIsEditSubUnitDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubUnit(subUnit.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add Sub-unit Dialog */}
              <Dialog
                open={isAddSubUnitDialogOpen}
                onOpenChange={setIsAddSubUnitDialogOpen}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Sub-unit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subUnitName">Sub-unit Name</Label>
                      <Input
                        id="subUnitName"
                        placeholder="Enter sub-unit name"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSubUnitDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const name = (
                          document.getElementById(
                            "subUnitName"
                          ) as HTMLInputElement
                        )?.value;
                        if (name) {
                          handleAddSubUnit({ name });
                        }
                      }}
                    >
                      Add Sub-unit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Sub-unit Dialog */}
              <Dialog
                open={isEditSubUnitDialogOpen}
                onOpenChange={setIsEditSubUnitDialogOpen}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      Edit Sub-unit - {selectedSubUnit?.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSubUnitName">Sub-unit Name</Label>
                      <Input
                        id="editSubUnitName"
                        defaultValue={selectedSubUnit?.name}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditSubUnitDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const name = (
                          document.getElementById(
                            "editSubUnitName"
                          ) as HTMLInputElement
                        )?.value;
                        if (name) {
                          handleEditSubUnit({ name });
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* View Sub-unit Details Dialog */}
              <Dialog
                open={isViewSubUnitDialogOpen}
                onOpenChange={setIsViewSubUnitDialogOpen}
              >
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      Sub-unit Details - {selectedSubUnit?.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Sub-unit ID
                        </p>
                        <p className="font-medium">{selectedSubUnit?.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Status
                        </p>
                        <Badge
                          className={getStatusColor(selectedSubUnit?.status)}
                        >
                          {selectedSubUnit?.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Equipment Count
                        </p>
                        <p className="font-medium">
                          {selectedSubUnit?.equipmentCount} items
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Name
                        </p>
                        <p className="font-medium">{selectedSubUnit?.name}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">
                        Description
                      </p>
                      <p className="text-gray-700">
                        This sub-unit contains {selectedSubUnit?.equipmentCount}{" "}
                        equipment items and is currently{" "}
                        {selectedSubUnit?.status?.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setIsViewSubUnitDialogOpen(false)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Department Equipment</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search equipment by name or sub-unit..."
                      value={equipmentSearchTerm}
                      onChange={(e) => {
                        setEquipmentSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="min-w-full overflow-x-auto">
                    <Table className="text-xs md:text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">#</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort("name")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Name</span>
                              {getSortIcon("name")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort("subUnit")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Sub-unit</span>
                              {getSortIcon("subUnit")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Status</span>
                              {getSortIcon("status")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort("last_service_date")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Last Maintenance</span>
                              {getSortIcon("last_service_date")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort("created_at")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Date Added</span>
                              {getSortIcon("created_at")}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100 select-none"
                            onClick={() => handleSort("purchase_cost")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Value</span>
                              {getSortIcon("purchase_cost")}
                            </div>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentEquipment.length > 0 ? (
                          currentEquipment.map(
                            (equipment: any, index: number) => (
                              <TableRow
                                key={equipment.id}
                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() =>
                                  (window.location.href = `/equipment/${equipment.id}?returnTo=/departments/${departmentId}&returnTab=equipment`)
                                }
                              >
                                <TableCell className="text-gray-500">
                                  {startIndex + index + 1}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {equipment.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {equipment.manufacturer}{" "}
                                      {equipment.model || ""}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {equipment.subUnit || (
                                        <span className="text-gray-400 italic">
                                          Not Specified
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Tag:{" "}
                                      {equipment.tagNumber ||
                                        equipment.tag_number ||
                                        "Not Specified"}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(
                                      equipment.status || "unknown"
                                    )}
                                  >
                                    {equipment.status
                                      ? equipment.status
                                          .charAt(0)
                                          .toUpperCase() +
                                        equipment.status.slice(1)
                                      : "Unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {equipment.last_service_date ? (
                                    new Date(
                                      equipment.last_service_date
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Not Set
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {equipment.created_at ? (
                                    new Date(equipment.created_at).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Not Available
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {equipment.purchase_cost ||
                                  equipment.purchaseCost ? (
                                    `GHS ${Number(
                                      equipment.purchase_cost ||
                                        equipment.purchaseCost
                                    ).toLocaleString()}`
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Not Set
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/equipment/${equipment.id}?returnTo=/departments/${departmentId}&returnTab=equipment`;
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {/* Status Change Options */}
                                        {[
                                          "operational",
                                          "maintenance",
                                          "broken",
                                          "retired",
                                        ].map((status) => {
                                          const isCurrentStatus =
                                            equipment.status === status;
                                          const getTextColor = (s: string) => {
                                            switch (s.toLowerCase()) {
                                              case "operational":
                                                return "text-green-600";
                                              case "maintenance":
                                                return "text-yellow-600";
                                              case "broken":
                                                return "text-red-600";
                                              case "retired":
                                                return "text-gray-600";
                                              default:
                                                return "text-gray-600";
                                            }
                                          };
                                          return (
                                            <DropdownMenuItem
                                              key={status}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleStatusUpdate(
                                                  equipment.id,
                                                  status
                                                );
                                              }}
                                              className={`flex items-center justify-between cursor-pointer ${
                                                isCurrentStatus
                                                  ? "bg-gray-100"
                                                  : ""
                                              }`}
                                            >
                                              <span
                                                className={getTextColor(status)}
                                              >
                                                {status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  status.slice(1)}
                                                {isCurrentStatus && " ✓"}
                                              </span>
                                            </DropdownMenuItem>
                                          );
                                        })}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `/equipment/${equipment.id}?returnTo=/departments/${departmentId}&returnTab=equipment`;
                                          }}
                                        >
                                          <Edit className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Add delete functionality here if needed
                                          }}
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-6 text-muted-foreground"
                            >
                              {equipmentSearchTerm
                                ? "No equipment found"
                                : "No equipment in this department"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing{" "}
                      {filteredEquipment.length > 0 ? startIndex + 1 : 0} to{" "}
                      {Math.min(endIndex, filteredEquipment.length)} of{" "}
                      {filteredEquipment.length} equipment
                      {equipmentSearchTerm &&
                        ` (filtered from ${allEquipment.length} total)`}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Maintenance Activities
                </h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task ID</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentMaintenance.length > 0 ? (
                        departmentMaintenance.map((activity: any) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">
                              MT-{activity.id.toString().padStart(3, "0")}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {activity.equipment_name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  EQ-
                                  {activity.equipment_id
                                    ?.toString()
                                    .padStart(3, "0") || "N/A"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {activity.type
                                ? activity.type.charAt(0).toUpperCase() +
                                  activity.type.slice(1)
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusColor(
                                  activity.status || "unknown"
                                )}
                              >
                                {activity.status
                                  ? activity.status.charAt(0).toUpperCase() +
                                    activity.status.slice(1).replace("-", " ")
                                  : "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getPriorityColor(
                                  activity.priority || "medium"
                                )}
                              >
                                {activity.priority
                                  ? activity.priority.charAt(0).toUpperCase() +
                                    activity.priority.slice(1)
                                  : "Medium"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {activity.date
                                ? new Date(activity.date).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {activity.technician || "Unassigned"}
                            </TableCell>
                            <TableCell>
                              <Link href={`/maintenance/${activity.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-10 text-gray-500"
                          >
                            No maintenance activities for this department
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No recent activities</p>
                    <p className="text-sm">
                      Activity tracking will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DepartmentDetailSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-full" />
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
