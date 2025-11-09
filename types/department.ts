export interface Department {
  id: number;
  name: string;
  manager?: string;
  email?: string;
  phone?: string;
  description?: string;
  sub_units?: string[];
  equipment_count?: number;
  maintenance_count?: number;
  active_maintenance_count?: number;
  total_value?: number;
  budget?: number;
  employees?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SubUnit {
  id: string;
  name: string;
  department_id?: number;
  equipment_count?: number;
  status?: string;
}
