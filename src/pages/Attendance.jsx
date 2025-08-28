import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import FilterBar from "../components/FilterBar";

export default function Attendance({ showFilter = true, limit = null }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("report_attendance_daily")
          .select("*");
          
        if (attendanceError) {
          throw attendanceError;
        }
          
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select("id, name");
          
        if (userError) {
          throw userError;
        }
          
        // Merge the data
        let mergedData = attendanceData.map(record => {
        const user = userData.find(u => u.id === record.user_id);
          return { ...record, user };
        });
        
        // Filter by current date for dashboard
        if (limit) {
          const today = new Date().toISOString().split('T')[0];
          mergedData = mergedData.filter(record => record.date === today);
          mergedData = mergedData.slice(0, limit);
        }
          
        setRecords(mergedData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTime = (time) => time ? new Date(time).toLocaleTimeString() : "-";
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortedRecords = (records) => {
    if (!sortConfig.key) return records;
    
    return [...records].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'name':
          aValue = a.user?.name || '';
          bValue = b.user?.name || '';
          break;
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
  
  const getStatusBadge = (isIncomplete) => {
    return isIncomplete ? (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
        <span>⚠️</span>
        <span>Incomplete</span>
      </span>
    ) : (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
        <span>✓</span>
        <span>Complete</span>
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-slate-600 font-medium">Loading data...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8">
        <div className="flex items-center space-x-3 text-red-600">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold">Error loading data</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
      <div className="bg-primary p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Attendance Records</h2>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-white font-medium">{records.length} Records</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 lg:p-6">
        {showFilter && (
          <FilterBar onFilter={setFilters} showStatus={true} showLocation={true} showDate={true} />
        )}
        
        {records.filter(rec => {
          const matchesName = !filters.name || rec.user?.name?.toLowerCase().includes(filters.name.toLowerCase());
          const matchesDate = !filters.date || rec.date === filters.date;
          const matchesLocation = !filters.location || rec.work_location === filters.location;
          const matchesStatus = !filters.status || 
            (filters.status === 'Complete' && rec.clock_in && rec.clock_out) ||
            (filters.status === 'Incomplete' && (!rec.clock_in || !rec.clock_out));
          return matchesName && matchesDate && matchesLocation && matchesStatus;
        }).length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📄</span>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No records found</h3>
            <p className="text-slate-500">No attendance data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 lg:py-4 lg:px-6 font-semibold text-slate-700 text-sm lg:text-base">
                    <button onClick={() => handleSort('name')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                      <span>👤</span>
                      <span>Employee</span>
                    </button>
                  </th>
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
                {getSortedRecords(records.filter(rec => {
                  const matchesName = !filters.name || rec.user?.name?.toLowerCase().includes(filters.name.toLowerCase());
                  const matchesDate = !filters.date || rec.date === filters.date;
                  const matchesLocation = !filters.location || rec.work_location === filters.location;
                  const matchesStatus = !filters.status || 
                    (filters.status === 'Complete' && rec.clock_in && rec.clock_out) ||
                    (filters.status === 'Incomplete' && (!rec.clock_in || !rec.clock_out));
                  return matchesName && matchesDate && matchesLocation && matchesStatus;
                })).map((rec, index) => {
                  const isIncomplete = !rec.clock_in || !rec.clock_out;
                  return (
                    <tr key={rec.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                    }`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {rec.user?.name?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-slate-900">{rec.user?.name || "-"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{rec.date || "-"}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                          {rec.work_location || "Remote"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {formatTime(rec.clock_in)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          {formatTime(rec.clock_out)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-primary px-3 py-1 rounded-full text-sm font-medium text-white">
                          {isIncomplete ? "-" : rec.total_hours}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(isIncomplete)}
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
  );
}
