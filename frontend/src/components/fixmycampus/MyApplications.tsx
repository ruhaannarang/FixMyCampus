import { useState, useEffect } from "react";
import { Application } from "@/types/fixmycampus";
import { FileText, Clock, Check, X, MessageSquare, ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { View } from "./AppShell";
import { Button } from "@/components/ui/button";

const templateLabels: Record<string, { label: string; color: string }> = {
  leave: { label: "Leave", color: "bg-warning-soft text-warning" },
  permission: { label: "Permission", color: "bg-info-soft text-info" },
  event: { label: "Event", color: "bg-primary-soft text-primary" },
  medical: { label: "Medical", color: "bg-destructive-soft text-destructive" },
  other: { label: "Other", color: "bg-muted text-muted-foreground" },
};

interface Props {
  onNavigate: (v: View) => void;
}

export const MyApplications = ({ onNavigate }: Props) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getMyApplications();
        setApplications(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all your submitted applications.</p>
        </div>
        <Button onClick={() => onNavigate("send-application")} className="rounded-xl shadow-glow font-semibold">
          <Send className="h-4 w-4 mr-1.5" />New Application
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, tint: "bg-primary-soft text-primary", icon: FileText },
          { label: "Pending", value: stats.pending, tint: "bg-warning-soft text-warning", icon: Clock },
          { label: "Accepted", value: stats.accepted, tint: "bg-success-soft text-success", icon: Check },
          { label: "Rejected", value: stats.rejected, tint: "bg-destructive-soft text-destructive", icon: X },
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

      <div className="flex gap-1.5 flex-wrap">
        {["all", "pending", "accepted", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize", filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40")}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No applications yet</p>
          <p className="text-sm text-muted-foreground mt-1">Send your first application to a teacher.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const tpl = templateLabels[a.templateType] || templateLabels.other;
            const statusStyles: Record<string, string> = { pending: "bg-warning-soft text-warning", accepted: "bg-success-soft text-success", rejected: "bg-destructive-soft text-destructive" };
            return (
              <div key={a._id} className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-soft transition-all">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0"><FileText className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", tpl.color)}>{tpl.label}</span>
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", statusStyles[a.status])}>{a.status}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{a.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      To: <span className="font-medium text-foreground">{a.teacherId?.name || "Unknown"}</span> · {a.teacherId?.department || ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Sent {new Date(a.createdAt).toLocaleDateString()}</p>

                    {a.teacherRemarks && (
                      <div className="mt-3 rounded-xl border border-border p-3 bg-secondary/30">
                        <div className="flex items-center gap-1.5 mb-1"><MessageSquare className="h-3.5 w-3.5 text-primary" /><span className="text-xs font-semibold text-primary">Teacher's Remarks</span></div>
                        <p className="text-sm text-foreground">{a.teacherRemarks}</p>
                        {a.respondedAt && <p className="text-[11px] text-muted-foreground mt-1">Responded {new Date(a.respondedAt).toLocaleDateString()}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
