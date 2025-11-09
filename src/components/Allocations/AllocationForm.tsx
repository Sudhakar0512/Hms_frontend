import { useState, useEffect } from 'react';
import { AllocationRequest, Patient, Room, PatientStatus } from '../../types';
import { allocationService } from '../../services/allocationService';
import { patientService } from '../../services/patientService';
import { roomService } from '../../services/roomService';
import Button from '../Shared/Button';

interface AllocationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AllocationForm({ onSuccess, onCancel }: AllocationFormProps) {
  const [formData, setFormData] = useState<AllocationRequest>({
    patientId: 0,
    roomId: 0,
    allocationDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
      setFormData((prev) => ({ ...prev, roomId: 0 }));
    }
  }, [formData.patientId]);

  const fetchData = async () => {
    try {
      setLoadingPatients(true);
      setError('');
      
      // Fetch all patients with a large page size
      const patientsData = await patientService.getAll({ page: 0, size: 1000, sortBy: 'name', sortDir: 'ASC' });
      
      if (!patientsData || !patientsData.content) {
        setPatients([]);
        setError('No patients found. Please create a patient first.');
        return;
      }

      // Filter to only show ACTIVE patients (we'll check for allocations on submit)
      const activePatients = patientsData.content.filter(p => p.status === PatientStatus.ACTIVE);
      setPatients(activePatients);

      if (activePatients.length === 0) {
        setError('No active patients found. Please create an active patient first.');
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load patients. Please check your connection and try again.';
      setError(errorMessage);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const rooms = await roomService.getAvailable();
      setAvailableRooms(rooms || []);
      if (rooms && rooms.length === 0) {
        setError('No available rooms at the moment.');
      }
    } catch (error: any) {
      console.error('Error fetching available rooms:', error);
      setError('Failed to load available rooms. Please try again.');
      setAvailableRooms([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'patientId' || name === 'roomId') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Edge case: Check if patient already has an active allocation
      try {
        const existingAllocation = await allocationService.getByPatientId(formData.patientId);
        if (existingAllocation) {
          setError('This patient already has an active room allocation. Please discharge the patient first.');
          setLoading(false);
          return;
        }
      } catch (error) {
        // If no allocation found (404), continue with creation
      }

      // Edge case: Verify room is still available
      const selectedRoom = availableRooms.find(r => r.id === formData.roomId);
      if (!selectedRoom) {
        setError('Selected room is no longer available. Please select another room.');
        setLoading(false);
        return;
      }

      await allocationService.create(formData);
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
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 text-sm mb-4 rounded-r">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patient <span className="text-red-500">*</span>
        </label>
        {loadingPatients ? (
          <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading patients...
          </div>
        ) : (
          <>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              disabled={patients.length === 0}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={0}>Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
            {patients.length === 0 && !loadingPatients && (
              <p className="mt-1 text-sm text-amber-600">
                No active patients available for allocation. Please create a patient or check existing allocations.
              </p>
            )}
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Room <span className="text-red-500">*</span>
        </label>
        <select
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          required
          disabled={!formData.patientId || availableRooms.length === 0}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value={0}>Select Room</option>
          {availableRooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.roomNumber} - {room.roomType.replace('_', ' ')} (Floor {room.floor}) - ₹{room.pricePerDay.toFixed(2)}/day
            </option>
          ))}
        </select>
        {!formData.patientId && (
          <p className="mt-1 text-sm text-gray-500">Please select a patient first</p>
        )}
        {formData.patientId && availableRooms.length === 0 && (
          <p className="mt-1 text-sm text-yellow-600">No available rooms</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Allocation Date</label>
        <input
          type="date"
          name="allocationDate"
          value={formData.allocationDate}
          onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 mt-5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading} disabled={!formData.patientId || !formData.roomId}>
          Allocate Room
        </Button>
      </div>
    </form>
  );
}
