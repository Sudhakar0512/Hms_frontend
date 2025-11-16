import apiClient from '../config/api';
import { Patient, PatientRequest, PaginatedResponse, PaginationParams, Allocation, AllocationStatus } from '../types';

export const patientService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Patient>> => {
    const response = await apiClient.get('/patients', { params });
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

  // Allocation methods
  allocateRoom: async (patientId: number, roomId: number, allocationDate?: string, notes?: string): Promise<Patient> => {
    const params = new URLSearchParams();
    params.append('roomId', roomId.toString());
    if (allocationDate) params.append('allocationDate', allocationDate);
    if (notes) params.append('notes', notes);
    
    const response = await apiClient.post(`/patients/${patientId}/allocate?${params.toString()}`);
    return response.data.data;
  },

  discharge: async (patientId: number): Promise<Patient> => {
    const response = await apiClient.put(`/patients/${patientId}/discharge`);
    return response.data.data;
  },

  transfer: async (patientId: number, newRoomId: number): Promise<Patient> => {
    const response = await apiClient.put(`/patients/${patientId}/transfer`, { newRoomId });
    return response.data.data;
  },

  getPatientsWithActiveRooms: async (params?: PaginationParams): Promise<PaginatedResponse<Patient>> => {
    const response = await apiClient.get('/patients/active-rooms', { params });
    return response.data.data;
  },

  getPatientHistoryByRoom: async (roomId: number): Promise<Patient[]> => {
    const response = await apiClient.get(`/patients/room/${roomId}/history`);
    return response.data.data;
  },

  getActivePatientByRoom: async (roomId: number): Promise<Patient> => {
    const response = await apiClient.get(`/patients/room/${roomId}/active`);
    return response.data.data;
  },

  getActiveAllocations: async (params?: PaginationParams): Promise<PaginatedResponse<Allocation>> => {
    const response = await apiClient.get('/patients/active-rooms', { params });
    const patients = response.data.data;
    return {
      ...patients,
      content: patients.content.map(patientToAllocation),
    };
  },

  getAllocations: async (params?: PaginationParams): Promise<PaginatedResponse<Allocation>> => {
    const response = await apiClient.get('/patients', { params });
    const patients = response.data.data;
    return {
      ...patients,
      content: patients.content
        .filter((p: Patient) => p.roomId != null)
        .map(patientToAllocation),
    };
  },
};

function patientToAllocation(patient: Patient): Allocation {
  const status = patient.dischargeDate 
    ? AllocationStatus.COMPLETED 
    : AllocationStatus.ACTIVE;
  
  return {
    id: patient.id!,
    patientId: patient.id,
    patientName: patient.name,
    patientEmail: patient.email,
    roomId: patient.roomId!,
    roomNumber: patient.roomNumber!,
    roomType: patient.roomType!,
    allocationDate: patient.allocationDate!,
    dischargeDate: patient.dischargeDate,
    status: status,
    totalAmount: patient.totalAmount,
    notes: patient.notes,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}
