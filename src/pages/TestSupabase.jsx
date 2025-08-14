import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AttendanceFromSupabase() {
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      // Fetch attendance data
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("report_attendance_daily")
        .select("*");
        
      if (attendanceError) {
        console.error(attendanceError);
        return;
      }
        
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("id, name");
        
      if (userError) {
        console.error(userError);
        return;
      }
        
      // Merge the data
      const mergedData = attendanceData.map(record => {
      const user = userData.find(u => u.id === record.user_id);
        return { ...record, user };
      });
        
      setRecords(mergedData);
    };
    fetchData();
  }, []);

  const formatTime = (time) => time ? new Date(time).toLocaleTimeString() : "-";
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Records</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Location</th>
            <th className="border px-4 py-2">Clock In</th>
            <th className="border px-4 py-2">Clock Out</th>
            <th className="border px-4 py-2">Total Hours</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => {
            const isIncomplete = !rec.clock_in || !rec.clock_out;
            return (
              <tr key={rec.id}>
                <td className="border px-4 py-2">{rec.user?.name || "-"}</td>
                <td className="border px-4 py-2">{rec.date || "-"}</td>
                <td className="border px-4 py-2">{rec.work_location || "-"}</td>
                <td className="border px-4 py-2">{formatTime(rec.clock_in)}</td>
                <td className="border px-4 py-2">{formatTime(rec.clock_out)}</td>
                <td className="border px-4 py-2">
                  {isIncomplete ? "-" : rec.total_hours}
                </td>
                <td className="border px-4 py-2">
                  {isIncomplete ? "Incomplete" : "Complete"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
