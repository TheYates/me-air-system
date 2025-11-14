"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileText,
  Filter,
  BarChart3,
  PieChart,
  AlertTriangle,
  Package,
  Wrench,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";

const reportTypes = [
  {
    id: "equipment-inventory",
    name: "Equipment Inventory Report",
    description: "Complete equipment listing with specifications and status",
    icon: Package,
    category: "Equipment",
  },
  {
    id: "maintenance-history",
    name: "Maintenance History Report",
    description: "Historical maintenance data and trends analysis",
    icon: Wrench,
    category: "Maintenance",
  },
  {
    id: "department-summary",
    name: "Department Summary Report",
    description: "Equipment distribution and status by department",
    icon: BarChart3,
    category: "Department",
  },
  {
    id: "warranty-status",
    name: "Warranty Status Report",
    description: "Equipment warranty status and expiring warranties",
    icon: AlertTriangle,
    category: "Warranty",
  },
  {
    id: "activities-log",
    name: "Activities Log Report",
    description: "System activity and audit trail",
    icon: FileText,
    category: "System",
  },
  {
    id: "status-analysis",
    name: "Status Analysis Report",
    description: "Equipment status breakdown and trends",
    icon: PieChart,
    category: "Analytics",
  },
];

const sampleInventoryData = [
  {
    id: "EQ-001",
    name: "Industrial Printer A1",
    department: "Manufacturing",
    status: "Operational",
    value: "$15,000",
    warranty: "2025-01-15",
  },
  {
    id: "EQ-045",
    name: "HVAC Unit B2",
    department: "Facilities",
    status: "Under Maintenance",
    value: "$25,000",
    warranty: "2024-03-20",
  },
  {
    id: "EQ-123",
    name: "Centrifuge C3",
    department: "Laboratory",
    status: "Operational",
    value: "$35,000",
    warranty: "2026-05-10",
  },
  {
    id: "EQ-089",
    name: "Server Rack D1",
    department: "IT Department",
    status: "Operational",
    value: "$18,000",
    warranty: "2024-02-12",
  },
  {
    id: "EQ-234",
    name: "MRI Scanner E1",
    department: "Medical",
    status: "Broken",
    value: "$450,000",
    warranty: "2025-09-05",
  },
];

const maintenanceStatsData = [
  { month: "Jan", preventive: 15, repair: 8, calibration: 5, inspection: 12 },
  { month: "Feb", preventive: 18, repair: 6, calibration: 7, inspection: 10 },
  { month: "Mar", preventive: 22, repair: 12, calibration: 4, inspection: 15 },
  { month: "Apr", preventive: 20, repair: 9, calibration: 8, inspection: 13 },
  { month: "May", preventive: 25, repair: 7, calibration: 6, inspection: 18 },
  { month: "Jun", preventive: 28, repair: 5, calibration: 9, inspection: 16 },
];

const departmentDistribution = [
  { name: "Manufacturing", value: 89, color: "#3b82f6" },
  { name: "Laboratory", value: 67, color: "#10b981" },
  { name: "Facilities", value: 54, color: "#f59e0b" },
  { name: "IT Department", value: 43, color: "#8b5cf6" },
  { name: "Medical", value: 38, color: "#ef4444" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [department, setDepartment] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operational":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Under Maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Broken":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Retired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case "equipment-inventory":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Equipment Inventory Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Warranty Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleInventoryData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.value}</TableCell>
                      <TableCell>{item.warranty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "maintenance-history":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <BarChartComponent
                  labels={maintenanceStatsData.map((item) => item.month)}
                  datasets={[
                    {
                      label: "Preventive",
                      data: maintenanceStatsData.map((item) => item.preventive),
                      backgroundColor: "#3b82f6",
                    },
                    {
                      label: "Repair",
                      data: maintenanceStatsData.map((item) => item.repair),
                      backgroundColor: "#ef4444",
                    },
                    {
                      label: "Calibration",
                      data: maintenanceStatsData.map(
                        (item) => item.calibration
                      ),
                      backgroundColor: "#10b981",
                    },
                    {
                      label: "Inspection",
                      data: maintenanceStatsData.map((item) => item.inspection),
                      backgroundColor: "#f59e0b",
                    },
                  ]}
                  stacked={true}
                />
              </div>
            </CardContent>
          </Card>
        );

      case "department-summary":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Department Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] mb-6">
                <PieChartComponent
                  labels={departmentDistribution.map((item) => item.name)}
                  data={departmentDistribution.map((item) => item.value)}
                  colors={departmentDistribution.map((item) => item.color)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {departmentDistribution.map((item, index) => {
                  const total = departmentDistribution.reduce(
                    (sum, i) => sum + i.value,
                    0
                  );
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">{item.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a Report
                </h3>
                <p className="text-muted-foreground">
                  Choose a report type from the list above to generate and view
                  the report.
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Report Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((report) => {
                  const IconComponent = report.icon;
                  return (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedReport === report.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent
                          className={`h-6 w-6 mt-1 ${
                            selectedReport === report.id
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {report.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {report.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          {selectedReport && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Report Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-7-days">Last 7 days</SelectItem>
                        <SelectItem value="last-30-days">
                          Last 30 days
                        </SelectItem>
                        <SelectItem value="last-90-days">
                          Last 90 days
                        </SelectItem>
                        <SelectItem value="last-year">Last year</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Department</label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="facilities">Facilities</SelectItem>
                        <SelectItem value="it">IT Department</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button>Generate Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Content */}
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
}
