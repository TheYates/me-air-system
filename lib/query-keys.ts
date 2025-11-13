/**
 * Centralized query key factory for type-safe and consistent React Query cache keys
 * This helps with cache invalidation and prevents duplicate queries
 */

export const queryKeys = {
  all: ["equipment"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...queryKeys.lists(), { ...(filters || {}) }] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id?: number) => [...queryKeys.details(), id] as const,

  departments: ["departments"] as const,
  departmentsList: ["departments", "list"] as const,

  maintenance: {
    all: ["maintenance"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.maintenance.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.maintenance.all, "detail", id] as const,
    checklist: (maintenanceId: number) =>
      [...queryKeys.maintenance.all, "checklist", maintenanceId] as const,
    checklistItem: (maintenanceId: number, itemId: number) =>
      [...queryKeys.maintenance.all, "checklist", maintenanceId, itemId] as const,
  },

  maintenanceRequests: {
    all: ["maintenance-requests"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.maintenanceRequests.all, "list", filters] as const,
    detail: (id: number) =>
      [...queryKeys.maintenanceRequests.all, "detail", id] as const,
  },

  dashboard: ["dashboard"] as const,
  dashboardStats: () => [...queryKeys.dashboard, "stats"] as const,
};

