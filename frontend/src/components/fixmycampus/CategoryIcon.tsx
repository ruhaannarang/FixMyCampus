import { ComplaintCategory } from "@/types/fixmycampus";
import {
  Building,
  GraduationCap,
  LucideIcon,
} from "lucide-react";

const map: Record<ComplaintCategory, { icon: LucideIcon; label: string; tint: string }> = {
  hostel: { icon: Building, label: "Hostel", tint: "bg-primary-soft text-primary" },
  college: { icon: GraduationCap, label: "College", tint: "bg-info-soft text-info" },
};

export const categoryMeta = map;

export const CategoryIcon = ({
  category,
  size = "md",
}: {
  category: ComplaintCategory;
  size?: "sm" | "md" | "lg";
}) => {
  const cfg = map[category];
  // Fallback icon if category isn't in map for some reason
  if (!cfg) {
    return <div className={`h-8 w-8 bg-muted text-muted-foreground rounded-xl flex items-center justify-center shrink-0`}>?</div>
  }
  const Icon = cfg.icon;
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const inner = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className={`${dim} ${cfg.tint} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={inner} />
    </div>
  );
};
