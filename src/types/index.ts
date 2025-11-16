// Enums
export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  DISCHARGED = 'DISCHARGED',
  DECEASED = 'DECEASED',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE',
  SUITE = 'SUITE',
  ICU = 'ICU',
  EMERGENCY = 'EMERGENCY',
  OPERATION_THEATRE = 'OPERATION_THEATRE',
  WARD = 'WARD',
}

export enum AllocationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// DTOs
export interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  status: PatientStatus;
  // Room allocation information
  roomId?: number;
  roomNumber?: string;
  roomType?: RoomType;
  allocationDate?: string;
  dischargeDate?: string;
  totalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  status?: PatientStatus;
  roomId?: number;
  allocationDate?: string;
  notes?: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: RoomType;
  floor: number;
  capacity: number;
  status: RoomStatus;
  pricePerDay: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomRequest {
  roomNumber: string;
  roomType: RoomType;
  floor: number;
  capacity: number;
  status?: RoomStatus;
  pricePerDay: number;
  description?: string;
}

export interface Allocation {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  roomId: number;
  roomNumber: string;
  roomType: RoomType;
  allocationDate: string;
  dischargeDate?: string;
  status: AllocationStatus;
  totalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferRequest {
  newRoomId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface Bill {
  id: number;
  allocationId: number;
  patientId: number;
  patientName: string;
  roomId: number;
  roomNumber: string;
  allocationDate: string;
  dischargeDate: string;
  days: number;
  roomPricePerDay: number;
  totalAmount: number;
  generatedAt: string;
}
