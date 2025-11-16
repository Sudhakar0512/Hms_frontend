import { useState, useEffect } from 'react';
import { Patient, PatientRequest, PatientStatus, Room, Allocation } from '../../types';
import { patientService } from '../../services/patientService';
import { allocationService } from '../../services/allocationService';
import { roomService } from '../../services/roomService';
import Button from '../Shared/Button';

interface PatientFormProps {
  patient?: Patient | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    status: PatientStatus.ACTIVE,
    roomId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [currentAllocation, setCurrentAllocation] = useState<Allocation | null>(null);
  const [loadingAllocation, setLoadingAllocation] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone || '',
        address: patient.address || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        status: patient.status,
        roomId: undefined, 
      });
    }
  }, [patient]);

  useEffect(() => {
    if (!patient) {
      const fetchAvailableRooms = async () => {
        setLoadingRooms(true);
        try {
          const rooms = await roomService.getAvailable();
          setAvailableRooms(rooms);
        } catch (err) {
          console.error('Failed to fetch available rooms:', err);
        } finally {
          setLoadingRooms(false);
        }
      };
      fetchAvailableRooms();
    }
  }, [patient]);

  // Fetch current allocation and available rooms when editing a patient
  useEffect(() => {
    if (patient) {
      const fetchData = async () => {
        setLoadingAllocation(true);
        setLoadingRooms(true);
        try {
          let allocation: Allocation | null = null;
          // Fetch current allocation
          try {
            allocation = await allocationService.getByPatientId(patient.id);
            setCurrentAllocation(allocation);
            // Set roomId only if allocation exists
            if (allocation) {
              const roomId = allocation.roomId;
              setFormData((prev) => ({ ...prev, roomId }));
            } else {
              // No allocation found, ensure roomId is undefined
              setFormData((prev) => ({ ...prev, roomId: undefined }));
            }
          } catch (error) {
            console.error('Failed to fetch allocation:', error);
            setCurrentAllocation(null);
            // On error, ensure roomId is undefined
            setFormData((prev) => ({ ...prev, roomId: undefined }));
          }

          // Fetch available rooms (including currently occupied room if patient has allocation)
          try {
            const availableRooms = await roomService.getAvailable();
            // If patient has a current allocation, include that room in the list
            if (allocation) {
              try {
                const currentRoom = await roomService.getById(allocation.roomId);
                // Add current room if it's not in the available list
                if (!availableRooms.find(r => r.id === currentRoom.id)) {
                  setAvailableRooms([currentRoom, ...availableRooms]);
                } else {
                  setAvailableRooms(availableRooms);
                }
              } catch (error) {
                console.error('Failed to fetch current room:', error);
                setAvailableRooms(availableRooms);
              }
            } else {
              setAvailableRooms(availableRooms);
            }
          } catch (err) {
            console.error('Failed to fetch available rooms:', err);
          }
        } finally {
          setLoadingAllocation(false);
          setLoadingRooms(false);
        }
      };
      fetchData();
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Edge case: If changing patient status to DISCHARGED, check for active allocation
      if (patient && formData.status === PatientStatus.DISCHARGED && patient.status !== PatientStatus.DISCHARGED) {
        try {
          const activeAllocation = await allocationService.getByPatientId(patient.id);
          if (activeAllocation) {
            setError('Cannot discharge patient with active room allocation. Please discharge the patient from the room first.');
            setLoading(false);
            return;
          }
        } catch (error) {
          // If no allocation found, continue
        }
      }

      // Edge case: If changing patient status to DECEASED, check for active allocation
      if (patient && formData.status === PatientStatus.DECEASED && patient.status !== PatientStatus.DECEASED) {
        try {
          const activeAllocation = await allocationService.getByPatientId(patient.id);
          if (activeAllocation) {
            setError('Cannot mark patient as deceased with active room allocation. Please discharge the patient first.');
            setLoading(false);
            return;
          }
        } catch (error) {
          // If no allocation found, continue
        }
      }

 
      const submitData: PatientRequest = {
        ...formData,
        roomId: formData.roomId && formData.roomId > 0 ? formData.roomId : undefined,
      };

      if (patient) {
        await patientService.update(patient.id, submitData);
      } else {
        await patientService.create(submitData);
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
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 text-sm mb-4 rounded-r">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={PatientStatus.ACTIVE}>ACTIVE</option>
            <option value={PatientStatus.DISCHARGED}>DISCHARGED</option>
            <option value={PatientStatus.DECEASED}>DECEASED</option>
          </select>
        </div>

        {!patient && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select
              name="roomId"
              value={formData.roomId || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({ ...prev, roomId: value ? parseInt(value) : undefined }));
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingRooms}
            >
              <option value="">Select Room (Optional)</option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomNumber} - {room.roomType} (Floor {room.floor})
                </option>
              ))}
            </select>
            {loadingRooms && (
              <p className="text-xs text-gray-500 mt-1">Loading available rooms...</p>
            )}
          </div>
        )}

        {patient && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            {loadingAllocation || loadingRooms ? (
              <p className="text-sm text-gray-500">Loading rooms...</p>
            ) : (
              <>
                <select
                  name="roomId"
                  value={formData.roomId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, roomId: value ? parseInt(value) : undefined }));
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No Room (Remove Allocation)</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomNumber} - {room.roomType} (Floor {room.floor})
                      {currentAllocation && room.id === currentAllocation.roomId ? ' (Current)' : ''}
                    </option>
                  ))}
                </select>
                {currentAllocation && (
                  <p className="text-xs text-gray-500 mt-1">
                    Currently allocated to {currentAllocation.roomNumber} since {new Date(currentAllocation.allocationDate).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 mt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          {patient ? 'Update Patient' : 'Create Patient'}
        </Button>
      </div>
    </form>
  );
}