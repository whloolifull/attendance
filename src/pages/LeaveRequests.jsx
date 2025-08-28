import { useState } from "react";
import LeaveFilterBar from "../components/LeaveFilterBar";

export default function LeaveRequests({ showFilter = true, limit = null }) {
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [data, setData] = useState([
    { id: 1, name: "Alice", date: "2025-08-01", type: "Annual Leave", status: "Approved" },
    { id: 2, name: "Bob", date: "2025-08-02", type: "Sick Leave", status: "Pending" },
    { id: 3, name: "Charlie", date: "2025-08-03", type: "Annual Leave", status: "Rejected" },
    { id: 4, name: "Daisy", date: "2025-08-04", type: "Sick Leave", status: "Pending" },
  ]);

  const handleAction = (id, newStatus) => {
    setData(prevData =>
      prevData.map(leave =>
        leave.id === id ? { ...leave, status: newStatus } : leave
      )
    );
    // Later: call Supabase API to update status in database
    console.log(`Leave ID ${id} updated to ${newStatus}`);
  };

  let filteredData = data.filter(row => {
    const matchesName = !filters.name || row.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesDate = !filters.date || row.date === filters.date;
    const matchesType = !filters.type || row.type === filters.type;
    const matchesStatus = !filters.status || row.status === filters.status;
    return matchesName && matchesDate && matchesType && matchesStatus;
  });

  if (limit) {
    const today = new Date().toISOString().split('T')[0];
    filteredData = filteredData.filter(row => row.date === today);
    filteredData = filteredData.slice(0, limit);
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Approved': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const statusIcons = {
      'Approved': '✓',
      'Pending': '⏳',
      'Rejected': '✗'
    };
    
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
        <span>{statusIcons[status]}</span>
        <span>{status}</span>
      </span>
    );
  };

  const getLeaveTypeIcon = (type) => {
    return type === 'Annual Leave' ? '🏖️' : '🩺';
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
                  <button onClick={() => handleSort('date')} className="flex items-center space-x-2 hover:text-primary transition-colors">
                    <span>📅</span>
                    <span>Date</span>
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  <button onClick={() => handleSort('type')} className="flex items-center space-x-2 hover:text-primary transition-colors">
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
                  <td className="py-4 px-6 text-slate-600">{row.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getLeaveTypeIcon(row.type)}</span>
                      <span className="text-slate-700">{row.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(row.status)}
                  </td>
                  {showFilter && (
                    <td className="py-4 px-6">
                      {row.status === "Pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAction(row.id, "Approved")}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-1"
                          >
                            <span>✓</span>
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleAction(row.id, "Rejected")}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
