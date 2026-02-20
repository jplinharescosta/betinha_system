import { z } from 'zod';
import { 
  insertEmployeeSchema, 
  insertVehicleSchema, 
  insertCategorySchema, 
  insertCatalogItemSchema, 
  insertEventSchema,
  insertEventItemSchema,
  insertEventTeamSchema,
  insertUserSchema,
  employees,
  vehicles,
  categories,
  catalogItems,
  events,
  eventItems,
  eventTeam,
  users
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// A helper for empty responses
const emptyResponse = z.object({ success: z.boolean() });

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string()
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: emptyResponse
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees' as const,
      responses: {
        200: z.array(z.custom<typeof employees.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/employees/:id' as const,
      responses: {
        200: z.custom<typeof employees.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees' as const,
      input: insertEmployeeSchema,
      responses: {
        201: z.custom<typeof employees.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/employees/:id' as const,
      input: insertEmployeeSchema.partial(),
      responses: {
        200: z.custom<typeof employees.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/employees/:id' as const, // Soft delete
      responses: {
        200: emptyResponse,
        404: errorSchemas.notFound,
      }
    }
  },
  vehicles: {
    list: {
      method: 'GET' as const,
      path: '/api/vehicles' as const,
      responses: {
        200: z.array(z.custom<typeof vehicles.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/vehicles' as const,
      input: insertVehicleSchema,
      responses: {
        201: z.custom<typeof vehicles.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/vehicles/:id' as const,
      input: insertVehicleSchema.partial(),
      responses: {
        200: z.custom<typeof vehicles.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/vehicles/:id' as const, // Soft delete
      responses: {
        200: emptyResponse,
        404: errorSchemas.notFound,
      }
    }
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/categories' as const,
      input: insertCategorySchema,
      responses: {
        201: z.custom<typeof categories.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/categories/:id' as const,
      input: insertCategorySchema.partial(),
      responses: {
        200: z.custom<typeof categories.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id' as const,
      responses: {
        200: emptyResponse,
        404: errorSchemas.notFound,
      }
    }
  },
  catalogItems: {
    list: {
      method: 'GET' as const,
      path: '/api/catalog' as const,
      responses: {
        200: z.array(z.custom<typeof catalogItems.$inferSelect & { category?: typeof categories.$inferSelect | null }>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/catalog' as const,
      input: insertCatalogItemSchema,
      responses: {
        201: z.custom<typeof catalogItems.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/catalog/:id' as const,
      input: insertCatalogItemSchema.partial(),
      responses: {
        200: z.custom<typeof catalogItems.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/catalog/:id' as const,
      responses: {
        200: emptyResponse,
        404: errorSchemas.notFound,
      }
    }
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      input: z.object({
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id' as const,
      responses: {
        200: z.custom<typeof events.$inferSelect & {
          vehicle?: typeof vehicles.$inferSelect | null;
          items?: (typeof eventItems.$inferSelect & { catalogItem?: typeof catalogItems.$inferSelect })[];
          team?: (typeof eventTeam.$inferSelect & { employee?: typeof employees.$inferSelect })[];
        }>(),
        404: errorSchemas.notFound,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/events/:id' as const,
      input: insertEventSchema.partial().extend({ extraExpenses: z.string().optional() }),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id' as const,
      responses: {
        200: emptyResponse,
        404: errorSchemas.notFound,
      }
    },
    // Event Items (produtos/serviços)
    addItem: {
      method: 'POST' as const,
      path: '/api/events/:id/items' as const,
      input: z.object({
        catalogItemId: z.string(),
        quantity: z.number().int().positive()
      }),
      responses: {
        201: z.custom<typeof eventItems.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    removeItem: {
      method: 'DELETE' as const,
      path: '/api/events/:id/items/:itemId' as const,
      responses: {
        200: emptyResponse,
        404: errorSchemas.notFound,
      }
    },
    // Event Team (equipe)
    addTeamMember: {
      method: 'POST' as const,
      path: '/api/events/:id/team' as const,
      input: z.object({
        employeeId: z.string()
      }),
      responses: {
        201: z.custom<typeof eventTeam.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    removeTeamMember: {
      method: 'DELETE' as const,
      path: '/api/events/:id/team/:teamId' as const,
      responses: {
        200: emptyResponse,
        404: errorSchemas.notFound,
      }
    },
    // Dashboard Stats
    stats: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.object({
          monthlyRevenue: z.string(),
          monthlyProfit: z.string(),
          avgMargin: z.string(),
          pendingEvents: z.number(),
          chartData: z.array(z.object({
            month: z.string(),
            revenue: z.number(),
            costs: z.number()
          }))
        })
      }
    }
  }
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
