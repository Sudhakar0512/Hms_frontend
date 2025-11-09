import { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, LogOut, X, ArrowRight } from 'lucide-react';
import { Allocation, AllocationStatus, PaginationParams } from '../../types';
import { allocationService } from '../../services/allocationService';
import Table from '../Shared/Table';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import AllocationForm from './AllocationForm.tsx';
import AllocationDetails from './AllocationDetails.tsx';
import TransferModal from './TransferModal.tsx';
import BillView from '../Billing/BillView';
import { useConfirm } from '../../hooks/useConfirm';
import { useAlert } from '../../hooks/useAlert';

export default function AllocationList() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [transferringAllocation, setTransferringAllocation] = useState<Allocation | null>(null);
  const [dischargedAllocation, setDischargedAllocation] = useState<Allocation | null>(null);
  
  const { confirm, setLoading: setConfirmLoading, ConfirmComponent } = useConfirm();
  const { showAlert, AlertComponent } = useAlert();

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: PaginationParams = {
        page: pagination.page,
        size: pagination.size,
        sortBy: 'id',
        sortDir: 'DESC',
      };

      const response = showActiveOnly
        ? await allocationService.getActive(params)
        : await allocationService.getAll(params);

      setAllocations(response?.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: response?.totalElements || 0,
        totalPages: response?.totalPages || 0,
      }));
    } catch (error: any) {
      console.error('Error fetching allocations:', error);
      setError(error.response ? 'Failed to fetch allocations. Please try again.' : 'Unable to connect to the server. Please make sure the backend is running.');
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, showActiveOnly]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleView = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    setIsDetailsModalOpen(true);
  };

  const handleDischarge = async (id: number) => {
    const allocation = allocations.find(a => a.id === id);
    if (!allocation) return;

    const confirmed = await confirm({
      title: 'Discharge Patient',
      message: `Are you sure you want to discharge ${allocation.patientName} from Room ${allocation.roomNumber}? A bill will be generated upon discharge.`,
      type: 'warning',
      confirmText: 'Discharge',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        const discharged = await allocationService.discharge(id);
        // Update the allocation in the list optimistically
        setAllocations((prev) => 
          prev.map((a) => a.id === id ? discharged : a)
        );
        // Show bill
        setDischargedAllocation(discharged);
        setIsBillModalOpen(true);
        showAlert('success', 'Patient discharged successfully. Bill generated.');
      } catch (error: any) {
        console.error('Error discharging patient:', error);
        const errorMessage = error.response?.data?.message || 'Failed to discharge patient. Please try again.';
        showAlert('error', errorMessage);
        // Refresh to get updated data
        fetchAllocations();
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const handleCancel = async (id: number) => {
    const allocation = allocations.find(a => a.id === id);
    if (!allocation) return;

    const confirmed = await confirm({
      title: 'Cancel Allocation',
      message: `Are you sure you want to cancel the allocation for ${allocation.patientName}? This will free up Room ${allocation.roomNumber}.`,
      type: 'danger',
      confirmText: 'Cancel Allocation',
      cancelText: 'Keep Allocation',
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        await allocationService.cancel(id);
        // Optimistically update the list
        setAllocations((prev) => prev.filter((a) => a.id !== id));
        setPagination((prev) => ({ ...prev, totalElements: prev.totalElements - 1 }));
        showAlert('success', 'Allocation cancelled successfully');
      } catch (error: any) {
        console.error('Error cancelling allocation:', error);
        const errorMessage = error.response?.data?.message || 'Failed to cancel allocation. Please try again.';
        showAlert('error', errorMessage);
        // Refresh to get updated data
        fetchAllocations();
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const handleTransfer = (allocation: Allocation) => {
    setTransferringAllocation(allocation);
    setIsTransferModalOpen(true);
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    // Only refetch if needed
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsModalOpen(false);
    fetchAllocations();
    showAlert('success', 'Room allocated successfully');
  }, [fetchAllocations, showAlert]);

  const handleTransferModalClose = useCallback(() => {
    setIsTransferModalOpen(false);
    setTransferringAllocation(null);
    // Only refetch if transfer was successful
  }, []);

  const handleTransferSuccess = useCallback(() => {
    setIsTransferModalOpen(false);
    setTransferringAllocation(null);
    fetchAllocations();
    showAlert('success', 'Patient transferred successfully');
  }, [fetchAllocations, showAlert]);

  const handleBillModalClose = useCallback(() => {
    setIsBillModalOpen(false);
    setDischargedAllocation(null);
    // Refresh allocations to show updated status
    fetchAllocations();
  }, [fetchAllocations]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

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

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Allocation },
    { header: 'Patient', accessor: 'patientName' as keyof Allocation },
    { header: 'Room', accessor: 'roomNumber' as keyof Allocation },
    { header: 'Room Type', accessor: 'roomType' as keyof Allocation, render: (value: string) => value.replace('_', ' ') },
    { header: 'Allocation Date', accessor: 'allocationDate' as keyof Allocation, render: (value: string) => new Date(value).toLocaleDateString() },
    { header: 'Discharge Date', accessor: 'dischargeDate' as keyof Allocation, render: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A' },
    { header: 'Status', accessor: 'status' as keyof Allocation, render: (value: AllocationStatus) => getStatusBadge(value) },
    { header: 'Total Amount', accessor: 'totalAmount' as keyof Allocation, render: (value: number) => value ? `₹${value.toFixed(2)}` : 'N/A' },
    {
      header: 'Actions',
      accessor: 'id' as keyof Allocation,
      render: (_value: number, row: Allocation) => (
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
          {row.status === AllocationStatus.ACTIVE && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTransfer(row);
                }}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded hover:text-gray-700 transition-colors"
                title="Transfer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDischarge(row.id);
                }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded hover:text-green-700 transition-colors"
                title="Discharge"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(row.id);
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">Room Allocations</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage room allocations and patient assignments</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2 inline" />
          Allocate Room
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => {
                setShowActiveOnly(e.target.checked);
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">Show Active Allocations Only</span>
          </label>
        </div>

        <div className="p-3 md:p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-sm text-gray-500">Loading allocations...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllocations}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table columns={columns} data={allocations || []} />
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-3">
                <div className="text-xs md:text-sm text-gray-600">
                  Showing <span className="font-medium">{(allocations || []).length}</span> of <span className="font-medium">{pagination.totalElements}</span> allocations
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
        title="Allocate Room to Patient"
        size="md"
      >
        <AllocationForm onSuccess={handleFormSuccess} onCancel={handleModalClose} />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Allocation Details"
        size="md"
      >
        {selectedAllocation && <AllocationDetails allocation={selectedAllocation} />}
      </Modal>

      <Modal
        isOpen={isTransferModalOpen}
        onClose={handleTransferModalClose}
        title="Transfer Patient"
        size="md"
      >
        {transferringAllocation && (
          <TransferModal
            allocation={transferringAllocation}
            onSuccess={handleTransferSuccess}
            onCancel={handleTransferModalClose}
          />
        )}
      </Modal>

      <Modal
        isOpen={isBillModalOpen}
        onClose={handleBillModalClose}
        title="Patient Bill"
        size="lg"
      >
        {dischargedAllocation && (
          <BillView 
            allocation={dischargedAllocation} 
            onClose={handleBillModalClose}
            onPrint={() => window.print()}
          />
        )}
      </Modal>
    </div>
  );
}
