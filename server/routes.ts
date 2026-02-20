import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "betinha-secret-key";
const JWT_EXPIRES_IN = "7d";

// Helper to safely get a route param as string
function param(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as {
        userId: string;
      };
      req.userId = payload.userId;
      next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || user.passwordHash !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      const { passwordHash, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.get(api.auth.me.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(req.userId!);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  // Employees
  app.get(api.employees.list.path, requireAuth, async (req, res) => {
    const list = await storage.getEmployees();
    res.json(list);
  });

  app.post(api.employees.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.employees.create.input.parse(req.body);
      const created = await storage.createEmployee(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.put(api.employees.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.employees.update.input.parse(req.body);
      const updated = await storage.updateEmployee(param(req, "id"), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.delete(api.employees.delete.path, requireAuth, async (req, res) => {
    await storage.deleteEmployee(param(req, "id"));
    res.json({ success: true });
  });

  // Vehicles
  app.get(api.vehicles.list.path, requireAuth, async (req, res) => {
    const list = await storage.getVehicles();
    res.json(list);
  });

  app.post(api.vehicles.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.vehicles.create.input.parse(req.body);
      const created = await storage.createVehicle(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.put(api.vehicles.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.vehicles.update.input.parse(req.body);
      const updated = await storage.updateVehicle(param(req, "id"), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.delete(api.vehicles.delete.path, requireAuth, async (req, res) => {
    await storage.deleteVehicle(param(req, "id"));
    res.json({ success: true });
  });

  // Categories
  app.get(api.categories.list.path, requireAuth, async (req, res) => {
    const list = await storage.getCategories();
    res.json(list);
  });

  app.post(api.categories.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.categories.create.input.parse(req.body);
      const created = await storage.createCategory(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  // Catalog
  app.get(api.catalogItems.list.path, requireAuth, async (req, res) => {
    const list = await storage.getCatalogItems();
    res.json(list);
  });

  app.post(api.catalogItems.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.catalogItems.create.input.parse(req.body);
      const created = await storage.createCatalogItem(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.put(api.catalogItems.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.catalogItems.update.input.parse(req.body);
      const updated = await storage.updateCatalogItem(param(req, "id"), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.delete(api.catalogItems.delete.path, requireAuth, async (req, res) => {
    await storage.deleteCatalogItem(param(req, "id"));
    res.json({ success: true });
  });

  // Events
  app.get(api.events.list.path, requireAuth, async (req, res) => {
    const filters = req.query.status
      ? { status: String(req.query.status) }
      : undefined;
    const list = await storage.getEvents(filters);
    res.json(list);
  });

  app.get(api.events.get.path, requireAuth, async (req, res) => {
    const event = await storage.getEvent(param(req, "id"));
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  });

  app.post(api.events.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.events.create.input.parse(req.body);
      const created = await storage.createEvent(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.put(api.events.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.events.update.input.parse(req.body);
      const updated = await storage.updateEvent(param(req, "id"), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Error" });
    }
  });

  // Event relations (Items and Team)
  app.post(api.events.addItem.path, requireAuth, async (req, res) => {
    try {
      const input = api.events.addItem.input.parse(req.body);
      await storage.addEventItem(param(req, "id"), input);
      res.status(201).json({ success: true } as any);
    } catch (err) {
      res.status(400).json({ message: "Error adding item" });
    }
  });

  app.delete(api.events.removeItem.path, requireAuth, async (req, res) => {
    await storage.removeEventItem(param(req, "id"), param(req, "itemId"));
    res.json({ success: true });
  });

  app.post(api.events.addTeamMember.path, requireAuth, async (req, res) => {
    try {
      const input = api.events.addTeamMember.input.parse(req.body);
      await storage.addEventTeamMember(param(req, "id"), input);
      res.status(201).json({ success: true } as any);
    } catch (err) {
      res.status(400).json({ message: "Error adding team member" });
    }
  });

  app.delete(
    api.events.removeTeamMember.path,
    requireAuth,
    async (req, res) => {
      await storage.removeEventTeamMember(
        param(req, "id"),
        param(req, "teamId"),
      );
      res.json({ success: true });
    },
  );

  app.get(api.events.stats.path, requireAuth, async (req, res) => {
    const events = await storage.getEvents();
    const pendingEvents = events.filter((e) => e.status === "PENDING").length;

    // Simplistic stats calculation
    let monthlyRevenue = 0;
    let monthlyProfit = 0;

    events.forEach((e) => {
      monthlyRevenue += parseFloat(e.totalRevenue as string);
      monthlyProfit += parseFloat(e.netProfit as string);
    });

    res.json({
      monthlyRevenue: monthlyRevenue.toFixed(2),
      monthlyProfit: monthlyProfit.toFixed(2),
      avgMargin:
        monthlyRevenue > 0
          ? ((monthlyProfit / monthlyRevenue) * 100).toFixed(2)
          : "0.00",
      pendingEvents,
      chartData: [
        { month: "Jan", revenue: 4000, costs: 2400 },
        { month: "Feb", revenue: 3000, costs: 1398 },
        { month: "Mar", revenue: 2000, costs: 9800 },
        {
          month: "Apr",
          revenue: monthlyRevenue,
          costs: monthlyRevenue - monthlyProfit,
        },
      ],
    });
  });

  return httpServer;
}
