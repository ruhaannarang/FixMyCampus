import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Complaint, ComplaintCategory, Priority } from "@/types/fixmycampus";
import { categoryMeta, CategoryIcon } from "./CategoryIcon";
import { StatusBadge } from "./StatusBadge";
import { VoteButtons } from "./VoteButtons";
import { toast } from "sonner";
import { ImagePlus, ArrowLeft, Send, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { View } from "./AppShell";

interface SubmitProps {
  onNavigate: (v: View) => void;
  complaints: Complaint[];
  onVote: (id: string, vote: "up" | "down") => void;
  onSelect: (id: string) => void;
}

export const SubmitComplaint = ({ onNavigate, complaints, onVote, onSelect }: SubmitProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("water");
  const [priority, setPriority] = useState<Priority>("medium");
  const [image, setImage] = useState<string | null>(null);

  const similar = useMemo(() => {
    const q = title.trim().toLowerCase();
    const candidates = complaints.filter(
      (c) => c.category === category && c.status !== "rejected" && c.status !== "resolved",
    );
    if (q.length < 3) return candidates.slice(0, 2);
    const tokens = q.split(/\s+/).filter((t) => t.length > 2);
    return candidates
      .map((c) => {
        const hay = `${c.title} ${c.description}`.toLowerCase();
        const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
        return { c, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.c);
  }, [title, category, complaints]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Complaint submitted!", {
      description: "We've assigned ID FMC-2042. Track its status anytime.",
    });
    onNavigate("student-dashboard");
  };

  const priorities: { id: Priority; label: string; color: string }[] = [
    { id: "low", label: "Low", color: "border-muted-foreground/30 data-[active=true]:bg-muted data-[active=true]:text-foreground" },
    { id: "medium", label: "Medium", color: "border-info/30 data-[active=true]:bg-info-soft data-[active=true]:text-info data-[active=true]:border-info" },
    { id: "high", label: "High", color: "border-destructive/30 data-[active=true]:bg-destructive-soft data-[active=true]:text-destructive data-[active=true]:border-destructive" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => onNavigate("student-dashboard")}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </button>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="bg-gradient-hero px-6 py-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">File a new complaint</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us what's wrong. Be clear — it helps us fix it faster.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Geyser not working in B-block bathroom"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Similar complaints — upvote instead of duplicating */}
          {similar.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning-soft/40 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-lg bg-warning text-warning-foreground flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Looks similar to existing complaints
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upvote one of these instead — it boosts priority and avoids duplicates.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {similar.map((c) => (
                  <div
                    key={c.id}
                    className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
                  >
                    <VoteButtons complaint={c} onVote={onVote} size="sm" />
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(c.id);
                        onNavigate("tracking");
                      }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                          {c.id}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {c.description}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(categoryMeta) as ComplaintCategory[]).map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <CategoryIcon category={cat} size="sm" />
                    <span
                      className={cn(
                        "text-sm font-semibold capitalize",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {categoryMeta[cat].label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-active={priority === p.id}
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all bg-card text-foreground",
                    p.color,
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              required
              rows={5}
              placeholder="Describe the issue, when it started, and any safety concerns..."
              className="rounded-xl resize-none"
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Attach photo (optional)</Label>
            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={image} alt="Upload preview" className="w-full max-h-64 object-cover" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-background"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary hover:bg-primary-soft/40 transition-colors">
                <div className="h-12 w-12 rounded-full bg-primary-soft text-primary flex items-center justify-center">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">Tap to upload a photo</p>
                <p className="text-xs text-muted-foreground">PNG or JPG up to 5MB</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onNavigate("student-dashboard")}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl shadow-glow font-semibold">
              <Send className="h-4 w-4 mr-1.5" />
              Submit complaint
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
