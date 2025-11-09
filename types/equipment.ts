export interface Equipment {
  id: number;
  name: string;
  manufacturer: string;
  country_of_origin?: string;
  year_of_manufacture?: number;
  date_of_installation?: string;
  tag_number: string;
  owner?: string;
  maintained_by?: string;
  model?: string;
  serial_number?: string;
  status?: "operational" | "maintenance" | "broken" | "retired";
  department_id?: number;
  department_name?: string;
  sub_unit?: string;
  purchase_date?: string;
  purchase_cost?: number;
  purchase_type: "purchase" | "lease" | "rental";
  purchase_order_number: string;
  has_service_contract: boolean;
  service_organization: string;
  service_types: string[];
  photo_url?: string;
  mfg_number?: string;
  warranty_info?: string;
  lease_id?: string;
  contact_info?: string;
  employee_number?: string;
  last_service_date?: string;
  next_maintenance_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentFilters {
  search?: string;
  department?: number;
  unit?: number;
  status?: string;
  page?: number;
  limit?: number;
  warranty?: "expiring";
  service?: "due";
}
