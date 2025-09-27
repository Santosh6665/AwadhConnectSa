import { getTeachers } from '@/lib/firebase/firestore';
import TeacherList from '@/components/dashboard/admin/teachers/teacher-list';

export default async function TeacherManagementPage() {
  const teachers = await getTeachers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Teacher Management</h1>
        <p className="text-muted-foreground">
          View, add, and manage teacher profiles.
        </p>
      </div>
      <TeacherList teachers={teachers} />
    </div>
  );
}
