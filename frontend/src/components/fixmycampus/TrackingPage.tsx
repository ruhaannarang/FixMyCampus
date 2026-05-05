import { useState } from "react";
import { Complaint } from "@/types/fixmycampus";
import { StatusBadge } from "./StatusBadge";
import { CategoryIcon, categoryMeta } from "./CategoryIcon";
import { VoteButtons } from "./VoteButtons";
import { Check, Circle, MessageSquare, AlertCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  complaints: Complaint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onVote: (id: string, vote: "up" | "down") => void;
  refreshData?: () => void;
}

export const TrackingPage = ({ complaints, selectedId, onSelect, onVote, refreshData }: Props) => {
  const [activeId, setActiveId] = useState(selectedId ?? complaints[0]?._id);
  const active = complaints.find((c) => c._id === activeId) ?? complaints[0];
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const role = localStorage.getItem("role");
  const isAdminOrWarden = role === "warden" || role === "faculty" || role === "admin";

  const getTimeline = (complaint: Complaint) => {
    const { status, createdAt, approvedAt, rejectedAt, resolvedAt } = complaint;
    const isApproved = status === "approved" || status === "resolved";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";
    
    const steps = [
      {
        label: "Complaint submitted",
        date: new Date(createdAt).toLocaleString(),
        done: true,
      },
    ];

    if (isRejected) {
      steps.push({
        label: "Complaint rejected",
        date: rejectedAt ? new Date(rejectedAt).toLocaleString() : "Unknown",
        done: true,
        rejected: true,
      } as any);
    } else {
      steps.push({
        label: "Warden approved",
        date: isApproved && approvedAt ? new Date(approvedAt).toLocaleString() : "Pending",
        done: isApproved,
      });
      steps.push({
        label: "Issue resolved",
        date: isResolved && resolvedAt ? new Date(resolvedAt).toLocaleString() : "Pending",
        done: isResolved,
      });
    }

    return steps;
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !active) return;
    setSubmittingComment(true);
    try {
      await api.addComment(active._id, commentText.trim());
      toast.success("Comment added!");
      setCommentText("");
      if (refreshData) refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ticket Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Follow your complaints through every stage.
        </p>
      </div>

      <div className="grid lg:grid-cols-[340px,1fr] gap-4">
        {/* Ticket list */}
        <div className="bg-card rounded-2xl border border-border p-2 shadow-sm h-fit lg:max-h-[70vh] lg:overflow-y-auto">
          {complaints.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No complaints found.</div>
          ) : complaints.map((c) => {
            const isActive = c._id === active?._id;
            return (
              <button
                key={c._id}
                onClick={() => {
                  setActiveId(c._id);
                  onSelect(c._id);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors",
                  isActive
                    ? "bg-primary-soft border border-primary/30"
                    : "hover:bg-secondary border border-transparent",
                )}
              >
                <CategoryIcon category={c.category} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                      {c._id.substring(0, 8)}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p
                    className={cn(
                      "text-sm font-semibold line-clamp-1",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {c.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        {active && (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">
            <div className="bg-gradient-hero px-5 sm:px-6 py-5 border-b border-border">
              <div className="flex items-start gap-4">
                <CategoryIcon category={active.category} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-mono font-semibold text-muted-foreground">
                      {active._id}
                    </span>
                    <StatusBadge status={active.status} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">{active.title}</h2>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {active.isAnonymous ? "🔒 Anonymous submission" : `👤 ${active.studentId?.name || "Unknown"}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {categoryMeta[active.category]?.label || active.category}
                  </p>
                </div>
                <VoteButtons complaint={active} onVote={onVote} />
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-sm text-foreground leading-relaxed">{active.description}</p>
                {active.image && (
                  <div className="mt-4">
                    <img src={active.image.startsWith('http') ? active.image : `${import.meta.env.VITE_API_URL || '/api'}${active.image.startsWith('/') ? '' : '/'}${active.image}`} alt="Complaint" className="rounded-xl max-h-64 object-cover border border-border" />
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Timeline
                </h3>
                <ol className="relative">
                  {getTimeline(active).map((step: any, idx: number, arr: any[]) => {
                    const isLast = idx === arr.length - 1;
                    const isRejected = step.rejected;
                    return (
                      <li key={idx} className="flex gap-4 pb-6 last:pb-0 relative">
                        {!isLast && (
                          <span
                            className={cn(
                              "absolute left-[15px] top-8 bottom-0 w-0.5",
                              step.done ? "bg-success" : "bg-border",
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10",
                            isRejected
                              ? "bg-destructive text-destructive-foreground"
                              : step.done
                                ? "bg-success text-success-foreground shadow-sm"
                                : "bg-muted text-muted-foreground border-2 border-dashed border-border",
                          )}
                        >
                          {step.done ? (
                            isRejected ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" strokeWidth={3} />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isRejected
                                ? "text-destructive"
                                : step.done
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                            )}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Comments section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Comments ({active.comments?.length || 0})
                </h3>
                {active.comments && active.comments.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {active.comments.map((comment, idx) => (
                      <div key={comment._id || idx} className="rounded-xl border border-border bg-secondary/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {comment.authorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{comment.role} · {new Date(comment.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pl-9">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">No comments yet.</p>
                )}

                {/* Comment form for admins/wardens */}
                {isAdminOrWarden && (
                  <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Add a comment</p>
                    </div>
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write an update or remark for this complaint..."
                      rows={3}
                      className="rounded-xl resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={!commentText.trim() || submittingComment}
                        onClick={handleAddComment}
                        className="rounded-xl font-semibold"
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        {submittingComment ? "Posting..." : "Post comment"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Info box for students */}
                {!isAdminOrWarden && (
                  <div className="rounded-xl border border-border bg-secondary/40 p-4 flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Waiting for updates?
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        The warden will post official comments and updates here as your complaint is processed.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
