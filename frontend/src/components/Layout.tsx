import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  Building2,
  Megaphone,
  FileText,
  CalendarClock,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/leads", icon: Users, label: "Leads" },
  { to: "/opportunities", icon: Target, label: "Opportunities" },
  { to: "/prospects", icon: Building2, label: "Prospects" },
  { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
  { to: "/contracts", icon: FileText, label: "Contracts" },
  { to: "/appointments", icon: CalendarClock, label: "Appointments" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">CRM</h1>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
