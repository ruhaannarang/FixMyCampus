import { ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/fixmycampus";

interface Props {
  complaint: Pick<Complaint, "_id" | "upvotes">;
  onVote: (id: string, vote: "up" | "down") => void;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md";
}

export const VoteButtons = ({
  complaint,
  onVote,
  orientation = "vertical",
  size = "md",
}: Props) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const upvotesCount = complaint.upvotes?.length || 0;
  const isUp = complaint.upvotes?.includes(user._id);

  const handle = (e: React.MouseEvent, vote: "up" | "down") => {
    e.stopPropagation();
    onVote(complaint._id, vote);
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <div
      className={cn(
        "flex items-center bg-secondary/60 rounded-full p-0.5 border border-border shrink-0",
        orientation === "vertical" ? "flex-col py-1" : "flex-row gap-0.5 px-1",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => handle(e, "up")}
        aria-label="Upvote"
        aria-pressed={isUp}
        className={cn(
          "rounded-full flex items-center justify-center transition-all",
          btnSize,
          isUp
            ? "bg-success text-success-foreground shadow-sm scale-105"
            : "text-muted-foreground hover:text-success hover:bg-success-soft",
        )}
      >
        <ArrowBigUp className={cn(iconSize, isUp && "fill-current")} strokeWidth={2} />
      </button>
      <span
        className={cn(
          "font-bold tabular-nums text-center min-w-[1.5rem]",
          size === "sm" ? "text-xs" : "text-sm",
          isUp ? "text-success" : "text-foreground",
          orientation === "horizontal" && "px-1",
          orientation === "vertical" && "py-0.5"
        )}
      >
        {upvotesCount}
      </span>
    </div>
  );
};
