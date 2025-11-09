import { useEffect, useState } from 'react';
import { Users, Home, Calendar, Activity, TrendingUp, Plus } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { patientService } from '../../services/patientService';
import { allocationService } from '../../services/allocationService';
import { Link } from 'react-router-dom';
import Button from '../Shared/Button';

interface DashboardStats {
  totalPatients: number;
  availableRooms: number;
  activeAllocations: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    availableRooms: 0,
    activeAllocations: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [recentAllocations, setRecentAllocations] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [patientsData, availableRoomsCount, activeAllocationsData, roomsData, recentPatientsData, recentAllocationsData] = await Promise.all([
        patientService.getAll({ page: 0, size: 1 }),
        roomService.getAvailableCount(),
        allocationService.getActive({ page: 0, size: 1 }),
        roomService.getAll({ page: 0, size: 1 }),
        patientService.getAll({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'DESC' }),
        allocationService.getActive({ page: 0, size: 5, sortBy: 'allocationDate', sortDir: 'DESC' }),
      ]);

      const totalRooms = roomsData?.totalElements || 0;
      const occupiedRooms = totalRooms - (availableRoomsCount || 0);
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      setStats({
        totalPatients: patientsData?.totalElements || 0,
        availableRooms: availableRoomsCount || 0,
        activeAllocations: activeAllocationsData?.totalElements || 0,
        totalRooms,
        occupiedRooms,
        occupancyRate,
      });
      
      setRecentPatients(recentPatientsData?.content || []);
      setRecentAllocations(recentAllocationsData?.content || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response ? 'Failed to load dashboard data.' : 'Unable to connect to the server. Please make sure the backend is running.');
      setStats({
        totalPatients: 0,
        availableRooms: 0,
        activeAllocations: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        occupancyRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
    },
    {
      title: 'Available Rooms',
      value: stats.availableRooms,
      icon: Home,
      color: 'bg-green-500',
      textColor: 'text-green-500',
    },
    {
      title: 'Active Allocations',
      value: stats.activeAllocations,
      icon: Calendar,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: Activity,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-xs md:text-sm text-gray-500">Overview of your hospital management system</p>
      </div>
      
      {error && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 md:p-4 mb-4 md:mb-6 rounded-r">
          <p className="text-xs md:text-sm text-amber-800">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900">Room Occupancy</h3>
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-1">
                <span className="text-gray-600">Occupied</span>
                <span className="font-medium text-gray-900">{stats.occupiedRooms} / {stats.totalRooms}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.occupancyRate}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">Occupancy Rate: <span className="font-medium text-gray-900">{stats.occupancyRate}%</span></p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900">Quick Actions</h3>
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <Link to="/patients">
              <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
                Patients
              </Button>
            </Link>
            <Link to="/rooms">
              <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                <Home className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
                Rooms
              </Button>
            </Link>
            <Link to="/allocations">
              <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
                Allocations
              </Button>
            </Link>
            <Link to="/allocations">
              <Button size="sm" className="w-full text-xs md:text-sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 inline" />
                New Allocation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900">Recent Patients</h3>
            <Link to="/patients" className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          {recentPatients.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{patient.name}</p>
                    <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ml-2 flex-shrink-0 ${
                    patient.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                    patient.status === 'DISCHARGED' ? 'bg-gray-50 text-gray-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-gray-500 text-center py-4">No recent patients</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900">Active Allocations</h3>
            <Link to="/allocations" className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          {recentAllocations.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {recentAllocations.map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{allocation.patientName}</p>
                    <p className="text-xs text-gray-500">Room {allocation.roomNumber}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700 ml-2 flex-shrink-0">
                    Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-gray-500 text-center py-4">No active allocations</p>
          )}
        </div>
      </div>
    </div>
  );
}
