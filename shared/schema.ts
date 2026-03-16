import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean, integer, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  mode: text("mode").notNull().default("rental"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const workspaces = pgTable("workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerId: varchar("owner_id").notNull(),
  type: text("type").notNull().default("rental"),
  settings: jsonb("settings"),
  modelConfig: jsonb("model_config"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true, createdAt: true });
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;

export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  workspaceId: varchar("workspace_id"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  w: text("w").notNull().default("1"),
  h: text("h").notNull().default("1"),
  data: jsonb("data"),
  position: integer("position").default(0),
  visible: boolean("visible").default(true),
});
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  workspaceId: varchar("workspace_id"),
  role: text("role").notNull(),
  content: text("content").notNull(),
  actions: jsonb("actions"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  plate: text("plate"),
  color: text("color"),
  status: text("status").notNull().default("available"),
  category: text("category").default("sedan"),
  dailyRate: numeric("daily_rate"),
  mileage: integer("mileage"),
  fuelLevel: integer("fuel_level"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, createdAt: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  idNumber: text("id_number"),
  licenseNumber: text("license_number"),
  address: text("address"),
  notes: text("notes"),
  totalRentals: integer("total_rentals").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  vehicleId: varchar("vehicle_id"),
  customerId: varchar("customer_id"),
  status: text("status").notNull().default("pending"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  totalAmount: numeric("total_amount"),
  dailyRate: numeric("daily_rate"),
  deposit: numeric("deposit"),
  pickupLocation: text("pickup_location"),
  dropoffLocation: text("dropoff_location"),
  mileageStart: integer("mileage_start"),
  mileageEnd: integer("mileage_end"),
  fuelStart: integer("fuel_start"),
  fuelEnd: integer("fuel_end"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const maintenanceRecords = pgTable("maintenance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  vehicleId: varchar("vehicle_id"),
  type: text("type").notNull(),
  description: text("description"),
  cost: numeric("cost"),
  status: text("status").notNull().default("scheduled"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertMaintenanceSchema = createInsertSchema(maintenanceRecords).omit({ id: true, createdAt: true });
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").default("medium"),
  dueDate: timestamp("due_date"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  category: text("category"),
  pinned: boolean("pinned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export const actionHistory = pgTable("action_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  actionType: text("action_type").notNull(),
  description: text("description"),
  entityType: text("entity_type"),
  entityId: varchar("entity_id"),
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  status: text("status").notNull().default("applied"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertActionSchema = createInsertSchema(actionHistory).omit({ id: true, createdAt: true });
export type InsertAction = z.infer<typeof insertActionSchema>;
export type ActionHistory = typeof actionHistory.$inferSelect;

export const assistantMemory = pgTable("assistant_memory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertMemorySchema = createInsertSchema(assistantMemory).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type AssistantMemoryRecord = typeof assistantMemory.$inferSelect;