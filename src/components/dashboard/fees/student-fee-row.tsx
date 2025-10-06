
'use client';
import { useState } from 'react';
import type { Student, FeeStructure, FeeReceipt } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Banknote, FileCog, FileText, MoreVertical } from 'lucide-react';
import FeeDetailsDialog from './fee-details-dialog';
import AddPaymentDialog from './add-payment-dialog';
import CustomizeStructureDialog from './customize-structure-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const calculateDues = (student: Student, defaultStructure: { [key: string]: FeeStructure } | null) => {
    const studentFeeData = student.fees?.[student.className];
    const studentStructure = studentFeeData?.structure || defaultStructure?.[student.className];

    let annualFee = 0;
    if (studentStructure) {
        annualFee = Object.values(studentStructure).reduce((sum, head) => sum + (head.amount * head.months), 0);
    }
    
    const concession = studentFeeData?.concession || 0;
    const totalPaid = (studentFeeData?.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);

    const currentDue = Math.max(0, annualFee - concession - totalPaid);
    const previousDue = student.previousDue || 0;
    const totalDue = currentDue + previousDue;
    
    return {
        annualFee,
        currentDue,
        previousDue,
        totalDue
    };
};

export default function StudentFeeRow({
  student,
  defaultFeeStructure,
  onSavePayment,
  onSaveStructure,
  isSaving,
}: {
  student: Student;
  defaultFeeStructure: { [key: string]: FeeStructure } | null;
  onSavePayment: (student: Student, amount: number, mode: FeeReceipt['mode'], remarks: string, onPaymentSaved: () => void) => void;
  onSaveStructure: (student: Student, newStructure: FeeStructure, newConcession: number, onStructureSaved: () => void) => void;
  isSaving: boolean;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isStructureOpen, setIsStructureOpen] = useState(false);

  const { annualFee, currentDue, previousDue, totalDue } = calculateDues(student, defaultFeeStructure);

  const handlePaymentSaved = () => {
    setIsPaymentOpen(false);
  };
  
  const handleStructureSaved = () => {
    setIsStructureOpen(false);
  };


  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-3 border-b last:border-none">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={`https://picsum.photos/seed/${student.admissionNumber}/100`} />
          <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{student.firstName} {student.lastName}</p>
          <p className="text-sm text-muted-foreground">Class: {student.className}-{student.sectionName} | Roll: {student.rollNo}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-right">
            <p className="text-sm text-muted-foreground">Annual Fee</p>
            <p className="font-mono text-lg font-semibold">Rs {annualFee.toLocaleString()}</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-muted-foreground">Previous Due</p>
            <p className="font-mono text-lg font-semibold text-destructive">Rs {previousDue.toLocaleString()}</p>
        </div>
         <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Due</p>
            <p className="font-mono text-lg font-semibold">Rs {currentDue.toLocaleString()}</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Due</p>
            <p className="font-mono text-lg font-bold text-destructive">Rs {totalDue.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsPaymentOpen(true)}><Banknote className="mr-2 h-4 w-4"/>Pay</Button>
            <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(true)}><FileText className="mr-2 h-4 w-4"/>Receipt</Button>
            <Button variant="outline" size="sm" onClick={() => setIsStructureOpen(true)}><FileCog className="mr-2 h-4 w-4"/>Structure</Button>
        </div>
      </div>
      
      <FeeDetailsDialog 
        isOpen={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
        student={student}
        defaultFeeStructure={defaultFeeStructure}
      />
      <AddPaymentDialog
        isOpen={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        student={student}
        onSave={(amount, mode, remarks) => onSavePayment(student, amount, mode, remarks, handlePaymentSaved)}
        isSaving={isSaving}
      />
      <CustomizeStructureDialog 
        isOpen={isStructureOpen}
        onOpenChange={setIsStructureOpen}
        student={student}
        defaultFeeStructure={defaultFeeStructure?.[student.className] || null}
        onSave={(newStructure, newConcession) => onSaveStructure(student, newStructure, newConcession, handleStructureSaved)}
        isSaving={isSaving}
      />
    </div>
  );
}
