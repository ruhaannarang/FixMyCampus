import { Complaint } from "@/types/fixmycampus";
import { categoryMeta } from "./CategoryIcon";
import {
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
} from "lucide-react";

interface Props {
  complaints: Complaint[];
}

export const AdminDashboard = ({ complaints }: Props) => {
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const approved = complaints.filter((c) => c.status === "approved").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const categoryData = (Object.keys(categoryMeta) as (keyof typeof categoryMeta)[]).map((c) => ({
    name: categoryMeta[c].label,
    value: complaints.filter((x) => x.category === c).length,
  }));

  const stats = [
    {
      label: "Total complaints",
      value: total,
      delta: `${approved} approved`,
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
      delta: `${approved} in progress`,
      icon: Clock,
      tint: "bg-warning-soft text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Campus Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time view of complaints and performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
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

      {/* Category breakdown chart */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h3 className="font-bold text-foreground mb-1">By category</h3>
        <p className="text-xs text-muted-foreground mb-4">Complaint distribution</p>
        <div className="h-48">
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

      {/* Recent complaints overview */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h3 className="font-bold text-foreground mb-4">Recent complaints</h3>
        <div className="space-y-3">
          {complaints.slice(0, 5).map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/40"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">
                  {c.isAnonymous ? "🔒 Anonymous" : `👤 ${c.studentId?.name || "Unknown"}`}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {c.category} · {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  c.status === "pending"
                    ? "bg-warning-soft text-warning"
                    : c.status === "approved"
                      ? "bg-info-soft text-info"
                      : c.status === "resolved"
                        ? "bg-success-soft text-success"
                        : "bg-destructive-soft text-destructive"
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
          {complaints.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No complaints yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
