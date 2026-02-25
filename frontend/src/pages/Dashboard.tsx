import { useEffect, useState } from "react";
import { dashboardApi, customerApi, productApi } from "@/services/api";
import type { DashboardStats, Customer, Product } from "@/types";
import { Users, Target, CalendarClock, FileText, MoreVertical, Send, Package, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import "./Dashboard.css";

// Donut chart colors
const DONUT_COLORS = {
  primary: ["#556ee6", "#e8ecf6"],
  success: ["#34c38f", "#e6f7f1"],
  warning: ["#f1b44c", "#fef4e4"],
  info: ["#50a5f1", "#e6f2fd"],
};

const BAR_COLORS = ["#556ee6", "#34c38f", "#f1b44c", "#f46a6a", "#50a5f1", "#6f42c1", "#d63384"];

const TERRITORY_BAR_COLORS = ["blue", "green", "orange", "cyan", "red", "purple"];
const AVATAR_BG = ["bg-1", "bg-2", "bg-3", "bg-4", "bg-5", "bg-6"];
const PRODUCT_ICON_BG = ["bg-soft-blue", "bg-soft-green", "bg-soft-orange", "bg-soft-cyan", "bg-soft-red"];

// Mini donut for KPI card
function KpiDonut({ value, total, colorKey }: { value: number; total: number; colorKey: keyof typeof DONUT_COLORS }) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const data = [
    { name: "filled", value: pct },
    { name: "empty", value: 1 - pct },
  ];
  const [c1, c2] = DONUT_COLORS[colorKey];

  return (
    <div className="kpi-donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="95%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            stroke="none"
          >
            <Cell fill={c1} />
            <Cell fill={c2} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Activity messages (static demo data)
const activityMessages = [
  { id: 1, type: "received", text: "New lead created successfully!" },
  { id: 2, type: "sent", text: "Follow up scheduled for tomorrow" },
  { id: 3, type: "received", text: "Opportunity moved to Proposal stage" },
  { id: 4, type: "sent", text: "Contract sent for review. Waiting for client signature on the agreement." },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      customerApi.list({ per_page: 6 }).then(r => r.data).catch(() => []),
      productApi.list({ per_page: 6 }).then(r => r.data).catch(() => []),
    ]).then(([s, c, p]) => {
      setStats(s);
      setCustomers(c as Customer[]);
      setProducts(p as Product[]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="alert alert-danger m-4">Failed to load dashboard data</div>;
  }

  // KPI data
  const kpis = [
    {
      label: "Total Leads",
      value: stats.leads.total,
      change: stats.leads.new_last_30_days,
      changeLabel: `+${stats.leads.new_last_30_days} new`,
      positive: true,
      sub: "Since last month",
      icon: Users,
      colorKey: "primary" as const,
      donutTotal: Math.max(stats.leads.total, 1),
      donutValue: stats.leads.new_last_30_days,
    },
    {
      label: "Open Opportunities",
      value: stats.opportunities.open,
      change: stats.opportunities.won_last_30_days,
      changeLabel: `${stats.opportunities.won_last_30_days} won`,
      positive: true,
      sub: "Since last month",
      icon: Target,
      colorKey: "success" as const,
      donutTotal: Math.max(stats.opportunities.total, 1),
      donutValue: stats.opportunities.open,
    },
    {
      label: "Appointments",
      value: stats.appointments.upcoming,
      change: stats.appointments.total,
      changeLabel: `${stats.appointments.total} total`,
      positive: true,
      sub: "Upcoming",
      icon: CalendarClock,
      colorKey: "warning" as const,
      donutTotal: Math.max(stats.appointments.total, 1),
      donutValue: stats.appointments.upcoming,
    },
    {
      label: "Active Contracts",
      value: stats.contracts.active,
      change: stats.contracts.unsigned,
      changeLabel: `${stats.contracts.unsigned} unsigned`,
      positive: stats.contracts.unsigned === 0,
      sub: "Current period",
      icon: FileText,
      colorKey: "info" as const,
      donutTotal: Math.max(stats.contracts.active + stats.contracts.unsigned, 1),
      donutValue: stats.contracts.active,
    },
  ];

  // Bar chart data (leads by status)
  const barData = stats.leads.by_status.map(s => ({
    name: s.status,
    count: s.count,
  }));

  // Ranked sources (from by_status as a proxy for top items)
  const rankedItems = stats.leads.by_status.slice(0, 5).map((s, i) => ({
    rank: i + 1,
    name: s.status,
    count: s.count,
    positive: i % 2 === 0,
    pctLabel: `${((s.count / Math.max(stats.leads.total, 1)) * 100).toFixed(1)}%`,
  }));

  // Territory / pipeline data
  const territorySummary = stats.opportunities.by_stage.slice(0, 5).map((s, i) => {
    const maxVal = Math.max(...stats.opportunities.by_stage.map(x => x.count), 1);
    return {
      name: s.stage_name,
      count: s.count,
      pct: Math.round((s.count / maxVal) * 100),
      color: TERRITORY_BAR_COLORS[i % TERRITORY_BAR_COLORS.length],
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <h2>Welcome !</h2>
        <div className="dashboard-breadcrumb">
          <span>Dashboard</span> &rsaquo; Welcome !
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi) => (
          <div className="col-md-6 col-xl-3" key={kpi.label}>
            <div className="kpi-card">
              <div className="kpi-info">
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value.toLocaleString()}</div>
                <div>
                  <span className={`kpi-change ${kpi.positive ? "positive" : "negative"}`}>
                    {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.changeLabel}
                  </span>
                  <span className="kpi-sub">{kpi.sub}</span>
                </div>
              </div>
              <KpiDonut value={kpi.donutValue} total={kpi.donutTotal} colorKey={kpi.colorKey} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Chart + Territory */}
      <div className="row g-3 mb-4">
        {/* Lead Pipeline Chart */}
        <div className="col-lg-8">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Lead Pipeline</h5>
              <div className="filter-tabs">
                <button className="filter-tab active">ALL</button>
                <button className="filter-tab">1M</button>
                <button className="filter-tab">6M</button>
                <button className="filter-tab">1Y</button>
              </div>
            </div>
            <div className="dash-card-body">
              <div className="chart-ranked-layout">
                <div className="chart-section">
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} barCategoryGap="30%">
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#74788d" }}
                          axisLine={{ stroke: "#e0e0e0" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#74788d" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            fontSize: "0.82rem",
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {barData.map((_, i) => (
                            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      No lead data available
                    </div>
                  )}
                </div>
                <div className="ranked-list">
                  {rankedItems.map((item) => (
                    <div className="ranked-item" key={item.rank}>
                      <div className="ranked-number">{item.rank}</div>
                      <div className="ranked-name">{item.name}</div>
                      <span className={`ranked-badge ${item.positive ? "positive" : "negative"}`}>
                        {item.positive ? "+" : ""}{item.pctLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity Stages */}
        <div className="col-lg-4">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Opportunity Stages</h5>
              <div className="sort-by">
                Sort By:
                <select defaultValue="all">
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div className="dash-card-body">
              {territorySummary.length > 0 ? (
                <ul className="territory-list">
                  {territorySummary.map((t) => (
                    <li className="territory-item" key={t.name}>
                      <div className="territory-meta">
                        <span className="territory-name">{t.name}</span>
                        <span className="territory-pct">{t.pct}%</span>
                      </div>
                      <div className="territory-bar">
                        <div
                          className={`territory-bar-fill ${t.color}`}
                          style={{ width: `${t.pct}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted text-center py-4">No stage data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Customer List + Products + Activity */}
      <div className="row g-3">
        {/* Customer List */}
        <div className="col-lg-4">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Customer List</h5>
              <div className="sort-by">
                All Members
                <select defaultValue="all">
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div className="dash-card-body" style={{ overflowY: "auto", maxHeight: 380 }}>
              {customers.length > 0 ? customers.map((c, i) => {
                const initials = c.name
                  ? c.name.split(" ").map(w => w[0]).join("").substring(0, 2)
                  : "?";
                return (
                  <div className="customer-list-item" key={c.id}>
                    <div className={`customer-avatar ${AVATAR_BG[i % AVATAR_BG.length]}`}>
                      {initials}
                    </div>
                    <div className="customer-details">
                      <div className="customer-name">{c.name}</div>
                      <div className="customer-email">{c.email || "No email"}</div>
                    </div>
                    <div className="customer-more">
                      <MoreVertical size={16} />
                    </div>
                  </div>
                );
              }) : (
                <div className="text-muted text-center py-4">No customers yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <div className="col-lg-4">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Products</h5>
              <div className="customer-more">
                <MoreVertical size={16} />
              </div>
            </div>
            <div className="dash-card-body" style={{ overflowY: "auto", maxHeight: 380, padding: "0 20px 16px" }}>
              {products.length > 0 ? (
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id}>
                        <td>
                          <div className="product-name-cell">
                            <div className={`product-icon ${PRODUCT_ICON_BG[i % PRODUCT_ICON_BG.length]}`}>
                              <Package size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{p.name}</div>
                              <div style={{ fontSize: "0.72rem", color: "#74788d" }}>
                                {p.code || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ₹{p.rate?.toLocaleString() || "0"}
                        </td>
                        <td>
                          <span className={`stock-badge ${p.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                            {p.stock > 0 ? "Available" : "Out of Stock"}
                          </span>
                        </td>
                        <td>{p.category?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-muted text-center py-4">No products yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed / Chat */}
        <div className="col-lg-4">
          <div className="dash-card">
            <div className="dash-card-header">
              <h5>Recent Activity</h5>
              <div className="sort-by">
                Today
                <select defaultValue="today">
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>
            <div className="dash-card-body" style={{ display: "flex", flexDirection: "column", maxHeight: 380 }}>
              <div className="activity-feed">
                <div className="activity-date">
                  <span>Today</span>
                </div>
                <div className="activity-messages">
                  {activityMessages.map((msg) => (
                    <div className={`activity-item ${msg.type}`} key={msg.id}>
                      <div className="activity-bubble">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="activity-input">
                  <input type="text" placeholder="Enter Message..." readOnly />
                  <button>
                    Send <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
