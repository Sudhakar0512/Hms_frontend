import { Allocation, AllocationStatus } from '../../types';

interface AllocationDetailsProps {
  allocation: Allocation;
}

export default function AllocationDetails({ allocation }: AllocationDetailsProps) {
  const getStatusBadge = (status: AllocationStatus) => {
    const statusColors = {
      ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
      COMPLETED: 'bg-gray-50 text-gray-700 border border-gray-200',
      CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
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
          <p className="text-sm text-gray-900 font-medium">{allocation.id}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <div>{getStatusBadge(allocation.status)}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Patient Name</label>
          <p className="text-sm text-gray-900 font-medium">{allocation.patientName}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Patient Email</label>
          <p className="text-sm text-gray-900">{allocation.patientEmail}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Room Number</label>
          <p className="text-sm text-gray-900 font-medium">{allocation.roomNumber}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Room Type</label>
          <p className="text-sm text-gray-900">{allocation.roomType.replace('_', ' ')}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Allocation Date</label>
          <p className="text-sm text-gray-900">
            {new Date(allocation.allocationDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Discharge Date</label>
          <p className="text-sm text-gray-900">
            {allocation.dischargeDate ? new Date(allocation.dischargeDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Total Amount</label>
          <p className="text-sm text-gray-900 font-medium">
            {allocation.totalAmount ? `₹${allocation.totalAmount.toFixed(2)}` : 'N/A'}
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Created At</label>
          <p className="text-sm text-gray-900">
            {new Date(allocation.createdAt).toLocaleString()}
          </p>
        </div>
        {allocation.notes && (
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <p className="text-sm text-gray-900">{allocation.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
