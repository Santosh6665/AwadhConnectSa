
'use client';
import { useState, useMemo, useTransition } from 'react';
import type { Student, Class, Section, Parent } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Filter, Loader2, ArrowUpDown, ArrowUpCircle, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { addStudent, updateStudent, promoteStudent } from '@/lib/firebase/firestore';
import AddEditStudentDialog from './add-edit-student-dialog';
import PromoteStudentDialog from './promote-student-dialog';
import ViewPreviousRecordsDialog from './view-previous-records-dialog';
import { getStudentByAdmissionNumber } from '@/lib/firebase/firestore';

type StudentWithDetails = Student;

type SortConfig = {
  key: keyof Student;
  direction: 'ascending' | 'descending';
};

const getFeeStatus = (student: Student) => {
    const classFees = student.fees[student.className] || [];
    if (classFees.length === 0) return 'Due';
    const lastReceipt = classFees[classFees.length - 1];
    return lastReceipt.status;
};


export default function StudentList({
  initialStudents,
}: {
  initialStudents: Student[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isViewRecordsDialogOpen, setIsViewRecordsDialogOpen] = useState(false);
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
        student.className?.toLowerCase().includes(searchLower) ||
        student.sectionName?.toLowerCase().includes(searchLower) ||
        student.session?.toLowerCase().includes(searchLower) ||
        student.parentName?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Student] ?? '';
        const bValue = b[sortConfig.key as keyof Student] ?? '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
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

  const handleViewRecords = (student: Student) => {
    setSelectedStudent(student);
    setIsViewRecordsDialogOpen(true);
  };
  
  const handleSaveStudent = (data: Student) => {
      startTransition(async () => {
        try {
            const { admissionNumber, ...studentData } = data;
            if (selectedStudent) {
                await updateStudent(admissionNumber, studentData);
                setStudents(students.map(s => s.admissionNumber === admissionNumber ? data : s));
                toast({ title: "Success", description: "Student record updated." });
            } else {
                await addStudent(studentData, admissionNumber);
                setStudents(prev => [...prev, data]);
                toast({ title: "Success", description: "New student admitted." });
            }
            setIsAddEditDialogOpen(false);
        } catch (error) {
            console.error("Failed to save student:", error);
            toast({ title: "Error", description: "Failed to save student data.", variant: "destructive" });
        }
      });
  };

  const handleSavePromotion = async (
    admissionNumber: string,
    newSession: string,
    newClassName: string,
    newSectionName: string,
    carryForwardDues: boolean
  ) => {
    startTransition(async () => {
      try {
        await promoteStudent(admissionNumber, newSession, newClassName, newSectionName, carryForwardDues);
        const updatedStudent = await getStudentByAdmissionNumber(admissionNumber);
        if (updatedStudent) {
            setStudents(students.map(s => s.admissionNumber === admissionNumber ? updatedStudent : s));
        }
        toast({ title: "Success", description: "Student promoted successfully." });
        setIsPromoteDialogOpen(false);
      } catch (error) {
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
              <TableHead onClick={() => requestSort('admissionNumber')}>Admission No</TableHead>
              <TableHead>Class & Section</TableHead>
              <TableHead onClick={() => requestSort('session')}>
                 <div className="flex items-center gap-2 cursor-pointer">
                  Session <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const feeStatus = getFeeStatus(student);
              const hasPreviousRecords = student.previousSessions && student.previousSessions.length > 0;
              return (
              <TableRow key={student.admissionNumber}>
                <TableCell className="font-medium">{student.rollNo}</TableCell>
                <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                <TableCell>{student.admissionNumber}</TableCell>
                <TableCell>{`${student.className || 'N/A'}-${student.sectionName || 'N/A'}`}</TableCell>
                <TableCell>{student.session}</TableCell>
                <TableCell>{student.parentName || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={
                      feeStatus === 'Paid' ? 'default' 
                      : feeStatus === 'Due' ? 'destructive' 
                      : 'secondary'
                  }>
                    {feeStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
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
                       {hasPreviousRecords && (
                          <DropdownMenuItem onClick={() => handleViewRecords(student)}>
                            <History className="mr-2 h-4 w-4" />
                            View Previous Records
                          </DropdownMenuItem>
                        )}
                      {student.status === 'Active' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePromote(student)}>
                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                            Promote
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
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
       {selectedStudent && (
        <>
          <PromoteStudentDialog
            isOpen={isPromoteDialogOpen}
            onOpenChange={setIsPromoteDialogOpen}
            student={selectedStudent}
            onSave={handleSavePromotion}
            isSaving={isSaving}
          />
          <ViewPreviousRecordsDialog
            isOpen={isViewRecordsDialogOpen}
            onOpenChange={setIsViewRecordsDialogOpen}
            student={selectedStudent}
          />
        </>
       )}
    </>
  );
}
