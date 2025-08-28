import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function UserListWithReports() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch team members
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("user").select("id, name");
        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch selected user's reports
  useEffect(() => {
    if (!selectedUser) return;
    const fetchReports = async () => {
      try {
        setLoadingReports(true);
        const { data, error } = await supabase
          .from("report_attendance_daily")
          .select("*")
          .eq("user_id", selectedUser.id)
          .order("date", { ascending: false });

        if (error) throw error;
        setReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [selectedUser]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortedReports = (reports) => {
    if (!sortConfig.key) return reports;
    
    return [...reports].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'location':
          aValue = a.work_location || '';
          bValue = b.work_location || '';
          break;
        case 'clock_in':
          aValue = a.clock_in || '';
          bValue = b.clock_in || '';
          break;
        case 'clock_out':
          aValue = a.clock_out || '';
          bValue = b.clock_out || '';
          break;
        case 'total_hours':
          aValue = parseFloat(a.total_hours) || 0;
          bValue = parseFloat(b.total_hours) || 0;
          break;
        case 'status':
          aValue = (a.clock_in && a.clock_out) ? 'Complete' : 'Incomplete';
          bValue = (b.clock_in && b.clock_out) ? 'Complete' : 'Incomplete';
          break;
        default:
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  const getStatusBadge = (isComplete) => {
    return isComplete ? (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
        <span>✓</span>
        <span>Complete</span>
      </span>
    ) : (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
        <span>⚠️</span>
        <span>Incomplete</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-slate-600 font-medium">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 mb-2">User Reports</h1>
        <p className="text-slate-600">Select a team member to view their attendance records.</p>
      </div>

      {/* Team Members Selection */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Team Members</h2>
          <div className="bg-slate-100 px-3 py-1 rounded-full">
            <span className="text-slate-600 font-medium">{users.length} Members</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {users.map((user) => (
            <button
              key={user.id}
              className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                selectedUser?.id === user.id
                  ? "bg-primary text-white border-primary shadow-lg"
                  : "bg-white text-slate-700 border-slate-200 hover:border-primary hover:shadow-md"
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  selectedUser?.id === user.id
                    ? "bg-white/20 text-white"
                    : "bg-primary text-white"
                }`}>
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium text-sm text-center">{user.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User's Reports */}
      {selectedUser && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-primary p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedUser.name}'s Attendance</h3>
                  <p className="text-orange-100">Detailed attendance records</p>
                </div>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">{reports.length} Records</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 lg:p-6">
            {loadingReports ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-slate-600 font-medium">Loading attendance records...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📊</span>
                <h4 className="text-xl font-semibold text-slate-700 mb-2">No records found</h4>
                <p className="text-slate-500">No attendance data available for {selectedUser.name}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        <button onClick={() => handleSort('date')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                          <span>📅</span>
                          <span>Date</span>
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        <button onClick={() => handleSort('location')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                          <span>📍</span>
                          <span>Location</span>
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        <button onClick={() => handleSort('clock_in')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                          <span>🔄</span>
                          <span>Clock In</span>
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        <button onClick={() => handleSort('clock_out')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                          <span>🔚</span>
                          <span>Clock Out</span>
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        <button onClick={() => handleSort('total_hours')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                          <span>⏱️</span>
                          <span>Total Hours</span>
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        <button onClick={() => handleSort('status')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                          <span>📊</span>
                          <span>Status</span>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedReports(reports).map((rec, index) => {
                      const isComplete = rec.clock_in && rec.clock_out;
                      return (
                        <tr key={rec.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                        }`}>
                          <td className="py-4 px-6 text-slate-600 font-medium">{rec.date}</td>
                          <td className="py-4 px-6">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                              {rec.work_location || "Remote"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {rec.clock_in ? new Date(rec.clock_in).toLocaleTimeString() : "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              {rec.clock_out ? new Date(rec.clock_out).toLocaleTimeString() : "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                              {rec.total_hours ?? "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(isComplete)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
