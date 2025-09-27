'use client';
import { useState } from 'react';
import type { Teacher } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AddEditTeacherDialog from './add-edit-teacher-dialog';

export default function TeacherList({ teachers: initialTeachers }: { teachers: Teacher[] }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Archived'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsDialogOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
  };
  
  const handleSaveTeacher = (teacher: Teacher) => {
    if(selectedTeacher) {
      setTeachers(teachers.map(t => t.id === teacher.id ? teacher : t));
    } else {
      setTeachers([...teachers, { ...teacher, id: `T${teachers.length + 1}` }]);
    }
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10">
                        <Filter className="mr-2 h-4 w-4" />
                        {statusFilter === 'all' ? 'Status' : statusFilter}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setStatusFilter('all')}>All</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setStatusFilter('Active')}>Active</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setStatusFilter('Archived')}>Archived</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Button onClick={handleAddTeacher}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.id}</TableCell>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.phone}</TableCell>
                <TableCell>
                  <Badge variant={teacher.status === 'Active' ? 'default' : 'secondary'}>
                    {teacher.status}
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
                      <DropdownMenuItem onClick={() => handleEditTeacher(teacher)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddEditTeacherDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
      />
    </>
  );
}
