import { BrowserRouter, Routes, Route } from "react-router-dom";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import LeaveRequests from "./pages/LeaveRequests";
import AttendanceFromSupabase from "./pages/TestSupabase";
import UserListWithReports from "./pages/UserListWithReports";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>    
        <Route
          path="/*"
          element={
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto bg-gray-50">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/leaves" element={<LeaveRequests />} />
                    <Route path="/supabase" element={<AttendanceFromSupabase />} />
                    <Route path="/user-reports" element={<UserListWithReports />} />
                  </Routes>
                </main>
              </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


