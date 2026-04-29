import { useState } from "react";
import { Complaint, Role } from "@/types/fixmycampus";
import { mockComplaints } from "@/data/mockComplaints";
import { LoginPage } from "@/components/fixmycampus/LoginPage";
import { AppShell, View } from "@/components/fixmycampus/AppShell";
import { StudentDashboard } from "@/components/fixmycampus/StudentDashboard";
import { SubmitComplaint } from "@/components/fixmycampus/SubmitComplaint";
import { WardenDashboard } from "@/components/fixmycampus/WardenDashboard";
import { AdminDashboard } from "@/components/fixmycampus/AdminDashboard";
import { TrackingPage } from "@/components/fixmycampus/TrackingPage";
import { toast } from "sonner";

const defaultViewByRole: Record<Role, View> = {
  student: "student-dashboard",
  warden: "warden-dashboard",
  admin: "admin-dashboard",
};

const Index = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<View>("student-dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);

  const handleVote = (id: string, vote: "up" | "down") => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const current = c.userVote ?? null;
        let upvotes = c.upvotes;
        let downvotes = c.downvotes;
        let next: "up" | "down" | null = vote;

        // remove previous
        if (current === "up") upvotes -= 1;
        if (current === "down") downvotes -= 1;

        if (current === vote) {
          // toggle off
          next = null;
        } else {
          if (vote === "up") upvotes += 1;
          else downvotes += 1;
        }

        return { ...c, upvotes, downvotes, userVote: next };
      }),
    );
    const target = complaints.find((c) => c.id === id);
    if (target) {
      const wasSame = target.userVote === vote;
      if (wasSame) {
        toast(`Vote removed on ${id}`);
      } else {
        toast.success(
          vote === "up" ? `Upvoted ${id} — thanks for confirming!` : `Downvoted ${id}`,
        );
      }
    }
  };

  if (!role) {
    return (
      <LoginPage
        onLogin={(r) => {
          setRole(r);
          setView(defaultViewByRole[r]);
        }}
      />
    );
  }

  return (
    <AppShell
      role={role}
      view={view}
      onNavigate={setView}
      onLogout={() => setRole(null)}
    >
      {view === "student-dashboard" && (
        <StudentDashboard
          complaints={complaints}
          onNavigate={setView}
          onSelect={setSelectedId}
          onVote={handleVote}
        />
      )}
      {view === "submit" && (
        <SubmitComplaint
          complaints={complaints}
          onNavigate={setView}
          onVote={handleVote}
          onSelect={setSelectedId}
        />
      )}
      {view === "warden-dashboard" && (
        <WardenDashboard
          complaints={complaints}
          onSelect={setSelectedId}
          onNavigate={setView}
          onVote={handleVote}
        />
      )}
      {view === "admin-dashboard" && <AdminDashboard complaints={complaints} />}
      {view === "tracking" && (
        <TrackingPage
          complaints={complaints}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onVote={handleVote}
        />
      )}
    </AppShell>
  );
};

export default Index;
