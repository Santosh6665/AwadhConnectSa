# AwadhConnect

AwadhConnect is a modern, comprehensive school management platform built with Next.js, Firebase, and Genkit AI. It provides a centralized hub for communication and management for administrators, teachers, students, and parents.

## Key Features

- **Homepage:** A public-facing page with a hero slider, notices, events, admissions info, and leadership messages.
- **Role-Based Dashboards:** Secure, feature-rich dashboards for Admin, Teacher, Parent, and Student roles.
- **Firebase Firestore Integration:** Real-time data management for all school-related information.
- **AI-Powered Event Suggestions:** An intelligent tool for administrators to generate engaging school events.
- **Real-time Notices:** Display of school-wide or audience-specific notices.
- **Comprehensive Management:** Modules for students, teachers, fees, attendance, results, and more.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS with shadcn/ui
- **Database:** Firebase Firestore
- **AI:** Google's Genkit
- **Deployment:** Firebase App Hosting

## Page Structure

- `/`: Public homepage.
- `/login`: Login page to access dashboards.
- `/dashboard/admin`: Dashboard for administrators.
- `/dashboard/teacher`: Dashboard for teachers.
- `/dashboard/parent`: Dashboard for parents.
- `/dashboard/student`: Dashboard for students.
- Management pages (e.g., student management, fee management) will be nested under the `/dashboard/admin` route.

## Firestore Collections & Data Structure

Below is the schema for the Firestore database.

### `students`
- **Description:** Stores individual student records.
- **Fields:**
    - `rollNo`: (string) Unique roll number.
    - `firstName`: (string)
    - `lastName`: (string)
    - `dob`: (Timestamp) Date of birth.
    - `gender`: (string) e.g., 'Male', 'Female'.
    - `admissionNumber`: (string) Unique admission number.
    - `classId`: (string) Reference to `classes` collection.
    - `sectionId`: (string) Reference to `sections` collection.
    - `parentId`: (string) Reference to `parents` collection.
- **Subcollections:**
    - `attendance`: Records student's daily attendance.
        - `date`: (Timestamp)
        - `status`: (string) 'Present' or 'Absent'.
    - `results`: Stores exam results for the student.
        - `examType`: (string) 'Quarterly', 'Half-Yearly', 'Annual'.
        - `subjectId`: (string) Reference to `subjects`.
        - `marksObtained`: (number)
        - `totalMarks`: (number)

### `parents`
- **Description:** Stores parent/guardian information.
- **Fields:**
    - `parentId`: (string) Unique ID.
    - `name`: (string)
    - `email`: (string)
    - `phone`: (string)
    - `children`: (array of strings) List of `studentId`s.

### `teachers`
- **Description:** Stores teacher profiles and information.
- **Fields:**
    - `teacherId`: (string) Unique ID.
    - `name`: (string)
    - `email`: (string)
    - `phone`: (string)
    - `subjects`: (array of strings) List of `subjectId`s they teach.
- **Subcollections:**
    - `attendance`: Records teacher's daily attendance.
        - `date`: (Timestamp)
        - `status`: (string) 'Present' or 'Absent'.

### `classes`
- **Description:** Defines the classes available in the school.
- **Fields:**
    - `classId`: (string) e.g., 'class-10'.
    - `name`: (string) e.g., 'Class 10'.

### `sections`
- **Description:** Defines sections within each class.
- **Fields:**
    - `sectionId`: (string) e.g., '10-A'.
    - `name`: (string) e.g., 'A'.
    - `classId`: (string) Reference to `classes`.

### `subjects`
- **Description:** Lists all subjects taught.
- **Fields:**
    - `subjectId`: (string) e.g., 'math-10'.
    - `name`: (string) e.g., 'Mathematics'.
    - `classId`: (string) Reference to `classes`.
    - `teacherId`: (string) Reference to `teachers`.

### `fees`
- **Description:** Manages fee records for students.
- **Fields:**
    - `studentId`: (string) Reference to `students`.
    - `session`: (string) e.g., '2025-26'.
    - `totalFee`: (number)
    - `paidFee`: (number)
    - `dueFee`: (number)
- **Subcollections:**
    - `receipts`: Stores individual payment receipts.
        - `receiptId`: (string)
        - `amount`: (number)
        - `date`: (Timestamp)

### `notices`
- **Description:** School-wide or targeted announcements.
- **Fields:**
    - `noticeId`: (string) Unique ID.
    - `title`: (string)
    - `description`: (string)
    - `targetAudience`: (string) 'all', 'teacher', 'student', 'parent'.
    - `date`: (Timestamp)

### `events`
- **Description:** School events calendar.
- **Fields:**
    - `eventId`: (string) Unique ID.
    - `title`: (string)
    - `description`: (string)
    - `startDate`: (Timestamp)
    - `endDate`: (Timestamp)
    - `targetAudience`: (string) 'all', 'teacher', 'student', 'parent'.

### `studyMaterials`
- **Description:** Educational materials uploaded by teachers.
- **Fields:**
    - `materialId`: (string) Unique ID.
    - `title`: (string)
    - `fileUrl`: (string) URL to the stored file.
    - `classId`: (string)
    - `sectionId`: (string)
    - `uploadedBy`: (string) `teacherId`.
    - `date`: (Timestamp)
