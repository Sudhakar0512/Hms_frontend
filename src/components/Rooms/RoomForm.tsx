import { useState, useEffect } from 'react';
import { Room, RoomRequest, RoomStatus, RoomType } from '../../types';
import { roomService } from '../../services/roomService';
import { allocationService } from '../../services/allocationService';
import Button from '../Shared/Button';

interface RoomFormProps {
  room?: Room | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RoomForm({ room, onSuccess, onCancel }: RoomFormProps) {
  const [formData, setFormData] = useState<RoomRequest>({
    roomNumber: '',
    roomType: RoomType.SINGLE,
    floor: 1,
    capacity: 1,
    status: RoomStatus.AVAILABLE,
    pricePerDay: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        floor: room.floor,
        capacity: room.capacity,
        status: room.status,
        pricePerDay: room.pricePerDay,
        description: room.description || '',
      });
    }
  }, [room]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'floor' || name === 'capacity') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else if (name === 'pricePerDay') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Edge case: If changing room status from OCCUPIED to AVAILABLE, check for active allocation
      if (room && room.status === RoomStatus.OCCUPIED && formData.status === RoomStatus.AVAILABLE) {
        try {
          const activeAllocation = await allocationService.getByRoomId(room.id);
          if (activeAllocation) {
            setError('Cannot set room to AVAILABLE while it has an active allocation. Please discharge the patient first.');
            setLoading(false);
            return;
          }
        } catch (error) {
          // If no allocation found, continue
        }
      }

      // Edge case: If changing room status to MAINTENANCE or RESERVED and room is OCCUPIED
      if (room && room.status === RoomStatus.OCCUPIED && 
          (formData.status === RoomStatus.MAINTENANCE || formData.status === RoomStatus.RESERVED)) {
        try {
          const activeAllocation = await allocationService.getByRoomId(room.id);
          if (activeAllocation) {
            setError('Cannot change status of an occupied room. Please discharge the patient first.');
            setLoading(false);
            return;
          }
        } catch (error) {
          // If no allocation found, continue
        }
      }

      if (room) {
        await roomService.update(room.id, formData);
      } else {
        await roomService.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Type <span className="text-red-500">*</span>
          </label>
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(RoomType).map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Floor <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={RoomStatus.AVAILABLE}>Available</option>
            <option value={RoomStatus.OCCUPIED}>Occupied</option>
            <option value={RoomStatus.MAINTENANCE}>Maintenance</option>
            <option value={RoomStatus.RESERVED}>Reserved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Per Day <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="pricePerDay"
            value={formData.pricePerDay}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 mt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          {room ? 'Update Room' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
}
