CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"description" text,
	"date" timestamp,
	"equipment_id" integer,
	"department_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"manager" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"description" text,
	"sub_units" json,
	"budget" numeric(15, 2),
	"employees" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"manufacturer" varchar(255) NOT NULL,
	"country_of_origin" varchar(255),
	"year_of_manufacture" integer,
	"tag_number" varchar(255) NOT NULL,
	"owner" varchar(255),
	"maintained_by" varchar(255),
	"warranty_info" text,
	"warranty_expiry" timestamp,
	"date_of_installation" timestamp,
	"department_id" integer,
	"sub_unit" varchar(255),
	"model" varchar(255),
	"mfg_number" varchar(255),
	"serial_number" varchar(255),
	"status" varchar(50) DEFAULT 'operational',
	"purchase_type" varchar(50) NOT NULL,
	"purchase_date" timestamp,
	"purchase_order_number" varchar(255),
	"purchase_cost" numeric(15, 2),
	"lease_id" varchar(255),
	"photo_url" varchar(500),
	"has_service_contract" boolean DEFAULT false,
	"service_organization" varchar(255),
	"service_types" json,
	"contact_info" varchar(255),
	"employee_number" varchar(50),
	"last_service_date" timestamp,
	"next_maintenance_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"document_type" varchar(100),
	"document_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"photo_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_specifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"specification_key" varchar(255),
	"specification_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'scheduled',
	"priority" varchar(20),
	"date" timestamp NOT NULL,
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"technician" varchar(255),
	"notes" text,
	"cost" numeric(15, 2),
	"description" text,
	"estimated_duration" varchar(100),
	"actual_duration" varchar(100),
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_checklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"maintenance_id" integer NOT NULL,
	"task" varchar(255) NOT NULL,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"maintenance_id" integer NOT NULL,
	"document_type" varchar(100),
	"document_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"maintenance_id" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"maintenance_id" integer NOT NULL,
	"part_name" varchar(255),
	"part_number" varchar(100),
	"quantity" integer,
	"cost" numeric(15, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"maintenance_id" integer NOT NULL,
	"photo_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"requested_by" varchar(255),
	"request_date" timestamp DEFAULT now(),
	"description" text,
	"priority" varchar(20),
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_documents" ADD CONSTRAINT "equipment_documents_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_photos" ADD CONSTRAINT "equipment_photos_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_specifications" ADD CONSTRAINT "equipment_specifications_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_checklist" ADD CONSTRAINT "maintenance_checklist_maintenance_id_maintenance_id_fk" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_documents" ADD CONSTRAINT "maintenance_documents_maintenance_id_maintenance_id_fk" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_notes" ADD CONSTRAINT "maintenance_notes_maintenance_id_maintenance_id_fk" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_parts" ADD CONSTRAINT "maintenance_parts_maintenance_id_maintenance_id_fk" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_photos" ADD CONSTRAINT "maintenance_photos_maintenance_id_maintenance_id_fk" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_equipment_id_idx" ON "activities" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "activities_department_id_idx" ON "activities" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE INDEX "equipment_department_id_idx" ON "equipment" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "equipment_name_idx" ON "equipment" USING btree ("name");--> statement-breakpoint
CREATE INDEX "equipment_status_idx" ON "equipment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "equipment_documents_equipment_id_idx" ON "equipment_documents" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "equipment_photos_equipment_id_idx" ON "equipment_photos" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "equipment_specifications_equipment_id_idx" ON "equipment_specifications" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "maintenance_equipment_id_idx" ON "maintenance" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "maintenance_status_idx" ON "maintenance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "maintenance_date_idx" ON "maintenance" USING btree ("date");--> statement-breakpoint
CREATE INDEX "maintenance_checklist_maintenance_id_idx" ON "maintenance_checklist" USING btree ("maintenance_id");--> statement-breakpoint
CREATE INDEX "maintenance_documents_maintenance_id_idx" ON "maintenance_documents" USING btree ("maintenance_id");--> statement-breakpoint
CREATE INDEX "maintenance_notes_maintenance_id_idx" ON "maintenance_notes" USING btree ("maintenance_id");--> statement-breakpoint
CREATE INDEX "maintenance_parts_maintenance_id_idx" ON "maintenance_parts" USING btree ("maintenance_id");--> statement-breakpoint
CREATE INDEX "maintenance_photos_maintenance_id_idx" ON "maintenance_photos" USING btree ("maintenance_id");--> statement-breakpoint
CREATE INDEX "maintenance_requests_equipment_id_idx" ON "maintenance_requests" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "maintenance_requests_status_idx" ON "maintenance_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "maintenance_types_name_idx" ON "maintenance_types" USING btree ("name");