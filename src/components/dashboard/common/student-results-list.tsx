'use client';
import { useState, useMemo, useTransition, useRef } from 'react';
import type { Student, ExamType, AnnualResult, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Filter, Loader2, Edit, Trash, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { calculateOverallResult, getGrade } from '@/lib/utils';
import EditMarksDialog from './edit-marks-dialog';
import ResultCard from './result-card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteStudentResults } from '@/lib/firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReactToPrint } from 'react-to-print';

type StudentResultSummary = {
  student: Student;
  percentage: number;
  grade: string;
  rank: number;
};

const examTypes: ExamType[] = ['Quarterly', 'Half-Yearly', 'Annual'];
const allClassOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];


export default function StudentResultsList({ initialStudents, userRole, teacherClasses }: { initialStudents: Student[], userRole: UserRole, teacherClasses?: string[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamType>('Annual');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isDeleting, startDeleteTransition] = useTransition();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => resultRef.current,
  });

  const { toast } = useToast();
  
  const classOptions = useMemo(() => {
    if (userRole === 'teacher' && teacherClasses) {
      return teacherClasses;
    }
    return allClassOptions;
  }, [userRole, teacherClasses]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };
  
  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedStudent || !selectedStudent.session) {
      toast({ title: "Error", description: "Cannot delete results without a selected student or session.", variant: "destructive" });
      return;
    }

    startDeleteTransition(async () => {
      try {
        await deleteStudentResults(selectedStudent.admissionNumber, selectedStudent.session, selectedExam);
        
        // Optimistically update the UI
        const updatedStudents = students.map(s => {
          if (s.admissionNumber === selectedStudent.admissionNumber) {
            const newStudent = { ...s };
            if (newStudent.results?.[s.session]?.examResults) {
              delete newStudent.results[s.session].examResults[selectedExam];
            }
            return newStudent;
          }
          return s;
        });
        setStudents(updatedStudents);
        
        toast({ title: "Success", description: `${selectedExam} results for ${selectedStudent.firstName} have been deleted.` });
      } catch (error) {
        console.error("Failed to delete results:", error);
        toast({ title: "Error", description: "Could not delete results.", variant: "destructive" });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedStudent(null);
      }
    });
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

      let matchesClass = selectedClass === 'all';
      if (userRole === 'teacher' && selectedClass !== 'all') {
        const classAndSection = `${student.className}${student.sectionName}`;
        matchesClass = classAndSection === selectedClass;
      } else if (userRole === 'admin') {
         matchesClass = selectedClass === 'all' || student.className === selectedClass;
      }

      const matchesSection = selectedSection === 'all' || student.sectionName === 'all' || student.sectionName === selectedSection;

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
  }, [students, searchTerm, selectedClass, selectedSection, userRole]);


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
                        {classOptions.map(c => 
                            <SelectItem key={c} value={c}>
                                {userRole === 'admin' ? `Class ${c}` : c}
                            </SelectItem>
                        )}
                    </SelectContent>
                 </Select>
                 {userRole === 'admin' && (
                    <Select onValueChange={setSelectedSection} value={selectedSection} disabled={selectedClass === 'all'}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="All Sections" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sections</SelectItem>
                            {sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 )}
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
                                {userRole === 'admin' && (
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(student)} disabled={isDeleting}>
                                      <Trash className="h-4 w-4"/>
                                    </Button>
                                )}
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
                    <ScrollArea className="max-h-[90vh]">
                       <ResultCard 
                            ref={resultRef}
                            student={selectedStudent} 
                            annualResult={selectedStudent.results?.[selectedStudent.session]} 
                            onDownload={handlePrint}
                        />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete the <strong>{selectedExam}</strong> results for <strong>{selectedStudent.firstName}</strong>. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </>
  );
}
