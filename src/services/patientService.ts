import apiClient from '../config/api';
import { Patient, PatientRequest, PaginatedResponse, PaginationParams } from '../types';

export const patientService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Patient>> => {
    const response = await apiClient.get('/patients', { params });
    // Backend returns ApiResponse<Page<PatientResponse>>
    // response.data is ApiResponse, response.data.data is Page object
    return response.data.data;
  },

  getById: async (id: number): Promise<Patient> => {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data.data;
  },

  getByEmail: async (email: string): Promise<Patient> => {
    const response = await apiClient.get(`/patients/email/${email}`);
    return response.data.data;
  },

  search: async (keyword: string, params?: PaginationParams): Promise<PaginatedResponse<Patient>> => {
    const response = await apiClient.get('/patients/search', {
      params: { keyword, ...params },
    });
    // Backend returns ApiResponse<Page<PatientResponse>>
    return response.data.data;
  },

  create: async (patient: PatientRequest): Promise<Patient> => {
    const response = await apiClient.post('/patients', patient);
    return response.data.data;
  },

  update: async (id: number, patient: PatientRequest): Promise<Patient> => {
    const response = await apiClient.put(`/patients/${id}`, patient);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/patients/${id}`);
  },
};
