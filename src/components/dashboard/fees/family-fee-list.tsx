
'use client';
import { useState, useMemo, useTransition } from 'react';
import type { Family, Student, FeeStructure, FeeReceipt } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Accordion } from '@/components/ui/accordion';
import FamilyFeeCard from './family-fee-card';
import { useToast } from '@/hooks/use-toast';
import { addFeePayment, getStudentByAdmissionNumber, updateStudentFeeStructure } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function FamilyFeeList({
  initialFamilies,
  feeStructure: defaultFeeStructure,
}: {
  initialFamilies: Family[];
  feeStructure: { [key: string]: FeeStructure } | null;
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
            await addFeePayment(student.admissionNumber, student.className, amount, mode, remarks);
            
            const updatedStudent = await getStudentByAdmissionNumber(student.admissionNumber);

            if (updatedStudent) {
                handleUpdateStudent(updatedStudent);
            }

            toast({ title: 'Success', description: 'Payment recorded successfully.' });
            onPaymentSaved();

        } catch (error) {
            console.error("Error saving payment", error);
            toast({ title: 'Error', description: 'Failed to record payment.', variant: 'destructive' });
        }
    });
  };

  const handleSaveStructure = async (student: Student, newStructure: FeeStructure, newConcession: number, onStructureSaved: () => void) => {
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
            onStructureSaved();

        } catch (error) {
            console.error("Error saving structure", error);
            toast({ title: 'Error', description: 'Failed to update fee structure.', variant: 'destructive' });
        }
    });
  }

  const handleExportCSV = () => {
    const headers = [
        'Admission Number',
        'Student Name',
        'Class',
        'Roll No',
        'Parent Name',
        'Parent Phone',
        'Annual Fee',
        'Concession',
        'Total Payable',
        'Paid Amount',
        'Current Year Due',
        'Previous Due',
        'Net Due'
    ];

    const rows = families.flatMap(family => {
        return family.students.map(student => {
            const studentFeeDetails = student.fees?.[student.className];
            const structureToUse = studentFeeDetails?.structure || defaultFeeStructure?.[student.className];

            let annualFee = 0;
            if (structureToUse) {
                annualFee = Object.values(structureToUse).reduce((sum, head) => sum + (head.amount * head.months), 0);
            }

            const concession = studentFeeDetails?.concession || 0;
            const totalPayable = annualFee - concession;
            const paidAmount = (studentFeeDetails?.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
            const currentYearDue = totalPayable - paidAmount;
            const previousDue = student.previousDue || 0;
            const netDue = currentYearDue + previousDue;

            return [
                student.admissionNumber,
                `"${student.firstName} ${student.lastName}"`,
                `"${student.className}-${student.sectionName}"`,
                student.rollNo,
                `"${family.name}"`,
                family.phone,
                annualFee,
                concession,
                totalPayable,
                paidAmount,
                currentYearDue,
                previousDue,
                netDue
            ].join(',');
        });
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'fee-summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
            placeholder="Search by parent name, phone, or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-lg"
        />
        <Button onClick={handleExportCSV} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Export to CSV
        </Button>
      </div>
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
