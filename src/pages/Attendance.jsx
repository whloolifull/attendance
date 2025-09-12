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
        console.log('Fetching from attendance table...');
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("*");
          
        console.log('Attendance query result:', { data: attendanceData, error: attendanceError });
          
        if (attendanceError) {
          console.error('Attendance error:', attendanceError);
          throw attendanceError;
        }
          
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select("slack_user_id, name");
          
        if (userError) {
          throw userError;
        }
          
        // Merge the data
        let mergedData = attendanceData.map(record => {
          const user = userData.find(u => u.slack_user_id === record.slack_user_id);
          return { 
            ...record, 
            user,
            date: record.created_at?.split('T')[0]
          };
        });
        
        console.log('Raw attendance data:', attendanceData);
        console.log('Attendance data length:', attendanceData?.length || 0);
        console.log('User data:', userData);
        console.log('Merged data before filter:', mergedData);
        
        // Filter by current date for dashboard
        if (limit) {
          const today = new Date().toISOString().split('T')[0];
          console.log('Today date:', today);
          console.log('Records before date filter:', mergedData.length);
          mergedData = mergedData.filter(record => {
            const recordDate = record.created_at?.split('T')[0];
            console.log('Record date:', recordDate, 'matches today:', recordDate === today);
            return record.created_at?.startsWith(today);
          });
          console.log('Records after date filter:', mergedData.length);
          mergedData = mergedData.slice(0, limit);
        }
          
        setRecords(mergedData);
        console.log('Final records set:', mergedData);
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
        case 'created_at':
          aValue = a.created_at || '';
          bValue = b.created_at || '';
          break;
        case 'log_type':
          aValue = a.log_type || '';
          bValue = b.log_type || '';
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
          const matchesDate = !filters.date || rec.created_at?.split('T')[0] === filters.date;
          const matchesLocation = !filters.location || rec.work_location === filters.location;
          const matchesStatus = !filters.status || rec.log_type === filters.status;
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
                    <button onClick={() => handleSort('created_at')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                      <span>⏰</span>
                      <span>Time</span>
                    </button>
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    <button onClick={() => handleSort('log_type')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                      <span>📊</span>
                      <span>Action</span>
                    </button>
                  </th>

                </tr>
              </thead>
              <tbody>
                {getSortedRecords(records.filter(rec => {
                  const matchesName = !filters.name || rec.user?.name?.toLowerCase().includes(filters.name.toLowerCase());
                  const matchesDate = !filters.date || rec.created_at?.split('T')[0] === filters.date;
                  const matchesLocation = !filters.location || rec.work_location === filters.location;
                  const matchesStatus = !filters.status || rec.log_type === filters.status;
                  return matchesName && matchesDate && matchesLocation && matchesStatus;
                })).map((rec, index) => {
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
                      <td className="py-4 px-6 text-slate-600">{rec.created_at?.split('T')[0] || "-"}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                          {rec.work_location || "Remote"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {formatTime(rec.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          rec.log_type === 'CLOCK_IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {rec.log_type === 'CLOCK_IN' ? 'Clock In' : 'Clock Out'}
                        </span>
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
