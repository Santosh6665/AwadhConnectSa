
'use client';
import { useState, useMemo, useTransition } from 'react';
import type { Student, Class, Section, Parent } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Filter, Loader2, ArrowUpDown, ArrowUpCircle, History, User, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { addStudent, updateStudent, promoteStudent } from '@/lib/firebase/firestore';
import AddEditStudentDialog from './add-edit-student-dialog';
import PromoteStudentDialog from './promote-student-dialog';
import ViewPreviousRecordsDialog from './view-previous-records-dialog';
import { getStudentByAdmissionNumber } from '@/lib/firebase/firestore';
import StudentDetailDialog from './student-detail-dialog';

type StudentWithDetails = Student;

type SortConfig = {
  key: keyof Student;
  direction: 'ascending' | 'descending';
};

const getFeeStatus = (student: Student) => {
    const classFees = student.fees[student.className] || { transactions: [] };
    const totalPaid = classFees.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    // This is a simplified check. A proper due calculation would be needed here.
    if (totalPaid > 0) return 'Partial'; 
    return 'Due';
};


export default function StudentList({
  initialStudents,
}: {
  initialStudents: Student[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isViewRecordsDialogOpen, setIsViewRecordsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const statusMatch = statusFilter === 'All' || student.status === statusFilter;
      const searchMatch = (
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
      return statusMatch && searchMatch;
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
  }, [students, searchTerm, sortConfig, statusFilter]);

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
  
  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailDialogOpen(true);
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
            if (selectedStudent) {
                // Update logic
                const { admissionNumber, ...studentData } = data;
                await updateStudent(admissionNumber, studentData);
                setStudents(students.map(s => s.admissionNumber === admissionNumber ? data : s));
                toast({ title: "Success", description: "Student record updated." });
            } else {
                // Add logic
                await addStudent(data);
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

  const handleExportCSV = () => {
    const csvHeaders = [
      'Admission Number',
      'Roll No',
      'First Name',
      'Last Name',
      'Date of Birth',
      'Gender',
      'Class',
      'Section',
      'Parent Name',
      'Parent Mobile',
      'Status',
      'Session',
    ];

    const csvRows = filteredStudents.map(student => {
      return [
        student.admissionNumber,
        student.rollNo,
        student.firstName,
        student.lastName,
        student.dob,
        student.gender,
        student.className,
        student.sectionName,
        student.parentName,
        student.parentMobile || 'N/A',
        student.status,
        student.session,
      ].join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Archived">Archive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportCSV} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
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
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
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
                       <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                        <User className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
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
          <StudentDetailDialog
            isOpen={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            student={selectedStudent}
          />
        </>
       )}
    </>
  );
}
