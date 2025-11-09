import { useEffect, useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Patient, PatientStatus, PaginationParams } from '../../types';
import { patientService } from '../../services/patientService';
import { allocationService } from '../../services/allocationService';
import Table from '../Shared/Table';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import PatientForm from './PatientForm.tsx';
import PatientDetails from './PatientDetails.tsx';
import { useConfirm } from '../../hooks/useConfirm';
import { useAlert } from '../../hooks/useAlert';

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword] = useDebounce(searchKeyword, 500);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const { confirm, setLoading: setConfirmLoading, ConfirmComponent } = useConfirm();
  const { showAlert, AlertComponent } = useAlert();

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: PaginationParams = {
        page: pagination.page,
        size: pagination.size,
        sortBy: 'id',
        sortDir: 'DESC',
      };

      let response;
      if (debouncedSearchKeyword.trim()) {
        response = await patientService.search(debouncedSearchKeyword, params);
      } else {
        response = await patientService.getAll(params);
      }

      setPatients(response?.content || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: response?.totalElements || 0,
        totalPages: response?.totalPages || 0,
      }));
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError(error.response ? 'Failed to fetch patients. Please try again.' : 'Unable to connect to the server. Please make sure the backend is running.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, debouncedSearchKeyword]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);


  const handleCreate = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    // Check if patient has active allocation
    try {
      const activeAllocation = await allocationService.getByPatientId(id);
      if (activeAllocation) {
        showAlert('error', 'Cannot delete patient with active room allocation. Please discharge the patient first.');
        return;
      }
    } catch (error) {
      // If error, continue with deletion attempt
    }

    const confirmed = await confirm({
      title: 'Delete Patient',
      message: `Are you sure you want to delete ${patient.name}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        await patientService.delete(id);
        // Optimistically update the list
        setPatients((prev) => prev.filter((p) => p.id !== id));
        setPagination((prev) => ({ ...prev, totalElements: prev.totalElements - 1 }));
        showAlert('success', 'Patient deleted successfully');
      } catch (error: any) {
        console.error('Error deleting patient:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete patient. Patient may have active allocations.';
        showAlert('error', errorMessage);
        // Refresh to get updated data
        fetchPatients();
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingPatient(null);
    // Only refetch if we actually made changes
  }, []);
  
  const handleFormSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingPatient(null);
    // Optimistically update or refetch
    fetchPatients();
    showAlert('success', editingPatient ? 'Patient updated successfully' : 'Patient created successfully');
  }, [editingPatient, fetchPatients, showAlert]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

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

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Patient },
    { header: 'Name', accessor: 'name' as keyof Patient },
    { header: 'Email', accessor: 'email' as keyof Patient },
    { header: 'Phone', accessor: 'phone' as keyof Patient },
    { header: 'Status', accessor: 'status' as keyof Patient, render: (value: PatientStatus) => getStatusBadge(value) },
    {
      header: 'Actions',
      accessor: 'id' as keyof Patient,
      render: (_value: number, row: Patient) => (
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded hover:text-red-700 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">Patients</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage patient records and information</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Patient
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-sm text-gray-500">Loading patients...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPatients}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <Table columns={columns} data={patients || []} />
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-3">
                <div className="text-xs md:text-sm text-gray-600">
                  Showing <span className="font-medium">{(patients || []).length}</span> of <span className="font-medium">{pagination.totalElements}</span> patients
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
        title={editingPatient ? 'Edit Patient' : 'Add Patient'}
        size="md"
      >
        <PatientForm
          patient={editingPatient}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Patient Details"
        size="md"
      >
        {selectedPatient && <PatientDetails patient={selectedPatient} />}
      </Modal>
    </div>
  );
}
