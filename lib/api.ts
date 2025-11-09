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
      const response = await fetch(`${API_URL}/equipment`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create equipment");
      }
      return response.json();
    },
    update: async (id: number, data: FormData) => {
      const response = await fetch(`${API_URL}/equipment/${id}`, {
        method: "PUT",
        body: data,
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
    list: (filters?: { month?: string; department?: string }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      return fetchApi(`/maintenance?${params.toString()}`);
    },

    getById: (id: string) => fetchApi(`/maintenance/${id}`),

    create: (data: any) =>
      axiosInstance.post("/maintenance", data).then((res) => res.data),

    update: (id: string, data: any) =>
      fetchApi(`/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
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
    list: (filters?: { status?: string; department?: string }) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      return fetchApi(`/maintenance-requests?${params.toString()}`);
    },

    create: (data: any) =>
      fetchApi("/maintenance-requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateStatus: (
      id: string,
      status: "approved" | "rejected",
      approvedBy: string
    ) =>
      fetchApi(`/maintenance-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, approvedBy }),
      }),

    delete: (id: string) =>
      fetchApi(`/maintenance-requests/${id}`, {
        method: "DELETE",
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
