'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import type { StudyMaterial, Student } from '@/lib/types';
import { getStudentsByAdmissionNumbers } from '@/lib/firebase/firestore';

interface CompletionStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  material: StudyMaterial | null;
}

export default function CompletionStatusDialog({ isOpen, onOpenChange, material }: CompletionStatusDialogProps) {
  const [completedStudents, setCompletedStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && material && material.completedBy && material.completedBy.length > 0) {
      const fetchStudents = async () => {
        setIsLoading(true);
        try {
          const students = await getStudentsByAdmissionNumbers(material.completedBy!);
          setCompletedStudents(students);
        } catch (error) {
          console.error("Failed to fetch students:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudents();
    } else {
      setCompletedStudents([]);
    }
  }, [isOpen, material]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Completion Status</DialogTitle>
          <DialogDescription>
            Students who have marked "{material?.title}" as complete.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] p-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : completedStudents.length > 0 ? (
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
                  {completedStudents.map(student => (
                    <TableRow key={student.admissionNumber}>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.firstName} {student.lastName}</TableCell>
                      <TableCell>{student.className}-{student.sectionName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8">
              No students have marked this material as complete yet.
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
