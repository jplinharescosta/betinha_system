import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import {
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
  type CreateVehicleRequest,
  type UpdateVehicleRequest,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type CreateCatalogItemRequest,
  type UpdateCatalogItemRequest,
  type CreateEventRequest,
  type UpdateEventRequest,
} from "@shared/schema";
import { authFetch } from "@/lib/auth";

// --- EMPLOYEES ---
export function useEmployees() {
  return useQuery({
    queryKey: [api.employees.list.path],
    queryFn: async () => {
      const res = await authFetch(api.employees.list.path);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return await res.json();
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEmployeeRequest) => {
      const res = await authFetch(api.employees.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create employee");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateEmployeeRequest & { id: string }) => {
      const url = buildUrl(api.employees.update.path, { id });
      const res = await authFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update employee");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.employees.delete.path, { id });
      const res = await authFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete employee");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] }),
  });
}

// --- VEHICLES ---
export function useVehicles() {
  return useQuery({
    queryKey: [api.vehicles.list.path],
    queryFn: async () => {
      const res = await authFetch(api.vehicles.list.path);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return await res.json();
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVehicleRequest) => {
      const res = await authFetch(api.vehicles.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create vehicle");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateVehicleRequest & { id: string }) => {
      const url = buildUrl(api.vehicles.update.path, { id });
      const res = await authFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update vehicle");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.vehicles.delete.path, { id });
      const res = await authFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete vehicle");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}

// --- CATEGORIES ---
export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await authFetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const res = await authFetch(api.categories.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path] }),
  });
}

// --- CATALOG ITEMS ---
export function useCatalogItems() {
  return useQuery({
    queryKey: [api.catalogItems.list.path],
    queryFn: async () => {
      const res = await authFetch(api.catalogItems.list.path);
      if (!res.ok) throw new Error("Failed to fetch catalog items");
      return await res.json();
    },
  });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCatalogItemRequest) => {
      const res = await authFetch(api.catalogItems.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.catalogItems.list.path] }),
  });
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateCatalogItemRequest & { id: string }) => {
      const url = buildUrl(api.catalogItems.update.path, { id });
      const res = await authFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update item");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.catalogItems.list.path] }),
  });
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.catalogItems.delete.path, { id });
      const res = await authFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.catalogItems.list.path] }),
  });
}

// --- EVENTS ---
export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await authFetch(api.events.list.path);
      if (!res.ok) throw new Error("Failed to fetch events");
      return await res.json();
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: [api.events.get.path, id],
    queryFn: async () => {
      if (!id || id === "new") return null;
      const url = buildUrl(api.events.get.path, { id });
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch event");
      return await res.json();
    },
    enabled: !!id && id !== "new",
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      const res = await authFetch(api.events.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return await res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateEventRequest & { id: string }) => {
      const url = buildUrl(api.events.update.path, { id });
      const res = await authFetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      queryClient.invalidateQueries({
        queryKey: [api.events.get.path, data.id],
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.events.delete.path, { id });
      const res = await authFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] }),
  });
}

// Event Items & Team
export function useAddEventItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      ...data
    }: {
      eventId: string;
      catalogItemId: string;
      quantity: number;
    }) => {
      const url = buildUrl(api.events.addItem.path, { id: eventId });
      const res = await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return await res.json();
    },
    onSuccess: (_, { eventId }) =>
      queryClient.invalidateQueries({
        queryKey: [api.events.get.path, eventId],
      }),
  });
}

export function useRemoveEventItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      itemId,
    }: {
      eventId: string;
      itemId: string;
    }) => {
      const url = buildUrl(api.events.removeItem.path, { id: eventId, itemId });
      const res = await authFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: (_, { eventId }) =>
      queryClient.invalidateQueries({
        queryKey: [api.events.get.path, eventId],
      }),
  });
}

export function useAddEventTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      employeeId,
    }: {
      eventId: string;
      employeeId: string;
    }) => {
      const url = buildUrl(api.events.addTeamMember.path, { id: eventId });
      const res = await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      if (!res.ok) throw new Error("Failed to add team member");
      return await res.json();
    },
    onSuccess: (_, { eventId }) =>
      queryClient.invalidateQueries({
        queryKey: [api.events.get.path, eventId],
      }),
  });
}

export function useRemoveEventTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      teamId,
    }: {
      eventId: string;
      teamId: string;
    }) => {
      const url = buildUrl(api.events.removeTeamMember.path, {
        id: eventId,
        teamId,
      });
      const res = await authFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove team member");
    },
    onSuccess: (_, { eventId }) =>
      queryClient.invalidateQueries({
        queryKey: [api.events.get.path, eventId],
      }),
  });
}

// Stats
export function useStats() {
  return useQuery({
    queryKey: [api.events.stats.path],
    queryFn: async () => {
      const res = await authFetch(api.events.stats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    },
  });
}
