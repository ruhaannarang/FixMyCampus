export type Role = "student" | "warden" | "faculty" | "admin";

export type ComplaintStatus = "pending" | "approved" | "resolved" | "rejected";

export type ComplaintCategory = "hostel" | "college";

export interface Student {
  _id: string;
  name: string;
  usn: string;
  branch?: string;
  year?: number;
  hostelBlock?: string;
  roomNumber?: string;
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
