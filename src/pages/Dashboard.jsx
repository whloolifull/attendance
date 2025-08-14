import Attendance from "./Attendance";
import LeaveRequests from "./LeaveRequests";
import TestSupabase from "./TestSupabase";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <Attendance showFilter={false} />
      <LeaveRequests showFilter={false} />
      <TestSupabase />
    </div>
  );
}
