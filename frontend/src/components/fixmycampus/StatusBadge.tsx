import { ComplaintStatus, Priority } from "@/types/fixmycampus";
import { CheckCircle2, Clock, ThumbsUp, XCircle } from "lucide-react";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning-soft text-warning border-warning/20",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-info-soft text-info border-info/20",
    icon: ThumbsUp,
  },
  resolved: {
    label: "Resolved",
    className: "bg-success-soft text-success border-success/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive-soft text-destructive border-destructive/20",
    icon: XCircle,
  },
};

export const StatusBadge = ({ status }: { status: ComplaintStatus }) => {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
};

const priorityConfig: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info-soft text-info",
  high: "bg-destructive-soft text-destructive",
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${priorityConfig[priority]}`}
  >
    {priority}
  </span>
);
