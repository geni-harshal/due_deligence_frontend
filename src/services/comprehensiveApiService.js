import api from "@/lib/api";

const comprehensiveApiService = {
  getOrderDetail: async (orderId) => {
    const { data } = await api.get(`/operations/orders/${orderId}`);
    return data;
  },

  fetchFreshData: async (orderId) => {
    const { data } = await api.post(`/operations/orders/${orderId}/fetch-data`);
    return data;
  },

  runModels: async (orderId) => {
    const { data } = await api.post(`/operations/orders/${orderId}/run-models`);
    return data;
  },

  generatePdf: async (orderId) => {
    const { data } = await api.post(`/operations/orders/${orderId}/generate-pdf`);
    return data;
  },
};

export default comprehensiveApiService;