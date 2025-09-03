import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LeaveRequests from "./pages/LeaveRequests";
import Attendance from "./pages/Attendance";
import UserListWithReports from "./pages/UserListWithReports";
import Analytics from "./pages/Analytics";
import Events from "./pages/Events";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>    
        <Route
          path="/*"
          element={
              <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Sidebar />
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                  <div className="max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/leaves" element={<LeaveRequests />} />
                      <Route path="/user-reports" element={<UserListWithReports />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/events" element={<Events />} />
                    </Routes>
                  </div>
                </main>
              </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


