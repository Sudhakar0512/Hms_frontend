import { Room, RoomStatus } from '../../types';

interface RoomDetailsProps {
  room: Room;
}

export default function RoomDetails({ room }: RoomDetailsProps) {
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

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ID</label>
          <p className="text-sm text-gray-900 font-medium">{room.id}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <div>{getStatusBadge(room.status)}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Room Number</label>
          <p className="text-sm text-gray-900 font-medium">{room.roomNumber}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Room Type</label>
          <p className="text-sm text-gray-900">{room.roomType.replace('_', ' ')}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Floor</label>
          <p className="text-sm text-gray-900">{room.floor}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Capacity</label>
          <p className="text-sm text-gray-900">{room.capacity}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Price Per Day</label>
          <p className="text-sm text-gray-900 font-medium">₹{room.pricePerDay.toFixed(2)}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Created At</label>
          <p className="text-sm text-gray-900">
            {new Date(room.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <p className="text-sm text-gray-900">{room.description || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Updated At</label>
          <p className="text-sm text-gray-900">
            {new Date(room.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
