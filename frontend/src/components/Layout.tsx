import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Target, Building2, Megaphone, Globe, CalendarClock, Settings, MapPin, UserCircle, Briefcase, Package, ShoppingBag, ThumbsDown } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Briefcase },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/opportunities", label: "Opportunities", icon: Target },
  { to: "/prospects", label: "Prospects", icon: Building2 },
  { to: "/contacts", label: "Contacts", icon: UserCircle },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/sources", label: "Sources", icon: Globe },
  { to: "/territories", label: "Territories", icon: MapPin },
  { to: "/product-categories", label: "Product Categories", icon: Package },
  { to: "/products", label: "Products", icon: ShoppingBag },
  { to: "/opportunity-lost-reasons", label: "Lost Reasons", icon: ThumbsDown },
  { to: "/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/sales-tasks", label: "Sales Tasks", icon: Briefcase },
];

export default function Layout() {
  return (
    <div className="d-flex">
      <nav className="sidebar">
        <NavLink to="/" className="brand">CRM</NavLink>
        <ul className="nav flex-column">
          {links.map((l) => (
            <li className="nav-item" key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <l.icon size={18} />
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content-area flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}
