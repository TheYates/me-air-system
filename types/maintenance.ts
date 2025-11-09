export interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  equipment_name?: string;
  tag_number?: string;
  department?: string;
  type: "preventive" | "corrective" | "repair" | "inspection";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  priority?: "critical" | "high" | "medium" | "low";
  date: string;
  scheduled_date?: string;
  completed_date?: string;
  technician?: string;
  notes?: string;
  cost?: number;
  description?: string;
  estimated_duration?: string;
  actual_duration?: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceFilters {
  equipment_id?: number;
  status?: string;
  type?: string;
  upcoming?: boolean;
  page?: number;
  limit?: number;
}
