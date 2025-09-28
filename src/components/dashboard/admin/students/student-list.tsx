
'use client';
import { useState, useMemo, useTransition } from 'react';
import type { Student, Class, Section, Parent } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Filter, Loader2, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { addStudent, updateStudent, promoteStudent } from '@/lib/firebase/firestore';
import AddEditStudentDialog from './add-edit-student-dialog';
import PromoteStudentDialog from './promote-student-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


type StudentWithDetails = Student;

type SortConfig = {
  key: keyof Student;
  direction: 'ascending' | 'descending';
};

export default function StudentList({
  initialStudents,
  classes,
  sections,
}: {
  initialStudents: Student[];
  classes: Class[];
  sections: Section[];
  parents: Parent[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        `${student.firstName.toLowerCase()} ${student.lastName.toLowerCase()}`.includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower) ||
        student.admissionNumber.toLowerCase().includes(searchLower) ||
        student.className?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [students, searchTerm, sortConfig]);

  const requestSort = (key: keyof Student) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleAddNew = () => {
    setSelectedStudent(null);
    setIsAddEditDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsAddEditDialogOpen(true);
  };
  
  const handlePromote = (student: Student) => {
    setSelectedStudent(student);
    setIsPromoteDialogOpen(true);
  };
  
  const handleArchive = (studentId: string) => {
     startTransition(async () => {
        try {
            await updateStudent(studentId, { status: 'Archived' });
            setStudents(students.map(s => s.id === studentId ? { ...s, status: 'Archived' } : s));
            toast({ title: 'Student Archived', description: 'The student has been moved to the archives.' });
        } catch (error) {
            console.error('Failed to archive student:', error);
            toast({ title: 'Error', description: 'Could not archive the student.', variant: 'destructive' });
        }
    });
  };

  const handleSaveStudent = (data: Student) => {
      startTransition(async () => {
        try {
            if (selectedStudent) {
                await updateStudent(selectedStudent.id, data);
                setStudents(students.map(s => s.id === selectedStudent.id ? data : s));
                toast({ title: "Success", description: "Student record updated." });
            } else {
                const newId = await addStudent(data);
                setStudents(prev => [...prev, { ...data, id: newId }]);
                toast({ title: "Success", description: "New student admitted." });
            }
            setIsAddEditDialogOpen(false);
        } catch (error) {
            console.error("Failed to save student:", error);
            toast({ title: "Error", description: "Failed to save student data.", variant: "destructive" });
        }
      });
  };
  
  const handleSavePromotion = ({ newClassName, newSectionName, newSession, carryOverDues }: { newClassName: string; newSectionName: string; newSession: string; carryOverDues: boolean }) => {
    if (!selectedStudent) return;
    startTransition(async () => {
        try {
            await promoteStudent(selectedStudent.id, selectedStudent, newClassName, newSectionName, newSession, carryOverDues);
            // This is tricky. For now, we'll just filter out the promoted (now archived) student.
            // A full refresh would be better to show the new student record.
            setStudents(students.filter(s => s.id !== selectedStudent.id));
            toast({ title: "Promotion Successful", description: `${selectedStudent.firstName} has been promoted.` });
            setIsPromoteDialogOpen(false);
        } catch(error) {
            console.error("Failed to promote student:", error);
            toast({ title: "Error", description: "Failed to promote student.", variant: "destructive" });
        }
    });
  };


  return (
    <>
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
            <Input
                placeholder="Filter by name, roll no, class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
        </div>
        <Button onClick={handleAddNew} disabled={isSaving}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Admission
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('rollNo')}>
                <div className="flex items-center gap-2 cursor-pointer">
                  Roll No <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead onClick={() => requestSort('firstName')}>
                 <div className="flex items-center gap-2 cursor-pointer">
                  Name <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Class & Section</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.rollNo}</TableCell>
                <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                <TableCell>{student.admissionNumber}</TableCell>
                <TableCell>{`${student.className || 'N/A'}-${student.sectionName || 'N/A'}`}</TableCell>
                <TableCell>{student.parentName || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={
                      student.feeStatus === 'Paid' ? 'default' 
                      : student.feeStatus === 'Due' ? 'destructive' 
                      : 'secondary'
                  }>
                    {student.feeStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={student.status === 'Active' ? 'outline' : 'secondary'}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(student)}>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePromote(student)}>Promote Student</DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Archive</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Archiving this student will mark them as inactive. They will no longer appear in active lists but their data will be retained.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleArchive(student.id)}>
                                {isSaving ? <Loader2 className="animate-spin" /> : 'Confirm Archive'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       <AddEditStudentDialog
          isOpen={isAddEditDialogOpen}
          onOpenChange={setIsAddEditDialogOpen}
          student={selectedStudent}
          onSave={handleSaveStudent}
          isSaving={isSaving}
       />
       
       <PromoteStudentDialog
          isOpen={isPromoteDialogOpen}
          onOpenChange={setIsPromoteDialogOpen}
          student={selectedStudent}
          onSave={handleSavePromotion}
          isSaving={isSaving}
        />
    </>
  );
}
