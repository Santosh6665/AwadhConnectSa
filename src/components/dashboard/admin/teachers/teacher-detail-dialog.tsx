
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
import type { Teacher } from '@/lib/types';
import { format, parse } from 'date-fns';
import { Check, X } from 'lucide-react';

interface TeacherDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teacher: Teacher | null;
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 py-2 border-b">
        <Label className="font-semibold text-muted-foreground">{label}</Label>
        <div className="col-span-2">{value || 'N/A'}</div>
    </div>
);


export default function TeacherDetailDialog({ isOpen, onOpenChange, teacher }: TeacherDetailDialogProps) {
  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
          <DialogDescription>
            Viewing the profile for {teacher.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
            <DetailItem label="Teacher ID" value={teacher.id} />
            <DetailItem label="Full Name" value={teacher.name} />
            <DetailItem label="Email" value={teacher.email} />
            <DetailItem label="Phone Number" value={teacher.phone} />
            <DetailItem label="Gender" value={teacher.gender} />
            <DetailItem label="Date of Birth" value={teacher.dob} />
            <DetailItem label="Hire Date" value={teacher.hireDate} />
            <DetailItem label="Designation" value={teacher.designation} />
            <DetailItem label="Salary" value={teacher.salary ? `Rs ${teacher.salary.toLocaleString()}` : 'N/A'} />
            <DetailItem 
                label="Subjects" 
                value={
                    <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                } 
            />
            <DetailItem 
                label="Classes" 
                value={
                     <div className="flex flex-wrap gap-1">
                        {teacher.classes?.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                    </div>
                } 
            />
            <DetailItem 
                label="Status" 
                value={
                    <Badge variant={teacher.status === 'Active' ? 'default' : 'destructive'}>
                        {teacher.status}
                    </Badge>
                } 
            />
            <h4 className="font-semibold text-muted-foreground mt-4">Permissions</h4>
            <DetailItem label="Can Mark Attendance" value={teacher.canMarkAttendance ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />} />
            <DetailItem label="Can Edit Results" value={teacher.canEditResults ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
