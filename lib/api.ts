import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

// Configure axios with base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Helper function to create search params
function createSearchParams(params?: Record<string, any>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value.toString());
  });
  return searchParams.toString();
}

// Generic fetch function
export async function fetchApi<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  // Check if the response is empty
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => {
    throw new Error("Failed to parse JSON response");
  });

  if (!response.ok) {
    throw new Error(data.error || "API Error");
  }

  return data;
}

export const api = {
  dashboard: {
    getStats: () => fetchApi("/dashboard/stats"),
  },

  departments: {
    list: (filters?: { search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.search) {
        params.append("search", filters.search);
      }
      return fetchApi(`/departments?${params.toString()}`);
    },
    create: (data: any) =>
      fetchApi("/departments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      fetchApi(`/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchApi(`/departments/${id}`, {
        method: "DELETE",
      }),
    getById: (id: number) => fetchApi(`/departments/${id}`),
  },

  equipment: {
    list: (filters?: any) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }

      return fetchApi(`/equipment?${params.toString()}`);
    },
    create: async (data: FormData) => {
      // Convert FormData to JSON object
      const jsonData: Record<string, any> = {};

      // Helper function to convert snake_case to camelCase
      const snakeToCamel = (str: string) => {
        return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      };

      data.forEach((value, key) => {
        // Convert snake_case to camelCase
        const camelKey = snakeToCamel(key);

        // Handle special cases
        if (camelKey === "serviceTypes") {
          try {
            jsonData[camelKey] = JSON.parse(value as string);
          } catch {
            jsonData[camelKey] = value;
          }
        } else if (camelKey === "hasServiceContract") {
          jsonData[camelKey] = value === "true" ? 1 : 0;
        } else if (value === "true" || value === "false") {
          jsonData[camelKey] = value === "true";
        } else if (!isNaN(Number(value)) && value !== "") {
          // Convert numeric strings to numbers
          jsonData[camelKey] = Number(value);
        } else {
          jsonData[camelKey] = value;
        }
      });

      const response = await fetch(`${API_URL}/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create equipment");
      }
      return response.json();
    },
    update: async (id: number, data: FormData) => {
      // Convert FormData to JSON object
      const jsonData: Record<string, any> = {};

      // Helper function to convert snake_case to camelCase
      const snakeToCamel = (str: string) => {
        return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      };

      data.forEach((value, key) => {
        // Convert snake_case to camelCase
        const camelKey = snakeToCamel(key);

        // Handle special cases
        if (camelKey === "serviceTypes") {
          try {
            jsonData[camelKey] = JSON.parse(value as string);
          } catch {
            jsonData[camelKey] = value;
          }
        } else if (camelKey === "hasServiceContract") {
          jsonData[camelKey] = value === "true" ? 1 : 0;
        } else if (value === "true" || value === "false") {
          jsonData[camelKey] = value === "true";
        } else if (!isNaN(Number(value)) && value !== "") {
          // Convert numeric strings to numbers
          jsonData[camelKey] = Number(value);
        } else {
          jsonData[camelKey] = value;
        }
      });

      const response = await fetch(`${API_URL}/equipment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update equipment");
      }
      return response.json();
    },
    delete: (id: number) =>
      fetchApi(`/equipment/${id}`, {
        method: "DELETE",
      }),
    updateStatus: (id: number, status: string) =>
      fetchApi(`/equipment/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    getById: (id: number) => fetchApi(`/equipment/${id}`),
  },

  maintenance: {
    list: (filters?: {
      month?: string;
      department?: string;
      status?: string;
      type?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      return fetchApi(`/maintenance?${params.toString()}`);
    },

    getById: (id: number) => fetchApi(`/maintenance/${id}`),

    create: (data: any) =>
      fetchApi("/maintenance", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: number, data: any) =>
      fetchApi(`/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      fetchApi(`/maintenance/${id}`, {
        method: "DELETE",
      }),

    listByEquipment: (equipmentId: number) =>
      fetchApi(`/maintenance/equipment/${equipmentId}`),

    listHistory: () => fetchApi("/maintenance/history"),

    listRequests: () => fetchApi("/maintenance/requests"),

    upcoming: () => fetchApi("/maintenance?upcoming=true"),

    test: () => fetchApi("/maintenance/test"),
  },

  maintenanceRequests: {
    list: (filters?: {
      status?: string;
      priority?: string;
      equipmentId?: number;
      page?: number;
      limit?: number;
    }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            params.append(key, value.toString());
        });
      }
      return fetchApi(`/maintenance-requests?${params.toString()}`);
    },

    getById: (id: number) => fetchApi(`/maintenance-requests/${id}`),

    create: (data: any) =>
      fetchApi("/maintenance-requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: number, data: any) =>
      fetchApi(`/maintenance-requests/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      fetchApi(`/maintenance-requests/${id}`, {
        method: "DELETE",
      }),

    updateStatus: (id: number, status: string, assignedTo?: string) =>
      fetchApi(`/maintenance-requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, assignedTo }),
      }),
  },

  maintenanceChecklist: {
    list: (maintenanceId: number) =>
      fetchApi(`/maintenance/${maintenanceId}/checklist`),

    getById: (maintenanceId: number, itemId: number) =>
      fetchApi(`/maintenance/${maintenanceId}/checklist/${itemId}`),

    create: (maintenanceId: number, data: any) =>
      fetchApi(`/maintenance/${maintenanceId}/checklist`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (maintenanceId: number, itemId: number, data: any) =>
      fetchApi(`/maintenance/${maintenanceId}/checklist/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (maintenanceId: number, itemId: number) =>
      fetchApi(`/maintenance/${maintenanceId}/checklist/${itemId}`, {
        method: "DELETE",
      }),

    toggleComplete: (
      maintenanceId: number,
      itemId: number,
      isCompleted: boolean
    ) =>
      fetchApi(`/maintenance/${maintenanceId}/checklist/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ isCompleted }),
      }),
  },

  maintenanceTypes: {
    list: () => fetchApi("/maintenance-types"),

    create: (data: any) =>
      fetchApi("/maintenance-types", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any) =>
      fetchApi(`/maintenance-types/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi(`/maintenance-types/${id}`, {
        method: "DELETE",
      }),
  },

  reports: {
    preview: (
      reportType: string,
      params?: Record<string, any>
    ): Promise<any> => {
      switch (reportType) {
        case "equipment-inventory":
          return fetchApi("/reports/equipment-inventory/preview");
        case "maintenance-history":
          return fetchApi(
            `/reports/maintenance-history/preview?${createSearchParams(params)}`
          );
        case "department-summary":
          return fetchApi("/reports/department-summary/preview");
        case "warranty-status":
          return fetchApi(
            `/reports/warranty-status/preview?${createSearchParams(params)}`
          );
        case "activities-log":
          return fetchApi(
            `/reports/activities-log/preview?${createSearchParams(params)}`
          );
        case "status-analysis":
          return fetchApi("/reports/status-analysis/preview");
        default:
          throw new Error("Invalid report type");
      }
    },
  },
};
