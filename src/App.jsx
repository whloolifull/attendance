import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import AttendanceTable from "./components/AttendanceTable";
import LeaveRequestsTable from "./components/LeaveRequestsTable";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen"> {/* make container full height */}
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto bg-gray-50"> {/* scrollable content */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<AttendanceTable />} />
            <Route path="/leaves" element={<LeaveRequestsTable />} />
            <Route path="/settings" element={<h1>Settings Page</h1>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


