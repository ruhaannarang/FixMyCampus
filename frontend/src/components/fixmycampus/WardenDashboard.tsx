import { useState } from "react";
import { Complaint, ComplaintCategory } from "@/types/fixmycampus";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { CategoryIcon, categoryMeta } from "./CategoryIcon";
import { VoteButtons } from "./VoteButtons";
import { Check, X, Search, Filter, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { View } from "./AppShell";

interface Props {
  complaints: Complaint[];
  onSelect: (id: string) => void;
  onNavigate: (v: View) => void;
  onVote: (id: string, vote: "up" | "down") => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export const WardenDashboard = ({ complaints, onSelect, onNavigate, onVote, onStatusUpdate }: Props) => {
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = complaints.filter((c) => {
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    const searchString = `${c.title} ${c._id} ${c.studentId?.name || "Anonymous"}`.toLowerCase();
    if (search && !searchString.includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: complaints.filter((c) => c.status === "pending").length,
    approved: complaints.filter((c) => c.status === "approved").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const handleApprove = (id: string) => onStatusUpdate(id, "approved");
  const handleReject = (id: string) => onStatusUpdate(id, "rejected");
  const handleResolve = (id: string) => onStatusUpdate(id, "resolved");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Complaint Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, approve, and resolve student-reported issues.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning">Awaiting</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.pending}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-info">In progress</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.approved}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-success">Resolved</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, ID, or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            FILTERS
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>
            All categories
          </FilterChip>
          {(Object.keys(categoryMeta) as ComplaintCategory[]).map((cat) => (
            <FilterChip
              key={cat}
              active={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
            >
              {categoryMeta[cat]?.label || cat}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No complaints match your filters</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting search or filters above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-soft transition-all"
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <VoteButtons complaint={c} onVote={onVote} size="sm" />
                <CategoryIcon category={c.category} />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onSelect(c._id);
                    onNavigate("tracking");
                  }}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                      {c._id.substring(0, 8)}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs font-medium text-foreground mt-1">
                    {c.isAnonymous ? "🔒 Anonymous" : `👤 ${c.studentId?.name || "Unknown"}`}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {c.category} {!c.isAnonymous && c.studentId?.hostelBlock ? `· ${c.studentId.hostelBlock}` : ''} {!c.isAnonymous && c.studentId?.roomNumber ? `· Room ${c.studentId.roomNumber}` : ''} · {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {c.status === "pending" && (
                  <div className="flex gap-2 sm:flex-col lg:flex-row shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(c._id)}
                      className="rounded-xl bg-success hover:bg-success/90 text-success-foreground font-semibold flex-1"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(c._id)}
                      className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive-soft hover:text-destructive font-semibold flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
                {c.status === "approved" && (
                  <Button
                    size="sm"
                    onClick={() => handleResolve(c._id)}
                    className="rounded-xl shrink-0"
                  >
                    Mark resolved
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
      active
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
    )}
  >
    {children}
  </button>
);
