"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Package,
  Wrench,
  Phone,
  Mail,
  Edit,
  Eye,
  Plus,
  X,
  Loader2,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Department } from "@/types/department";
import { Skeleton } from "@/components/ui/skeleton";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  manager: z.string().min(2, "Manager name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

// Helper to format currency
const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "GHS 0";
  return `GHS ${value.toLocaleString()}`;
};

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [subUnits, setSubUnits] = useState<string[]>([]);
  const [subUnitInput, setSubUnitInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubUnit, setSelectedSubUnit] = useState<any>(null);
  const [isSubUnitEquipmentDialogOpen, setIsSubUnitEquipmentDialogOpen] =
    useState(false);
  const [subUnitEquipmentSearch, setSubUnitEquipmentSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Fetch departments from backend
  const { data: departmentData = [], isLoading } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => api.departments.list(),
  });

  // Fetch equipment for sub-unit dialogs
  const { data: equipmentResponse } = useQuery({
    queryKey: ["equipment-list"],
    queryFn: () => api.equipment.list({}),
  });

  const allEquipment = equipmentResponse?.data || [];

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      manager: "",
      email: "",
      phone: "",
      description: "",
    },
  });

  const handleSubUnitInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = subUnitInput.trim();
      if (value && !subUnits.includes(value)) {
        setSubUnits([...subUnits, value]);
        setSubUnitInput("");
      }
    }
  };

  const removeSubUnit = (index: number) => {
    setSubUnits(subUnits.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Department data:", { ...data, subUnits });
    setIsSubmitting(false);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    form.reset();
    setSubUnits([]);
  };

  const openEditDialog = (department: any) => {
    setSelectedDepartment(department);
    form.reset({
      name: department.name,
      manager: department.manager,
      email: department.email,
      phone: department.phone,
      description: department.description,
    });
    setSubUnits(department.subUnits?.map((unit: any) => unit.name) || []);
    setIsEditDialogOpen(true);
  };

  const DepartmentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Manufacturing" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Manager *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., John Smith" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe the department's purpose and responsibilities"
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Mail className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="department@company.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1 (555) 123-4567" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sub-units Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Package className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Sub-units</h3>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Type a sub-unit name and press Enter or comma to add"
              onKeyDown={handleSubUnitInput}
              value={subUnitInput}
              onChange={(e) => setSubUnitInput(e.target.value)}
            />

            {subUnits.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No sub-units added yet
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subUnits.map((unit, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{unit}</span>
                    <button
                      type="button"
                      onClick={() => removeSubUnit(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Add specific areas or rooms within this department
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              form.reset();
              setSubUnits([]);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </form>
    </Form>
  );

  const filteredDepartments = departmentData.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.manager?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <DepartmentsSkeleton />;
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
                Department Management
              </h1>
              <Badge variant="secondary">
                {departmentData.length} departments
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "card" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                  className="h-8 px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                  </DialogHeader>
                  <DepartmentForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative max-w-md">
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Department Grid View */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDepartments.map((department) => {
                // Get equipment for this department
                const deptEquipment = allEquipment.filter(
                  (eq: any) => eq.department_id === department.id
                );

                // Use sub_units from department data (parsed from JSON)
                const subUnits = department.sub_units || [];

                // Sort sub-units: prioritize ones with equipment
                const sortedSubUnits = [...subUnits].sort((a, b) => {
                  const countA = deptEquipment.filter(
                    (eq: any) => eq.sub_unit === a
                  ).length;
                  const countB = deptEquipment.filter(
                    (eq: any) => eq.sub_unit === b
                  ).length;
                  return countB - countA; // Descending order
                });

                return (
                  <Card
                    key={department.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {department.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Manager Info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="font-medium truncate">
                            {department.manager}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{department.email}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-0.5">
                            <Package className="h-3 w-3 text-blue-500" />
                          </div>
                          <div className="text-base font-bold">
                            {department.equipment_count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Equipment</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-0.5">
                            <Wrench className="h-3 w-3 text-yellow-500" />
                          </div>
                          <div className="text-base font-bold">
                            {department.maintenance_count || 0}
                          </div>
                          <div className="text-xs text-gray-600">
                            Maintenance
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold">
                            {formatCurrency(department.total_value)}
                          </div>
                          <div className="text-xs text-gray-600">Value</div>
                        </div>
                      </div>

                      {/* Sub-units */}
                      {sortedSubUnits.length > 0 && (
                        <div className="space-y-1 pt-2 border-t">
                          <div className="text-xs text-gray-600 mb-1">
                            Sub-units ({sortedSubUnits.length})
                          </div>
                          <div className="space-y-0.5">
                            {sortedSubUnits.slice(0, 2).map((subUnit, idx) => {
                              const subUnitCount = deptEquipment.filter(
                                (eq: any) => eq.sub_unit === subUnit
                              ).length;
                              return (
                                <div
                                  key={idx}
                                  className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 flex justify-between items-center"
                                  onClick={() => {
                                    setSelectedDepartment(department);
                                    setIsSubUnitEquipmentDialogOpen(true);
                                  }}
                                >
                                  <span>{subUnit}</span>
                                  <span className="text-xs text-gray-500">
                                    {subUnitCount}
                                  </span>
                                </div>
                              );
                            })}
                            {sortedSubUnits.length > 2 && (
                              <div
                                className="text-xs text-gray-500 cursor-pointer hover:text-blue-600"
                                onClick={() => {
                                  setSelectedDepartment(department);
                                  setIsSubUnitEquipmentDialogOpen(true);
                                }}
                              >
                                +{sortedSubUnits.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-1 pt-2">
                        <Link
                          href={`/departments/${department.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => openEditDialog(department)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Department Table View */}
          {viewMode === "table" && (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Active Tasks</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Sub-units</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((department) => {
                        // Get equipment for this department
                        const deptEquipment = allEquipment.filter(
                          (eq: any) => eq.department_id === department.id
                        );

                        // Use sub_units from department data (parsed from JSON)
                        const subUnits = department.sub_units || [];

                        // Sort sub-units: prioritize ones with equipment
                        const sortedSubUnits = [...subUnits].sort((a, b) => {
                          const countA = deptEquipment.filter(
                            (eq: any) => eq.sub_unit === a
                          ).length;
                          const countB = deptEquipment.filter(
                            (eq: any) => eq.sub_unit === b
                          ).length;
                          return countB - countA; // Descending order
                        });

                        return (
                          <TableRow key={department.id}>
                            <TableCell className="font-medium">
                              DEPT-{department.id.toString().padStart(3, "0")}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {department.name}
                              </div>
                            </TableCell>
                            <TableCell>{department.manager}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {department.email}
                                </div>
                                {department.phone && (
                                  <div className="text-xs text-gray-500">
                                    {department.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {department.equipment_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {department.maintenance_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(department.total_value)}
                            </TableCell>
                            <TableCell>
                              {sortedSubUnits.length > 0 ? (
                                <div className="space-y-0.5">
                                  {sortedSubUnits
                                    .slice(0, 2)
                                    .map((subUnit, idx) => {
                                      const subUnitCount = deptEquipment.filter(
                                        (eq: any) => eq.sub_unit === subUnit
                                      ).length;
                                      return (
                                        <div
                                          key={idx}
                                          className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 flex justify-between items-center gap-2"
                                          onClick={() => {
                                            setSelectedDepartment(department);
                                            setIsSubUnitEquipmentDialogOpen(
                                              true
                                            );
                                          }}
                                        >
                                          <span>{subUnit}</span>
                                          <span className="text-xs text-gray-500">
                                            {subUnitCount}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  {sortedSubUnits.length > 2 && (
                                    <div
                                      className="text-xs text-gray-500 cursor-pointer hover:text-blue-600"
                                      onClick={() => {
                                        setSelectedDepartment(department);
                                        setIsSubUnitEquipmentDialogOpen(true);
                                      }}
                                    >
                                      +{sortedSubUnits.length - 2} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  None
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Link href={`/departments/${department.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(department)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-10 text-gray-500"
                        >
                          {searchTerm
                            ? "No departments found"
                            : "No departments available"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Department - {selectedDepartment?.name}
            </DialogTitle>
          </DialogHeader>
          <DepartmentForm isEdit={true} />
        </DialogContent>
      </Dialog>

      {/* SubUnit Equipment Dialog */}
      <Dialog
        open={isSubUnitEquipmentDialogOpen}
        onOpenChange={(open) => {
          setIsSubUnitEquipmentDialogOpen(open);
          if (!open) setSubUnitEquipmentSearch("");
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Equipment in Department: {selectedDepartment?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search equipment..."
                value={subUnitEquipmentSearch}
                onChange={(e) => setSubUnitEquipmentSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Equipment Table */}
            <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const equipment = allEquipment.filter(
                      (eq: any) => eq.department_id === selectedDepartment?.id
                    );
                    const filtered = equipment.filter((eq: any) =>
                      subUnitEquipmentSearch
                        ? eq.name
                            .toLowerCase()
                            .includes(subUnitEquipmentSearch.toLowerCase()) ||
                          eq.id.toString().includes(subUnitEquipmentSearch)
                        : true
                    );

                    if (filtered.length === 0) {
                      return (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-gray-500"
                          >
                            {subUnitEquipmentSearch
                              ? "No equipment found"
                              : "No equipment in this department"}
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return filtered.map((eq: any) => (
                      <TableRow key={eq.id}>
                        <TableCell className="font-medium">{eq.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              eq.status === "operational"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {eq.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(eq.purchase_cost)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/equipment/${eq.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DepartmentsSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-full max-w-md" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
