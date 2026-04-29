export type Role = "student" | "warden" | "admin";

export type ComplaintStatus = "pending" | "approved" | "resolved" | "rejected";

export type ComplaintCategory =
  | "water"
  | "electricity"
  | "food"
  | "internet"
  | "cleaning"
  | "maintenance"
  | "security";

export type Priority = "low" | "medium" | "high";

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  priority: Priority;
  createdAt: string;
  student: string;
  room: string;
  hostel: string;
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  timeline: { label: string; date: string; done: boolean }[];
}
