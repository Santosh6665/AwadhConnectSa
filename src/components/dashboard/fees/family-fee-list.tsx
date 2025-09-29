
'use client';
import { useState, useMemo, useTransition } from 'react';
import type { Family, Student, FeeStructure, FeeReceipt } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Accordion } from '@/components/ui/accordion';
import FamilyFeeCard from './family-fee-card';
import { useToast } from '@/hooks/use-toast';
import { addFeePayment, updateStudentFeeStructure } from '@/lib/firebase/firestore';

export default function FamilyFeeList({
  initialFamilies,
  feeStructure: defaultFeeStructure,
}: {
  initialFamilies: Family[];
  feeStructure: FeeStructure | null;
}) {
  const [families, setFamilies] = useState(initialFamilies);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const filteredFamilies = useMemo(() => {
    return families.filter(family => {
      const searchLower = searchTerm.toLowerCase();
      const parentMatch = family.name.toLowerCase().includes(searchLower) || family.phone.includes(searchLower);
      const studentMatch = family.students.some(
        student =>
          student.firstName.toLowerCase().includes(searchLower) ||
          student.lastName.toLowerCase().includes(searchLower) ||
          student.admissionNumber.toLowerCase().includes(searchLower)
      );
      return parentMatch || studentMatch;
    });
  }, [families, searchTerm]);

  const handleUpdateStudent = (updatedStudent: Student) => {
    const newFamilies = families.map(family => ({
        ...family,
        students: family.students.map(s => s.admissionNumber === updatedStudent.admissionNumber ? updatedStudent : s)
    }));
    setFamilies(newFamilies);
  };
  
  const handleSavePayment = async (student: Student, amount: number, mode: FeeReceipt['mode'], remarks: string, onPaymentSaved: () => void) => {
    startTransition(async () => {
        try {
            const receipt: FeeReceipt = {
                id: `TXN-${Date.now()}`,
                amount,
                date: new Date().toLocaleDateString('en-GB'), // dd/MM/yyyy
                mode,
                remarks,
            };
            await addFeePayment(student.admissionNumber, student.className, receipt);
            
            const updatedStudent: Student = {
                ...student,
                fees: {
                    ...student.fees,
                    [student.className]: {
                        ...student.fees[student.className],
                        transactions: [...(student.fees[student.className]?.transactions || []), receipt],
                    }
                }
            };

            handleUpdateStudent(updatedStudent);
            toast({ title: 'Success', description: 'Payment recorded successfully.' });
            onPaymentSaved(); // Callback to close dialog

        } catch (error) {
            console.error("Error saving payment", error);
            toast({ title: 'Error', description: 'Failed to record payment.', variant: 'destructive' });
        }
    });
  };

  const handleSaveStructure = async (student: Student, newStructure: FeeStructure, newConcession: number) => {
     startTransition(async () => {
        try {
            await updateStudentFeeStructure(student.admissionNumber, student.className, newStructure, newConcession);
             const updatedStudent: Student = {
                ...student,
                fees: {
                    ...student.fees,
                    [student.className]: {
                        ...(student.fees[student.className] || { transactions: [] }),
                        structure: newStructure,
                        concession: newConcession,
                    }
                }
            };
            handleUpdateStudent(updatedStudent);
            toast({ title: 'Success', description: "Student's fee structure updated." });

        } catch (error) {
            console.error("Error saving structure", error);
            toast({ title: 'Error', description: 'Failed to update fee structure.', variant: 'destructive' });
        }
    });
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by parent name, phone, or student name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-lg"
      />
      <Accordion type="multiple" className="w-full space-y-4">
        {filteredFamilies.map((family) => (
          <FamilyFeeCard
            key={family.id}
            family={family}
            defaultFeeStructure={defaultFeeStructure}
            onSavePayment={handleSavePayment}
            onSaveStructure={handleSaveStructure}
            isSaving={isSaving}
          />
        ))}
      </Accordion>
      {filteredFamilies.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
            No families found for your search criteria.
        </div>
      )}
    </div>
  );
}
