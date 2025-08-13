import { useState } from "react";

export default function NameFilter({ onFilter }) {
  const [name, setName] = useState("");

  const handleChange = (e) => {
    setName(e.target.value);
    onFilter(e.target.value);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Filter by name"
        value={name}
        onChange={handleChange}
        className="border border-gray-300 rounded px-3 py-1 w-64"
      />
    </div>
  );
}
