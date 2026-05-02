export type Role = "student" | "warden" | "faculty" | "admin" | "teacher";

export type ComplaintStatus = "pending" | "approved" | "resolved" | "rejected";

export type ComplaintCategory = "hostel" | "college";

export type ApplicationTemplate = "leave" | "permission" | "event" | "medical" | "other";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface Student {
  _id: string;
  name: string;
  usn: string;
  branch?: string;
  year?: number;
  hostelBlock?: string;
  roomNumber?: string;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  department: string;
  subject: string;
}

export interface Comment {
  _id?: string;
  text: string;
  authorName: string;
  role: string;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  image?: string;
  status: ComplaintStatus;
  createdAt: string;
  studentId: Student | null;
  isAnonymous: boolean;
  upvotes: string[];
  approvedAt?: string;
  rejectedAt?: string;
  resolvedAt?: string;
  comments: Comment[];
}

export interface Application {
  _id: string;
  studentId: Student | null;
  teacherId: Teacher | null;
  templateType: ApplicationTemplate;
  subject: string;
  description: string;
  status: ApplicationStatus;
  teacherRemarks: string;
  respondedAt?: string;
  createdAt: string;
}
