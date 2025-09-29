'use client';
import type { Teacher } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

export default function TeacherRosterReport({ teachers }: { teachers: Teacher[] }) {
    const reportRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: reportRef,
    });

  return (
    <div>
        <div className="flex justify-end mb-4">
            <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Report
            </Button>
        </div>
        <div className="border rounded-lg" ref={reportRef}>
            <div className="p-4 print:block hidden">
                <h2 className="text-xl font-bold text-center">Teacher Roster</h2>
                <p className="text-center text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Subjects</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {teachers.map(teacher => (
                    <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.id}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.designation}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.phone}</TableCell>
                    <TableCell>{teacher.subjects.join(', ')}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
