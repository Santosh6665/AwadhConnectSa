
'use client';
import { useState, useMemo, useTransition } from 'react';
import type { Student, ExamType, AnnualResult, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Filter, Loader2, Edit, Trash, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { calculateOverallResult, getGrade } from '@/lib/utils';
import EditMarksDialog from './edit-marks-dialog';
import ResultCard from './result-card';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type StudentResultSummary = {
  student: Student;
  percentage: number;
  grade: string;
  rank: number;
};

const examTypes: ExamType[] = ['Quarterly', 'Half-Yearly', 'Annual'];
const classOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];


export default function StudentResultsList({ initialStudents, userRole, teacherClasses }: { initialStudents: Student[], userRole: UserRole, teacherClasses?: string[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamType>('Annual');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { toast } = useToast();

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };
  
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleSaveMarks = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.admissionNumber === updatedStudent.admissionNumber ? updatedStudent : s));
  };
  
  const studentSummaries = useMemo(() => {
    let filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower);

      const matchesClass = selectedClass === 'all' || student.className === selectedClass;
      const matchesSection = selectedSection === 'all' || student.sectionName === selectedSection;

      return matchesSearch && matchesClass && matchesSection;
    });

    const summaries = filtered.map(student => {
        const annualResult = student.results?.[student.session] || { examResults: {} };
        const { percentage, grade } = calculateOverallResult(annualResult);
        return { student, percentage, grade, rank: 0 };
    });

    summaries.sort((a, b) => b.percentage - a.percentage);
    summaries.forEach((summary, index) => {
        summary.rank = index + 1;
    });

    return summaries;
  }, [students, searchTerm, selectedClass, selectedSection]);


  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Filter & View Results</CardTitle>
            <CardDescription>Select filters to narrow down the student list and manage results.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <Input
                    placeholder="Search by name or roll no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <Select onValueChange={(val) => setSelectedExam(val as ExamType)} value={selectedExam}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>{examTypes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
                 <Select onValueChange={setSelectedClass} value={selectedClass}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="All Classes" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classOptions.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                    </SelectContent>
                 </Select>
                 <Select onValueChange={setSelectedSection} value={selectedSection} disabled={selectedClass === 'all'}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="All Sections" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studentSummaries.map(({ student, percentage, grade, rank }) => (
                    <TableRow key={student.admissionNumber}>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                        <TableCell>{student.className}-{student.sectionName}</TableCell>
                        <TableCell>{percentage.toFixed(2)}%</TableCell>
                        <TableCell>{grade}</TableCell>
                        <TableCell>{rank}</TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleView(student)}><Eye className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}><Edit className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="text-destructive"><Trash className="h-4 w-4"/></Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
            <EditMarksDialog 
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                student={selectedStudent}
                examType={selectedExam}
                onSave={handleSaveMarks}
            />
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-4xl p-0 border-0">
                   {selectedStudent.results?.[selectedStudent.session] ? (
                     <ResultCard student={selectedStudent} annualResult={selectedStudent.results[selectedStudent.session]}/>
                   ): (
                    <div className="p-8 text-center">No results found for the current session.</div>
                   )}
                </DialogContent>
            </Dialog>
        </>
      )}
    </>
  );
}
