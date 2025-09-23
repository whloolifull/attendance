import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import LeaveFilterBar from "../components/LeaveFilterBar";

export default function LeaveRequests({ showFilter = true, limit = null }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState(new Set());

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch leave data
        const { data: leaveData, error: leaveError } = await supabase
          .from("leave")
          .select("*");
          
        if (leaveError) {
          throw leaveError;
        }
          
        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("user")
          .select("id, name");
          
        if (userError) {
          throw userError;
        }
          
        // Merge the data
        let mergedData = leaveData.map(record => {
          const user = userData.find(u => u.id === record.user_id);
          return { 
            ...record, 
            name: user?.name || 'Unknown',
            date: record.start_at,
            type: record.leave_type
          };
        });
        
        // Filter by request date for dashboard
        if (limit) {
          const today = new Date().toISOString().split('T')[0];
          mergedData = mergedData.filter(record => record.created_at?.startsWith(today));
          mergedData = mergedData.slice(0, limit);
        }
          
        setData(mergedData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [limit]);

  const handleAction = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('leave')
        .update({ status: newStatus })
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      setData(prevData =>
        prevData.map(leave =>
          leave.id === id ? { ...leave, status: newStatus } : leave
        )
      );
    } catch (err) {
      console.error('Error updating leave status:', err);
      alert('Failed to update leave status. Please check permissions.');
    }
  };

  let filteredData = data.filter(row => {
    const matchesName = !filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesDate = !filters.date || row.start_at?.split('T')[0] === filters.date;
    const matchesType = !filters.type || row.leave_type === filters.type;
    const matchesStatus = !filters.status || row.status?.toLowerCase() === filters.status.toLowerCase();
    return matchesName && matchesDate && matchesType && matchesStatus;
  });

  if (limit) {
    const today = new Date().toISOString().split('T')[0];
    filteredData = filteredData.filter(row => row.created_at?.startsWith(today));
    filteredData = filteredData.slice(0, limit);
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      'APPROVE': 'bg-green-500 text-white',
      'PENDING': 'bg-yellow-500 text-white',
      'REJECT': 'bg-red-500 text-white'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-500 text-white'}`}>
        {status}
      </span>
    );
  };
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  const toggleRowExpansion = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
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
              <span className="text-2xl">🏖️</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Leave Requests</h2>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-white font-medium">{filteredData.length} Requests</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 lg:p-6">
        
        {showFilter && (
          <LeaveFilterBar onFilter={setFilters} />
        )}
        
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📄</span>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No leave requests found</h3>
            <p className="text-slate-500">No leave data available or matches your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  <button onClick={() => handleSort('name')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                    <span>👤</span>
                    <span>Employee</span>
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  <button onClick={() => handleSort('created_at')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                    <span>📅</span>
                    <span>Request Date</span>
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  <button onClick={() => handleSort('leave_type')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                    <span>🏷️</span>
                    <span>Type</span>
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  <button onClick={() => handleSort('status')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                    <span>📊</span>
                    <span>Status</span>
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  <div className="flex items-center space-x-2">
                    <span>ℹ️</span>
                  </div>
                </th>
                {showFilter && (
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <span>⚙️</span>
                      <span>Actions</span>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {getSortedData(filteredData).map((row, index) => (
                <>
                  <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                  }`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {row.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {row.created_at ? row.created_at.split('T')[0] : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-700">{row.leave_type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleRowExpansion(row.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <span>{expandedRows.has(row.id) ? '▼' : '▶'}</span>
                        <span>Show more</span>
                      </button>
                    </td>
                    {showFilter && (
                      <td className="py-4 px-6">
                        {row.status === "PENDING" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction(row.id, "APPROVE")}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1"
                            >
                              <span>✓</span>
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleAction(row.id, "REJECT")}
                              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1"
                            >
                              <span>✗</span>
                              <span>Deny</span>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                  {expandedRows.has(row.id) && (
                    <tr key={`${row.id}-details`} className="bg-slate-50">
                      <td colSpan={showFilter ? 6 : 5} className="px-6 py-4">
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                                  <span>📅</span>
                                  <span>Start Date</span>
                                </h4>
                                <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded">
                                  {row.start_at?.split('T')[0] || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                                  <span>📅</span>
                                  <span>End Date</span>
                                </h4>
                                <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded">
                                  {row.end_at?.split('T')[0] || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                                <span>📝</span>
                                <span>Reason</span>
                              </h4>
                              <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded">
                                {row.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
