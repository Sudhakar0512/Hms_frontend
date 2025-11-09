import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import PatientList from './components/Patients/PatientList';
import RoomList from './components/Rooms/RoomList';
import AllocationList from './components/Allocations/AllocationList';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/allocations" element={<AllocationList />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;