
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
import type { Student } from '@/lib/types';
import PreviousSessionCard from '@/components/student/previous-session-card';

interface ViewPreviousRecordsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student | null;
}

export default function ViewPreviousRecordsDialog({ isOpen, onOpenChange, student }: ViewPreviousRecordsDialogProps) {
  if (!student) return null;

  const hasPreviousSessions = student.previousSessions && student.previousSessions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Previous Records: {student.firstName} {student.lastName}</DialogTitle>
          <DialogDescription>
            Viewing the complete academic history for this student.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4 pr-6">
                {hasPreviousSessions ? (
                    student.previousSessions!.map(session => (
                        <PreviousSessionCard key={session.sessionId} session={session} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        No previous session records found for this student.
                    </div>
                )}
            </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
