"use client";

import { useState, useEffect } from "react";
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
  Download,
  Loader2,
} from "lucide-react";

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

interface Department {
  id: number;
  name: string;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [department, setDepartment] = useState("all");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments");
        const data = await response.json();
        if (data.success) {
          setDepartments(data.departments);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "last-7-days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "last-30-days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "last-90-days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "last-year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Generate report
  const generateReport = async () => {
    if (!selectedReport) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        departmentId: department,
        startDate,
        endDate,
      });

      const response = await fetch(`/api/reports/${selectedReport}?${params}`);
      const data = await response.json();

      if (data.success) {
        setReportData(data);
      } else {
        console.error("Error fetching report:", data.error);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when report is selected
  useEffect(() => {
    if (selectedReport) {
      generateReport();
    }
  }, [selectedReport]);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "_");
    switch (normalizedStatus) {
      case "operational":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "under_maintenance":
      case "under maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "broken":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "retired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getWarrantyStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "expiring":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "expiring-soon":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value: number | string | null) => {
    if (!value) return "$0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Generating Report
              </h3>
              <p className="text-muted-foreground">
                Please wait while we fetch the data...
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!reportData) {
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

    switch (selectedReport) {
      case "equipment-inventory":
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {reportData.summary.totalEquipment}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(reportData.summary.totalValue)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Operational
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary.byStatus?.operational || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Under Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {reportData.summary.byStatus?.under_maintenance || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Equipment Table */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Inventory Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Warranty Expiry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportData.data || []).map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.tagNumber}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.departmentName || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(item.purchaseCost)}</TableCell>
                        <TableCell>{formatDate(item.warrantyExpiry)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "maintenance-history":
        // Transform monthly stats for chart
        const monthlyData = reportData.summary.monthlyStats || {};
        const months = Object.keys(monthlyData).sort();
        const chartData = {
          labels: months.map((m) => {
            const date = new Date(m + "-01");
            return date.toLocaleDateString("en-US", { month: "short" });
          }),
          preventive: months.map((m) => monthlyData[m].preventive || 0),
          repair: months.map((m) => monthlyData[m].repair || 0),
          calibration: months.map((m) => monthlyData[m].calibration || 0),
          inspection: months.map((m) => monthlyData[m].inspection || 0),
        };

        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {reportData.summary.totalMaintenance}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(reportData.summary.totalCost)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Preventive Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.summary.byType?.preventive || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance History Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <BarChartComponent
                    labels={chartData.labels}
                    datasets={[
                      {
                        label: "Preventive",
                        data: chartData.preventive,
                        backgroundColor: "#3b82f6",
                      },
                      {
                        label: "Repair",
                        data: chartData.repair,
                        backgroundColor: "#ef4444",
                      },
                      {
                        label: "Calibration",
                        data: chartData.calibration,
                        backgroundColor: "#10b981",
                      },
                      {
                        label: "Inspection",
                        data: chartData.inspection,
                        backgroundColor: "#f59e0b",
                      },
                    ]}
                    stacked={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "department-summary":
        const distribution = reportData.summary.distribution || [];
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Departments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {reportData.summary.totalDepartments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {reportData.summary.totalEquipment}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(reportData.summary.totalValue)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Operational
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary.totalOperational}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Department Summary Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] mb-6">
                  <PieChartComponent
                    labels={distribution.map((item: any) => item.name)}
                    data={distribution.map((item: any) => item.value)}
                    colors={colors}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {distribution.map((item: any, index: number) => {
                    const total = distribution.reduce(
                      (sum: number, i: any) => sum + i.value,
                      0
                    );
                    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
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
          </div>
        );

      case "warranty-status":
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {reportData.summary.total}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.summary.active}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {reportData.summary.expiringSoon}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expiring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {reportData.summary.expiring}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expired
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {reportData.summary.expired}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Warranty Table */}
            <Card>
              <CardHeader>
                <CardTitle>Warranty Status Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Warranty Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Until Expiry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportData.data || []).map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.tagNumber}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.departmentName || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge className={getWarrantyStatusColor(item.warrantyStatus || "unknown")}>
                            {item.warrantyStatus ? item.warrantyStatus.replace("-", " ") : "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.warrantyExpiry)}</TableCell>
                        <TableCell>
                          {item.daysUntilExpiry !== undefined && item.daysUntilExpiry < 0
                            ? `Expired ${Math.abs(item.daysUntilExpiry)} days ago`
                            : item.daysUntilExpiry !== undefined
                            ? `${item.daysUntilExpiry} days`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "activities-log":
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {reportData.summary.totalActivities}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Activity Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {Object.keys(reportData.summary.byType || {}).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Departments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {Object.keys(reportData.summary.byDepartment || {}).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activities Table */}
            <Card>
              <CardHeader>
                <CardTitle>Activities Log Report</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportData.data || []).map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.date || item.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {item.description}
                        </TableCell>
                        <TableCell>
                          {item.equipmentName ? (
                            <span className="text-sm">
                              {item.equipmentName}
                              <span className="text-muted-foreground ml-1">
                                ({item.equipmentTag})
                              </span>
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>{item.departmentName || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "status-analysis": {
        const statusDist = reportData.summary.statusDistribution || [];
        const statusColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {reportData.summary.totalEquipment}
                  </div>
                </CardContent>
              </Card>
              {statusDist.slice(0, 3).map((item: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                      {(item.status || "unknown").replace("_", " ")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {item.count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(item.totalValue)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <PieChartComponent
                    labels={statusDist.map((item: any) => (item.status || "unknown").replace("_", " "))}
                    data={statusDist.map((item: any) => item.count)}
                    colors={statusColors}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(reportData.summary.ageDistribution || {}).map(
                    ([category, count]: [string, any]) => (
                      <div
                        key={category}
                        className="flex flex-col items-center p-4 bg-muted rounded-lg"
                      >
                        <div className="text-2xl font-bold text-foreground">{count}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {category}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

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
    <div className="flex-1 space-y-4 overflow-auto">
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
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={generateReport} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Report"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Content */}
          {renderReportContent()}
    </div>
  );
}
