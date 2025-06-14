import { api } from "./api";

export const phaseService = {
  async getPhasesByForageId(forageId) {
    const response = await api.get(`/phases/forage/${forageId}`);
    return response.data;
  },

  async createPhase(phase) {
    const response = await api.post("/phases", phase);
    return response.data;
  },

  async updatePhase(id, phase) {
    const response = await api.put(`/phases/${id}`, phase);
    return response.data;
  },

  async deletePhase(id) {
    await api.delete(`/phases/${id}`);
  },
};
