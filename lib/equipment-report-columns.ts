import type { Equipment } from "@/types/equipment";

export type ReportColumnKey =
  | "name"
  | "tagNumber"
  | "manufacturer"
  | "department"
  | "subUnit"
  | "status"
  | "lastMaintenance"
  | "dateAdded"
  | "value";

export type ReportColumns = Record<ReportColumnKey, boolean>;

export const DEFAULT_REPORT_COLUMNS: ReportColumns = {
  name: true,
  manufacturer: true,
  department: true,
  subUnit: true,
  status: true,
  dateAdded: true,
  value: true,
  tagNumber: false,
  lastMaintenance: false,
};

export interface ReportColumnDef {
  key: ReportColumnKey;
  label: string;
  getValue: (equipment: Equipment) => string | number;
}

function formatStatus(status?: string) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value?: string | null) {
  if (!value) return "Not Set";
  return new Date(value).toLocaleDateString();
}

export const EQUIPMENT_REPORT_COLUMN_DEFS: ReportColumnDef[] = [
  {
    key: "name",
    label: "Equipment Name",
    getValue: (e) => e.name,
  },
  {
    key: "tagNumber",
    label: "Tag Number",
    getValue: (e) => e.tag_number || "Not Set",
  },
  {
    key: "manufacturer",
    label: "Manufacturer",
    getValue: (e) => `${e.manufacturer} ${e.model || ""}`.trim(),
  },
  {
    key: "department",
    label: "Department",
    getValue: (e) => e.department_name || "Unassigned",
  },
  {
    key: "subUnit",
    label: "Sub Unit",
    getValue: (e) => e.sub_unit || "Not Specified",
  },
  {
    key: "status",
    label: "Status",
    getValue: (e) => formatStatus(e.status),
  },
  {
    key: "lastMaintenance",
    label: "Last Maintenance",
    getValue: (e) => formatDate(e.last_service_date),
  },
  {
    key: "dateAdded",
    label: "Date Added",
    getValue: (e) => {
      const date = e.createdAt || e.created_at;
      return date ? formatDate(date) : "Not Available";
    },
  },
  {
    key: "value",
    label: "Value (GHS)",
    getValue: (e) =>
      e.purchase_cost != null
        ? Number(e.purchase_cost).toLocaleString()
        : "Not Set",
  },
];

export function getSelectedColumnDefs(columns: ReportColumns): ReportColumnDef[] {
  return EQUIPMENT_REPORT_COLUMN_DEFS.filter((def) => columns[def.key]);
}

export function buildReportTable(
  equipment: Equipment[],
  columns: ReportColumns
): { headers: string[]; rows: (string | number)[][] } {
  const defs = getSelectedColumnDefs(columns);
  const headers = defs.map((d) => d.label);
  const rows = equipment.map((item) =>
    defs.map((d) => d.getValue(item))
  );
  return { headers, rows };
}

export function hasSelectedColumns(columns: ReportColumns): boolean {
  return getSelectedColumnDefs(columns).length > 0;
}
