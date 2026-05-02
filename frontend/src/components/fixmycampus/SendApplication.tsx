import { useState, useEffect } from "react";
import { Teacher, ApplicationTemplate } from "@/types/fixmycampus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Send, Search, BookOpen, FileText, Calendar, Stethoscope, ShieldCheck, MoreHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { View } from "./AppShell";

const templates: { id: ApplicationTemplate; label: string; icon: typeof FileText; defaultSubject: string; color: string }[] = [
  { id: "leave", label: "Leave Application", icon: Calendar, defaultSubject: "Application for Leave of Absence", color: "bg-warning-soft text-warning" },
  { id: "permission", label: "Permission Request", icon: ShieldCheck, defaultSubject: "Request for Permission", color: "bg-info-soft text-info" },
  { id: "event", label: "Event Participation", icon: BookOpen, defaultSubject: "Permission for Event Participation", color: "bg-primary-soft text-primary" },
  { id: "medical", label: "Medical Leave", icon: Stethoscope, defaultSubject: "Application for Medical Leave", color: "bg-destructive-soft text-destructive" },
  { id: "other", label: "Other", icon: MoreHorizontal, defaultSubject: "", color: "bg-muted text-muted-foreground" },
];

interface Props {
  onNavigate: (v: View) => void;
}

export const SendApplication = ({ onNavigate }: Props) => {
  const [step, setStep] = useState(1);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await api.getTeachers();
        setTeachers(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load teachers");
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((t) => {
    const s = `${t.name} ${t.department} ${t.subject}`.toLowerCase();
    return !searchQuery || s.includes(searchQuery.toLowerCase());
  });

  const handleTemplateSelect = (tpl: ApplicationTemplate) => {
    setSelectedTemplate(tpl);
    const t = templates.find((x) => x.id === tpl);
    if (t && t.defaultSubject) setSubject(t.defaultSubject);
    else setSubject("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedTemplate) return;
    setSubmitting(true);
    try {
      await api.createApplication({
        teacherId: selectedTeacher._id,
        templateType: selectedTemplate,
        subject,
        description,
      });
      toast.success("Application sent successfully!", { description: `Sent to ${selectedTeacher.name}` });
      onNavigate("my-applications");
    } catch (err: any) {
      toast.error(err.message || "Failed to send application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => onNavigate("student-dashboard")} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />Back to dashboard
      </button>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="bg-gradient-hero px-6 py-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Send Application</h1>
          <p className="text-sm text-muted-foreground mt-1">Select a teacher, choose a template, and submit your application digitally.</p>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all", step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s}</div>
                {s < 3 && <div className={cn("w-8 h-0.5 rounded-full transition-all", step > s ? "bg-primary" : "bg-border")} />}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {step === 1 ? "Select Teacher" : step === 2 ? "Choose Template" : "Write Application"}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Select Teacher */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search teachers by name, department, or subject..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 rounded-xl pl-10" />
              </div>
              {loadingTeachers ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading teachers...</p>
              ) : filteredTeachers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No teachers found.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredTeachers.map((t) => (
                    <button key={t._id} type="button" onClick={() => { setSelectedTeacher(t); setStep(2); }}
                      className={cn("text-left p-4 rounded-xl border-2 transition-all hover:shadow-soft", selectedTeacher?._id === t._id ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40")}>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                          {t.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.department}</p>
                          <p className="text-xs text-primary font-medium mt-0.5">{t.subject}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Template */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-3 bg-secondary/30 flex items-center gap-3">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">To: {selectedTeacher?.name}</span>
                <span className="text-xs text-muted-foreground">({selectedTeacher?.department})</span>
                <button onClick={() => setStep(1)} className="text-xs text-primary font-semibold ml-auto hover:underline">Change</button>
              </div>
              <p className="text-sm font-semibold text-foreground">Choose application type</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {templates.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <button key={tpl.id} type="button" onClick={() => { handleTemplateSelect(tpl.id); setStep(3); }}
                      className={cn("text-left p-4 rounded-xl border-2 transition-all hover:shadow-soft flex items-center gap-3", selectedTemplate === tpl.id ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40")}>
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", tpl.color)}><Icon className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{tpl.label}</p>
                        <p className="text-[11px] text-muted-foreground">{tpl.defaultSubject || "Custom subject"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            </div>
          )}

          {/* Step 3: Write Application */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-border p-3 bg-secondary/30 flex items-center gap-3 flex-wrap">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">To: {selectedTeacher?.name}</span>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", templates.find((t) => t.id === selectedTemplate)?.color)}>
                  {templates.find((t) => t.id === selectedTemplate)?.label}
                </span>
                <button type="button" onClick={() => setStep(2)} className="text-xs text-primary font-semibold ml-auto hover:underline">Change</button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-subject">Subject</Label>
                <Input id="app-subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Application subject..." className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-desc">Description</Label>
                <Textarea id="app-desc" required value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Write your application here. Include dates, reasons, and any supporting details..." className="rounded-xl resize-none" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
                <Button type="submit" disabled={submitting} className="rounded-xl shadow-glow font-semibold"><Send className="h-4 w-4 mr-1.5" />{submitting ? "Sending..." : "Send Application"}</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
