import { useState } from "react";
import NameFilter from "../components/NameFilter";

export default function Attendance({ showFilter = true, limit = null }) {
  const [filter, setFilter] = useState("");
  // Mock data before Supabase connection
  const data = [
    { id: 1, name: "Alice", date: "2025-08-08", clockIn: "08:05", clockOut: "17:30" },
    { id: 2, name: "Bob", date: "2025-08-08", clockIn: "09:15", clockOut: "18:00" },
    { id: 3, name: "Charlie", date: "2025-08-08", clockIn: "07:30", clockOut: "16:45" },
  ];

  const filteredData = data.filter(row =>
    row.name.toLowerCase().includes(filter.toLowerCase())
  );

  const displayedData = limit ? filteredData.slice(0, limit) : filteredData;

  const calculateHoursAndMinutes = (inTime, outTime) => {
    const start = new Date(`1970-01-01T${inTime}:00`);
    const end = new Date(`1970-01-01T${outTime}:00`);
  
    // total milliseconds difference
    let diffMs = end - start;
  
    // subtract 1 hour in milliseconds for lunch break
    diffMs -= 1 * 60 * 60 * 1000;
  
    // if negative or zero, return "0h 0m"
    if (diffMs <= 0) return "0h 0m";
  
    // convert to hours and minutes
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
    return `${hours}h ${minutes}m`;
  };  

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
      {showFilter && <NameFilter onFilter={setFilter} />}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Clock In</th>
            <th className="border p-2">Clock Out</th>
            <th className="border p-2">Hours Worked</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.name}</td>
              <td className="border p-2">{row.date}</td>
              <td className="border p-2">{row.clockIn}</td>
              <td className="border p-2">{row.clockOut}</td>
              <td className="border p-2">{calculateHoursAndMinutes(row.clockIn, row.clockOut)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

