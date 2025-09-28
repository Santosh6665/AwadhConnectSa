
import { getStudents, getClasses, getSections } from '@/lib/firebase/firestore';
import StudentList from '@/components/dashboard/admin/students/student-list';

export default async function StudentManagementPage() {
  const [students, classes, sections] = await Promise.all([
    getStudents(),
    getClasses(),
    getSections(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Student Management</h1>
        <p className="text-muted-foreground">
          View, add, and manage student records for the entire school.
        </p>
      </div>
      <StudentList 
        initialStudents={students} 
        classes={classes} 
        sections={sections} 
        parents={[]} 
      />
    </div>
  );
}
