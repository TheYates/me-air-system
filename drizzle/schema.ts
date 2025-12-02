import { pgTable, index, foreignKey, serial, integer, varchar, timestamp, text, numeric, boolean, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const equipmentPhotos = pgTable("equipment_photos", {
	id: serial().primaryKey().notNull(),
	equipmentId: integer("equipment_id").notNull(),
	photoUrl: varchar("photo_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("equipment_photos_equipment_id_idx").using("btree", table.equipmentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "equipment_photos_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);

export const equipmentSpecifications = pgTable("equipment_specifications", {
	id: serial().primaryKey().notNull(),
	equipmentId: integer("equipment_id").notNull(),
	specificationKey: varchar("specification_key", { length: 255 }),
	specificationValue: text("specification_value"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("equipment_specifications_equipment_id_idx").using("btree", table.equipmentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "equipment_specifications_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);

export const maintenance = pgTable("maintenance", {
	id: serial().primaryKey().notNull(),
	equipmentId: integer("equipment_id").notNull(),
	type: varchar({ length: 50 }).notNull(),
	status: varchar({ length: 50 }).default('scheduled'),
	priority: varchar({ length: 20 }),
	date: timestamp({ mode: 'string' }).notNull(),
	scheduledDate: timestamp("scheduled_date", { mode: 'string' }),
	completedDate: timestamp("completed_date", { mode: 'string' }),
	technician: varchar({ length: 255 }),
	notes: text(),
	cost: numeric({ precision: 15, scale:  2 }),
	description: text(),
	estimatedDuration: varchar("estimated_duration", { length: 100 }),
	actualDuration: varchar("actual_duration", { length: 100 }),
	progress: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_date_idx").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	index("maintenance_equipment_id_idx").using("btree", table.equipmentId.asc().nullsLast().op("int4_ops")),
	index("maintenance_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "maintenance_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);

export const maintenanceChecklist = pgTable("maintenance_checklist", {
	id: serial().primaryKey().notNull(),
	maintenanceId: integer("maintenance_id").notNull(),
	task: varchar({ length: 255 }).notNull(),
	completed: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_checklist_maintenance_id_idx").using("btree", table.maintenanceId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.maintenanceId],
			foreignColumns: [maintenance.id],
			name: "maintenance_checklist_maintenance_id_maintenance_id_fk"
		}).onDelete("cascade"),
]);

export const maintenanceDocuments = pgTable("maintenance_documents", {
	id: serial().primaryKey().notNull(),
	maintenanceId: integer("maintenance_id").notNull(),
	documentType: varchar("document_type", { length: 100 }),
	documentUrl: varchar("document_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_documents_maintenance_id_idx").using("btree", table.maintenanceId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.maintenanceId],
			foreignColumns: [maintenance.id],
			name: "maintenance_documents_maintenance_id_maintenance_id_fk"
		}).onDelete("cascade"),
]);

export const maintenanceNotes = pgTable("maintenance_notes", {
	id: serial().primaryKey().notNull(),
	maintenanceId: integer("maintenance_id").notNull(),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_notes_maintenance_id_idx").using("btree", table.maintenanceId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.maintenanceId],
			foreignColumns: [maintenance.id],
			name: "maintenance_notes_maintenance_id_maintenance_id_fk"
		}).onDelete("cascade"),
]);

export const maintenanceParts = pgTable("maintenance_parts", {
	id: serial().primaryKey().notNull(),
	maintenanceId: integer("maintenance_id").notNull(),
	partName: varchar("part_name", { length: 255 }),
	partNumber: varchar("part_number", { length: 100 }),
	quantity: integer(),
	cost: numeric({ precision: 15, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_parts_maintenance_id_idx").using("btree", table.maintenanceId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.maintenanceId],
			foreignColumns: [maintenance.id],
			name: "maintenance_parts_maintenance_id_maintenance_id_fk"
		}).onDelete("cascade"),
]);

export const maintenancePhotos = pgTable("maintenance_photos", {
	id: serial().primaryKey().notNull(),
	maintenanceId: integer("maintenance_id").notNull(),
	photoUrl: varchar("photo_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_photos_maintenance_id_idx").using("btree", table.maintenanceId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.maintenanceId],
			foreignColumns: [maintenance.id],
			name: "maintenance_photos_maintenance_id_maintenance_id_fk"
		}).onDelete("cascade"),
]);

export const maintenanceRequests = pgTable("maintenance_requests", {
	id: serial().primaryKey().notNull(),
	equipmentId: integer("equipment_id").notNull(),
	requestedBy: varchar("requested_by", { length: 255 }),
	requestDate: timestamp("request_date", { mode: 'string' }).defaultNow(),
	description: text(),
	priority: varchar({ length: 20 }),
	status: varchar({ length: 50 }).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_requests_equipment_id_idx").using("btree", table.equipmentId.asc().nullsLast().op("int4_ops")),
	index("maintenance_requests_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "maintenance_requests_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);

export const maintenanceTypes = pgTable("maintenance_types", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("maintenance_types_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const equipment = pgTable("equipment", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	manufacturer: varchar({ length: 255 }).notNull(),
	countryOfOrigin: varchar("country_of_origin", { length: 255 }),
	yearOfManufacture: integer("year_of_manufacture"),
	tagNumber: varchar("tag_number", { length: 255 }).notNull(),
	owner: varchar({ length: 255 }),
	maintainedBy: varchar("maintained_by", { length: 255 }),
	warrantyInfo: text("warranty_info"),
	warrantyExpiry: timestamp("warranty_expiry", { mode: 'string' }),
	dateOfInstallation: timestamp("date_of_installation", { mode: 'string' }),
	departmentId: integer("department_id"),
	subUnit: varchar("sub_unit", { length: 255 }),
	model: varchar({ length: 255 }),
	mfgNumber: varchar("mfg_number", { length: 255 }),
	serialNumber: varchar("serial_number", { length: 255 }),
	status: varchar({ length: 50 }).default('operational'),
	purchaseType: varchar("purchase_type", { length: 50 }).notNull(),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }),
	purchaseOrderNumber: varchar("purchase_order_number", { length: 255 }),
	purchaseCost: numeric("purchase_cost", { precision: 15, scale:  2 }),
	leaseId: varchar("lease_id", { length: 255 }),
	photoUrl: varchar("photo_url", { length: 500 }),
	hasServiceContract: boolean("has_service_contract").default(false),
	serviceOrganization: varchar("service_organization", { length: 255 }),
	serviceTypes: json("service_types"),
	contactInfo: varchar("contact_info", { length: 255 }),
	employeeNumber: varchar("employee_number", { length: 50 }),
	lastServiceDate: timestamp("last_service_date", { mode: 'string' }),
	nextMaintenanceDate: timestamp("next_maintenance_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("equipment_department_id_idx").using("btree", table.departmentId.asc().nullsLast().op("int4_ops")),
	index("equipment_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("equipment_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "equipment_department_id_departments_id_fk"
		}).onDelete("cascade"),
]);

export const activities = pgTable("activities", {
	id: serial().primaryKey().notNull(),
	type: varchar({ length: 255 }).notNull(),
	description: text(),
	date: timestamp({ mode: 'string' }),
	equipmentId: integer("equipment_id"),
	departmentId: integer("department_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("activities_department_id_idx").using("btree", table.departmentId.asc().nullsLast().op("int4_ops")),
	index("activities_equipment_id_idx").using("btree", table.equipmentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "activities_department_id_departments_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "activities_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);

export const departments = pgTable("departments", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	manager: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	description: text(),
	subUnits: json("sub_units"),
	budget: numeric({ precision: 15, scale:  2 }),
	employees: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("departments_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const equipmentDocuments = pgTable("equipment_documents", {
	id: serial().primaryKey().notNull(),
	equipmentId: integer("equipment_id").notNull(),
	documentType: varchar("document_type", { length: 100 }),
	documentUrl: varchar("document_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("equipment_documents_equipment_id_idx").using("btree", table.equipmentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "equipment_documents_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);
