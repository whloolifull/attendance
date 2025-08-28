import { useState } from "react";

export default function FilterBar({ onFilter, showStatus = true, showLocation = true, showDate = true }) {
  const [filters, setFilters] = useState({
    date: "",
    location: "",
    status: "",
    name: ""
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
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

        {showDate && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
        )}

        {showLocation && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="">All Locations</option>
              <option value="OFFICE">OFFICE</option>
              <option value="WORK_FROM_HOME">WORK_FROM_HOME</option>
            </select>
          </div>
        )}

        {showStatus && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            >
              <option value="">All Status</option>
              <option value="Complete">Complete</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  );
}