import { api } from "./api";

export const operationService = {
  async getOperationsByPhaseId(phaseId) {
    const response = await api.get(`/operations/phase/${phaseId}`);
    return response.data;
  },

  async getOperationsByForageId(forageId) {
    const response = await api.get(`/operations/forage/${forageId}`);
    return response.data;
  },

  async createOperation(operation) {
    const response = await api.post("/operations", operation);
    return response.data;
  },

  async updateOperation(id, operation) {
    const response = await api.put(`/operations/${id}`, operation);
    return response.data;
  },

  async deleteOperation(id) {
    await api.delete(`/operations/${id}`);
  },
};
