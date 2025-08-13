import AttendanceTable from "./AttendanceTable";
import LeaveRequestsTable from "./LeaveRequestsTable";
import TestSupabase from "./TestSupabase";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <AttendanceTable showFilter={false} />
      <LeaveRequestsTable showFilter={false} />
      <TestSupabase />
    </div>
  );
}
