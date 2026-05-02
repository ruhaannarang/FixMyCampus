import { useState, useEffect } from "react";
import { Complaint, Role, Application } from "@/types/fixmycampus";
import { LoginPage } from "@/components/fixmycampus/LoginPage";
import { AppShell, View } from "@/components/fixmycampus/AppShell";
import { StudentDashboard } from "@/components/fixmycampus/StudentDashboard";
import { SubmitComplaint } from "@/components/fixmycampus/SubmitComplaint";
import { WardenDashboard } from "@/components/fixmycampus/WardenDashboard";
import { AdminDashboard } from "@/components/fixmycampus/AdminDashboard";
import { TrackingPage } from "@/components/fixmycampus/TrackingPage";
import { TeacherDashboard } from "@/components/fixmycampus/TeacherDashboard";
import { SendApplication } from "@/components/fixmycampus/SendApplication";
import { MyApplications } from "@/components/fixmycampus/MyApplications";
import { CommunityComplaints } from "@/components/fixmycampus/CommunityComplaints";
import { toast } from "sonner";
import { api } from "@/lib/api";

const defaultViewByRole: Record<Role, View> = {
  student: "student-dashboard",
  warden: "warden-dashboard",
  faculty: "admin-dashboard",
  admin: "admin-dashboard",
  teacher: "teacher-dashboard",
};

const Index = () => {
  const [role, setRole] = useState<Role | null>(() => {
    return localStorage.getItem("role") as Role | null;
  });
  const [view, setView] = useState<View>(role ? defaultViewByRole[role] : "student-dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [teacherApplications, setTeacherApplications] = useState<Application[]>([]);

  const fetchComplaints = async () => {
    if (!role || role === "teacher") return;
    setLoading(true);
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherInbox = async () => {
    if (role !== "teacher") return;
    try {
      const data = await api.getTeacherInbox();
      setTeacherApplications(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load applications");
    }
  };

  useEffect(() => {
    if (role) {
      if (role === "teacher") {
        fetchTeacherInbox();
      } else {
        fetchComplaints();
      }
    }
  }, [role]);

  const handleVote = async (id: string, vote: "up" | "down") => {
    try {
      if (vote === "down") {
        toast.error("Downvoting is not supported by backend yet.");
        return;
      }
      
      const res = await api.toggleUpvote(id);
      
      setComplaints((prev) =>
        prev.map((c) => {
          if (c._id !== id) return c;
          return { ...c, upvotes: res.upvotes };
        }),
      );
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || "Failed to upvote");
    }
  };
  
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const updated = await api.updateStatus(id, status);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...updated } : c)),
      );
      toast.success(`Complaint marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setRole(null);
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
      onLogout={handleLogout}
    >
      {view === "student-dashboard" && (
        <StudentDashboard
          complaints={complaints}
          onNavigate={setView}
          onSelect={setSelectedId}
          onVote={handleVote}
          loading={loading}
        />
      )}
      {view === "submit" && (
        <SubmitComplaint
          complaints={complaints}
          onNavigate={setView}
          onVote={handleVote}
          onSelect={setSelectedId}
          refreshData={fetchComplaints}
        />
      )}
      {view === "warden-dashboard" && (
        <WardenDashboard
          complaints={complaints}
          onSelect={setSelectedId}
          onNavigate={setView}
          onVote={handleVote}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
      {view === "admin-dashboard" && <AdminDashboard complaints={complaints} />}
      {view === "tracking" && (
        <TrackingPage
          complaints={complaints}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onVote={handleVote}
          refreshData={fetchComplaints}
        />
      )}
      {view === "teacher-dashboard" && (
        <TeacherDashboard
          applications={teacherApplications}
          onRefresh={fetchTeacherInbox}
        />
      )}
      {view === "send-application" && (
        <SendApplication onNavigate={setView} />
      )}
      {view === "my-applications" && (
        <MyApplications onNavigate={setView} />
      )}
      {view === "community-complaints" && (
        <CommunityComplaints onVote={handleVote} />
      )}
    </AppShell>
  );
};

export default Index;
