import apiClient from '../config/api';
import { Room, RoomRequest, RoomStatus, RoomType, PaginatedResponse, PaginationParams } from '../types';

export const roomService = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Room>> => {
    const response = await apiClient.get('/rooms', { params });
    // Backend returns ApiResponse<Page<RoomResponse>>
    return response.data.data;
  },

  getById: async (id: number): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data.data;
  },

  getByNumber: async (roomNumber: string): Promise<Room> => {
    const response = await apiClient.get(`/rooms/number/${roomNumber}`);
    return response.data.data;
  },

  getByStatus: async (status: RoomStatus, params?: PaginationParams): Promise<PaginatedResponse<Room>> => {
    const response = await apiClient.get(`/rooms/status/${status}`, { params });
    // Backend returns ApiResponse<Page<RoomResponse>>
    return response.data.data;
  },

  getByType: async (type: RoomType, params?: PaginationParams): Promise<PaginatedResponse<Room>> => {
    const response = await apiClient.get(`/rooms/type/${type}`, { params });
    // Backend returns ApiResponse<Page<RoomResponse>>
    return response.data.data;
  },

  getAvailable: async (): Promise<Room[]> => {
    const response = await apiClient.get('/rooms/available');
    // Backend returns ApiResponse<List<RoomResponse>>
    return response.data.data;
  },

  getAvailableByType: async (type: RoomType): Promise<Room[]> => {
    const response = await apiClient.get(`/rooms/available/type/${type}`);
    // Backend returns ApiResponse<List<RoomResponse>>
    return response.data.data;
  },

  getAvailableCount: async (): Promise<number> => {
    const response = await apiClient.get('/rooms/available/count');
    // Backend returns ApiResponse<Long>
    return response.data.data;
  },

  create: async (room: RoomRequest): Promise<Room> => {
    const response = await apiClient.post('/rooms', room);
    return response.data.data;
  },

  update: async (id: number, room: RoomRequest): Promise<Room> => {
    const response = await apiClient.put(`/rooms/${id}`, room);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`);
  },
};
