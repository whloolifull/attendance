import Attendance from "./Attendance";
import LeaveRequests from "./LeaveRequests";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard Overview</h1>
        <p className="text-slate-600">Welcome back! Here's what's happening in your organization today.</p>
      </div>
      
      <div className="grid gap-8">
        <Attendance showFilter={false} limit={10} />
        <LeaveRequests showFilter={false} limit={10} />
      </div>
    </div>
  );
}
