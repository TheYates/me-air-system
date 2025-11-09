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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "@/components/navigation";
import {
  ArrowLeft,
  Edit,
  Wrench,
  Calendar,
  DollarSign,
  FileText,
  Camera,
  Plus,
  Download,
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  Clock,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Equipment } from "@/types/equipment";
import type { MaintenanceRecord } from "@/types/maintenance";

export default function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const equipmentId = parseInt(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isUploadDocDialogOpen, setIsUploadDocDialogOpen] = useState(false);
  const [isUploadPhotoDialogOpen, setIsUploadPhotoDialogOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch equipment details
  const { data: equipment, isLoading } = useQuery<Equipment>({
    queryKey: ["equipment", equipmentId],
    queryFn: () => api.equipment.getById(equipmentId),
  });

  // Fetch maintenance records for this equipment
  const { data: maintenanceRecords = [] } = useQuery<MaintenanceRecord[]>({
    queryKey: ["maintenance", "equipment", equipmentId],
    queryFn: () => api.maintenance.listByEquipment(equipmentId),
    enabled: !!equipment,
  });

  if (isLoading) {
    return <EquipmentDetailSkeleton />;
  }

  if (!equipment) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Equipment Not Found</h1>
          <Link href="/equipment">
            <Button className="mt-4">Back to Equipment</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  // Find upcoming maintenance
  const upcomingMaintenance = maintenanceRecords.find(
    (record) => record.status === "scheduled"
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/equipment">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Equipment
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {equipment.name}
                </h1>
                <p className="text-gray-600">
                  EQ-{equipment.id.toString().padStart(3, "0")} •{" "}
                  {equipment.tag_number} • {equipment.manufacturer}{" "}
                  {equipment.model || ""}
                </p>
              </div>
              <Badge className={getStatusColor(equipment.status || "unknown")}>
                {equipment.status
                  ? equipment.status.charAt(0).toUpperCase() +
                    equipment.status.slice(1)
                  : "Unknown"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Equipment - {equipment.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Equipment Name</Label>
                      <Input id="name" defaultValue={equipment.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagNumber">Tag Number</Label>
                      <Input
                        id="tagNumber"
                        defaultValue={equipment.tag_number}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serial">Serial Number</Label>
                      <Input
                        id="serial"
                        defaultValue={equipment.serial_number || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        defaultValue={equipment.manufacturer}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" defaultValue={equipment.model || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mfgNumber">MFG Number</Label>
                      <Input
                        id="mfgNumber"
                        defaultValue={equipment.mfg_number || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearManufactured">
                        Year Manufactured
                      </Label>
                      <Input
                        id="yearManufactured"
                        defaultValue={equipment.year_of_manufacture || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                      <Input
                        id="countryOfOrigin"
                        defaultValue={equipment.country_of_origin || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner</Label>
                      <Input id="owner" defaultValue={equipment.owner || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maintainedBy">Maintained By</Label>
                      <Input
                        id="maintainedBy"
                        defaultValue={equipment.maintained_by || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">Value (GHS)</Label>
                      <Input
                        id="value"
                        defaultValue={equipment.purchase_cost || ""}
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
              <Dialog
                open={isMaintenanceDialogOpen}
                onOpenChange={setIsMaintenanceDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      Schedule Maintenance - {equipment.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Maintenance Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="calibration">
                            Calibration
                          </SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select>
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
                      <Label htmlFor="technician">Technician</Label>
                      <Input id="technician" placeholder="Technician name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" placeholder="e.g., 2 hours" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Maintenance description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsMaintenanceDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setIsMaintenanceDialogOpen(false)}>
                      Schedule
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Purchase Value
                    </p>
                    <p className="text-2xl font-bold">
                      {equipment.purchase_cost
                        ? `GHS ${Number(
                            equipment.purchase_cost
                          ).toLocaleString()}`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {equipment.purchase_type
                        ? equipment.purchase_type.charAt(0).toUpperCase() +
                          equipment.purchase_type.slice(1)
                        : "Unknown"}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Warranty Status
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {equipment.warranty_info ? "Active" : "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {equipment.warranty_info
                        ? equipment.warranty_info.substring(0, 20) + "..."
                        : "No warranty"}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Service Contract
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {equipment.has_service_contract ? "Yes" : "No"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {equipment.service_organization || "N/A"}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Next Maintenance
                    </p>
                    <p className="text-lg font-bold">
                      {upcomingMaintenance?.date
                        ? new Date(
                            upcomingMaintenance.date
                          ).toLocaleDateString()
                        : "Not scheduled"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {upcomingMaintenance?.type || "N/A"}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Equipment ID
                        </p>
                        <p className="font-medium">
                          EQ-{equipment.id.toString().padStart(3, "0")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tag Number
                        </p>
                        <p className="font-medium">{equipment.tag_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Serial Number
                        </p>
                        <p className="font-medium">
                          {equipment.serial_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          MFG Number
                        </p>
                        <p className="font-medium">
                          {equipment.mfg_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Manufacturer
                        </p>
                        <p className="font-medium">{equipment.manufacturer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Model
                        </p>
                        <p className="font-medium">
                          {equipment.model || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Year Manufactured
                        </p>
                        <p className="font-medium">
                          {equipment.year_of_manufacture || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Country of Origin
                        </p>
                        <p className="font-medium">
                          {equipment.country_of_origin || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Location & Ownership</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Department
                        </p>
                        <p className="font-medium">
                          {equipment.department_name || "Unassigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Sub-unit
                        </p>
                        <p className="font-medium">
                          {equipment.sub_unit || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Owner
                        </p>
                        <p className="font-medium">
                          {equipment.owner || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Maintained By
                        </p>
                        <p className="font-medium">
                          {equipment.maintained_by || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Purchase Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Purchase Type
                        </p>
                        <p className="font-medium">
                          {equipment.purchase_type
                            ? equipment.purchase_type.charAt(0).toUpperCase() +
                              equipment.purchase_type.slice(1)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Purchase Date
                        </p>
                        <p className="font-medium">
                          {equipment.purchase_date
                            ? new Date(
                                equipment.purchase_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Installation Date
                        </p>
                        <p className="font-medium">
                          {equipment.date_of_installation
                            ? new Date(
                                equipment.date_of_installation
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Purchase Value
                        </p>
                        <p className="font-medium">
                          {equipment.purchase_cost
                            ? `GHS ${Number(
                                equipment.purchase_cost
                              ).toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          PO Number
                        </p>
                        <p className="font-medium">
                          {equipment.purchase_order_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Employee Number
                        </p>
                        <p className="font-medium">
                          {equipment.employee_number || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Warranty Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Warranty Details
                      </p>
                      <p className="font-medium text-sm">
                        {equipment.warranty_info ||
                          "No warranty information available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Technical Specifications</span>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Specifications
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-gray-600">
                    <p>
                      Technical specifications will be available in a future
                      update.
                    </p>
                    <p className="text-sm mt-2">
                      This feature is under development.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="service" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Service Contract Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Service Contract
                        </p>
                        <Badge
                          className={
                            equipment.has_service_contract
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {equipment.has_service_contract ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Service Organization
                        </p>
                        <p className="font-medium">
                          {equipment.service_organization || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Contact Information
                        </p>
                        <p className="font-medium text-sm">
                          {equipment.contact_info || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Service Coverage
                      </h4>
                      <div className="space-y-3">
                        {equipment.service_types &&
                        equipment.service_types.length > 0 ? (
                          equipment.service_types.map((type, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded"
                            >
                              <span className="font-medium capitalize">
                                {type}
                              </span>
                              <Badge className="bg-green-100 text-green-800">
                                Yes
                          </Badge>
                        </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">
                            No service types specified
                          </p>
                        )}
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Maintenance History</h3>
                <Button
                  size="sm"
                  onClick={() => setIsMaintenanceDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>

              {/* Upcoming Maintenance */}
              {upcomingMaintenance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Upcoming Maintenance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <div>
                        <p className="font-medium">
                          {upcomingMaintenance.type
                            ? upcomingMaintenance.type.charAt(0).toUpperCase() +
                              upcomingMaintenance.type.slice(1)
                            : "Unknown"}{" "}
                          Maintenance
                        </p>
                      <p className="text-sm text-gray-600">
                          Scheduled for{" "}
                          {new Date(
                            upcomingMaintenance.date
                          ).toLocaleDateString()}
                          {upcomingMaintenance.technician &&
                            ` • ${upcomingMaintenance.technician}`}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Maintenance History Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance History</CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenanceRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {maintenanceRecords.map((record) => (
                          <TableRow key={record.id}>
                          <TableCell>
                              {record.date
                                ? new Date(record.date).toLocaleDateString()
                                : "N/A"}
                          </TableCell>
                          <TableCell>
                              {record.type
                                ? record.type.charAt(0).toUpperCase() +
                                  record.type.slice(1)
                                : "N/A"}
                            </TableCell>
                            <TableCell>{record.technician || "N/A"}</TableCell>
                            <TableCell>
                              {record.cost
                                ? `GHS ${Number(record.cost).toLocaleString()}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  record.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "in-progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              >
                                {record.status
                                  ? record.status.charAt(0).toUpperCase() +
                                    record.status.slice(1)
                                  : "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  ) : (
                    <div className="text-center py-10 text-gray-600">
                      <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No maintenance records found</p>
                      <p className="text-sm mt-2">
                        Schedule maintenance to start tracking service history
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documents</h3>
                <Button
                  size="sm"
                  onClick={() => setIsUploadDocDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10 text-gray-600">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No documents available</p>
                    <p className="text-sm mt-2">
                      Upload documents like manuals, certificates, or contracts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Photos</h3>
                <Button
                  size="sm"
                  onClick={() => setIsUploadPhotoDialogOpen(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6">
                  {equipment.photo_url ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="w-full h-48 bg-gray-200 rounded mb-3 overflow-hidden">
                          <img
                            src={equipment.photo_url}
                            alt={equipment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="font-medium">Equipment Photo</p>
                        <p className="text-sm text-gray-600">
                          Uploaded{" "}
                          {equipment.created_at
                            ? new Date(
                                equipment.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                  </div>
                  ) : (
                    <div className="text-center py-10 text-gray-600">
                      <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No photos available</p>
                      <p className="text-sm mt-2">
                        Upload photos to help identify and track this equipment
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipment.created_at && (
                    <div className="flex items-start space-x-3 p-4 border-l-4 border-blue-500 bg-blue-50">
                      <div className="flex-1">
                          <p className="font-medium">
                            Equipment Added to System
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              equipment.created_at
                            ).toLocaleDateString()}{" "}
                            • System
                          </p>
                        <p className="text-sm mt-1">
                            Equipment EQ-
                            {equipment.id.toString().padStart(3, "0")} was added
                            to the maintenance system
                        </p>
                      </div>
                    </div>
                    )}
                    {equipment.date_of_installation && (
                    <div className="flex items-start space-x-3 p-4 border-l-4 border-green-500 bg-green-50">
                      <div className="flex-1">
                        <p className="font-medium">Equipment Installed</p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              equipment.date_of_installation
                            ).toLocaleDateString()}{" "}
                            • Installation Team
                          </p>
                          <p className="text-sm mt-1">
                            Equipment successfully installed at{" "}
                            {equipment.department_name || "location"}
                          </p>
                      </div>
                    </div>
                    )}
                    {equipment.purchase_date && (
                    <div className="flex items-start space-x-3 p-4 border-l-4 border-purple-500 bg-purple-50">
                      <div className="flex-1">
                          <p className="font-medium">Equipment Purchased</p>
                        <p className="text-sm text-gray-600">
                            {new Date(
                              equipment.purchase_date
                            ).toLocaleDateString()}{" "}
                            • Procurement
                          </p>
                          <p className="text-sm mt-1">
                            {equipment.purchase_type &&
                              `Acquisition type: ${
                                equipment.purchase_type
                                  .charAt(0)
                                  .toUpperCase() +
                                equipment.purchase_type.slice(1)
                              }`}
                            {equipment.purchase_cost &&
                              ` • Cost: GHS ${Number(
                                equipment.purchase_cost
                              ).toLocaleString()}`}
                          </p>
                      </div>
                    </div>
                    )}
                    {equipment.has_service_contract && (
                      <div className="flex items-start space-x-3 p-4 border-l-4 border-purple-500 bg-purple-50">
                      <div className="flex-1">
                          <p className="font-medium">
                            Service Contract Activated
                          </p>
                          <p className="text-sm text-gray-600">
                            {equipment.created_at
                              ? new Date(
                                  equipment.created_at
                                ).toLocaleDateString()
                              : "N/A"}{" "}
                            •{" "}
                            {equipment.service_organization ||
                              "Service Provider"}
                          </p>
                          <p className="text-sm mt-1">
                            Service contract activated with{" "}
                            {equipment.service_organization || "provider"}
                          </p>
                      </div>
                    </div>
                    )}
                    {equipment.last_service_date && (
                      <div className="flex items-start space-x-3 p-4 border-l-4 border-orange-500 bg-orange-50">
                      <div className="flex-1">
                          <p className="font-medium">Last Service</p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              equipment.last_service_date
                            ).toLocaleDateString()}{" "}
                            • Service Team
                          </p>
                          <p className="text-sm mt-1">
                            Most recent service performed on this equipment
                          </p>
                      </div>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Upload Document Dialog */}
      <Dialog
        open={isUploadDocDialogOpen}
        onOpenChange={setIsUploadDocDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input id="documentName" placeholder="e.g., User Manual" />
    </div>
            <div className="space-y-2">
              <Label htmlFor="documentFile">Select File</Label>
              <Input
                id="documentFile"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("Document selected:", file.name);
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentDescription">
                Description (Optional)
              </Label>
              <Textarea
                id="documentDescription"
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadDocDialogOpen(false)}
              disabled={uploadingDoc}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setUploadingDoc(true);
                // TODO: Implement actual upload logic with API
                setTimeout(() => {
                  setUploadingDoc(false);
                  setIsUploadDocDialogOpen(false);
                  alert(
                    "Document upload feature will be fully implemented soon!"
                  );
                }, 1000);
              }}
              disabled={uploadingDoc}
            >
              {uploadingDoc ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Photo Dialog */}
      <Dialog
        open={isUploadPhotoDialogOpen}
        onOpenChange={setIsUploadPhotoDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="photoName">Photo Name</Label>
              <Input id="photoName" placeholder="e.g., Front View" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoFile">Select Photo</Label>
              <Input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("Photo selected:", file.name);
                    // Preview the image
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const preview = document.getElementById(
                        "photoPreview"
                      ) as HTMLImageElement;
                      if (preview && event.target?.result) {
                        preview.src = event.target.result as string;
                        preview.classList.remove("hidden");
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF (Max 5MB)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  id="photoPreview"
                  className="hidden max-h-48 mx-auto rounded"
                  alt="Photo preview"
                />
                <div
                  id="photoPlaceholder"
                  className="text-center py-8 text-gray-400"
                >
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">No photo selected</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadPhotoDialogOpen(false)}
              disabled={uploadingPhoto}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setUploadingPhoto(true);
                // TODO: Implement actual upload logic with API
                setTimeout(() => {
                  setUploadingPhoto(false);
                  setIsUploadPhotoDialogOpen(false);
                  alert("Photo upload feature will be fully implemented soon!");
                }, 1000);
              }}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EquipmentDetailSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
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
