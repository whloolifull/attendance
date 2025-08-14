import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function UserListWithReports() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reports, setReports] = useState([]);

  // Fetch team members
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("user").select("id, name");
      if (error) console.error(error);
      else setUsers(data);
    };
    fetchUsers();
  }, []);

  // Fetch selected user's reports
  useEffect(() => {
    if (!selectedUser) return;
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("report_attendance_daily")
        .select("*")
        .eq("user_id", selectedUser.id)
        .order("date", { ascending: false });

      if (error) console.error(error);
      else setReports(data);
    };
    fetchReports();
  }, [selectedUser]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      {/* Team Members List */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {users.map((user) => (
          <button
            key={user.id}
            className={`px-4 py-2 rounded border ${
              selectedUser?.id === user.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedUser(user)}
          >
            {user.name}
          </button>
        ))}
      </div>

      {/* User's Reports */}
      {selectedUser && (
        <>
          <h3 className="text-xl font-semibold mb-4">
            {selectedUser.name}'s Attendance
          </h3>

          {/* Table */}
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Location</th>
                <th className="border px-4 py-2">Clock In</th>
                <th className="border px-4 py-2">Clock Out</th>
                <th className="border px-4 py-2">Total Hours</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rec) => (
                <tr key={rec.id}>
                  <td className="border px-4 py-2">{rec.date}</td>
                  <td className="border px-4 py-2">{rec.work_location}</td>
                  <td className="border px-4 py-2">
                    {rec.clock_in
                      ? new Date(rec.clock_in).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">
                    {rec.clock_out
                      ? new Date(rec.clock_out).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">{rec.total_hours ?? "-"}</td>
                  <td className="border px-4 py-2">
                    {rec.clock_in && rec.clock_out ? "Complete" : "Incomplete"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
