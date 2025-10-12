
'use client';
import { useState, useMemo, useTransition, useRef, useEffect } from 'react';
import type { Student, ExamType, AnnualResult, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Loader2, Edit, Trash, Eye, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { calculateOverallResult, calculateGrandTotalResult } from '@/lib/utils';
import EditMarksDialog from './edit-marks-dialog';
import ResultCard from './result-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteStudentResults } from '@/lib/firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReactToPrint } from 'react-to-print';

type StudentResultSummary = {
  student: Student;
  percentage: number;
  grade: string;
  rank: number;
  grandTotalPercentage: number;
};

const examTypes: ExamType[] = ['Quarterly', 'Half-Yearly', 'Annual'];
const allClassOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];


export default function StudentResultsList({
  initialStudents,
  allStudentsForRank,
  userRole,
  teacherClasses,
  canEdit
}: {
  initialStudents: Student[];
  allStudentsForRank?: Student[];
  userRole: UserRole;
  teacherClasses?: string[];
  canEdit?: boolean;
}) {
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
  const [selectedStudentSummary, setSelectedStudentSummary] = useState<StudentResultSummary | null>(null);
  
  const [viewingClass, setViewingClass] = useState<string>('');

  const resultRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: resultRef
  });

  const { toast } = useToast();

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);
  
  const classOptions = useMemo(() => {
    if (userRole === 'teacher' && teacherClasses) {
      return teacherClasses;
    }
    return allClassOptions;
  }, [userRole, teacherClasses]);

  const canEditResults = canEdit ?? (userRole === 'admin');

  const handleEdit = (student: Student) => {
    if (!canEditResults) {
        toast({ title: "Permission Denied", description: "You do not have permission to edit results.", variant: "destructive" });
        return;
    }
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };
  
  const handleView = (summary: StudentResultSummary) => {
    setSelectedStudent(summary.student);
    setSelectedStudentSummary(summary);
    setViewingClass(summary.student.className);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    if (!canEditResults) {
        toast({ title: "Permission Denied", description: "You do not have permission to delete results.", variant: "destructive" });
        return;
    }
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedStudent || !selectedStudent.className) {
      toast({ title: "Error", description: "Cannot delete results without a selected student or class.", variant: "destructive" });
      return;
    }

    startDeleteTransition(async () => {
      try {
        await deleteStudentResults(selectedStudent.admissionNumber, selectedStudent.className, selectedExam);
        
        const updatedStudents = students.map(s => {
          if (s.admissionNumber === selectedStudent.admissionNumber) {
            const newStudent = { ...s };
            if (newStudent.results?.[s.className]?.examResults) {
              delete newStudent.results[s.className].examResults[selectedExam];
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
    if (allStudentsForRank) {
        const newAllStudents = allStudentsForRank.map(s => s.admissionNumber === updatedStudent.admissionNumber ? updatedStudent : s);
    }
  };
  
  const studentSummaries = useMemo(() => {
    const rankingList = allStudentsForRank || students;

    const allSummaries = rankingList.map(student => {
        const annualResult = student.results?.[student.className] || { examResults: {} };
        const { percentage, grade } = calculateOverallResult(annualResult, selectedExam);
        const { percentage: grandTotalPercentage } = calculateGrandTotalResult(annualResult);
        return { student, percentage, grade, rank: 0, grandTotalPercentage };
    });

    const summariesByClass: { [className: string]: StudentResultSummary[] } = {};
    allSummaries.forEach(s => {
      const className = s.student.className;
      if (!summariesByClass[className]) {
        summariesByClass[className] = [];
      }
      summariesByClass[className].push(s);
    });

    for (const classSummaries of Object.values(summariesByClass)) {
      classSummaries.sort((a, b) => b.grandTotalPercentage - a.grandTotalPercentage);
      let rank = 1;
      for (let i = 0; i < classSummaries.length; i++) {
        if (i > 0 && classSummaries[i].grandTotalPercentage < classSummaries[i - 1].grandTotalPercentage) {
          rank = i + 1;
        }
        classSummaries[i].rank = rank;
      }
    }

    const rankMap = new Map<string, number>();
    Object.values(summariesByClass).flat().forEach(s => {
        rankMap.set(s.student.admissionNumber, s.rank);
    });

    let filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        (student.rollNo || '').toLowerCase().includes(searchLower);

      let matchesClass = selectedClass === 'all';
        if (userRole === 'teacher' && selectedClass !== 'all') {
            const classAndSection = `${student.className}${student.sectionName}`;
            matchesClass = classAndSection === selectedClass;
        } else if (userRole !== 'teacher') { 
            matchesClass = selectedClass === 'all' || student.className === selectedClass;
        }

      const matchesSection = selectedSection === 'all' || student.sectionName === selectedSection;

      return matchesSearch && matchesClass && matchesSection;
    });

    const finalSummaries = filtered.map(student => {
        const annualResult = student.results?.[student.className] || { examResults: {} };
        const { percentage, grade } = calculateOverallResult(annualResult, selectedExam);
        const { percentage: grandTotalPercentage } = calculateGrandTotalResult(annualResult);
        const rank = rankMap.get(student.admissionNumber) || 0;
        return { student, percentage, grade, rank, grandTotalPercentage };
    });
    
    finalSummaries.sort((a,b) => {
        if (a.student.className < b.student.className) return -1;
        if (a.student.className > b.student.className) return 1;
        return parseInt(a.student.rollNo) - parseInt(b.student.rollNo);
    });

    return finalSummaries;
  }, [students, allStudentsForRank, searchTerm, selectedClass, selectedSection, userRole, selectedExam]);

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Class', 'Percentage', 'Grade', 'Rank'];
    const rows = studentSummaries.map(s => [
      s.student.rollNo,
      `${s.student.firstName} ${s.student.lastName}`,
      `${s.student.className}-${s.student.sectionName}`,
      `${s.percentage.toFixed(2)}%`,
      s.grade,
      s.rank
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student-results-${selectedClass}-${selectedSection}-${selectedExam}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const viewingClassOptions = selectedStudent ? Object.keys(selectedStudent.results || {}).sort().reverse() : [];
  const annualResultForViewing = selectedStudent?.results?.[viewingClass];


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Filter & View Results</CardTitle>
                <CardDescription>Select filters to narrow down the student list and manage results.</CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline">
                <Upload className="mr-2 h-4 w-4"/>
                Export to CSV
            </Button>
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
                    {studentSummaries.map((summary) => (
                    <TableRow key={summary.student.admissionNumber}>
                        <TableCell>{summary.student.rollNo}</TableCell>
                        <TableCell>{`${summary.student.firstName} ${summary.student.lastName}`}</TableCell>
                        <TableCell>{`${summary.student.className}-${summary.student.sectionName}`}</TableCell>
                        <TableCell>{summary.percentage.toFixed(2)}%</TableCell>
                        <TableCell>{summary.grade}</TableCell>
                        <TableCell>{summary.rank}</TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleView(summary)}><Eye className="h-4 w-4"/></Button>
                                {canEditResults && (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(summary.student)}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(summary.student)} disabled={isDeleting}>
                                        <Trash className="h-4 w-4"/>
                                        </Button>
                                    </>
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
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle>Viewing Result for {selectedStudent.firstName}</DialogTitle>
                        <DialogDescription asChild>
                            <Select onValueChange={setViewingClass} value={viewingClass}>
                                <SelectTrigger className="w-full md:w-48 mt-2">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {viewingClassOptions.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                            </Select>
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh]">
                       <ResultCard 
                            ref={resultRef}
                            student={selectedStudent} 
                            annualResult={annualResultForViewing} 
                            forClass={viewingClass}
                            onDownload={handlePrint}
                            examType={selectedExam}
                            rank={selectedStudentSummary?.rank}
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
