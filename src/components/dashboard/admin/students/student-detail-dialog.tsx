
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Student } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface StudentDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student | null;
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-2">
        <Label className="font-semibold text-muted-foreground">{label}</Label>
        <div className="col-span-2">{value || 'N/A'}</div>
    </div>
);


export default function StudentDetailDialog({ isOpen, onOpenChange, student }: StudentDetailDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="items-center text-center pt-4">
             <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={`https://picsum.photos/seed/${student.admissionNumber}/200/200`} alt={student.firstName} />
                <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
              </Avatar>
              <DialogTitle className="text-2xl">{student.firstName} {student.lastName}</DialogTitle>
              <DialogDescription>
                Class: {student.className}-{student.sectionName} | Roll No: {student.rollNo}
              </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="max-h-[60vh] overflow-y-auto px-1">
            <DetailItem label="Admission No." value={student.admissionNumber} />
            <DetailItem label="Session" value={student.session} />
            <DetailItem label="Gender" value={student.gender} />
            <DetailItem label="Date of Birth" value={student.dob} />
            <DetailItem label="Parent's Name" value={student.parentName} />
            <DetailItem label="Parent's Mobile" value={student.parentMobile} />
            <DetailItem label="Status" value={<Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>{student.status}</Badge>} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
