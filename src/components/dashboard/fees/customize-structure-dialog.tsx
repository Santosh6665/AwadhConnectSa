
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Student, FeeStructure } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const feeHeads: (keyof FeeStructure)[] = [
  'Tuition Fee',
  'Transport Fee',
  'Computer Fee',
  'Admission Fee',
  'Exam Fee',
  'Miscellaneous/Enrolment',
];

export default function CustomizeStructureDialog({ isOpen, onOpenChange, student, defaultFeeStructure, onSave, isSaving }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; student: Student | null; defaultFeeStructure: FeeStructure | null; onSave: (newStructure: FeeStructure, newConcession: number) => void; isSaving: boolean; }) {
  
  const [customStructure, setCustomStructure] = React.useState<FeeStructure | null>(null);
  const [concession, setConcession] = React.useState(0);

  React.useEffect(() => {
    if (student && isOpen) {
        const studentFeeData = student.fees?.[student.session];
        const studentStructure = studentFeeData?.structure || defaultFeeStructure?.[student.className];
        const studentConcession = studentFeeData?.concession || 0;
        
        setCustomStructure(studentStructure || {});
        setConcession(studentConcession);
    }
  }, [student, defaultFeeStructure, isOpen]);
  
  const handleAmountChange = (head: keyof FeeStructure, value: string) => {
    const amount = Number(value);
    if (customStructure) {
        setCustomStructure(prev => ({
            ...prev,
            [head]: { ...(prev?.[head] || { months: 1 }), amount: isNaN(amount) ? 0 : amount }
        }));
    }
  };
  
  const handleSave = () => {
    if(customStructure) {
        onSave(customStructure, concession);
    }
  }

  if (!student || !customStructure) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize Fee Structure</DialogTitle>
          <DialogDescription>
            Set a custom fee structure or concession for {student.firstName} for the session {student.session}.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="default">
            <AlertDescription>
                These changes will only apply to this student for the current session. The base structure is taken from the global fee settings for Class {student.className}.
            </AlertDescription>
        </Alert>

        <ScrollArea className="max-h-[50vh] p-1 pr-4">
             <div className="grid grid-cols-2 gap-4">
                 {feeHeads.map(head => (
                    <div key={head} className="space-y-2">
                        <Label htmlFor={head}>{head}</Label>
                        <Input
                            id={head}
                            type="number"
                            value={customStructure[head]?.amount || 0}
                            onChange={(e) => handleAmountChange(head, e.target.value)}
                        />
                    </div>
                 ))}
             </div>
             <div className="mt-4 space-y-2 border-t pt-4">
                <Label htmlFor="concession">Total Concession (₹)</Label>
                <Input
                    id="concession"
                    type="number"
                    value={concession}
                    onChange={(e) => setConcession(Number(e.target.value))}
                    placeholder="Enter total concession amount"
                />
             </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Custom Structure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
