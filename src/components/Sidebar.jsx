import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-6 space-y-6">
      <h2 className="text-2xl font-bold">HR Admin</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/" className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
        <Link to="/attendance" className="hover:bg-gray-700 p-2 rounded">Attendance</Link>
        <Link to="/leaves" className="hover:bg-gray-700 p-2 rounded">Leave Management</Link>
        <Link to="/supabase" className="hover:bg-gray-700 p-2 rounded">Supabase</Link>
      </nav>
    </aside>
  );
}
