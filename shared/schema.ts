import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper: generate UUID as default
const uuid = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const uuidCol = (name: string) => text(name);

// --- Users (Administradores) ---
export const users = sqliteTable("users", {
  id: uuid(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

// --- Employees (Equipe) ---
export const employees = sqliteTable("employees", {
  id: uuid(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull(),
  basePayment: text("base_payment").notNull(),
  individualTransportCost: text("individual_transport_cost").notNull(),
  active: integer("active", { mode: "boolean" }).default(true),
});

// --- Vehicles (Frota) ---
export const vehicles = sqliteTable("vehicles", {
  id: uuid(),
  name: text("name").notNull(),
  licensePlate: text("license_plate").notNull(),
  kmPerLiter: text("km_per_liter").notNull(),
  avgFuelPrice: text("avg_fuel_price").notNull(),
  maintenanceCostPerKm: text("maintenance_cost_per_km").notNull(),
  active: integer("active", { mode: "boolean" }).default(true),
});

// --- Category (Catálogo) ---
export const categories = sqliteTable("categories", {
  id: uuid(),
  name: text("name").notNull().unique(),
  active: integer("active", { mode: "boolean" }).default(true),
});

// --- CatalogItem (Produtos/Serviços) ---
export const catalogItems = sqliteTable("catalog_items", {
  id: uuid(),
  categoryId: uuidCol("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // PRODUCT, SERVICE
  priceClient: text("price_client").notNull(),
  internalCost: text("internal_cost").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  active: integer("active", { mode: "boolean" }).default(true),
});

// --- Event (Coração do Sistema) ---
export const events = sqliteTable("events", {
  id: uuid(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  clientAddress: text("client_address"),
  address: text("address").notNull(),
  eventDate: integer("event_date", { mode: "timestamp" }).notNull(),
  distanceKm: text("distance_km").notNull(),
  guestAdults: integer("guest_adults").notNull().default(0),
  guestKids: integer("guest_kids").notNull().default(0),
  transportType: text("transport_type").notNull(), // FLEET_VEHICLE, INDIVIDUAL_TRANSPORT, NO_TRANSPORT
  vehicleId: uuidCol("vehicle_id").references(() => vehicles.id),
  status: text("status").notNull().default("PENDING"), // PENDING, CONFIRMED, DONE, CANCELED
  financialStatus: text("financial_status").notNull().default("UNPAID"), // UNPAID, PARTIAL, PAID
  notes: text("notes"),

  // Financials
  totalRevenue: text("total_revenue").notNull().default("0"),
  totalCostItems: text("total_cost_items").notNull().default("0"),
  totalCostLabor: text("total_cost_labor").notNull().default("0"),
  totalCostTransport: text("total_cost_transport").notNull().default("0"),
  extraExpenses: text("extra_expenses").notNull().default("0"),
  netProfit: text("net_profit").notNull().default("0"),
  profitMargin: text("profit_margin").notNull().default("0"),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  active: integer("active", { mode: "boolean" }).default(true),
});

// --- EventItems ---
export const eventItems = sqliteTable("event_items", {
  id: uuid(),
  eventId: uuidCol("event_id")
    .notNull()
    .references(() => events.id),
  catalogItemId: uuidCol("catalog_item_id")
    .notNull()
    .references(() => catalogItems.id),
  quantity: integer("quantity").notNull(),
  unitPriceSnapshot: text("unit_price_snapshot").notNull(),
  unitCostSnapshot: text("unit_cost_snapshot").notNull(),
});

// --- EventTeam ---
export const eventTeam = sqliteTable("event_team", {
  id: uuid(),
  eventId: uuidCol("event_id")
    .notNull()
    .references(() => events.id),
  employeeId: uuidCol("employee_id")
    .notNull()
    .references(() => employees.id),
  paymentSnapshot: text("payment_snapshot").notNull(),
  transportCostSnapshot: text("transport_cost_snapshot").notNull(),
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
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});
export const insertCatalogItemSchema = createInsertSchema(catalogItems).omit({
  id: true,
});

// Event insertion schema requires special care due to financial rules
// The frontend should NOT send financials, only the raw data to create an event
export const insertEventSchema = createInsertSchema(events, {
  eventDate: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  totalRevenue: true,
  totalCostItems: true,
  totalCostLabor: true,
  totalCostTransport: true,
  netProfit: true,
  profitMargin: true,
  active: true,
});

export const insertEventItemSchema = createInsertSchema(eventItems).omit({
  id: true,
  unitPriceSnapshot: true,
  unitCostSnapshot: true,
});
export const insertEventTeamSchema = createInsertSchema(eventTeam).omit({
  id: true,
  paymentSnapshot: true,
  transportCostSnapshot: true,
});

// === EXPLICIT API CONTRACT TYPES ===

// Response types
export type UserResponse = typeof users.$inferSelect;
export type EmployeeResponse = typeof employees.$inferSelect;
export type VehicleResponse = typeof vehicles.$inferSelect;
export type CategoryResponse = typeof categories.$inferSelect;
export type CatalogItemResponse = typeof catalogItems.$inferSelect & {
  category?: CategoryResponse | null;
};
export type EventResponse = typeof events.$inferSelect & {
  vehicle?: VehicleResponse | null;
  items?: (typeof eventItems.$inferSelect & {
    catalogItem?: typeof catalogItems.$inferSelect;
  })[];
  team?: (typeof eventTeam.$inferSelect & {
    employee?: typeof employees.$inferSelect;
  })[];
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
export type UpdateEventRequest = Partial<CreateEventRequest> & {
  extraExpenses?: string;
};

// For adding items/team members to an event
export type AddEventItemRequest = Omit<
  z.infer<typeof insertEventItemSchema>,
  "eventId"
>;
export type AddEventTeamRequest = Omit<
  z.infer<typeof insertEventTeamSchema>,
  "eventId"
>;

export type LoginRequest = { email: string; password: string };
