import { Wrench } from "lucide-react";

export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dim} rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow`}>
        <Wrench className="h-1/2 w-1/2 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${text} font-bold tracking-tight text-foreground`}>FixMyCampus</span>
        {size !== "sm" && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
            Smart Campus Hub
          </span>
        )}
      </div>
    </div>
  );
};
