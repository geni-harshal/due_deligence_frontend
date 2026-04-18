// src/lib/api.js
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Axios instance with Bearer token
const api = axios.create({
  baseURL: "http://localhost:8080",
});

// REQUEST interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor: 401 -> clear token, redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/api/auth/login", data).then((r) => r.data),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/auth/logout").then((r) => r.data),
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.setQueryData(["currentUser"], null);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      localStorage.removeItem("token");
      queryClient.setQueryData(["currentUser"], null);
    },
  });
};

export const useGetCurrentUser = () =>
  useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api.get("/api/auth/me").then((r) => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!localStorage.getItem("token"),
  });

// ==================== COMPANY SEARCH (Probe42) ====================
// Used by both client new-order modal and admin
// The new-order-modal calls: useSearchCompanies({ q, companyType })
// and expects: { mutate, data (array of companies), isFetching }
// Each company: { companyName, cin, city, state, status, companyType, id }
export const useSearchCompanies = () =>
  useMutation({
    mutationFn: ({ q, companyType }) =>
      api
        .post("/api/search-companies", { company_name: q, state: "" })
        .then((r) => {
          // Map Probe42 results to shape frontend expects
          return (r.data.results || []).map((item, idx) => ({
            id: idx + 1,
            companyName: item.name,
            cin: item.cin,
            city: (item.address || "").split(",").slice(-2, -1)[0]?.trim() || "",
            state: item.state || "",
            status: item.status || "Active",
            companyType: item.company_type || companyType || "Company",
            matchScore: item.match_score,
          }));
        }),
  });

export const useGetCompanyReport = (identifier, companyName) =>
  useQuery({
    queryKey: ["companyReport", identifier],
    queryFn: () =>
      api
        .get(`/api/company/${identifier}`, {
          params: { company_name: companyName },
        })
        .then((r) => r.data),
    enabled: !!identifier,
  });

export const useGeneratePdf = () =>
  useMutation({
    mutationFn: ({ identifier, companyName }) =>
      api.post(`/api/generate-pdf/${identifier}`, null, {
        params: { company_name: companyName },
        responseType: "blob",
      }),
  });

// ==================== CLIENT: ENTITLEMENTS ====================
// new-order-modal looks for: entitlements?.find(p => p.code === "DDR")
export const useGetClientEntitlements = () =>
  useQuery({
    queryKey: ["clientEntitlements"],
    queryFn: () => api.get("/api/client/entitlements").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

// ==================== CLIENT: STATS ====================
export const useGetClientStats = () =>
  useQuery({
    queryKey: ["clientStats"],
    queryFn: () => api.get("/api/client/stats").then((r) => r.data),
  });

// ==================== CLIENT: ORDERS ====================
export const useListClientOrders = () =>
  useQuery({
    queryKey: ["clientOrders"],
    queryFn: () => api.get("/api/client/orders").then((r) => r.data),
  });

// new-order-modal calls: createMut.mutate({ data: { productId, selectedCompany, notes } })
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => api.post("/api/client/orders", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientOrders"] });
      queryClient.invalidateQueries({ queryKey: ["clientStats"] });
    },
  });
};

// ==================== CLIENT: TEAM (still mock for now) ====================
export const useListMyCompanyUsers = () =>
  useQuery({
    queryKey: ["myCompanyUsers"],
    queryFn: async () => {
      // TODO: wire to /api/client/users when backend is ready
      await new Promise((r) => setTimeout(r, 100));
      return [];
    },
    staleTime: Infinity,
  });

export const useCreateMyCompanyUser = () =>
  useMutation({ mutationFn: async () => ({}) });
export const useUpdateMyCompanyUser = () =>
  useMutation({ mutationFn: async () => ({}) });
export const useResetMyCompanyUserPassword = () =>
  useMutation({ mutationFn: async () => ({}) });

// ==================== ADMIN: STATS ====================
export const useGetAdminStats = () =>
  useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      // TODO: wire to /api/admin/stats when ready
      await new Promise((r) => setTimeout(r, 100));
      return {
        totalClients: 5,
        totalUsers: 12,
        totalOrders: 45,
        ordersThisMonth: 8,
        pendingOrders: 3,
        completedOrders: 34,
      };
    },
    staleTime: Infinity,
  });

// ==================== ADMIN: CLIENTS ====================
export const useListClientCompanies = () =>
  useQuery({
    queryKey: ["clientCompanies"],
    queryFn: async () => {
      // TODO: wire to /api/admin/clients
      await new Promise((r) => setTimeout(r, 100));
      return [];
    },
    staleTime: Infinity,
  });
export const useCreateClientCompany = () =>
  useMutation({ mutationFn: async () => ({}) });
