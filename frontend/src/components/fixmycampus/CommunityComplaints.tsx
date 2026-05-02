import { useState, useEffect } from "react";
import { Complaint, ComplaintCategory } from "@/types/fixmycampus";
import { StatusBadge } from "./StatusBadge";
import { CategoryIcon, categoryMeta } from "./CategoryIcon";
import { VoteButtons } from "./VoteButtons";
import { Search, Filter, Globe, Flame, Clock, CheckCircle2, ThumbsUp, X as XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  onVote: (id: string, vote: "up" | "down") => void;
}

export const CommunityComplaints = ({ onVote }: Props) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const data = await api.getCommunityComplaints();
        setComplaints(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load community complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchCommunity();
  }, []);

  const filtered = complaints.filter((c) => {
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    const s = `${c.title} ${c.description} ${c.studentId?.name || "Anonymous"}`.toLowerCase();
    return !search || s.includes(search.toLowerCase());
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const handleLocalVote = async (id: string, vote: "up" | "down") => {
    try {
      if (vote === "down") { toast.error("Downvoting not supported"); return; }
      const res = await api.toggleUpvote(id);
      setComplaints((prev) => prev.map((c) => c._id === id ? { ...c, upvotes: res.upvotes } : c));
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || "Failed to upvote");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center"><Globe className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Community Feed</h1>
          <p className="text-sm text-muted-foreground">All complaints from students across campus. Upvote to boost priority.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Issues", value: stats.total, icon: Flame, tint: "bg-warning-soft text-warning" },
          { label: "Pending", value: stats.pending, icon: Clock, tint: "bg-info-soft text-info" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, tint: "bg-success-soft text-success" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center mb-2", s.tint)}><Icon className="h-4 w-4" /></div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 rounded-xl pl-10" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>All categories</Chip>
          {(Object.keys(categoryMeta) as ComplaintCategory[]).map((cat) => (
            <Chip key={cat} active={categoryFilter === cat} onClick={() => setCategoryFilter(cat)}>{categoryMeta[cat]?.label || cat}</Chip>
          ))}
          <span className="mx-2 border-l border-border" />
          {["all", "pending", "approved", "resolved", "rejected"].map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s === "all" ? "All status" : s}</Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading community complaints...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No complaints found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c._id} className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-soft hover:border-primary/40 transition-all">
              <div className="flex items-start gap-3">
                <VoteButtons complaint={c} onVote={handleLocalVote} size="sm" />
                <CategoryIcon category={c.category} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground">{c._id.substring(0, 8)}</span>
                    <StatusBadge status={c.status} />
                    <span className="text-[11px] text-muted-foreground capitalize">{categoryMeta[c.category]?.label || c.category}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span>{c.isAnonymous ? "🔒 Anonymous" : `👤 ${c.studentId?.name || "Unknown"}`}</span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{c.upvotes?.length || 0} upvotes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize", active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground")}>{children}</button>
);
