import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, modules, chatMessages, vehicles, customers, bookings,
  maintenanceRecords, tasks, notes, actionHistory, assistantMemory, workspaces,
  type User, type InsertUser,
  type Module, type InsertModule,
  type ChatMessage, type InsertChatMessage,
  type Vehicle, type InsertVehicle,
  type Customer, type InsertCustomer,
  type Booking, type InsertBooking,
  type MaintenanceRecord, type InsertMaintenance,
  type Task, type InsertTask,
  type Note, type InsertNote,
  type ActionHistory, type InsertAction,
  type AssistantMemoryRecord, type InsertMemory,
  type Workspace, type InsertWorkspace,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  getWorkspacesByOwner(ownerId: string): Promise<Workspace[]>;
  createWorkspace(ws: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: string, updates: Partial<InsertWorkspace>): Promise<Workspace | undefined>;

  getModulesByUser(userId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, updates: Partial<InsertModule>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<void>;
  deleteAllModulesByUser(userId: string): Promise<void>;

  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;

  getVehicles(userId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(v: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<void>;

  getCustomers(userId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(c: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<void>;

  getBookings(userId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(b: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<void>;

  getMaintenanceRecords(userId: string): Promise<MaintenanceRecord[]>;
  createMaintenance(m: InsertMaintenance): Promise<MaintenanceRecord>;
  updateMaintenance(id: string, updates: Partial<InsertMaintenance>): Promise<MaintenanceRecord | undefined>;

  getTasks(userId: string): Promise<Task[]>;
  createTask(t: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;

  getNotes(userId: string): Promise<Note[]>;
  createNote(n: InsertNote): Promise<Note>;
  updateNote(id: string, updates: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<void>;

  getActions(userId: string, limit?: number): Promise<ActionHistory[]>;
  createAction(a: InsertAction): Promise<ActionHistory>;
  updateActionStatus(id: string, status: string): Promise<void>;

  getMemory(userId: string): Promise<AssistantMemoryRecord[]>;
  setMemory(userId: string, key: string, value: string, category?: string): Promise<AssistantMemoryRecord>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [u] = await db.select().from(users).where(eq(users.id, id));
    return u;
  }
  async getUserByUsername(username: string) {
    const [u] = await db.select().from(users).where(eq(users.username, username));
    return u;
  }
  async createUser(data: InsertUser) {
    const [u] = await db.insert(users).values(data).returning();
    return u;
  }
  async updateUser(id: string, updates: Partial<InsertUser>) {
    const [u] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return u;
  }

  async getWorkspacesByOwner(ownerId: string) {
    return db.select().from(workspaces).where(eq(workspaces.ownerId, ownerId));
  }
  async createWorkspace(ws: InsertWorkspace) {
    const [w] = await db.insert(workspaces).values(ws).returning();
    return w;
  }
  async updateWorkspace(id: string, updates: Partial<InsertWorkspace>) {
    const [w] = await db.update(workspaces).set(updates).where(eq(workspaces.id, id)).returning();
    return w;
  }

  async getModulesByUser(userId: string) {
    return db.select().from(modules).where(eq(modules.userId, userId));
  }
  async createModule(module: InsertModule) {
    const [m] = await db.insert(modules).values(module).returning();
    return m;
  }
  async updateModule(id: string, updates: Partial<InsertModule>) {
    const [m] = await db.update(modules).set(updates).where(eq(modules.id, id)).returning();
    return m;
  }
  async deleteModule(id: string) {
    await db.delete(modules).where(eq(modules.id, id));
  }
  async deleteAllModulesByUser(userId: string) {
    await db.delete(modules).where(eq(modules.userId, userId));
  }

  async getChatMessages(userId: string, limit = 100) {
    return db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(chatMessages.createdAt).limit(limit);
  }
  async createChatMessage(msg: InsertChatMessage) {
    const [m] = await db.insert(chatMessages).values(msg).returning();
    return m;
  }

  async getVehicles(userId: string) {
    return db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }
  async getVehicle(id: string) {
    const [v] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return v;
  }
  async createVehicle(v: InsertVehicle) {
    const [created] = await db.insert(vehicles).values(v).returning();
    return created;
  }
  async updateVehicle(id: string, updates: Partial<InsertVehicle>) {
    const [v] = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
    return v;
  }
  async deleteVehicle(id: string) {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  async getCustomers(userId: string) {
    return db.select().from(customers).where(eq(customers.userId, userId));
  }
  async getCustomer(id: string) {
    const [c] = await db.select().from(customers).where(eq(customers.id, id));
    return c;
  }
  async createCustomer(c: InsertCustomer) {
    const [created] = await db.insert(customers).values(c).returning();
    return created;
  }
  async updateCustomer(id: string, updates: Partial<InsertCustomer>) {
    const [c] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return c;
  }
  async deleteCustomer(id: string) {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async getBookings(userId: string) {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }
  async getBooking(id: string) {
    const [b] = await db.select().from(bookings).where(eq(bookings.id, id));
    return b;
  }
  async createBooking(b: InsertBooking) {
    const [created] = await db.insert(bookings).values(b).returning();
    return created;
  }
  async updateBooking(id: string, updates: Partial<InsertBooking>) {
    const [b] = await db.update(bookings).set(updates).where(eq(bookings.id, id)).returning();
    return b;
  }
  async deleteBooking(id: string) {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async getMaintenanceRecords(userId: string) {
    return db.select().from(maintenanceRecords).where(eq(maintenanceRecords.userId, userId)).orderBy(desc(maintenanceRecords.createdAt));
  }
  async createMaintenance(m: InsertMaintenance) {
    const [created] = await db.insert(maintenanceRecords).values(m).returning();
    return created;
  }
  async updateMaintenance(id: string, updates: Partial<InsertMaintenance>) {
    const [m] = await db.update(maintenanceRecords).set(updates).where(eq(maintenanceRecords.id, id)).returning();
    return m;
  }

  async getTasks(userId: string) {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }
  async createTask(t: InsertTask) {
    const [created] = await db.insert(tasks).values(t).returning();
    return created;
  }
  async updateTask(id: string, updates: Partial<InsertTask>) {
    const [t] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return t;
  }
  async deleteTask(id: string) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getNotes(userId: string) {
    return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
  }
  async createNote(n: InsertNote) {
    const [created] = await db.insert(notes).values(n).returning();
    return created;
  }
  async updateNote(id: string, updates: Partial<InsertNote>) {
    const [n] = await db.update(notes).set(updates).where(eq(notes.id, id)).returning();
    return n;
  }
  async deleteNote(id: string) {
    await db.delete(notes).where(eq(notes.id, id));
  }

  async getActions(userId: string, limit = 50) {
    return db.select().from(actionHistory).where(eq(actionHistory.userId, userId)).orderBy(desc(actionHistory.createdAt)).limit(limit);
  }
  async createAction(a: InsertAction) {
    const [created] = await db.insert(actionHistory).values(a).returning();
    return created;
  }
  async updateActionStatus(id: string, status: string) {
    await db.update(actionHistory).set({ status }).where(eq(actionHistory.id, id));
  }

  async getMemory(userId: string) {
    return db.select().from(assistantMemory).where(eq(assistantMemory.userId, userId));
  }
  async setMemory(userId: string, key: string, value: string, category = "general") {
    const existing = await db.select().from(assistantMemory)
      .where(and(eq(assistantMemory.userId, userId), eq(assistantMemory.key, key)));
    if (existing.length > 0) {
      const [updated] = await db.update(assistantMemory)
        .set({ value, category, updatedAt: new Date() })
        .where(eq(assistantMemory.id, existing[0].id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(assistantMemory).values({ userId, key, value, category }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();