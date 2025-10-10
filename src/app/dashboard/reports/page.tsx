
import { getStudents, getTeachers, getAllAttendance } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnrollmentReport from '@/components/dashboard/reports/enrollment-report';
import FeeCollectionReport from '@/components/dashboard/reports/fee-collection-report';
import TeacherRosterReport from '@/components/dashboard/reports/teacher-roster-report';
import AttendanceSummaryReport from '@/components/dashboard/reports/attendance-summary-report';
import { getFeeStructure } from '@/lib/firebase/firestore';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [students, teachers, allAttendance, feeStructure] = await Promise.all([
    getStudents({ status: 'Active' }),
    getTeachers({ status: 'Active' }),
    getAllAttendance(),
    getFeeStructure(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">School Reports</h1>
        <p className="text-muted-foreground">
          An overview of key school metrics and data.
        </p>
      </div>
      <Tabs defaultValue="enrollment">
        <TabsList className="mb-4">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="fees">Fee Collection</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Roster</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment Report</CardTitle>
              <CardDescription>A breakdown of active students by class and section.</CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollmentReport students={students} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
            <FeeCollectionReport students={students} feeStructure={feeStructure} />
        </TabsContent>

        <TabsContent value="attendance">
             <AttendanceSummaryReport students={students} allAttendance={allAttendance} />
        </TabsContent>

        <TabsContent value="teachers">
           <Card>
            <CardHeader>
              <CardTitle>Teacher Roster</CardTitle>
              <CardDescription>A list of all active teachers and their contact details.</CardDescription>
            </CardHeader>
            <CardContent>
              <TeacherRosterReport teachers={teachers} />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
