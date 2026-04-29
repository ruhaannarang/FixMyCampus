import { Complaint } from "@/types/fixmycampus";
import { View } from "./AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { CategoryIcon, categoryMeta } from "./CategoryIcon";
import { VoteButtons } from "./VoteButtons";
import { ArrowUpRight, Clock, CheckCircle2, ThumbsUp, Plus, Flame } from "lucide-react";

interface Props {
  complaints: Complaint[];
  onNavigate: (v: View) => void;
  onSelect: (id: string) => void;
  onVote: (id: string, vote: "up" | "down") => void;
  loading?: boolean;
}

export const StudentDashboard = ({ complaints, onNavigate, onSelect, onVote, loading }: Props) => {
  const mine = complaints;
  const stats = [
    {
      label: "Pending",
      value: mine.filter((c) => c.status === "pending").length,
      icon: Clock,
      color: "bg-warning-soft text-warning",
    },
    {
      label: "Approved",
      value: mine.filter((c) => c.status === "approved").length,
      icon: ThumbsUp,
      color: "bg-info-soft text-info",
    },
    {
      label: "Resolved",
      value: mine.filter((c) => c.status === "resolved").length,
      icon: CheckCircle2,
      color: "bg-success-soft text-success",
    },
  ];

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-6 sm:p-8 shadow-glow">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-primary-foreground/10 blur-xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-primary-foreground">
            <p className="text-sm font-medium opacity-90">Hello, {user.name || "Student"}</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">Have an issue? We've got you.</h1>
            <p className="text-sm opacity-90 mt-1.5 max-w-md">
              Report any hostel or campus problem in under 30 seconds. Track every step in real time.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => onNavigate("submit")}
            className="bg-card text-primary hover:bg-card/90 rounded-xl font-semibold shrink-0 shadow-md"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Complaint
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-soft transition-shadow"
            >
              <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick categories */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3">Quick report</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(Object.keys(categoryMeta) as (keyof typeof categoryMeta)[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onNavigate("submit")}
              className="bg-card rounded-2xl border border-border p-3 flex flex-col items-center gap-2 hover:border-primary hover:shadow-soft transition-all"
            >
              <CategoryIcon category={cat} />
              <span className="text-xs font-medium text-foreground capitalize">
                {categoryMeta[cat]?.label || cat}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending - upvote existing complaints */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-warning-soft text-warning flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Trending on campus</h2>
              <p className="text-xs text-muted-foreground">
                Same issue? Upvote instead of filing a duplicate.
              </p>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {[...complaints]
            .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
            .slice(0, 4)
            .map((c) => (
              <div
                key={c._id}
                className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-soft hover:border-primary/40 transition-all flex items-start gap-3"
              >
                <VoteButtons complaint={c} onVote={onVote} />
                <button
                  onClick={() => {
                    onSelect(c._id);
                    onNavigate("tracking");
                  }}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                      {c._id.substring(0, 8)}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {c.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {categoryMeta[c.category]?.label || c.category}
                  </p>
                </button>
              </div>
            ))}
          {complaints.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground col-span-2">No complaints to show.</p>
          )}
        </div>
      </section>

      {/* Recent complaints */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Your recent complaints</h2>
          <button
            onClick={() => onNavigate("tracking")}
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {mine.slice(0, 10).map((c) => (
            <div
              key={c._id}
              className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-soft hover:border-primary/40 transition-all group flex items-start gap-3"
            >
              <VoteButtons complaint={c} onVote={onVote} size="sm" />
              <button
                onClick={() => {
                  onSelect(c._id);
                  onNavigate("tracking");
                }}
                className="text-left flex-1 min-w-0"
              >
                <div className="flex items-start gap-3">
                  <CategoryIcon category={c.category} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {c._id.substring(0, 8)}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {c.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Filed {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            </div>
          ))}
          {mine.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground col-span-2">You haven't filed any complaints yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};
