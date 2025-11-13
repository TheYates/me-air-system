"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "High":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Fetch maintenance data from backend
  const { data: maintenanceResponse, isLoading } = useQuery({
    queryKey: ["maintenance-schedule"],
    queryFn: () => api.maintenance.list({}),
  });

  const maintenanceData = maintenanceResponse?.data || [];

  // Fetch equipment data for display
  const { data: equipmentResponse } = useQuery({
    queryKey: ["equipment-list"],
    queryFn: () => api.equipment.list({}),
  });

  const allEquipment = equipmentResponse?.data || [];

  // Filter scheduled and in-progress maintenance tasks
  const scheduledTasks = maintenanceData.filter(
    (m: any) => m.status === "scheduled" || m.status === "in-progress"
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const getScheduleForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return scheduledTasks.filter((item: any) => {
      const itemDate = item.scheduled_date || item.date;
      return itemDate && itemDate.split("T")[0] === dateStr;
    });
  };

  const getEquipmentName = (equipmentId: number) => {
    const equipment = allEquipment.find((eq: any) => eq.id === equipmentId);
    return equipment?.name || "Unknown Equipment";
  };

  if (isLoading) {
    return <ScheduleSkeleton />;
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
                Maintenance Schedule
              </h1>
              <Badge variant="secondary">
                {scheduledTasks.length} scheduled tasks
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white rounded-lg border">
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Month
                </Button>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </div>

          {/* Calendar Navigation */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() - 7);
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <h2 className="text-lg font-semibold">
                  {viewMode === "week"
                    ? `Week of ${formatDate(weekDates[0])}`
                    : formatDate(currentDate)}
                </h2>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() + 7);
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Week View */}
          {viewMode === "week" && (
            <div className="grid grid-cols-7 gap-4">
              {weekDates.map((date, index) => {
                const daySchedule = getScheduleForDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <Card
                    key={index}
                    className={isToday ? "ring-2 ring-blue-500" : ""}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-center">
                        <div className="font-medium">
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </div>
                        <div
                          className={`text-lg ${
                            isToday ? "text-blue-600 font-bold" : ""
                          }`}
                        >
                          {date.getDate()}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {daySchedule.map((task: any) => (
                          <Link key={task.id} href={`/maintenance/${task.id}`}>
                            <div
                              className={`p-2 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(
                                task.priority || "Medium"
                              )}`}
                            >
                              <div className="font-medium truncate">
                                {getEquipmentName(task.equipment_id)} -{" "}
                                {task.type}
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {task.scheduled_date
                                    ? new Date(
                                        task.scheduled_date
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "TBD"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span className="truncate">
                                  {task.technician || "Unassigned"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {daySchedule.length === 0 && (
                          <div className="text-center text-gray-400 py-4">
                            No maintenance scheduled
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Upcoming Tasks List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upcoming Maintenance Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledTasks.length > 0 ? (
                  scheduledTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Wrench className="h-5 w-5 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {getEquipmentName(task.equipment_id)} -{" "}
                              {task.type}
                            </div>
                            <div className="text-sm text-gray-600">
                              {task.scheduled_date
                                ? new Date(
                                    task.scheduled_date
                                  ).toLocaleDateString()
                                : "TBD"}{" "}
                              •{" "}
                              {task.estimated_duration
                                ? `${task.estimated_duration}h`
                                : "Duration TBD"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          className={getPriorityColor(
                            task.priority || "Medium"
                          )}
                        >
                          {task.priority || "Medium"}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          <User className="h-4 w-4 inline mr-1" />
                          {task.technician || "Unassigned"}
                        </div>
                        <Link href={`/maintenance/${task.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No upcoming maintenance tasks scheduled
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

function ScheduleSkeleton() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-16 w-full" />
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
