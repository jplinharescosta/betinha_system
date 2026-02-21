import { db } from "./db";
import {
  users,
  employees,
  vehicles,
  categories,
  catalogItems,
  events,
  eventItems,
  eventTeam,
  customers,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeResponse,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
  CreateCatalogItemRequest,
  UpdateCatalogItemRequest,
  CatalogItemResponse,
  CreateEventRequest,
  UpdateEventRequest,
  EventResponse,
  AddEventItemRequest,
  AddEventTeamRequest,
  UserResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerResponse,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUserByEmail(email: string): Promise<UserResponse | undefined>;
  getUser(id: string): Promise<UserResponse | undefined>;
  createUser(user: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<UserResponse>;

  getCustomers(): Promise<CustomerResponse[]>;
  getCustomer(id: string): Promise<CustomerResponse | undefined>;
  createCustomer(customer: CreateCustomerRequest): Promise<CustomerResponse>;
  updateCustomer(
    id: string,
    updates: UpdateCustomerRequest,
  ): Promise<CustomerResponse>;
  deleteCustomer(id: string): Promise<void>;

  getEmployees(): Promise<EmployeeResponse[]>;
  getEmployee(id: string): Promise<EmployeeResponse | undefined>;
  createEmployee(employee: CreateEmployeeRequest): Promise<EmployeeResponse>;
  updateEmployee(
    id: string,
    updates: UpdateEmployeeRequest,
  ): Promise<EmployeeResponse>;
  deleteEmployee(id: string): Promise<void>;

  getVehicles(): Promise<VehicleResponse[]>;
  getVehicle(id: string): Promise<VehicleResponse | undefined>;
  createVehicle(vehicle: CreateVehicleRequest): Promise<VehicleResponse>;
  updateVehicle(
    id: string,
    updates: UpdateVehicleRequest,
  ): Promise<VehicleResponse>;
  deleteVehicle(id: string): Promise<void>;

  getCategories(): Promise<CategoryResponse[]>;
  getCategory(id: string): Promise<CategoryResponse | undefined>;
  createCategory(category: CreateCategoryRequest): Promise<CategoryResponse>;
  updateCategory(
    id: string,
    updates: UpdateCategoryRequest,
  ): Promise<CategoryResponse>;
  deleteCategory(id: string): Promise<void>;

  getCatalogItems(): Promise<CatalogItemResponse[]>;
  getCatalogItem(id: string): Promise<CatalogItemResponse | undefined>;
  createCatalogItem(
    item: CreateCatalogItemRequest,
  ): Promise<CatalogItemResponse>;
  updateCatalogItem(
    id: string,
    updates: UpdateCatalogItemRequest,
  ): Promise<CatalogItemResponse>;
  deleteCatalogItem(id: string): Promise<void>;

  getEvents(filters?: { status?: string }): Promise<EventResponse[]>;
  getEvent(id: string): Promise<EventResponse | undefined>;
  createEvent(event: CreateEventRequest): Promise<EventResponse>;
  updateEvent(id: string, updates: UpdateEventRequest): Promise<EventResponse>;
  deleteEvent(id: string): Promise<void>;

  addEventItem(eventId: string, itemData: AddEventItemRequest): Promise<void>;
  removeEventItem(eventId: string, itemId: string): Promise<void>;

  addEventTeamMember(
    eventId: string,
    teamData: AddEventTeamRequest,
  ): Promise<void>;
  removeEventTeamMember(eventId: string, teamId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<UserResponse | undefined> {
    return await db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async getUser(id: string): Promise<UserResponse | undefined> {
    return await db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async createUser(user: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<UserResponse> {
    const [inserted] = await db.insert(users).values(user).returning();
    return inserted;
  }

  async getCustomers(): Promise<CustomerResponse[]> {
    return await db.query.customers.findMany({
      where: eq(customers.active, true),
      orderBy: [desc(customers.name)],
    });
  }

  async getCustomer(id: string): Promise<CustomerResponse | undefined> {
    return await db.query.customers.findFirst({
      where: and(eq(customers.id, id), eq(customers.active, true)),
    });
  }

  async createCustomer(
    customer: CreateCustomerRequest,
  ): Promise<CustomerResponse> {
    const [inserted] = await db.insert(customers).values(customer).returning();
    return inserted;
  }

  async updateCustomer(
    id: string,
    updates: UpdateCustomerRequest,
  ): Promise<CustomerResponse> {
    const [updated] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db
      .update(customers)
      .set({ active: false })
      .where(eq(customers.id, id));
  }

  async getEmployees(): Promise<EmployeeResponse[]> {
    return await db.query.employees.findMany({
      where: eq(employees.active, true),
      orderBy: [desc(employees.name)],
    });
  }

  async getEmployee(id: string): Promise<EmployeeResponse | undefined> {
    return await db.query.employees.findFirst({
      where: and(eq(employees.id, id), eq(employees.active, true)),
    });
  }

  async createEmployee(
    employee: CreateEmployeeRequest,
  ): Promise<EmployeeResponse> {
    const [inserted] = await db.insert(employees).values(employee).returning();
    return inserted;
  }

  async updateEmployee(
    id: string,
    updates: UpdateEmployeeRequest,
  ): Promise<EmployeeResponse> {
    const [updated] = await db
      .update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db
      .update(employees)
      .set({ active: false })
      .where(eq(employees.id, id));
  }

  async getVehicles(): Promise<VehicleResponse[]> {
    return await db.query.vehicles.findMany({
      where: eq(vehicles.active, true),
      orderBy: [desc(vehicles.name)],
    });
  }

  async getVehicle(id: string): Promise<VehicleResponse | undefined> {
    return await db.query.vehicles.findFirst({
      where: and(eq(vehicles.id, id), eq(vehicles.active, true)),
    });
  }

  async createVehicle(vehicle: CreateVehicleRequest): Promise<VehicleResponse> {
    const [inserted] = await db.insert(vehicles).values(vehicle).returning();
    return inserted;
  }

  async updateVehicle(
    id: string,
    updates: UpdateVehicleRequest,
  ): Promise<VehicleResponse> {
    const [updated] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return updated;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.update(vehicles).set({ active: false }).where(eq(vehicles.id, id));
  }

  async getCategories(): Promise<CategoryResponse[]> {
    return await db.query.categories.findMany({
      where: eq(categories.active, true),
      orderBy: [desc(categories.name)],
    });
  }

  async getCategory(id: string): Promise<CategoryResponse | undefined> {
    return await db.query.categories.findFirst({
      where: and(eq(categories.id, id), eq(categories.active, true)),
    });
  }

  async createCategory(
    category: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    const [inserted] = await db.insert(categories).values(category).returning();
    return inserted;
  }

  async updateCategory(
    id: string,
    updates: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    const [updated] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db
      .update(categories)
      .set({ active: false })
      .where(eq(categories.id, id));
  }

  async getCatalogItems(): Promise<CatalogItemResponse[]> {
    return await db.query.catalogItems.findMany({
      where: eq(catalogItems.active, true),
      with: { category: true },
      orderBy: [desc(catalogItems.name)],
    });
  }

  async getCatalogItem(id: string): Promise<CatalogItemResponse | undefined> {
    return await db.query.catalogItems.findFirst({
      where: and(eq(catalogItems.id, id), eq(catalogItems.active, true)),
      with: { category: true },
    });
  }

  async createCatalogItem(
    item: CreateCatalogItemRequest,
  ): Promise<CatalogItemResponse> {
    const [inserted] = await db.insert(catalogItems).values(item).returning();
    return inserted;
  }

  async updateCatalogItem(
    id: string,
    updates: UpdateCatalogItemRequest,
  ): Promise<CatalogItemResponse> {
    const [updated] = await db
      .update(catalogItems)
      .set(updates)
      .where(eq(catalogItems.id, id))
      .returning();
    return updated;
  }

  async deleteCatalogItem(id: string): Promise<void> {
    await db
      .update(catalogItems)
      .set({ active: false })
      .where(eq(catalogItems.id, id));
  }

  async getEvents(filters?: { status?: string }): Promise<EventResponse[]> {
    return await db.query.events.findMany({
      where: and(
        eq(events.active, true),
        filters?.status ? eq(events.status, filters.status) : undefined,
      ),
      orderBy: [desc(events.eventDate)],
      with: {
        vehicle: true,
      },
    });
  }

  async getEvent(id: string): Promise<EventResponse | undefined> {
    return await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.active, true)),
      with: {
        vehicle: true,
        items: { with: { catalogItem: true } },
        team: { with: { employee: true } },
      },
    });
  }

  async createEvent(event: CreateEventRequest): Promise<EventResponse> {
    const [inserted] = await db.insert(events).values(event).returning();
    return inserted;
  }

  async updateEvent(
    id: string,
    updates: UpdateEventRequest,
  ): Promise<EventResponse> {
    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    await this.recalculateEventFinancials(id);
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.update(events).set({ active: false }).where(eq(events.id, id));
  }

  async addEventItem(
    eventId: string,
    itemData: AddEventItemRequest,
  ): Promise<void> {
    const catalogItem = await db.query.catalogItems.findFirst({
      where: eq(catalogItems.id, itemData.catalogItemId),
    });
    if (!catalogItem) throw new Error("Catalog item not found");

    await db.insert(eventItems).values({
      eventId,
      catalogItemId: itemData.catalogItemId,
      quantity: itemData.quantity,
      unitPriceSnapshot: catalogItem.priceClient,
      unitCostSnapshot: catalogItem.internalCost,
    });
    await this.recalculateEventFinancials(eventId);
  }

  async removeEventItem(eventId: string, itemId: string): Promise<void> {
    await db
      .delete(eventItems)
      .where(and(eq(eventItems.id, itemId), eq(eventItems.eventId, eventId)));
    await this.recalculateEventFinancials(eventId);
  }

  async addEventTeamMember(
    eventId: string,
    teamData: AddEventTeamRequest,
  ): Promise<void> {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, teamData.employeeId),
    });
    if (!employee) throw new Error("Employee not found");

    await db.insert(eventTeam).values({
      eventId,
      employeeId: teamData.employeeId,
      paymentSnapshot: employee.basePayment,
      transportCostSnapshot: employee.individualTransportCost,
    });
    await this.recalculateEventFinancials(eventId);
  }

  async removeEventTeamMember(eventId: string, teamId: string): Promise<void> {
    await db
      .delete(eventTeam)
      .where(and(eq(eventTeam.id, teamId), eq(eventTeam.eventId, eventId)));
    await this.recalculateEventFinancials(eventId);
  }

  private async recalculateEventFinancials(eventId: string) {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        vehicle: true,
        items: true,
        team: true,
      },
    });

    if (!event) return;

    let totalRevenue = 0;
    let totalCostItems = 0;
    let totalCostLabor = 0;
    let totalCostTransport = 0;
    const extraExpenses = parseFloat(event.extraExpenses as string) || 0;

    // Items calculation
    for (const item of event.items) {
      totalRevenue +=
        parseFloat(item.unitPriceSnapshot as string) * item.quantity;
      totalCostItems +=
        parseFloat(item.unitCostSnapshot as string) * item.quantity;
    }

    // Labor calculation
    for (const member of event.team) {
      totalCostLabor += parseFloat(member.paymentSnapshot as string);
      if (event.transportType === "INDIVIDUAL_TRANSPORT") {
        totalCostTransport += parseFloat(
          member.transportCostSnapshot as string,
        );
      }
    }

    // Fleet transport calculation
    if (event.transportType === "FLEET_VEHICLE" && event.vehicle) {
      const distance = parseFloat(event.distanceKm as string);
      const avgFuel = parseFloat(event.vehicle.avgFuelPrice as string);
      const kmPerL = parseFloat(event.vehicle.kmPerLiter as string);
      const maintenance = parseFloat(
        event.vehicle.maintenanceCostPerKm as string,
      );

      const fuelCost = (distance / kmPerL) * avgFuel;
      const maintenanceCost = distance * maintenance;
      totalCostTransport = fuelCost + maintenanceCost;
    }

    const netProfit =
      totalRevenue -
      (totalCostItems + totalCostLabor + totalCostTransport + extraExpenses);
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    await db
      .update(events)
      .set({
        totalRevenue: totalRevenue.toFixed(2),
        totalCostItems: totalCostItems.toFixed(2),
        totalCostLabor: totalCostLabor.toFixed(2),
        totalCostTransport: totalCostTransport.toFixed(2),
        netProfit: netProfit.toFixed(2),
        profitMargin: profitMargin.toFixed(2),
      })
      .where(eq(events.id, eventId));
  }
}

export const storage = new DatabaseStorage();
