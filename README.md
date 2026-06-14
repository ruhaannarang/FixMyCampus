# 🏫 FixMyCampus

FixMyCampus is a comprehensive, full-stack campus management platform designed to streamline the process of submitting, tracking, and resolving campus-related issues. By bridging the gap between students and campus administration, FixMyCampus fosters a more responsive, transparent, and efficient educational environment.

## ✨ Key Features

### 🔐 Role-Based Access Control
Secure, tailored experiences for different user roles:
- **Students**: Submit complaints, apply for leaves/permissions, track request statuses, and engage with community issues.
- **Teachers & Wardens**: Dedicated dashboards to review, approve, or reject student applications efficiently.
- **Administrators**: Centralized dashboard to oversee campus complaints, update statuses, and add official remarks to drive resolution.

### 📢 Complaint Management System
- **Rich Submissions**: Students can submit detailed complaints with image attachments (powered by Cloudinary).
- **Community Engagement**: A public feed where students can view, upvote, and track common campus issues anonymously.
- **Real-Time Tracking**: Transparent timelines showing the progress of a complaint from 'Pending' to 'Resolved'.
- **Official Remarks**: Admins can communicate directly on the complaint thread to provide updates.

### 📝 Digital Application System
- **Paperless Workflow**: Students can seamlessly submit applications (e.g., leave requests, event permissions) to specific teachers or wardens.
- **Instant Actions**: Approvers can quickly review and update the application status, keeping the student informed.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite for lightning-fast development.
- **Language**: TypeScript for robust, type-safe code.
- **Styling**: Tailwind CSS combined with Shadcn UI (Radix UI) for a beautiful, responsive, and accessible user interface.
- **State Management & Routing**: React Query for efficient data fetching and React Router DOM for navigation.
- **Forms**: React Hook Form combined with Zod for strict schema validation.
- **Data Visualization**: Recharts for interactive administrative charts.

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js for building scalable RESTful APIs.
- **Database**: MongoDB (with Mongoose ORM) for flexible data storage.
- **Authentication**: JWT (JSON Web Tokens) and bcryptjs for secure password hashing.
- **File Storage**: Cloudinary integration via Multer for seamless image uploads.

## 🌍 Sustainable Development Goals (SDGs) Alignment

FixMyCampus proudly contributes to the United Nations SDGs:

- **📘 SDG 4 - Quality Education**: By providing a platform to swiftly address infrastructural and administrative issues, FixMyCampus ensures that students and educators can focus on what truly matters: learning. A well-maintained and responsive campus directly correlates to improved educational outcomes and a safer, more inclusive learning environment.
- **🏗️ SDG 9 - Industry, Innovation and Infrastructure**: FixMyCampus drives digital innovation in institutional management. It upgrades traditional, paper-based administrative workflows into a resilient, scalable digital infrastructure, promoting sustainable institutional growth and efficient resource allocation.