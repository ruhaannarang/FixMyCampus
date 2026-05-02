import { ReactNode } from "react";
import { Role } from "@/types/fixmycampus";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  GitBranch,
  Send,
  FileText,
  Globe,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type View =
  | "student-dashboard"
  | "submit"
  | "tracking"
  | "warden-dashboard"
  | "admin-dashboard"
  | "teacher-dashboard"
  | "send-application"
  | "my-applications"
  | "community-complaints";

interface AppShellProps {
  role: Role;
  view: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  children: ReactNode;
}

const navByRole: Record<Role, { id: View; label: string; icon: typeof LayoutDashboard }[]> = {
  student: [
    { id: "student-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "submit", label: "New Complaint", icon: PlusCircle },
    { id: "tracking", label: "Track Tickets", icon: GitBranch },
    { id: "send-application", label: "Applications", icon: Send },
    { id: "my-applications", label: "My Applications", icon: FileText },
    { id: "community-complaints", label: "Community Feed", icon: Globe },
  ],
  warden: [
    { id: "warden-dashboard", label: "Inbox", icon: ListChecks },
    { id: "tracking", label: "Track Tickets", icon: GitBranch },
  ],
  faculty: [
    { id: "admin-dashboard", label: "Overview", icon: BarChart3 },
    { id: "warden-dashboard", label: "Complaints", icon: ListChecks },
    { id: "tracking", label: "Tracking", icon: GitBranch },
  ],
  admin: [
    { id: "admin-dashboard", label: "Overview", icon: BarChart3 },
    { id: "warden-dashboard", label: "Complaints", icon: ListChecks },
    { id: "tracking", label: "Tracking", icon: GitBranch },
  ],
  teacher: [
    { id: "teacher-dashboard", label: "Application Inbox", icon: BookOpen },
  ],
};

export const AppShell = ({ role, view, onNavigate, onLogout, children }: AppShellProps) => {
  const nav = navByRole[role];
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  
  let sub = "";
  if (role === "student") {
    sub = user.hostelBlock ? `${user.hostelBlock} Hostel ${user.roomNumber ? '· Room ' + user.roomNumber : ''}` : "Student";
  } else if (role === "warden") {
    sub = user.hostelAssigned ? `Warden · ${user.hostelAssigned} Hostel` : "Warden";
  } else if (role === "teacher") {
    sub = user.department ? `${user.department} · ${user.subject || ""}` : "Teacher";
  } else {
    sub = user.department ? `${user.department} Department` : "Administrator";
  }

  const me = { name, sub, initials };

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {role === "student" ? "Student" : role === "warden" ? "Warden" : role === "teacher" ? "Teacher" : "Admin"}
          </p>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-sidebar-border space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive-soft transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent transition-colors">
            <div className="h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
              {me.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{me.name}</p>
              <p className="text-xs text-muted-foreground truncate">{me.sub}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={onLogout}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">
                Welcome back,{" "}
                <span className="font-semibold text-foreground">{me.name.split(" ")[0]}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <div className="lg:hidden h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {me.initials}
              </div>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="lg:hidden flex gap-1 px-3 pb-3 overflow-x-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </nav>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
