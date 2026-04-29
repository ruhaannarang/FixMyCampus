import { useState } from "react";
import { Complaint } from "@/types/fixmycampus";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { CategoryIcon, categoryMeta } from "./CategoryIcon";
import { VoteButtons } from "./VoteButtons";
import { Check, Circle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  complaints: Complaint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onVote: (id: string, vote: "up" | "down") => void;
}

export const TrackingPage = ({ complaints, selectedId, onSelect, onVote }: Props) => {
  const [activeId, setActiveId] = useState(selectedId ?? complaints[0]?.id);
  const active = complaints.find((c) => c.id === activeId) ?? complaints[0];

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
          {complaints.map((c) => {
            const isActive = c.id === active?.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveId(c.id);
                  onSelect(c.id);
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
                      {c.id}
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">{c.createdAt}</p>
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
                      {active.id}
                    </span>
                    <PriorityBadge priority={active.priority} />
                    <StatusBadge status={active.status} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">{active.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categoryMeta[active.category].label} · {active.hostel} · Room {active.room}
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
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Timeline
                </h3>
                <ol className="relative">
                  {active.timeline.map((step, idx) => {
                    const isLast = idx === active.timeline.length - 1;
                    const isRejected = step.label === "Rejected";
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
                            <Check className="h-4 w-4" strokeWidth={3} />
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

              <div className="rounded-xl border border-border bg-secondary/40 p-4 flex gap-3">
                <div className="h-9 w-9 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Need to add more info?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reply to this ticket or upload more photos to help the warden resolve it faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
