export interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  type: string;
  status: string;
  priority?: string;
  date: Date | string;
  scheduledDate?: Date | string;
  completedDate?: Date | string;
  technician?: string;
  notes?: string;
  cost?: number | string;
  description?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  progress?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Optional fields for joined data
  equipment_name?: string;
  tag_number?: string;
  department?: string;
}

export interface MaintenanceFilters {
  equipment_id?: number;
  status?: string;
  type?: string;
  upcoming?: boolean;
  page?: number;
  limit?: number;
}
