import { pgTable, text, serial, integer, boolean, timestamp, numeric, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Users (Administradores) ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Employees (Equipe) ---
export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(),
  basePayment: numeric("base_payment", { precision: 10, scale: 2 }).notNull(),
  individualTransportCost: numeric("individual_transport_cost", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true),
});

// --- Vehicles (Frota) ---
export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  licensePlate: text("license_plate").notNull(),
  kmPerLiter: numeric("km_per_liter", { precision: 10, scale: 2 }).notNull(),
  avgFuelPrice: numeric("avg_fuel_price", { precision: 10, scale: 2 }).notNull(),
  maintenanceCostPerKm: numeric("maintenance_cost_per_km", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true),
});

// --- Category (Catálogo) ---
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  active: boolean("active").default(true),
});

// --- CatalogItem (Produtos/Serviços) ---
export const catalogItems = pgTable("catalog_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // PRODUCT, SERVICE
  priceClient: numeric("price_client", { precision: 10, scale: 2 }).notNull(),
  internalCost: numeric("internal_cost", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  active: boolean("active").default(true),
});

// --- Event (Coração do Sistema) ---
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  address: text("address").notNull(),
  eventDate: timestamp("event_date").notNull(),
  distanceKm: numeric("distance_km", { precision: 10, scale: 2 }).notNull(),
  guestAdults: integer("guest_adults").notNull().default(0),
  guestKids: integer("guest_kids").notNull().default(0),
  transportType: text("transport_type").notNull(), // FLEET_VEHICLE, INDIVIDUAL_TRANSPORT, NO_TRANSPORT
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  status: text("status").notNull().default('PENDING'), // PENDING, CONFIRMED, DONE, CANCELED
  financialStatus: text("financial_status").notNull().default('UNPAID'), // UNPAID, PARTIAL, PAID
  notes: text("notes"),
  
  // Financials
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }).notNull().default('0'),
  totalCostItems: numeric("total_cost_items", { precision: 12, scale: 2 }).notNull().default('0'),
  totalCostLabor: numeric("total_cost_labor", { precision: 12, scale: 2 }).notNull().default('0'),
  totalCostTransport: numeric("total_cost_transport", { precision: 12, scale: 2 }).notNull().default('0'),
  extraExpenses: numeric("extra_expenses", { precision: 12, scale: 2 }).notNull().default('0'),
  netProfit: numeric("net_profit", { precision: 12, scale: 2 }).notNull().default('0'),
  profitMargin: numeric("profit_margin", { precision: 10, scale: 2 }).notNull().default('0'),
  
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true),
});

// --- EventItems ---
export const eventItems = pgTable("event_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  catalogItemId: uuid("catalog_item_id").notNull().references(() => catalogItems.id),
  quantity: integer("quantity").notNull(),
  unitPriceSnapshot: numeric("unit_price_snapshot", { precision: 10, scale: 2 }).notNull(),
  unitCostSnapshot: numeric("unit_cost_snapshot", { precision: 10, scale: 2 }).notNull(),
});

// --- EventTeam ---
export const eventTeam = pgTable("event_team", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  employeeId: uuid("employee_id").notNull().references(() => employees.id),
  paymentSnapshot: numeric("payment_snapshot", { precision: 10, scale: 2 }).notNull(),
  transportCostSnapshot: numeric("transport_cost_snapshot", { precision: 10, scale: 2 }).notNull(),
});

// === RELATIONS ===
export const eventsRelations = relations(events, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [events.vehicleId],
    references: [vehicles.id],
  }),
  items: many(eventItems),
  team: many(eventTeam),
}));

export const eventItemsRelations = relations(eventItems, ({ one }) => ({
  event: one(events, {
    fields: [eventItems.eventId],
    references: [events.id],
  }),
  catalogItem: one(catalogItems, {
    fields: [eventItems.catalogItemId],
    references: [catalogItems.id],
  }),
}));

export const eventTeamRelations = relations(eventTeam, ({ one }) => ({
  event: one(events, {
    fields: [eventTeam.eventId],
    references: [events.id],
  }),
  employee: one(employees, {
    fields: [eventTeam.employeeId],
    references: [employees.id],
  }),
}));

export const catalogItemsRelations = relations(catalogItems, ({ one }) => ({
  category: one(categories, {
    fields: [catalogItems.categoryId],
    references: [categories.id],
  }),
}));

// === BASE SCHEMAS ===
// Base schemas for insertion
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertCatalogItemSchema = createInsertSchema(catalogItems).omit({ id: true });

// Event insertion schema requires special care due to financial rules
// The frontend should NOT send financials, only the raw data to create an event
export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true,
  totalRevenue: true,
  totalCostItems: true,
  totalCostLabor: true,
  totalCostTransport: true,
  netProfit: true,
  profitMargin: true,
  active: true
});

export const insertEventItemSchema = createInsertSchema(eventItems).omit({ id: true, unitPriceSnapshot: true, unitCostSnapshot: true });
export const insertEventTeamSchema = createInsertSchema(eventTeam).omit({ id: true, paymentSnapshot: true, transportCostSnapshot: true });

// === EXPLICIT API CONTRACT TYPES ===

// Response types
export type UserResponse = typeof users.$inferSelect;
export type EmployeeResponse = typeof employees.$inferSelect;
export type VehicleResponse = typeof vehicles.$inferSelect;
export type CategoryResponse = typeof categories.$inferSelect;
export type CatalogItemResponse = typeof catalogItems.$inferSelect & { category?: CategoryResponse | null };
export type EventResponse = typeof events.$inferSelect & {
  vehicle?: VehicleResponse | null;
  items?: (typeof eventItems.$inferSelect & { catalogItem?: typeof catalogItems.$inferSelect })[];
  team?: (typeof eventTeam.$inferSelect & { employee?: typeof employees.$inferSelect })[];
};

// Request Types
export type CreateEmployeeRequest = z.infer<typeof insertEmployeeSchema>;
export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;

export type CreateVehicleRequest = z.infer<typeof insertVehicleSchema>;
export type UpdateVehicleRequest = Partial<CreateVehicleRequest>;

export type CreateCategoryRequest = z.infer<typeof insertCategorySchema>;
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export type CreateCatalogItemRequest = z.infer<typeof insertCatalogItemSchema>;
export type UpdateCatalogItemRequest = Partial<CreateCatalogItemRequest>;

export type CreateEventRequest = z.infer<typeof insertEventSchema>;
export type UpdateEventRequest = Partial<CreateEventRequest> & { extraExpenses?: string };

// For adding items/team members to an event
export type AddEventItemRequest = Omit<z.infer<typeof insertEventItemSchema>, 'eventId'>;
export type AddEventTeamRequest = Omit<z.infer<typeof insertEventTeamSchema>, 'eventId'>;

export type LoginRequest = z.infer<typeof insertUserSchema>;
