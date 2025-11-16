import { patientService } from './patientService';
import { Allocation, AllocationStatus, TransferRequest, PaginatedResponse, PaginationParams } from '../types';

function patientToAllocation(patient: any): Allocation {
  if (!patient.roomId) {
    throw new Error('Patient does not have room allocation');
  }
  
  const status = patient.dischargeDate 
    ? AllocationStatus.COMPLETED 
    : AllocationStatus.ACTIVE;
  
  return {
    id: patient.id,
    patientId: patient.id,
    patientName: patient.name,
    patientEmail: patient.email,
    roomId: patient.roomId,
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

export const allocationService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Allocation>> => {
    return patientService.getAllocations(params);
  },

  getActive: async (params?: PaginationParams): Promise<PaginatedResponse<Allocation>> => {
    return patientService.getActiveAllocations(params);
  },

  getById: async (id: number): Promise<Allocation> => {
    const patient = await patientService.getById(id);
    if (!patient.roomId) {
      throw new Error('Patient does not have room allocation');
    }
    return patientToAllocation(patient);
  },

  getByPatientId: async (patientId: number): Promise<Allocation | null> => {
    try {
      const patient = await patientService.getById(patientId);
      if (patient.roomId && !patient.dischargeDate) {
        return patientToAllocation(patient);
      }
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getPatientHistory: async (patientId: number): Promise<Allocation[]> => {
    const patient = await patientService.getById(patientId);
    if (patient.roomId) {
      return [patientToAllocation(patient)];
    }
    return [];
  },

  getByRoomId: async (roomId: number): Promise<Allocation | null> => {
    try {
      const patient = await patientService.getActivePatientByRoom(roomId);
      return patientToAllocation(patient);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getRoomHistory: async (roomId: number): Promise<Allocation[]> => {
    const patients = await patientService.getPatientHistoryByRoom(roomId);
    return patients.filter(p => p.roomId != null).map(patientToAllocation);
  },

  create: async (allocation: { patientId: number; roomId: number; allocationDate?: string; notes?: string }): Promise<Allocation> => {
    const patient = await patientService.allocateRoom(
      allocation.patientId,
      allocation.roomId,
      allocation.allocationDate,
      allocation.notes
    );
    return patientToAllocation(patient);
  },

  discharge: async (id: number): Promise<Allocation> => {
    const patient = await patientService.discharge(id);
    return patientToAllocation(patient);
  },

  cancel: async (id: number): Promise<Allocation> => {
    const patient = await patientService.update(id, { 
      name: (await patientService.getById(id)).name,
      email: (await patientService.getById(id)).email,
      roomId: undefined 
    } as any);
    return patientToAllocation({ ...patient, roomId: 0 });
  },

  transfer: async (id: number, newRoomId: number | TransferRequest): Promise<Allocation> => {
    const roomId = typeof newRoomId === 'number' ? newRoomId : newRoomId.newRoomId;
    const patient = await patientService.transfer(id, roomId);
    return patientToAllocation(patient);
  },
};
