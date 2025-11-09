"use client";

import type React from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Edit,
  Eye,
  AlertTriangle,
  Wrench,
  Plus,
  Download,
  Loader2,
  ImagePlus,
  X,
  CalendarIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Equipment } from "@/types/equipment";
import type { Department } from "@/types/dashboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const router = useRouter();

  // Fetch equipment data
  const { data: equipmentResponse, isLoading: isLoadingEquipment } = useQuery({
    queryKey: [
      "equipment",
      searchTerm,
      statusFilter,
      departmentFilter,
      currentPage,
      itemsPerPage,
    ],
    queryFn: () =>
      api.equipment.list({
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        department:
          departmentFilter !== "all" ? Number(departmentFilter) : undefined,
        page: currentPage,
        limit: itemsPerPage,
      }),
  });

  // Fetch departments
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => api.departments.list(),
  });

  const equipmentData = equipmentResponse?.data || [];
  const totalItems = equipmentResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to page 1 when filters change
  const handleFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort equipment data
  const sortedEquipmentData = [...equipmentData].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any = a[sortColumn as keyof Equipment];
    let bValue: any = b[sortColumn as keyof Equipment];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Convert to strings for comparison
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

  if (isLoadingEquipment) {
    return <EquipmentSkeleton />;
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
              <h1 className="text-2xl font-bold text-gray-900">
                Equipment Management
              </h1>
              <Badge variant="secondary">{totalItems} total items</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Bulk Add (Excel Style)
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    handleFilterChange(setStatusFilter, value)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">
                      Under Maintenance
                    </SelectItem>
                    <SelectItem value="broken">Broken</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={departmentFilter}
                  onValueChange={(value) =>
                    handleFilterChange(setDepartmentFilter, value)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Table */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("id")}
                    >
                      Equipment ID {renderSortIcon("id")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      Name {renderSortIcon("name")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("department_name")}
                    >
                      Department {renderSortIcon("department_name")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      Status {renderSortIcon("status")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("last_service_date")}
                    >
                      Last Maintenance {renderSortIcon("last_service_date")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("next_maintenance_date")}
                    >
                      Next Maintenance {renderSortIcon("next_maintenance_date")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("purchase_cost")}
                    >
                      Value {renderSortIcon("purchase_cost")}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEquipmentData.length > 0 ? (
                    sortedEquipmentData.map((equipment: Equipment) => (
                      <TableRow
                        key={equipment.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          router.push(`/equipment/${equipment.id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          EQ-{equipment.id.toString().padStart(3, "0")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{equipment.name}</div>
                            <div className="text-sm text-gray-600">
                              {equipment.manufacturer} {equipment.model || ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>
                              {equipment.department_name || "Unassigned"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {equipment.sub_unit || "N/A"}
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
                              ? equipment.status.charAt(0).toUpperCase() +
                                equipment.status.slice(1)
                              : "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {equipment.last_service_date
                            ? new Date(
                                equipment.last_service_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {equipment.next_maintenance_date ? (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <span>
                                {new Date(
                                  equipment.next_maintenance_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {equipment.purchase_cost
                            ? `GHS ${Number(
                                equipment.purchase_cost
                              ).toLocaleString()}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/equipment/${equipment.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit action
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle maintenance action
                              }}
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No equipment found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} items
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
    } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        departments={departments || []}
      />

      {/* Bulk Add Dialog */}
      <BulkAddEquipmentDialog
        open={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        departments={departments || []}
      />
    </div>
  );
}

function AddEquipmentDialog({
  open,
  onOpenChange,
  departments,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState<any>({});
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleFormChange("photo", file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create FormData
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "service_types" && Array.isArray(value)) {
            submitData.append(key, JSON.stringify(value));
          } else {
            submitData.append(key, value.toString());
          }
        }
      });

      await api.equipment.create(submitData);
      onOpenChange(false);
    // Reset form
      setFormData({});
      setPhotoPreview(null);
      setSelectedDepartment(null);
      setActiveTab("details");
      // Refetch equipment list
      window.location.reload();
    } catch (error) {
      console.error("Error creating equipment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabValues = ["details", "location", "costs", "service"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
          <DialogTitle className="text-2xl">Add Equipment</DialogTitle>
            <DialogDescription>
            Enter the equipment details below. Required fields are marked with
            an asterisk (*).
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">Equipment Details</TabsTrigger>
              <TabsTrigger value="location">Location & Model</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
            </TabsList>

            {/* Equipment Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter equipment name"
                      value={formData.name || ""}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tag_number">Tag Number *</Label>
                      <Input
                        id="tag_number"
                        placeholder="Enter tag number"
                        value={formData.tag_number || ""}
                      onChange={(e) =>
                        handleFormChange("tag_number", e.target.value)
                      }
                      />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="year_of_manufacture">
                      Year Manufactured
                    </Label>
                      <Input
                        id="year_of_manufacture"
                        type="number"
                        placeholder="YYYY"
                        value={formData.year_of_manufacture || ""}
                      onChange={(e) =>
                        handleFormChange("year_of_manufacture", e.target.value)
                      }
                      />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="date_of_installation">
                      Date of Installation
                    </Label>
                      <Input
                        id="date_of_installation"
                        type="date"
                        value={formData.date_of_installation || ""}
                      onChange={(e) =>
                        handleFormChange("date_of_installation", e.target.value)
                      }
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer *</Label>
                      <Input
                        id="manufacturer"
                        placeholder="Enter manufacturer"
                        value={formData.manufacturer || ""}
                      onChange={(e) =>
                        handleFormChange("manufacturer", e.target.value)
                      }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country_of_origin">Country</Label>
                      <Input
                        id="country_of_origin"
                        placeholder="Country of origin"
                        value={formData.country_of_origin || ""}
                      onChange={(e) =>
                        handleFormChange("country_of_origin", e.target.value)
                      }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner</Label>
                      <Input
                        id="owner"
                        placeholder="Equipment owner"
                        value={formData.owner || ""}
                      onChange={(e) =>
                        handleFormChange("owner", e.target.value)
                      }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintained_by">Maintained By</Label>
                    <Input
                      id="maintained_by"
                      placeholder="Maintainer"
                      value={formData.maintained_by || ""}
                    onChange={(e) =>
                      handleFormChange("maintained_by", e.target.value)
                    }
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Equipment Photo</h3>
                    <div className="flex items-center gap-4">
                      <div className="border rounded-md flex items-center justify-center w-32 h-32 bg-muted">
                        {photoPreview ? (
                          <img
                          src={photoPreview}
                            alt="Equipment preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="cursor-pointer"
                      />
                        <p className="text-sm text-muted-foreground mt-2">
                          Upload a clear photo of the equipment. Max size: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warranty_info">Warranty Information</Label>
                    <Textarea
                      id="warranty_info"
                      placeholder="Enter warranty details"
                      className="h-20"
                      value={formData.warranty_info || ""}
                    onChange={(e) =>
                      handleFormChange("warranty_info", e.target.value)
                    }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Department *</Label>
                      <Select
                        value={formData.department_id?.toString() || ""}
                        onValueChange={(value) => {
                        handleFormChange("department_id", Number(value));
                        const dept = departments.find(
                          (d) => d.id === Number(value)
                        );
                        setSelectedDepartment(dept || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                    <Label>Sub Unit</Label>
                    <Input
                      placeholder="Enter sub unit"
                        value={formData.sub_unit || ""}
                      onChange={(e) =>
                        handleFormChange("sub_unit", e.target.value)
                      }
                    />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Model Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          placeholder="Enter model name/number"
                          value={formData.model || ""}
                        onChange={(e) =>
                          handleFormChange("model", e.target.value)
                        }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mfg_number">MFG Number</Label>
                        <Input
                          id="mfg_number"
                          placeholder="Enter manufacturing number"
                          value={formData.mfg_number || ""}
                        onChange={(e) =>
                          handleFormChange("mfg_number", e.target.value)
                        }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serial_number">Serial Number *</Label>
                      <Input
                        id="serial_number"
                        placeholder="Enter serial number"
                        value={formData.serial_number || ""}
                      onChange={(e) =>
                        handleFormChange("serial_number", e.target.value)
                      }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Costs Tab */}
            <TabsContent value="costs">
              <Card>
              <CardContent className="pt-6 space-y-6">
                    <div className="space-y-3">
                      <Label>Purchase Type *</Label>
                      <RadioGroup
                        value={formData.purchase_type || ""}
                    onValueChange={(value) =>
                      handleFormChange("purchase_type", value)
                    }
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="purchase" />
                          <Label className="font-normal">Purchase</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="lease" />
                          <Label className="font-normal">Lease</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="rental" />
                          <Label className="font-normal">Rental</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      value={formData.purchase_date || ""}
                      onChange={(e) =>
                        handleFormChange("purchase_date", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                    />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchase_cost">Purchase Cost</Label>
                        <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        GHS
                      </span>
                          <Input
                            id="purchase_cost"
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="pl-12"
                            value={formData.purchase_cost || ""}
                            onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, "");
                          handleFormChange("purchase_cost", value);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                    <Label htmlFor="purchase_order_number">
                      Purchase Order Number
                    </Label>
                        <Input
                          id="purchase_order_number"
                          placeholder="Enter PO number"
                          value={formData.purchase_order_number || ""}
                      onChange={(e) =>
                        handleFormChange(
                          "purchase_order_number",
                          e.target.value
                        )
                      }
                    />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lease_id">Lease ID</Label>
                        <Input
                          id="lease_id"
                          placeholder="Enter lease ID"
                          value={formData.lease_id || ""}
                      onChange={(e) =>
                        handleFormChange("lease_id", e.target.value)
                      }
                          disabled={formData.purchase_type !== "lease"}
                        />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Tab */}
            <TabsContent value="service">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <Label>Service Contract</Label>
                    <RadioGroup
                      value={formData.has_service_contract ? "true" : "false"}
                    onValueChange={(value) =>
                      handleFormChange("has_service_contract", value === "true")
                    }
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="true" />
                        <Label className="font-normal">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0">
                        <RadioGroupItem value="false" />
                        <Label className="font-normal">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                <div
                  className={
                    !formData.has_service_contract
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                >
                    <div className="space-y-2">
                    <Label htmlFor="service_organization">
                      Service Organization
                    </Label>
                      <Input
                        id="service_organization"
                        placeholder="Enter service provider name"
                        value={formData.service_organization || ""}
                      onChange={(e) =>
                        handleFormChange("service_organization", e.target.value)
                      }
                        disabled={!formData.has_service_contract}
                      />
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Service Types</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: "breakdown", label: "Breakdown Repair" },
                          { id: "maintenance", label: "Periodic Maintenance" },
                          { id: "training", label: "Training" },
                        {
                          id: "supplies",
                          label: "Supply of Consumables and Accessories",
                        },
                        ].map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                            <Checkbox
                            checked={
                              formData.service_types?.includes(item.id) || false
                            }
                              onCheckedChange={(checked) => {
                              const currentValues =
                                formData.service_types || [];
                                const newValues = checked
                                  ? [...currentValues, item.id]
                                : currentValues.filter(
                                    (value: string) => value !== item.id
                                  );
                              handleFormChange("service_types", newValues);
                              }}
                              disabled={!formData.has_service_contract}
                            />
                            <Label className="font-normal">{item.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      Additional Information
                    </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="contact_info">Contact</Label>
                          <Input
                            id="contact_info"
                            placeholder="Enter contact information"
                            value={formData.contact_info || ""}
                          onChange={(e) =>
                            handleFormChange("contact_info", e.target.value)
                          }
                            disabled={!formData.has_service_contract}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee_number">Employee Number</Label>
                          <Input
                            id="employee_number"
                            placeholder="Enter employee number"
                            value={formData.employee_number || ""}
                          onChange={(e) =>
                            handleFormChange("employee_number", e.target.value)
                          }
                            disabled={!formData.has_service_contract}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
            onClick={() => {
              const currentIndex = tabValues.indexOf(activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabValues[currentIndex - 1]);
              }
            }}
              disabled={tabValues.indexOf(activeTab) === 0}
            >
              Previous
            </Button>

            {tabValues.indexOf(activeTab) === tabValues.length - 1 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Equipment"
                )}
              </Button>
            ) : (
              <Button
                type="button"
              onClick={() => {
                const currentIndex = tabValues.indexOf(activeTab);
                if (currentIndex < tabValues.length - 1) {
                  setActiveTab(tabValues[currentIndex + 1]);
                }
              }}
              >
                Next
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}

function BulkAddEquipmentDialog({
  open,
  onOpenChange,
  departments,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
}) {
  const [excelRows, setExcelRows] = useState([
    {
      id: 1,
      name: "",
      tag_number: "",
      year_of_manufacture: "",
      date_of_installation: "",
      manufacturer: "",
      country_of_origin: "",
      owner: "",
      maintained_by: "",
      warranty_info: "",
      department_id: "",
      sub_unit: "",
      model: "",
      mfg_number: "",
      serial_number: "",
      purchase_type: "",
      purchase_date: "",
      purchase_cost: "",
      purchase_order_number: "",
      lease_id: "",
      has_service_contract: "",
      service_organization: "",
      contact_info: "",
      employee_number: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExcelRow = () => {
    const newRow = {
      id: excelRows.length + 1,
      name: "",
      tag_number: "",
      year_of_manufacture: "",
      date_of_installation: "",
      manufacturer: "",
      country_of_origin: "",
      owner: "",
      maintained_by: "",
      warranty_info: "",
      department_id: "",
      sub_unit: "",
      model: "",
      mfg_number: "",
      serial_number: "",
      purchase_type: "",
      purchase_date: "",
      purchase_cost: "",
      purchase_order_number: "",
      lease_id: "",
      has_service_contract: "",
      service_organization: "",
      contact_info: "",
      employee_number: "",
    };
    setExcelRows([...excelRows, newRow]);
  };

  const removeExcelRow = (id: number) => {
    if (excelRows.length > 1) {
      setExcelRows(excelRows.filter((row) => row.id !== id));
    }
  };

  const updateExcelRow = (id: number, field: string, value: string) => {
    setExcelRows(
      excelRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleExcelSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit each row
      for (const row of excelRows) {
        const formData = new FormData();
        Object.entries(row).forEach(([key, value]) => {
          if (key !== "id" && value !== "" && value !== undefined) {
            if (key === "has_service_contract") {
              formData.append(key, value === "true" ? "true" : "false");
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        await api.equipment.create(formData);
      }

      onOpenChange(false);
      // Reset form
      setExcelRows([
        {
          id: 1,
          name: "",
          tag_number: "",
          year_of_manufacture: "",
          date_of_installation: "",
          manufacturer: "",
          country_of_origin: "",
          owner: "",
          maintained_by: "",
          warranty_info: "",
          department_id: "",
          sub_unit: "",
          model: "",
          mfg_number: "",
          serial_number: "",
          purchase_type: "",
          purchase_date: "",
          purchase_cost: "",
          purchase_order_number: "",
          lease_id: "",
          has_service_contract: "",
          service_organization: "",
          contact_info: "",
          employee_number: "",
        },
      ]);
      // Refetch equipment list
      window.location.reload();
    } catch (error) {
      console.error("Error creating equipment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Bulk Add Equipment - Excel Style
          </DialogTitle>
          <DialogDescription>
            Enter multiple equipment entries in a spreadsheet format. Required
            fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="min-w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[40px]">
                    #
                  </th>
                  {/* Basic Information */}
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[200px]">
                    Equipment Name *
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Tag Number *
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[100px]">
                    Year Mfg
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Install Date
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[150px]">
                    Manufacturer *
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Country
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Owner
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[140px]">
                    Maintained By
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[200px]">
                    Warranty Info
                  </th>
                  {/* Location & Model */}
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[140px]">
                    Department *
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[140px]">
                    Sub Unit
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Model
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    MFG Number
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[140px]">
                    Serial Number *
                  </th>
                  {/* Costs */}
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Purchase Type *
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Purchase Date
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Cost (GHS)
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[140px]">
                    PO Number
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Lease ID
                  </th>
                  {/* Service */}
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Service Contract
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[160px]">
                    Service Org
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[140px]">
                    Contact Info
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[120px]">
                    Employee #
                  </th>
                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 min-w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {excelRows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-1 text-center text-sm font-medium">
                      {index + 1}
                    </td>

                      {/* Basic Information */}
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.name}
                        onChange={(e) =>
                          updateExcelRow(row.id, "name", e.target.value)
                        }
                          placeholder="Equipment name"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.tag_number}
                        onChange={(e) =>
                          updateExcelRow(row.id, "tag_number", e.target.value)
                        }
                          placeholder="Tag number"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          type="number"
                          value={row.year_of_manufacture}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "year_of_manufacture",
                            e.target.value
                          )
                        }
                          placeholder="YYYY"
                          min="1900"
                          max={new Date().getFullYear()}
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          type="date"
                          value={row.date_of_installation}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "date_of_installation",
                            e.target.value
                          )
                        }
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.manufacturer}
                        onChange={(e) =>
                          updateExcelRow(row.id, "manufacturer", e.target.value)
                        }
                          placeholder="Manufacturer"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.country_of_origin}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "country_of_origin",
                            e.target.value
                          )
                        }
                          placeholder="Country"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.owner}
                        onChange={(e) =>
                          updateExcelRow(row.id, "owner", e.target.value)
                        }
                          placeholder="Owner"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.maintained_by}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "maintained_by",
                            e.target.value
                          )
                        }
                          placeholder="Maintainer"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.warranty_info}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "warranty_info",
                            e.target.value
                          )
                        }
                          placeholder="Warranty details"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Location & Model */}
                      <td className="border border-gray-300 p-1">
                        <Select
                          value={row.department_id}
                          onValueChange={(value) => {
                          updateExcelRow(row.id, "department_id", value);
                          }}
                        >
                          <SelectTrigger className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="Select dept" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-1">
                      <Input
                          value={row.sub_unit}
                        onChange={(e) =>
                          updateExcelRow(row.id, "sub_unit", e.target.value)
                        }
                        placeholder="Sub unit"
                        className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                      />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.model}
                        onChange={(e) =>
                          updateExcelRow(row.id, "model", e.target.value)
                        }
                          placeholder="Model"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.mfg_number}
                        onChange={(e) =>
                          updateExcelRow(row.id, "mfg_number", e.target.value)
                        }
                          placeholder="MFG #"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.serial_number}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "serial_number",
                            e.target.value
                          )
                        }
                          placeholder="Serial number"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Costs */}
                      <td className="border border-gray-300 p-1">
                        <Select
                          value={row.purchase_type}
                        onValueChange={(value) =>
                          updateExcelRow(row.id, "purchase_type", value)
                        }
                        >
                          <SelectTrigger className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="purchase">Purchase</SelectItem>
                            <SelectItem value="lease">Lease</SelectItem>
                            <SelectItem value="rental">Rental</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          type="date"
                          value={row.purchase_date}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "purchase_date",
                            e.target.value
                          )
                        }
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={row.purchase_cost}
                          onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, "");
                          updateExcelRow(row.id, "purchase_cost", value);
                          }}
                          placeholder="0.00"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.purchase_order_number}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "purchase_order_number",
                            e.target.value
                          )
                        }
                          placeholder="PO number"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.lease_id}
                        onChange={(e) =>
                          updateExcelRow(row.id, "lease_id", e.target.value)
                        }
                          placeholder="Lease ID"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                          disabled={row.purchase_type !== "lease"}
                        />
                      </td>

                      {/* Service */}
                      <td className="border border-gray-300 p-1">
                        <Select
                          value={row.has_service_contract}
                        onValueChange={(value) =>
                          updateExcelRow(row.id, "has_service_contract", value)
                        }
                        >
                          <SelectTrigger className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500">
                            <SelectValue placeholder="Contract" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.service_organization}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "service_organization",
                            e.target.value
                          )
                        }
                          placeholder="Service org"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                          disabled={row.has_service_contract !== "true"}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.contact_info}
                        onChange={(e) =>
                          updateExcelRow(row.id, "contact_info", e.target.value)
                        }
                          placeholder="Contact"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                          disabled={row.has_service_contract !== "true"}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={row.employee_number}
                        onChange={(e) =>
                          updateExcelRow(
                            row.id,
                            "employee_number",
                            e.target.value
                          )
                        }
                          placeholder="Emp #"
                          className="border-0 h-8 text-sm focus:ring-1 focus:ring-blue-500"
                          disabled={row.has_service_contract !== "true"}
                        />
                      </td>
                      <td className="border border-gray-300 p-1">
                        <div className="flex items-center justify-center space-x-1">
                          {excelRows.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExcelRow(row.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                            <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExcelRow}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
            <span className="text-sm text-gray-600">
              {excelRows.length} equipment{" "}
              {excelRows.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExcelSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving {excelRows.length} items...
                </>
              ) : (
                `Save ${excelRows.length} Equipment`
              )}
            </Button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Quick Tips:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Use Tab key to navigate between cells quickly</li>
            <li>
              • Required fields (*) must be filled for successful submission
            </li>
            <li>
              • Service contract fields are enabled only when "Yes" is selected
            </li>
            <li>• Lease ID is only enabled when Purchase Type is "Lease"</li>
            <li>• Add multiple rows for bulk equipment entry</li>
            <li>
              • Click the X button to remove a row (minimum 1 row required)
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EquipmentSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
            </div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="w-48 h-10" />
                <Skeleton className="w-48 h-10" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "operational":
      return "bg-green-100 text-green-800";
    case "maintenance":
    case "under maintenance":
      return "bg-yellow-100 text-yellow-800";
    case "broken":
      return "bg-red-100 text-red-800";
    case "retired":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
