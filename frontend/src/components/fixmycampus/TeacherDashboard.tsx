import { useState } from "react";
import { Application } from "@/types/fixmycampus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, Inbox, Check, X, Clock, FileText, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

const templateLabels: Record<string, { label: string; color: string }> = {
  leave: { label: "Leave", color: "bg-warning-soft text-warning" },
  permission: { label: "Permission", color: "bg-info-soft text-info" },
  event: { label: "Event", color: "bg-primary-soft text-primary" },
  medical: { label: "Medical", color: "bg-destructive-soft text-destructive" },
  other: { label: "Other", color: "bg-muted text-muted-foreground" },
};

interface Props {
  applications: Application[];
  onRefresh: () => void;
}

export const TeacherDashboard = ({ applications, onRefresh }: Props) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const filtered = applications.filter((a) => {
    if (typeFilter !== "all" && a.templateType !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    const s = `${a.subject} ${a.studentId?.name || ""} ${a.studentId?.usn || ""}`.toLowerCase();
    return !search || s.includes(search.toLowerCase());
  });

  const stats = {
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const handleRespond = async (id: string, status: "accepted" | "rejected") => {
    setRespondingId(id);
    try {
      await api.respondToApplication(id, status, remarks);
      toast.success(`Application ${status}`);
      setRemarks("");
      setExpandedId(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to respond");
    } finally {
      setRespondingId(null);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Application Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and respond to student applications, {user.name || "Teacher"}.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, tint: "bg-warning-soft text-warning" },
          { label: "Accepted", value: stats.accepted, icon: Check, tint: "bg-success-soft text-success" },
          { label: "Rejected", value: stats.rejected, icon: X, tint: "bg-destructive-soft text-destructive" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", s.tint)}><Icon className="h-5 w-5" /></div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by subject or student..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 rounded-xl pl-10" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Filter className="h-3.5 w-3.5" />FILTERS</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", ...Object.keys(templateLabels)].map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t === "all" ? "All types" : templateLabels[t].label}</Chip>
          ))}
          <span className="mx-2 border-l border-border" />
          {["all", "pending", "accepted", "rejected"].map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s === "all" ? "All status" : s}</Chip>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No applications found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const expanded = expandedId === a._id;
            const tpl = templateLabels[a.templateType] || templateLabels.other;
            return (
              <div key={a._id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-soft transition-all overflow-hidden">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0"><FileText className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", tpl.color)}>{tpl.label}</span>
                      <StatusPill status={a.status} />
                    </div>
                    <h3 className="font-semibold text-foreground">{a.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-1">👤 {a.studentId?.name || "Unknown"} · {a.studentId?.usn || ""} · {a.studentId?.branch || ""}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Filed {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setExpandedId(expanded ? null : a._id)} className="text-muted-foreground hover:text-foreground">
                    {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                {expanded && (
                  <div className="border-t border-border px-4 sm:px-5 py-4 bg-secondary/30 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Application Body</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{a.description}</p>
                    </div>
                    {a.teacherRemarks && (
                      <div className="rounded-xl border border-border p-3 bg-card">
                        <div className="flex items-center gap-1.5 mb-1"><MessageSquare className="h-3.5 w-3.5 text-primary" /><span className="text-xs font-semibold text-primary">Your remarks</span></div>
                        <p className="text-sm text-foreground">{a.teacherRemarks}</p>
                      </div>
                    )}
                    {a.status === "pending" && (
                      <div className="space-y-3">
                        <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks (optional)..." rows={2} className="rounded-xl resize-none text-sm" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRespond(a._id, "accepted")} disabled={respondingId === a._id} className="rounded-xl bg-success hover:bg-success/90 text-success-foreground font-semibold flex-1"><Check className="h-4 w-4 mr-1" />Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRespond(a._id, "rejected")} disabled={respondingId === a._id} className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive-soft font-semibold flex-1"><X className="h-4 w-4 mr-1" />Reject</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const s: Record<string, string> = { pending: "bg-warning-soft text-warning", accepted: "bg-success-soft text-success", rejected: "bg-destructive-soft text-destructive" };
  return <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", s[status] || s.pending)}>{status}</span>;
};

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize", active ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground")}>{children}</button>
);
