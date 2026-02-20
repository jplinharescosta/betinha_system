import { db } from "../server/db";
import { users, employees, vehicles, categories, catalogItems, events } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  // Create Admin
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, "admin@betinha.com")
  });
  if (!existingAdmin) {
    await db.insert(users).values({
      email: "admin@betinha.com",
      passwordHash: "admin123", // In a real app, this should be hashed
      name: "Admin Betinha"
    });
    console.log("Admin user created.");
  }

  // Create initial data
  const existingVehicles = await db.query.vehicles.findMany();
  if (existingVehicles.length === 0) {
    const [vehicle] = await db.insert(vehicles).values({
      name: "Van Sprinter",
      licensePlate: "ABC-1234",
      kmPerLiter: "8.5",
      avgFuelPrice: "5.90",
      maintenanceCostPerKm: "0.50"
    }).returning();
    
    const [employee] = await db.insert(employees).values({
      name: "João Motorista",
      role: "Motorista",
      basePayment: "150.00",
      individualTransportCost: "30.00"
    }).returning();

    const [category] = await db.insert(categories).values({
      name: "Animação"
    }).returning();

    const [catalogItem] = await db.insert(catalogItems).values({
      categoryId: category.id,
      name: "Show de Mágica",
      type: "SERVICE",
      priceClient: "500.00",
      internalCost: "100.00",
      stockQuantity: 1
    }).returning();

    const [event] = await db.insert(events).values({
      clientName: "Maria Silva",
      clientPhone: "11999999999",
      address: "Rua das Flores, 123",
      eventDate: new Date(),
      distanceKm: "25.00",
      guestAdults: 50,
      guestKids: 20,
      transportType: "FLEET_VEHICLE",
      vehicleId: vehicle.id,
      status: "CONFIRMED",
      financialStatus: "PARTIAL",
      notes: "Festa de aniversário de 5 anos"
    }).returning();

    console.log("Seed data created.");
  }

  process.exit(0);
}

main().catch(console.error);