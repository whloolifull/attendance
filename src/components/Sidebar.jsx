import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/attendance", label: "Attendance", icon: "⏰" },
    { path: "/leaves", label: "Leave Management", icon: "🏖️" },
    { path: "/user-reports", label: "User Reports", icon: "👥" },
    { path: "/analytics", label: "Analytics", icon: "📈" },
    { path: "/events", label: "Events", icon: "📅" }
  ];

  return (
    <aside className="w-16 lg:w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl flex flex-col">
      <div className="flex-1 p-2 lg:p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-xl font-bold">
            HR
          </div>
          <h2 className="hidden lg:block text-2xl font-bold text-primary">
            Admin Dashboard
          </h2>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary shadow-lg transform scale-105"
                    : "hover:bg-slate-700/50 hover:transform hover:scale-105"
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="hidden lg:inline font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-2 lg:p-8 lg:pt-0">
        <div className="bg-slate-700/50 rounded-xl p-2 lg:p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-white">
              A
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-slate-400">admin@lifull.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
