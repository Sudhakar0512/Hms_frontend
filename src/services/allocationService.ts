import apiClient from '../config/api';
import { Allocation, AllocationRequest, TransferRequest, PaginatedResponse, PaginationParams } from '../types';

export const allocationService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Allocation>> => {
    const response = await apiClient.get('/allocations', { params });
    // Backend returns ApiResponse<Page<AllocationResponse>>
    return response.data.data;
  },

  getActive: async (params?: PaginationParams): Promise<PaginatedResponse<Allocation>> => {
    const response = await apiClient.get('/allocations/active', { params });
    // Backend returns ApiResponse<Page<AllocationResponse>>
    return response.data.data;
  },

  getById: async (id: number): Promise<Allocation> => {
    const response = await apiClient.get(`/allocations/${id}`);
    return response.data.data;
  },

  getByPatientId: async (patientId: number): Promise<Allocation | null> => {
    try {
      const response = await apiClient.get(`/allocations/patient/${patientId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getPatientHistory: async (patientId: number): Promise<Allocation[]> => {
    const response = await apiClient.get(`/allocations/patient/${patientId}/history`);
    // Backend returns ApiResponse<List<AllocationResponse>>
    return response.data.data;
  },

  getByRoomId: async (roomId: number): Promise<Allocation | null> => {
    try {
      const response = await apiClient.get(`/allocations/room/${roomId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getRoomHistory: async (roomId: number): Promise<Allocation[]> => {
    const response = await apiClient.get(`/allocations/room/${roomId}/history`);
    // Backend returns ApiResponse<List<AllocationResponse>>
    return response.data.data;
  },

  create: async (allocation: AllocationRequest): Promise<Allocation> => {
    const response = await apiClient.post('/allocations', allocation);
    return response.data.data;
  },

  discharge: async (id: number): Promise<Allocation> => {
    const response = await apiClient.put(`/allocations/${id}/discharge`);
    return response.data.data;
  },

  cancel: async (id: number): Promise<Allocation> => {
    const response = await apiClient.put(`/allocations/${id}/cancel`);
    return response.data.data;
  },

  transfer: async (id: number, newRoomId: number | TransferRequest): Promise<Allocation> => {
    // Handle both old format (just number) and new format (TransferRequest object)
    const transferRequest = typeof newRoomId === 'number' 
      ? { newRoomId } 
      : newRoomId;
    const response = await apiClient.put(`/allocations/${id}/transfer`, transferRequest);
    return response.data.data;
  },
};
