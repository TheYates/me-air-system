import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  json,
  index,
} from "drizzle-orm/pg-core";

// Activities Table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date"),
  equipmentId: integer("equipment_id"),
  departmentId: integer("department_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Departments Table
export const departments = pgTable(
  "departments",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    manager: varchar("manager", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    description: text("description"),
    subUnits: json("sub_units"),
    budget: numeric("budget", { precision: 15, scale: 2 }),
    employees: integer("employees"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("departments_name_idx").on(table.name),
  })
);

// Equipment Table
export const equipment = pgTable(
  "equipment",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    manufacturer: varchar("manufacturer", { length: 255 }).notNull(),
    countryOfOrigin: varchar("country_of_origin", { length: 255 }),
    yearOfManufacture: integer("year_of_manufacture"),
    tagNumber: varchar("tag_number", { length: 255 }).notNull(),
    owner: varchar("owner", { length: 255 }),
    maintainedBy: varchar("maintained_by", { length: 255 }),
    warrantyInfo: text("warranty_info"),
    warrantyExpiry: timestamp("warranty_expiry"),
    dateOfInstallation: timestamp("date_of_installation"),
    departmentId: integer("department_id"),
    subUnit: varchar("sub_unit", { length: 255 }),
    model: varchar("model", { length: 255 }),
    mfgNumber: varchar("mfg_number", { length: 255 }),
    serialNumber: varchar("serial_number", { length: 255 }),
    status: varchar("status", { length: 50 }).default("operational"),
    purchaseType: varchar("purchase_type", { length: 50 }).notNull(),
    purchaseDate: timestamp("purchase_date"),
    purchaseOrderNumber: varchar("purchase_order_number", { length: 255 }),
    purchaseCost: numeric("purchase_cost", { precision: 15, scale: 2 }),
    leaseId: varchar("lease_id", { length: 255 }),
    photoUrl: varchar("photo_url", { length: 500 }),
    hasServiceContract: integer("has_service_contract").default(0),
    serviceOrganization: varchar("service_organization", { length: 255 }),
    serviceTypes: json("service_types"),
    contactInfo: varchar("contact_info", { length: 255 }),
    employeeNumber: varchar("employee_number", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("equipment_name_idx").on(table.name),
    statusIdx: index("equipment_status_idx").on(table.status),
    departmentIdx: index("equipment_department_idx").on(table.departmentId),
  })
);

// Equipment Documents Table
export const equipmentDocuments = pgTable("equipment_documents", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  documentType: varchar("document_type", { length: 255 }),
  documentUrl: varchar("document_url", { length: 500 }),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Equipment Photos Table
export const equipmentPhotos = pgTable("equipment_photos", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  photoUrl: varchar("photo_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Equipment Specifications Table
export const equipmentSpecifications = pgTable("equipment_specifications", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  specificationKey: varchar("specification_key", { length: 255 }),
  specificationValue: text("specification_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Table
export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id"),
  maintenanceType: varchar("maintenance_type", { length: 255 }),
  description: text("description"),
  performedBy: varchar("performed_by", { length: 255 }),
  performedDate: timestamp("performed_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  cost: numeric("cost", { precision: 15, scale: 2 }),
  status: varchar("status", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Checklist Table
export const maintenanceChecklist = pgTable("maintenance_checklist", {
  id: serial("id").primaryKey(),
  maintenanceId: integer("maintenance_id"),
  itemDescription: text("item_description"),
  isCompleted: integer("is_completed").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Documents Table
export const maintenanceDocuments = pgTable("maintenance_documents", {
  id: serial("id").primaryKey(),
  maintenanceId: integer("maintenance_id"),
  documentType: varchar("document_type", { length: 255 }),
  documentUrl: varchar("document_url", { length: 500 }),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Notes Table
export const maintenanceNotes = pgTable("maintenance_notes", {
  id: serial("id").primaryKey(),
  maintenanceId: integer("maintenance_id"),
  note: text("note"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Parts Table
export const maintenanceParts = pgTable("maintenance_parts", {
  id: serial("id").primaryKey(),
  maintenanceId: integer("maintenance_id"),
  partName: varchar("part_name", { length: 255 }),
  partNumber: varchar("part_number", { length: 255 }),
  quantity: integer("quantity"),
  cost: numeric("cost", { precision: 15, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Photos Table
export const maintenancePhotos = pgTable("maintenance_photos", {
  id: serial("id").primaryKey(),
  maintenanceId: integer("maintenance_id"),
  photoUrl: varchar("photo_url", { length: 500 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Requests Table
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id"),
  requestedBy: varchar("requested_by", { length: 255 }),
  requestDate: timestamp("request_date"),
  priority: varchar("priority", { length: 50 }),
  description: text("description"),
  status: varchar("status", { length: 50 }),
  assignedTo: varchar("assigned_to", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Types Table
export const maintenanceTypes = pgTable(
  "maintenance_types",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    defaultFrequency: varchar("default_frequency", { length: 50 }),
    estimatedDuration: integer("estimated_duration"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("maintenance_types_name_idx").on(table.name),
  })
);