export const useUpdateClientCompany = () =>
  useMutation({ mutationFn: async () => ({}) });

// ==================== ADMIN: PRODUCTS ====================
export const useListProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return [];
    },
    staleTime: Infinity,
  });
export const useListClientProducts = () =>
  useQuery({
    queryKey: ["clientProducts"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return [];
    },
    staleTime: Infinity,
  });
export const useCreateClientProduct = () =>
  useMutation({ mutationFn: async () => ({}) });
export const useRevokeClientProduct = () =>
  useMutation({ mutationFn: async () => ({}) });

// ==================== ADMIN: USERS ====================
export const useListUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return [];
    },
    staleTime: Infinity,
  });
export const useCreateUser = () =>
  useMutation({ mutationFn: async () => ({}) });
export const useUpdateUser = () =>
  useMutation({ mutationFn: async () => ({}) });
export const useAdminResetPassword = () =>
  useMutation({ mutationFn: async () => ({}) });

// ==================== ADMIN: ORDERS ====================
export const useListAllOrders = () =>
  useQuery({
    queryKey: ["allOrders"],
    queryFn: () => api.get("/api/operations/orders").then((r) => r.data),
  });

// ==================== OPERATIONS: STATS ====================
export const useGetOperationsStats = () =>
  useQuery({
    queryKey: ["opsStats"],
    queryFn: () => api.get("/api/operations/stats").then((r) => r.data),
  });

// ==================== OPERATIONS: ORDERS LIST ====================
// OpsOrders component passes params object but useListOperationsOrders is called with (params)
// The hook receives filter params and passes them as query params
export const useListOperationsOrders = (params) =>
  useQuery({
    queryKey: ["opsOrders", params],
    queryFn: () =>
      api.get("/api/operations/orders", { params }).then((r) => r.data),
  });

// ==================== OPERATIONS: SINGLE ORDER ====================
// order-detail calls: useGetOperationsOrder(id)
// Expects full order with providerSearchSnapshot, analystEnrichment, generatedDocuments
export const useGetOperationsOrder = (id) =>
  useQuery({
    queryKey: ["opsOrder", id],
    queryFn: () => api.get(`/api/operations/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useFetchComprehensiveReportData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) =>
      api.post(`/api/operations/orders/${id}/fetch-data`).then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["opsOrder", id] });
      queryClient.invalidateQueries({ queryKey: ["opsOrders"] });
      queryClient.invalidateQueries({ queryKey: ["opsStats"] });
    },
  });
};

// ==================== OPERATIONS: SAVE ANALYST ENRICHMENT ====================
// order-detail calls: enrichMut.mutate({ id, data: { investigationSummary, analystComments, redFlags, recommendationNotes, isDraft } })
export const useSaveAnalystEnrichment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api
        .put(`/api/operations/orders/${id}/enrichment`, data)
        .then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [`opsOrder-${id}`] });
    },
  });
};

// Credit Report
export const useGenerateCreditReport = () => {
  return useMutation({
    mutationFn: (orderId) =>
      api.post(`/api/operations/orders/${orderId}/generate-credit-report`).then((r) => r.data),
  });
};

export const useGetCreditReport = (orderId) =>
  useQuery({
    queryKey: ["creditReport", orderId],
    queryFn: () =>
      api.get(`/api/operations/orders/${orderId}/credit-report`).then((r) => r.data),
    enabled: !!orderId,
  });
  
// ==================== OPERATIONS: RUN DECISION MODELS ====================
// order-detail calls: modelMut.mutate({ id }, { onSuccess: (data) => setLocalDecision(data) })
export const useRunDecisionModels = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) =>
      api
        .post(`/api/operations/orders/${id}/run-models`)
        .then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [`opsOrder-${id}`] });
    },
  });
};

// ==================== OPERATIONS: GENERATE PDF ====================
// order-detail calls: pdfMut.mutate({ id })
export const useGeneratePdfReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) =>
      api
        .post(`/api/operations/orders/${id}/generate-pdf`)
        .then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [`opsOrder-${id}`] });
    },
  });
};

// ==================== OPERATIONS: PUBLISH ====================
// order-detail calls: publishMut.mutate({ id })
export const usePublishOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) =>
      api
        .post(`/api/operations/orders/${id}/publish`)
        .then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [`opsOrder-${id}`] });
      queryClient.invalidateQueries({ queryKey: ["opsOrders"] });
    },
  });
};

// ==================== OPERATIONS: CLIENT COMPANIES (for filter dropdown) ====================
export const useGetOperationsClientCompanies = () =>
  useQuery({
    queryKey: ["opsCompanies"],
    queryFn: () =>
      api.get("/api/operations/client-companies").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
