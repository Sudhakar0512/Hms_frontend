import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Room, RoomStatus, RoomType, PaginationParams } from '../../types';
import { roomService } from '../../services/roomService';
import { allocationService } from '../../services/allocationService';
import Table from '../Shared/Table';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import RoomForm from './RoomForm';
import RoomDetails from './RoomDetails.tsx';
import { useConfirm } from '../../hooks/useConfirm';
import { useAlert } from '../../hooks/useAlert';

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<RoomType | 'ALL'>('ALL');
  
  const { confirm, setLoading: setConfirmLoading, ConfirmComponent } = useConfirm();
  const { showAlert, AlertComponent } = useAlert();

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: PaginationParams = {
        page: pagination.page,
        size: pagination.size,
        sortBy: 'id',
        sortDir: 'DESC',
      };

      let response;
      if (statusFilter !== 'ALL') {
        response = await roomService.getByStatus(statusFilter, params);
      } else if (typeFilter !== 'ALL') {
        response = await roomService.getByType(typeFilter, params);
      } else {
        response = await roomService.getAll(params);
      }

      setRooms(response?.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: response?.totalElements || 0,
        totalPages: response?.totalPages || 0,
      }));
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setError(error.response ? 'Failed to fetch rooms. Please try again.' : 'Unable to connect to the server. Please make sure the backend is running.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, typeFilter]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreate = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleView = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const room = rooms.find(r => r.id === id);
    if (!room) return;

    // Edge case: Check if room has active allocation
    try {
      const activeAllocation = await allocationService.getByRoomId(id);
      if (activeAllocation) {
        showAlert('error', 'Cannot delete room with active allocation. Please discharge the patient first.');
        return;
      }
    } catch (error) {
      // If no allocation found, continue
    }

    const confirmed = await confirm({
      title: 'Delete Room',
      message: `Are you sure you want to delete Room ${room.roomNumber}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        await roomService.delete(id);
        // Optimistically update the list
        setRooms((prev) => prev.filter((r) => r.id !== id));
        setPagination((prev) => ({ ...prev, totalElements: prev.totalElements - 1 }));
        showAlert('success', 'Room deleted successfully');
      } catch (error: any) {
        console.error('Error deleting room:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete room. Room may have active allocations.';
        showAlert('error', errorMessage);
        // Refresh to get updated data
        fetchRooms();
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingRoom(null);
    // Only refetch if needed
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingRoom(null);
    fetchRooms();
    showAlert('success', editingRoom ? 'Room updated successfully' : 'Room created successfully');
  }, [editingRoom, fetchRooms, showAlert]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status: RoomStatus) => {
    const statusColors = {
      AVAILABLE: 'bg-green-50 text-green-700 border border-green-200',
      OCCUPIED: 'bg-red-50 text-red-700 border border-red-200',
      MAINTENANCE: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      RESERVED: 'bg-blue-50 text-blue-700 border border-blue-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: RoomType) => {
    return (
      <span className="px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        {type.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Room },
    { header: 'Room Number', accessor: 'roomNumber' as keyof Room },
    { header: 'Type', accessor: 'roomType' as keyof Room, render: (value: RoomType) => getTypeBadge(value) },
    { header: 'Floor', accessor: 'floor' as keyof Room },
    { header: 'Capacity', accessor: 'capacity' as keyof Room },
    { header: 'Status', accessor: 'status' as keyof Room, render: (value: RoomStatus) => getStatusBadge(value) },
    { header: 'Price/Day', accessor: 'pricePerDay' as keyof Room, render: (value: number) => `₹${value.toFixed(2)}` },
    {
      header: 'Actions',
      accessor: 'id' as keyof Room,
      render: (_value: number, row: Room) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded hover:text-blue-700 transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">Rooms</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage hospital rooms and availability</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Room
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as RoomStatus | 'ALL');
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
              className="flex-1 sm:flex-initial px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px]"
            >
              <option value="ALL">All Status</option>
              <option value={RoomStatus.AVAILABLE}>Available</option>
              <option value={RoomStatus.OCCUPIED}>Occupied</option>
              <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
              <option value={RoomStatus.RESERVED}>Reserved</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as RoomType | 'ALL');
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
              className="flex-1 sm:flex-initial px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px]"
            >
              <option value="ALL">All Types</option>
              {Object.values(RoomType).map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 md:p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-sm text-gray-500">Loading rooms...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRooms}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table columns={columns} data={rooms || []} />
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-3">
                <div className="text-xs md:text-sm text-gray-600">
                  Showing <span className="font-medium">{(rooms || []).length}</span> of <span className="font-medium">{pagination.totalElements}</span> rooms
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                  >
                    Previous
                  </Button>
                  <span className="px-2 md:px-3 py-1.5 text-xs md:text-sm text-gray-600">
                    Page {pagination.page + 1} of {pagination.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {ConfirmComponent}
      {AlertComponent}
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingRoom ? 'Edit Room' : 'Add Room'}
        size="md"
      >
        <RoomForm room={editingRoom} onSuccess={handleFormSuccess} onCancel={handleModalClose} />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Room Details"
        size="md"
      >
        {selectedRoom && <RoomDetails room={selectedRoom} />}
      </Modal>
    </div>
  );
}
