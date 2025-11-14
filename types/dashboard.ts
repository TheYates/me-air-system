export interface DashboardStats {
  totalEquipment: number;
  underMaintenance: number;
  warrantyExpiring: number;
  serviceDue: number;
  equipmentByDepartment: {
    department: string;
    count: number;
  }[];
  recentActivities: {
    id: number;
    type: string;
    description: string;
    date: string;
  }[];
  statusBreakdown: Record<string, number>;
  equipmentValue: number;
  averageEquipmentAge: number | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  upcomingMaintenance: {
    id?: number;
    equipment_id: number;
    equipment_name: string;
    model?: string;
    manufacturer?: string;
    due_date: string;
    maintenance_type?: string;
  }[];
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}
