import { useState } from "react";
import { Role } from "@/types/fixmycampus";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ShieldCheck, UserCog, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (role: Role) => void;
}

const roles: { id: Role; label: string; sub: string; icon: typeof GraduationCap }[] = [
  { id: "student", label: "Student", sub: "Submit & track complaints", icon: GraduationCap },
  { id: "teacher", label: "Teacher", sub: "Review applications", icon: BookOpen },
  { id: "warden", label: "Warden", sub: "Review & approve issues", icon: ShieldCheck },
  { id: "admin", label: "Admin", sub: "Monitor the campus", icon: UserCog },
];

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [emailUsn, setEmailUsn] = useState(""); // used for USN (student) or Email (admin/warden)
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [hostelBlock, setHostelBlock] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const data = role === "student" 
          ? { usn: emailUsn, password }
          : { email: emailUsn, password };
        const res = await api.login(role, data);
        localStorage.setItem("token", res.token);
        if (role === "teacher") {
          localStorage.setItem("user", JSON.stringify(res.teacher));
          localStorage.setItem("role", "teacher");
        } else {
          localStorage.setItem("user", JSON.stringify(res[role === 'student' ? 'student' : 'admin']));
          localStorage.setItem("role", res.admin?.role || role);
        }
        toast.success("Welcome back!");
        onLogin(role === "teacher" ? "teacher" : (res.admin?.role || role));
      } else {
        let res;
        if (role === "student") {
          res = await api.signup(role, {
            name,
            usn: emailUsn,
            password,
            branch,
            year: parseInt(year),
            hostelBlock,
            roomNumber,
          });
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.student));
          localStorage.setItem("role", "student");
          toast.success("Account created successfully!");
          onLogin("student");
        } else if (role === "teacher") {
          res = await api.signup(role, {
            name,
            email: emailUsn,
            password,
            department,
            subject: teacherSubject,
          });
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.teacher));
          localStorage.setItem("role", "teacher");
          toast.success("Account created successfully!");
          onLogin("teacher");
        } else {
          // Both admin and warden use the admin schema
          res = await api.signup(role, {
            name,
            email: emailUsn,
            password,
            role: role === "warden" ? "warden" : "faculty",
            department,
            hostelAssigned: hostelBlock,
          });
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.admin));
          localStorage.setItem("role", res.admin.role);
          toast.success("Account created successfully!");
          onLogin(res.admin.role);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-hero flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center my-auto">
        {/* Left: brand */}
        <div className="hidden lg:flex flex-col gap-6 pr-8">
          <Logo size="lg" />
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight text-foreground">
            One tap to{" "}
            <span className="bg-gradient-primary bg-clip-text ">fix anything</span>{" "}
            on campus.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Report hostel issues, track resolution, and keep your campus running smoothly — all in
            one calm, modern dashboard.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex -space-x-2">
              {["AM", "RS", "KP"].map((i, idx) => (
                <div
                  key={i}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold text-primary-foreground",
                    idx === 0 && "bg-primary",
                    idx === 1 && "bg-success",
                    idx === 2 && "bg-warning",
                  )}
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,400+ students</span> already
              reporting smarter
            </p>
          </div>
        </div>

        {/* Right: card */}
        <div className="bg-card rounded-2xl shadow-elevated border border-border p-6 sm:p-8 animate-scale-in">
          <div className="lg:hidden mb-6">
            <Logo />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {mode === "login" ? "Welcome back" : "Get started"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {mode === "login" ? "Sign in to FixMyCampus" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose your role to continue.
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  type="button"
                  className={cn(
                    "flex flex-col items-center text-center gap-2 p-3 rounded-xl border-2 transition-all",
                    active
                      ? "border-primary bg-primary-soft shadow-soft"
                      : "border-border hover:border-primary/40 bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", active ? "text-primary" : "text-foreground")}>
                      {r.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">
                      {r.sub}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Mehta" required className="h-11 rounded-xl" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="emailUsn">{role === 'student' ? 'USN' : 'Campus Email'}</Label>
              <Input
                id="emailUsn"
                type={role === 'student' ? 'text' : 'email'}
                placeholder={role === 'student' ? '1RV20CS001' : 'you@campus.edu'}
                value={emailUsn}
                onChange={(e) => setEmailUsn(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            {mode === "signup" && role === "student" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="branch">Branch</Label>
                    <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="CSE" required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" type="number" min="1" max="5" value={year} onChange={(e) => setYear(e.target.value)} placeholder="3" required className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="hostelBlock">Hostel Block</Label>
                    <Input id="hostelBlock" value={hostelBlock} onChange={(e) => setHostelBlock(e.target.value)} placeholder="B-Block" required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="204" required className="h-11 rounded-xl" />
                  </div>
                </div>
              </>
            )}
            {mode === "signup" && role !== "student" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Computer Science" required className="h-11 rounded-xl" />
                </div>
                {role === "teacher" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="teacherSubject">Subject</Label>
                    <Input id="teacherSubject" value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} placeholder="Data Structures & Algorithms" required className="h-11 rounded-xl" />
                  </div>
                )}
                {role === "warden" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="hostelAssigned">Assigned Hostel</Label>
                    <Input id="hostelAssigned" value={hostelBlock} onChange={(e) => setHostelBlock(e.target.value)} placeholder="B-Block" required className="h-11 rounded-xl" />
                  </div>
                )}
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl text-sm font-semibold shadow-glow">
              {loading ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4 ml-1.5" />}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New to FixMyCampus?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
