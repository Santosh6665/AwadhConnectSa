
'use client';

import { useState, useMemo } from 'react';
import type { Student } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentListForTeacher({ students, classes }: { students: Student[], classes: string[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower);
      
      const classAndSection = `${student.className}${student.sectionName}`;
      const matchesClass = classFilter === 'all' || classAndSection === classFilter;
      
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, classFilter]);

  return (
    <Card>
        <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4 gap-4">
                <Input
                    placeholder="Search by name or roll no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select onValueChange={setClassFilter} value={classFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by Class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                        <TableRow key={student.admissionNumber}>
                            <TableCell className="font-medium">{student.rollNo}</TableCell>
                            <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                            <TableCell>{`${student.className}-${student.sectionName}`}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No students found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
