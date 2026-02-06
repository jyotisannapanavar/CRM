import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi } from "@/services/api";
import type { DashboardStats } from "@/types";
import { Users, Target, CalendarClock, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  if (!stats) return <div className="text-red-500">Failed to load dashboard</div>;

  const kpis = [
    { label: "Total Leads", value: stats.leads.total, sub: `${stats.leads.new_last_30_days} new (30d)`, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Open Opportunities", value: stats.opportunities.open, sub: `$${(stats.opportunities.total_value / 1000).toFixed(0)}k total value`, icon: Target, color: "text-green-600 bg-green-50" },
    { label: "Upcoming Appointments", value: stats.appointments.upcoming, sub: `${stats.appointments.total} total`, icon: CalendarClock, color: "text-amber-600 bg-amber-50" },
    { label: "Active Contracts", value: stats.contracts.active, sub: `${stats.contracts.unsigned} unsigned`, icon: FileText, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-xs text-gray-400">{kpi.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.leads.by_status.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.leads.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status} (${count})`}>
                    {stats.leads.by_status.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-10">No lead data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opportunity Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.opportunities.by_stage.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.opportunities.by_stage}>
                  <XAxis dataKey="stage_name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-10">No pipeline data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
