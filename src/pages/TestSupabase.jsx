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
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id}>
                <td className="border px-4 py-2">{rec.user?.name}</td>
                <td className="border px-4 py-2">{rec.date}</td>
                <td className="border px-4 py-2">{rec.work_location}</td>
                <td className="border px-4 py-2">
                  {new Date(rec.clock_in).toLocaleTimeString()}
                </td>
                <td className="border px-4 py-2">
                  {new Date(rec.clock_out).toLocaleTimeString()}
                </td>
                <td className="border px-4 py-2">{rec.total_hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
