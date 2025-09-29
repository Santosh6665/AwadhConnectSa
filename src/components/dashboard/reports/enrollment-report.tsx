'use client';
import type { Student } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const classOrder = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

export default function EnrollmentReport({ students }: { students: Student[] }) {
  const enrollmentData = students.reduce((acc, student) => {
    const { className, sectionName } = student;
    if (!acc[className]) {
      acc[className] = { total: 0, sections: {} };
    }
    acc[className].total++;
    if (!acc[className].sections[sectionName]) {
      acc[className].sections[sectionName] = 0;
    }
    acc[className].sections[sectionName]++;
    return acc;
  }, {} as Record<string, { total: number, sections: Record<string, number> }>);

  const sortedClasses = Object.keys(enrollmentData).sort((a, b) => classOrder.indexOf(a) - classOrder.indexOf(b));

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Section A</TableHead>
            <TableHead>Section B</TableHead>
            <TableHead>Section C</TableHead>
            <TableHead className="text-right font-bold">Total Students</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClasses.map(className => (
            <TableRow key={className}>
              <TableCell className="font-medium">Class {className}</TableCell>
              <TableCell>{enrollmentData[className].sections['A'] || 0}</TableCell>
              <TableCell>{enrollmentData[className].sections['B'] || 0}</TableCell>
              <TableCell>{enrollmentData[className].sections['C'] || 0}</TableCell>
              <TableCell className="text-right font-bold">{enrollmentData[className].total}</TableCell>
            </TableRow>
          ))}
            <TableRow className="bg-muted font-bold">
                <TableCell>Grand Total</TableCell>
                <TableCell colSpan={3}></TableCell>
                <TableCell className="text-right">{students.length}</TableCell>
            </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
