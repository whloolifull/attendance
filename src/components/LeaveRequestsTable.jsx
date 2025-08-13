import { useState } from "react";
import NameFilter from "../components/NameFilter";

export default function LeaveRequestsTable({ showFilter = true, limit = null }) {
  const [filter, setFilter] = useState("");
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

  let filteredData = data.filter(row =>
    row.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (limit) {
    filteredData = filteredData.slice(0, limit);
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Leave Requests</h2>
      {showFilter && <NameFilter onFilter={setFilter} />}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Status</th>
            {showFilter && <th className="border p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.name}</td>
              <td className="border p-2">{row.date}</td>
              <td className="border p-2">{row.type}</td>
              <td className="border p-2">{row.status}</td>
              {showFilter && (
                <td className="border p-2 space-x-2">
                  {row.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleAction(row.id, "Approved")}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(row.id, "Rejected")}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Deny
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
