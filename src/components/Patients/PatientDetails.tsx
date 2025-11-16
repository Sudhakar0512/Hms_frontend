import { useState, useEffect } from 'react';
import { Patient, PatientStatus, Allocation } from '../../types';
import { allocationService } from '../../services/allocationService';

interface PatientDetailsProps {
  patient: Patient;
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
  const [currentAllocation, setCurrentAllocation] = useState<Allocation | null>(null);
  const [loadingAllocation, setLoadingAllocation] = useState(false);

  useEffect(() => {
    const fetchAllocation = async () => {
      setLoadingAllocation(true);
      try {
        const allocation = await allocationService.getByPatientId(patient.id);
        setCurrentAllocation(allocation);
      } catch (error) {
        console.error('Failed to fetch allocation:', error);
        setCurrentAllocation(null);
      } finally {
        setLoadingAllocation(false);
      }
    };
    fetchAllocation();
  }, [patient.id]);
  const getStatusBadge = (status: PatientStatus) => {
    const statusColors = {
      ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
      DISCHARGED: 'bg-gray-50 text-gray-700 border border-gray-200',
      DECEASED: 'bg-red-50 text-red-700 border border-red-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ID</label>
          <p className="text-sm text-gray-900">{patient.id}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <div>{getStatusBadge(patient.status)}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <p className="text-sm text-gray-900">{patient.name}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <p className="text-sm text-gray-900">{patient.email}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phone</label>
          <p className="text-sm text-gray-900">{patient.phone || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
          <p className="text-sm text-gray-900">
            {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Gender</label>
          <p className="text-sm text-gray-900">{patient.gender || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Blood Group</label>
          <p className="text-sm text-gray-900">{patient.bloodGroup || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Address</label>
          <p className="text-sm text-gray-900">{patient.address || 'N/A'}</p>
        </div>
        {loadingAllocation ? (
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Room Allocation</label>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : currentAllocation ? (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Room Number</label>
              <p className="text-sm text-gray-900 font-medium">{currentAllocation.roomNumber}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Room Type</label>
              <p className="text-sm text-gray-900">{currentAllocation.roomType.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Allocation Date</label>
              <p className="text-sm text-gray-900">
                {new Date(currentAllocation.allocationDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Allocation Status</label>
              <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                currentAllocation.status === 'ACTIVE' 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : currentAllocation.status === 'COMPLETED'
                  ? 'bg-gray-50 text-gray-700 border border-gray-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {currentAllocation.status}
              </span>
            </div>
          </>
        ) : (
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Room Allocation</label>
            <p className="text-sm text-gray-500">No active room allocation</p>
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Created At</label>
          <p className="text-sm text-gray-900">
            {new Date(patient.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Updated At</label>
          <p className="text-sm text-gray-900">
            {new Date(patient.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
