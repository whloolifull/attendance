import { useState } from "react";

export default function NameFilter({ onFilter }) {
  const [name, setName] = useState("");

  const handleChange = (e) => {
    setName(e.target.value);
    onFilter(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-slate-400 text-lg">🔍</span>
      </div>
      <input
        type="text"
        placeholder="Search employees..."
        value={name}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white shadow-sm hover:shadow-md"
      />
    </div>
  );
}
