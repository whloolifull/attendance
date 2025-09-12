import { useState } from "react";

export default function LeaveFilterBar({ onFilter }) {
  const [filters, setFilters] = useState({
    name: "",
    date: "",
    type: "",
    status: ""
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = { name: "", date: "", type: "", status: "" };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  return (
    <div className="bg-slate-50 rounded-xl mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 rounded-xl transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔍</span>
          <span className="font-medium text-slate-700">Filters</span>
        </div>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-600">Filter your leave requests</span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Search Name</label>
          <input
            type="text"
            placeholder="Search employees..."
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            <option value="">All Types</option>
            <option value="ANNUAL">Annual</option>
            <option value="MEDICAL">Medical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
          </div>
        </div>
      )}
    </div>
  );
}