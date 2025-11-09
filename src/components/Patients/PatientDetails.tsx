import { Patient, PatientStatus } from '../../types';

interface PatientDetailsProps {
  patient: Patient;
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
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
