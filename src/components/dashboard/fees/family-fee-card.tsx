
'use client';

import * as React from 'react';
import type { Family, Student, FeeStructure, FeeReceipt } from '@/lib/types';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import StudentFeeRow from './student-fee-row';
import { Separator } from '@/components/ui/separator';

const calculateTotalDueForFamily = (family: Family, defaultFeeStructure: { [key: string]: FeeStructure } | null): number => {
    return family.students.reduce((total, student) => {
        const studentFeeData = student.fees?.[student.className];
        const studentStructure = studentFeeData?.structure || defaultFeeStructure?.[student.className];

        let annualFee = 0;
        if (studentStructure) {
            annualFee = Object.values(studentStructure).reduce((sum, head) => sum + (head.amount * head.months), 0);
        }

        const concession = studentFeeData?.concession || 0;
        const totalPaid = (studentFeeData?.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
        
        const previousDue = student.previousDue || 0;

        const currentDue = Math.max(0, annualFee - concession - totalPaid);
        
        return total + currentDue + previousDue;
    }, 0);
};


export default function FamilyFeeCard({
  family,
  defaultFeeStructure,
  onSavePayment,
  onSaveStructure,
  isSaving,
}: {
  family: Family;
  defaultFeeStructure: { [key: string]: FeeStructure } | null;
  onSavePayment: (student: Student, amount: number, mode: FeeReceipt['mode'], remarks: string, onPaymentSaved: () => void) => void;
  onSaveStructure: (student: Student, newStructure: FeeStructure, newConcession: number) => void;
  isSaving: boolean;
}) {
    const totalDue = calculateTotalDueForFamily(family, defaultFeeStructure);
    const studentNames = family.students.map(s => `${s.firstName} ${s.lastName}`).join(', ');
    const childCount = family.students.length;
    const childLabel = childCount === 1 ? 'Child' : 'Children';
    
    return (
        <AccordionItem value={family.id} className="border-none">
            <div className="bg-card rounded-lg shadow-sm">
            <AccordionTrigger className="p-4 hover:no-underline rounded-t-lg data-[state=open]:bg-muted/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                    <div className="text-left">
                        <p className="font-bold text-lg">{family.name}</p>
                        <p className="text-sm text-muted-foreground">{family.phone}</p>
                        <p className="text-sm text-muted-foreground">
                            ({childCount} {childLabel}: {studentNames})
                        </p>
                    </div>
                     <div className="text-left md:text-right shrink-0">
                         <p className="text-sm text-muted-foreground">Total Family Due</p>
                         <p className={`font-bold text-xl ${totalDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                           Rs {totalDue.toLocaleString()}
                         </p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-4">
                 <Separator className="mb-4" />
                {family.students.map(student => (
                    <StudentFeeRow 
                        key={student.admissionNumber}
                        student={student}
                        defaultFeeStructure={defaultFeeStructure}
                        onSavePayment={onSavePayment}
                        onSaveStructure={onSaveStructure}
                        isSaving={isSaving}
                    />
                ))}
                {family.students.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No active students associated with this parent.</p>
                )}
            </AccordionContent>
            </div>
        </AccordionItem>
    );
}
