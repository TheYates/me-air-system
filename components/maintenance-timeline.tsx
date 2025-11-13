"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wrench, Clock, DollarSign, AlertCircle } from "lucide-react";

interface MaintenanceRecord {
  id: number;
  maintenanceType?: string;
  performedBy?: string;
  performedDate?: string | Date;
  cost?: number | string;
  status?: string;
  notes?: string;
  description?: string;
  nextMaintenanceDate?: string | Date;
}

interface MaintenanceTimelineProps {
  records: MaintenanceRecord[];
  isLoading?: boolean;
  isError?: boolean;
}

export function MaintenanceTimeline({
  records,
  isLoading,
  isError,
}: MaintenanceTimelineProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load maintenance history</span>
        </div>
      </Card>
    );
  }

  if (!records || records.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-gray-500">
          <Wrench className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No maintenance records yet</p>
          <p className="text-sm">Start logging maintenance activities</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record, index) => (
        <Card key={record.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              {index !== records.length - 1 && (
                <div className="w-1 h-12 bg-blue-200 my-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 py-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">
                      {record.maintenanceType
                        ? record.maintenanceType.charAt(0).toUpperCase() +
                          record.maintenanceType.slice(1)
                        : "Maintenance"}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {record.status || "Scheduled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    By: {record.performedBy || "Not specified"}
                  </p>
                </div>

                <div className="text-right">
                  {record.cost && (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <DollarSign className="h-4 w-4" />
                      GHS {Number(record.cost).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4" />
                {record.performedDate
                  ? new Date(record.performedDate).toLocaleDateString()
                  : "No date"}
              </div>

              {/* Description */}
              {record.description && (
                <p className="text-sm text-gray-700 mb-2">
                  {record.description}
                </p>
              )}

              {/* Notes */}
              {record.notes && (
                <div className="bg-blue-50 border-l-2 border-blue-200 p-2 text-sm text-gray-700 mb-2">
                  <strong>Notes:</strong> {record.notes}
                </div>
              )}

              {/* Next Maintenance */}
              {record.nextMaintenanceDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                  <Clock className="h-4 w-4" />
                  Next maintenance: {new Date(record.nextMaintenanceDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

