
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Teacher } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Filter, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AddEditTeacherDialog from './add-edit-teacher-dialog';
import TeacherDetailDialog from './teacher-detail-dialog';
import { addTeacher, updateTeacher } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


export default function TeacherList({ teachers: initialTeachers }: { teachers: Teacher[] }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSaving, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const filteredTeachers = teachers.filter(teacher => {
    const name = teacher.name || '';
    const email = teacher.email || '';
    const id = teacher.id || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsAddEditDialogOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsAddEditDialogOpen(true);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailDialogOpen(true);
  };
  
  const handleSaveTeacher = async (data: Omit<Teacher, 'dob' | 'hireDate'> & { dob: Date, hireDate: Date }) => {
    startTransition(async () => {
      try {
        const formattedData = {
          ...data,
          dob: format(data.dob, 'dd/MM/yyyy'),
          hireDate: format(data.hireDate, 'dd/MM/yyyy'),
        };

        if (selectedTeacher) {
          // Update existing teacher
          await updateTeacher(data.id, formattedData);
          setTeachers(teachers.map(t => t.id === data.id ? { ...t, ...formattedData } : t));
          toast({ title: "Success", description: "Teacher profile updated." });
        } else {
           // Add new teacher
           const firstName = data.name.split(' ')[0];
           const birthYear = data.dob.getFullYear();
           const password = `${firstName}#${birthYear}`;
 
           const finalData = { ...formattedData, password };
           
           await addTeacher(finalData);
           setTeachers(prev => [...prev, finalData]);
           toast({ title: "Success", description: "New teacher added." });
        }
        setIsAddEditDialogOpen(false);
        router.refresh(); // Re-fetch server-side props to get the latest data
      } catch (error) {
        console.error("Failed to save teacher:", error);
        toast({ title: "Error", description: "Failed to save teacher data.", variant: "destructive" });
      }
    });
  };

  const handlePermissionChange = (teacherId: string, permission: 'canMarkAttendance' | 'canEditResults', value: boolean) => {
    startTransition(async () => {
        try {
            await updateTeacher(teacherId, { [permission]: value });
            setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, [permission]: value } : t));
            toast({ title: "Success", description: "Permission updated." });
        } catch (error) {
            console.error("Failed to update permission:", error);
            toast({ title: "Error", description: "Could not update permission.", variant: "destructive" });
            // Revert UI on failure
            setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, [permission]: !value } : t));
        }
    });
  }


  return (
    <>
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
            <Input
                placeholder="Filter by name, email, or ID..."
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
        </div>
        <Button onClick={handleAddTeacher} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          Add Teacher
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attendance Access</TableHead>
              <TableHead>Results Access</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.id}</TableCell>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>
                  <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'}>
                    {teacher.status}
                  </Badge>
                </TableCell>
                <TableCell>
                    <Switch
                        checked={teacher.canMarkAttendance ?? true}
                        onCheckedChange={(value) => handlePermissionChange(teacher.id, 'canMarkAttendance', value)}
                        disabled={isSaving}
                        aria-label="Toggle attendance marking permission"
                    />
                </TableCell>
                <TableCell>
                     <Switch
                        checked={teacher.canEditResults ?? true}
                        onCheckedChange={(value) => handlePermissionChange(teacher.id, 'canEditResults', value)}
                        disabled={isSaving}
                        aria-label="Toggle results editing permission"
                    />
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
                      <DropdownMenuItem onClick={() => handleViewTeacher(teacher)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>Edit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddEditTeacherDialog
        isOpen={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
        isSaving={isSaving}
      />
      <TeacherDetailDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        teacher={selectedTeacher}
      />
    </>
  );
}
