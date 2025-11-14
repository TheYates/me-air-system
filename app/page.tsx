"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "@/components/navigation";
import {
  Wrench,
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardStats, Department } from "@/types/dashboard";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { LineChartComponent } from "@/components/charts/line-chart";

// Helper function to generate maintenance trend data from real data
const generateMaintenanceTrends = (maintenanceRecords: any[]) => {
  // Month names for labels
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get last 6 months
  const months: { [key: string]: { completed: number; scheduled: number } } =
    {};
  const now = new Date();

  // Initialize last 6 months using simple month/year keys
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthKey = `${year}-${month}`;
    months[monthKey] = { completed: 0, scheduled: 0 };
  }

  // Count maintenance records by month and status
  maintenanceRecords.forEach((record: any) => {
    // Get the date from the record, handling various formats
    let recordDate: Date | null = null;
    const dateValue =
      record.completedDate || record.scheduledDate || record.date;

    if (dateValue) {
      recordDate = new Date(dateValue);
      // Check if date is valid
      if (isNaN(recordDate.getTime())) {
        recordDate = null;
      }
    }

    if (recordDate) {
      const year = recordDate.getFullYear();
      const month = recordDate.getMonth();
      const monthKey = `${year}-${month}`;

      if (months[monthKey]) {
        if (record.status === "completed") {
          months[monthKey].completed++;
        } else if (record.status === "scheduled") {
          months[monthKey].scheduled++;
        }
      }
    }
  });

  // Convert to array format for chart
  return Object.entries(months).map(([monthKey, data]) => {
    const [, monthNum] = monthKey.split("-");
    const monthIndex = parseInt(monthNum);
    const monthName = monthNames[monthIndex];

    return {
      month: monthName,
      completed: data.completed,
      scheduled: data.scheduled,
    };
  });
};

// Fallback data for testing
const FALLBACK_STATS: DashboardStats = {
  totalEquipment: 689,
  underMaintenance: 45,
  warrantyExpiring: 12,
  serviceDue: 12,
  equipmentValue: 2500000,
  averageEquipmentAge: null,
  statusBreakdown: {
    operational: 612,
    maintenance: 45,
    broken: 32,
    retired: 0,
  },
  equipmentByDepartment: [
    { department: "Laboratory", count: 125 },
    { department: "Radiology", count: 87 },
    { department: "Cardiology", count: 64 },
  ],
  recentActivities: [],
  upcomingMaintenance: [],
  pagination: {
    total: 689,
    page: 1,
    limit: 20,
  },
};

export default function Dashboard() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        return await api.dashboard.getStats();
      } catch (err) {
        console.log("API failed, using fallback data:", err);
        return FALLBACK_STATS;
      }
    },
    retry: 1,
    retryDelay: 500,
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => api.departments.list(),
    retry: 1,
  });

  // Fetch all maintenance records for trend data
  const { data: maintenanceResponse } = useQuery({
    queryKey: ["maintenance-all"],
    queryFn: () => api.maintenance.list({ page: 1, limit: 1000 }),
    retry: 1,
  });

  const maintenanceRecords = maintenanceResponse?.data || [];
  const maintenanceTrendData = generateMaintenanceTrends(maintenanceRecords);

  // Transform statusBreakdown into chart data
  // Filter out zero values to improve chart visibility
  const equipmentStatusData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          color:
            status === "operational"
              ? "#22c55e"
              : status === "maintenance"
              ? "#f59e0b"
              : status === "broken"
              ? "#ef4444"
              : "#6b7280",
        }))
    : [];

  // Transform equipmentByDepartment for chart (limit to top 5)
  const departmentData = (stats?.equipmentByDepartment || []).slice(0, 5);

  // Show skeleton only on true initial load (no data at all)
  if (isLoading && !stats) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Equipment
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalEquipment || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total registered equipment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Maintenance
                </CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.underMaintenance || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently being serviced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Warranty Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.serviceDue || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Expiring in 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Asset Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {stats?.equipmentValue
                    ? (stats.equipmentValue / 1000000).toFixed(1)
                    : 0}
                  M
                </div>
                <p className="text-xs text-muted-foreground">
                  Total equipment value
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Equipment Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChartComponent
                    labels={equipmentStatusData.map((item) => item.name)}
                    data={equipmentStatusData.map((item) => item.value)}
                    colors={equipmentStatusData.map((item) => item.color)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {equipmentStatusData.map((item, index) => {
                    const total = equipmentStatusData.reduce(
                      (sum, i) => sum + i.value,
                      0
                    );
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">
                          {item.name}: {item.value} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Department Equipment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] flex justify-center">
                  <div className="w-full">
                    <BarChartComponent
                      labels={departmentData.map(
                        (item: any) => item.department
                      )}
                      datasets={[
                        {
                          label: "Total Equipment",
                          data: departmentData.map((item: any) => item.count),
                          backgroundColor: "#3b82f6",
                        },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Maintenance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LineChartComponent
                    labels={maintenanceTrendData.map((item) => item.month)}
                    datasets={[
                      {
                        label: "Completed",
                        data: maintenanceTrendData.map(
                          (item) => item.completed
                        ),
                        borderColor: "#22c55e",
                      },
                      {
                        label: "Scheduled",
                        data: maintenanceTrendData.map(
                          (item) => item.scheduled
                        ),
                        borderColor: "#3b82f6",
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.upcomingMaintenance &&
                  stats.upcomingMaintenance.length > 0 ? (
                    stats.upcomingMaintenance.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.equipment_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.manufacturer && item.model
                              ? `${item.manufacturer} - ${item.model}`
                              : item.manufacturer ||
                                item.model ||
                                "Not Specified"}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {item.maintenance_type || "Scheduled"}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {new Date(item.due_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No upcoming maintenance scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivities &&
                stats.recentActivities.length > 0 ? (
                  stats.recentActivities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0">
                        {activity.type === "maintenance" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {activity.type === "operational" && (
                          <Package className="h-5 w-5 text-blue-500" />
                        )}
                        {activity.type === "request" && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        {activity.type === "broken" && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(activity.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activities to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {/* Key Metrics Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px] mb-1" />
                  <Skeleton className="h-3 w-[120px]" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-[140px]" />
              </CardHeader>
              <CardContent className="h-[300px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-[140px]" />
              </CardHeader>
              <CardContent className="h-[300px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-[120px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-8 w-8" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-[120px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-8 w-8" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-[120px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
