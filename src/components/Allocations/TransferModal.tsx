import { useState, useEffect } from 'react';
import { Allocation, Room, TransferRequest } from '../../types';
import { allocationService } from '../../services/allocationService';
import { roomService } from '../../services/roomService';
import Button from '../Shared/Button';

interface TransferModalProps {
  allocation: Allocation;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransferModal({ allocation, onSuccess, onCancel }: TransferModalProps) {
  const [newRoomId, setNewRoomId] = useState<number>(0);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      const rooms = await roomService.getAvailable();
      // Filter out the current room
      const filteredRooms = rooms.filter((room) => room.id !== allocation.roomId);
      setAvailableRooms(filteredRooms);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Edge case: Verify new room is still available
      const selectedRoom = availableRooms.find(r => r.id === newRoomId);
      if (!selectedRoom) {
        setError('Selected room is no longer available. Please select another room.');
        setLoading(false);
        return;
      }

      const transferRequest: TransferRequest = { newRoomId };
      await allocationService.transfer(allocation.id, transferRequest);
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 p-3 mb-4">
        <p className="text-sm text-gray-700">
          <strong>Patient:</strong> {allocation.patientName}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Current Room:</strong> {allocation.roomNumber} ({allocation.roomType.replace('_', ' ')})
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Room <span className="text-red-500">*</span>
        </label>
        <select
          value={newRoomId}
          onChange={(e) => setNewRoomId(parseInt(e.target.value))}
          required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={0}>Select New Room</option>
          {availableRooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.roomNumber} - {room.roomType.replace('_', ' ')} (Floor {room.floor}) - ₹{room.pricePerDay.toFixed(2)}/day
            </option>
          ))}
        </select>
        {availableRooms.length === 0 && (
          <p className="mt-1 text-sm text-yellow-600">No available rooms for transfer</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 mt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading} disabled={!newRoomId}>
          Transfer Patient
        </Button>
      </div>
    </form>
  );
}
