import { ComplaintCategory } from "@/types/fixmycampus";
import {
  Droplets,
  Zap,
  UtensilsCrossed,
  Wifi,
  Sparkles,
  Wrench,
  Shield,
  LucideIcon,
} from "lucide-react";

const map: Record<ComplaintCategory, { icon: LucideIcon; label: string; tint: string }> = {
  water: { icon: Droplets, label: "Water", tint: "bg-info-soft text-info" },
  electricity: { icon: Zap, label: "Electricity", tint: "bg-warning-soft text-warning" },
  food: { icon: UtensilsCrossed, label: "Mess / Food", tint: "bg-destructive-soft text-destructive" },
  internet: { icon: Wifi, label: "Internet", tint: "bg-accent text-accent-foreground" },
  cleaning: { icon: Sparkles, label: "Cleaning", tint: "bg-success-soft text-success" },
  maintenance: { icon: Wrench, label: "Maintenance", tint: "bg-primary-soft text-primary" },
  security: { icon: Shield, label: "Security", tint: "bg-muted text-foreground" },
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
  const Icon = cfg.icon;
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const inner = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className={`${dim} ${cfg.tint} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={inner} />
    </div>
  );
};
