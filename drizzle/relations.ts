import { relations } from "drizzle-orm/relations";
import { equipment, equipmentPhotos, equipmentSpecifications, maintenance, maintenanceChecklist, maintenanceDocuments, maintenanceNotes, maintenanceParts, maintenancePhotos, maintenanceRequests, departments, activities, equipmentDocuments } from "./schema";

export const equipmentPhotosRelations = relations(equipmentPhotos, ({one}) => ({
	equipment: one(equipment, {
		fields: [equipmentPhotos.equipmentId],
		references: [equipment.id]
	}),
}));

export const equipmentRelations = relations(equipment, ({one, many}) => ({
	equipmentPhotos: many(equipmentPhotos),
	equipmentSpecifications: many(equipmentSpecifications),
	maintenances: many(maintenance),
	maintenanceRequests: many(maintenanceRequests),
	department: one(departments, {
		fields: [equipment.departmentId],
		references: [departments.id]
	}),
	activities: many(activities),
	equipmentDocuments: many(equipmentDocuments),
}));

export const equipmentSpecificationsRelations = relations(equipmentSpecifications, ({one}) => ({
	equipment: one(equipment, {
		fields: [equipmentSpecifications.equipmentId],
		references: [equipment.id]
	}),
}));

export const maintenanceRelations = relations(maintenance, ({one, many}) => ({
	equipment: one(equipment, {
		fields: [maintenance.equipmentId],
		references: [equipment.id]
	}),
	maintenanceChecklists: many(maintenanceChecklist),
	maintenanceDocuments: many(maintenanceDocuments),
	maintenanceNotes: many(maintenanceNotes),
	maintenanceParts: many(maintenanceParts),
	maintenancePhotos: many(maintenancePhotos),
}));

export const maintenanceChecklistRelations = relations(maintenanceChecklist, ({one}) => ({
	maintenance: one(maintenance, {
		fields: [maintenanceChecklist.maintenanceId],
		references: [maintenance.id]
	}),
}));

export const maintenanceDocumentsRelations = relations(maintenanceDocuments, ({one}) => ({
	maintenance: one(maintenance, {
		fields: [maintenanceDocuments.maintenanceId],
		references: [maintenance.id]
	}),
}));

export const maintenanceNotesRelations = relations(maintenanceNotes, ({one}) => ({
	maintenance: one(maintenance, {
		fields: [maintenanceNotes.maintenanceId],
		references: [maintenance.id]
	}),
}));

export const maintenancePartsRelations = relations(maintenanceParts, ({one}) => ({
	maintenance: one(maintenance, {
		fields: [maintenanceParts.maintenanceId],
		references: [maintenance.id]
	}),
}));

export const maintenancePhotosRelations = relations(maintenancePhotos, ({one}) => ({
	maintenance: one(maintenance, {
		fields: [maintenancePhotos.maintenanceId],
		references: [maintenance.id]
	}),
}));

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({one}) => ({
	equipment: one(equipment, {
		fields: [maintenanceRequests.equipmentId],
		references: [equipment.id]
	}),
}));

export const departmentsRelations = relations(departments, ({many}) => ({
	equipment: many(equipment),
	activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({one}) => ({
	department: one(departments, {
		fields: [activities.departmentId],
		references: [departments.id]
	}),
	equipment: one(equipment, {
		fields: [activities.equipmentId],
		references: [equipment.id]
	}),
}));

export const equipmentDocumentsRelations = relations(equipmentDocuments, ({one}) => ({
	equipment: one(equipment, {
		fields: [equipmentDocuments.equipmentId],
		references: [equipment.id]
	}),
}));