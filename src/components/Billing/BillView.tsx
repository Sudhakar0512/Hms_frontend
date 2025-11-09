import { Receipt, Calendar, User, Home, DollarSign } from 'lucide-react';
import { Allocation } from '../../types';
import { roomService } from '../../services/roomService';
import Button from '../Shared/Button';
import { useEffect, useState } from 'react';

interface BillViewProps {
  allocation: Allocation;
  onClose: () => void;
  onPrint?: () => void;
}

export default function BillView({ allocation, onClose, onPrint }: BillViewProps) {
  const [roomPricePerDay, setRoomPricePerDay] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const calculateDays = () => {
    const allocationDate = new Date(allocation.allocationDate);
    const dischargeDate = allocation.dischargeDate 
      ? new Date(allocation.dischargeDate) 
      : new Date();
    const diffTime = Math.abs(dischargeDate.getTime() - allocationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const days = calculateDays();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const room = await roomService.getById(allocation.roomId);
        setRoomPricePerDay(room.pricePerDay);
      } catch (error) {
        console.error('Error fetching room details:', error);
        // Calculate from totalAmount if available
        if (allocation.totalAmount) {
          setRoomPricePerDay(allocation.totalAmount / days);
        }
      } finally {
        setLoading(false);
      }
    };

    if (allocation.roomId) {
      fetchRoomDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocation.roomId]);
  // Use totalAmount from allocation if available (calculated by backend), otherwise calculate from room price
  // If roomPricePerDay is 0, it means we're still loading or use totalAmount
  const totalAmount = allocation.totalAmount || (roomPricePerDay > 0 ? roomPricePerDay * days : 0);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="mt-3 text-sm text-gray-500">Loading bill details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="border-b-2 border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hospital Bill</h2>
              <p className="text-sm text-gray-500 mt-1">Invoice # {allocation.id}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Hospital Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hospital Management System</h3>
          <p className="text-sm text-gray-600">Medical Billing Department</p>
        </div>

        {/* Patient & Room Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center mb-2">
              <User className="w-4 h-4 text-gray-500 mr-2" />
              <h4 className="text-sm font-semibold text-gray-700">Patient Details</h4>
            </div>
            <p className="text-sm text-gray-900 font-medium">{allocation.patientName}</p>
            <p className="text-xs text-gray-600">{allocation.patientEmail}</p>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Home className="w-4 h-4 text-gray-500 mr-2" />
              <h4 className="text-sm font-semibold text-gray-700">Room Details</h4>
            </div>
            <p className="text-sm text-gray-900 font-medium">Room {allocation.roomNumber}</p>
            <p className="text-xs text-gray-600">{allocation.roomType.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <h4 className="text-sm font-semibold text-gray-700">Check-in Date</h4>
            </div>
            <p className="text-sm text-gray-900">
              {new Date(allocation.allocationDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <h4 className="text-sm font-semibold text-gray-700">Check-out Date</h4>
            </div>
            <p className="text-sm text-gray-900">
              {allocation.dischargeDate 
                ? new Date(allocation.dischargeDate).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Bill Details */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Days
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">
                  Room Charges ({allocation.roomType.replace('_', ' ')})
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{days}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {roomPricePerDay > 0 ? `₹${roomPricePerDay.toFixed(2)}/day` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  ₹{totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-xl font-bold text-blue-600">
                <DollarSign className="w-5 h-5 inline mr-1" />
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          <p>Thank you for choosing our hospital services</p>
          <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onPrint && (
            <Button onClick={onPrint}>
              Print Bill
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

