import { Complaint } from "@/types/fixmycampus";
import { categoryMeta } from "./CategoryIcon";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Server,
  Users,
  AlertTriangle,
} from "lucide-react";

interface Props {
  complaints: Complaint[];
}

export const AdminDashboard = ({ complaints }: Props) => {
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const resolutionRate = Math.round((resolved / total) * 100);

  const trendData = [
    { day: "Mon", complaints: 12, resolved: 9 },
    { day: "Tue", complaints: 18, resolved: 14 },
    { day: "Wed", complaints: 14, resolved: 12 },
    { day: "Thu", complaints: 22, resolved: 16 },
    { day: "Fri", complaints: 27, resolved: 20 },
    { day: "Sat", complaints: 16, resolved: 14 },
    { day: "Sun", complaints: 9, resolved: 8 },
  ];

  const categoryData = (Object.keys(categoryMeta) as (keyof typeof categoryMeta)[]).map((c) => ({
    name: categoryMeta[c].label,
    value: complaints.filter((x) => x.category === c).length || Math.floor(Math.random() * 8) + 2,
  }));

  const stats = [
    {
      label: "Total complaints",
      value: total,
      delta: "+12%",
      icon: Activity,
      tint: "bg-primary-soft text-primary",
    },
    {
      label: "Resolved",
      value: resolved,
      delta: `${resolutionRate}% rate`,
      icon: CheckCircle2,
      tint: "bg-success-soft text-success",
    },
    {
      label: "Pending review",
      value: pending,
      delta: "Avg 4h response",
      icon: Clock,
      tint: "bg-warning-soft text-warning",
    },
    {
      label: "Active students",
      value: 2436,
      delta: "+48 this week",
      icon: Users,
      tint: "bg-info-soft text-info",
    },
  ];

  const systems = [
    { name: "API Gateway", status: "Operational", uptime: "99.98%", ok: true },
    { name: "Notification Service", status: "Operational", uptime: "99.94%", ok: true },
    { name: "Storage", status: "Degraded", uptime: "97.21%", ok: false },
    { name: "Auth Provider", status: "Operational", uptime: "100%", ok: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Campus Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time view of complaints, performance, and platform health.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${s.tint} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-success bg-success-soft px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {s.delta}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {s.value.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground">Weekly activity</h3>
              <p className="text-xs text-muted-foreground">Complaints filed vs resolved</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Filed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" /> Resolved
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="hsl(var(--success))"
                  strokeWidth={2.5}
                  fill="url(#g2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-1">By category</h3>
          <p className="text-xs text-muted-foreground mb-4">This month</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System monitoring */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-foreground">System monitoring</h3>
          </div>
          <span className="text-xs font-semibold text-success bg-success-soft px-2.5 py-1 rounded-full">
            All Systems Mostly Operational
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {systems.map((sys) => (
            <div
              key={sys.name}
              className="rounded-xl border border-border p-4 bg-secondary/40"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{sys.name}</span>
                {sys.ok ? (
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                )}
              </div>
              <p className={`text-xs font-semibold ${sys.ok ? "text-success" : "text-warning"}`}>
                {sys.status}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Uptime {sys.uptime}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
