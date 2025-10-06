
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getStudentByAdmissionNumber, getFeeStructure } from '@/lib/firebase/firestore';
import type { Student, FeeStructure } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Banknote, Landmark, Percent } from 'lucide-react';
import FeeDetailsDialog from '@/components/dashboard/fees/fee-details-dialog';
import StatCard from '@/components/dashboard/stat-card';

const calculateDues = (student: Student | null, defaultStructure: { [key: string]: FeeStructure } | null) => {
    if (!student || !defaultStructure) return { totalPaid: 0, totalDue: 0, collectionPercentage: 0 };

    let totalExpected = 0;
    let totalPaid = 0;

    Object.keys(student.fees || {}).forEach(className => {
        const studentFeeData = student.fees[className];
        const structure = studentFeeData.structure || defaultStructure[className];
        
        if(structure){
            const annualFee = Object.values(structure).reduce((sum, head) => sum + (head.amount * head.months), 0);
            const concession = studentFeeData.concession || 0;
            totalExpected += (annualFee - concession);
        }
        
        totalPaid += (studentFeeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
    });

    totalExpected += (student.previousDue || 0);

    const totalDue = Math.max(0, totalExpected - totalPaid);
    const collectionPercentage = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 100;
    
    return { totalPaid, totalDue, collectionPercentage };
};


export default function StudentFeePage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [feeStructure, setFeeStructure] = useState<{ [key: string]: FeeStructure } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (user?.id) {
        try {
          const [studentData, structureData] = await Promise.all([
            getStudentByAdmissionNumber(user.id),
            getFeeStructure()
          ]);
          setStudent(studentData);
          setFeeStructure(structureData);
        } catch (error) {
          console.error("Failed to fetch student fee data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!student) {
    return <p className="text-muted-foreground">Could not load fee details.</p>;
  }

  const { totalPaid, totalDue, collectionPercentage } = calculateDues(student, feeStructure);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Fee Details</h1>
        <p className="text-muted-foreground">
          An overview of your fee payments and outstanding dues.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Paid" value={`Rs ${totalPaid.toLocaleString()}`} icon={Banknote} description="Across all sessions"/>
        <StatCard title="Total Outstanding" value={`Rs ${totalDue.toLocaleString()}`} icon={Landmark} />
        <StatCard title="Payment Status" value={`${collectionPercentage.toFixed(2)}% Paid`} icon={Percent} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee History</CardTitle>
          <CardDescription>
            View a detailed breakdown of all your fee transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            For a complete history of all payments made and a summary of your fee structure, please open the full receipt view.
          </p>
          <Button onClick={() => setIsDetailsOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            View Full Receipt
          </Button>
        </CardContent>
      </Card>
      
      <FeeDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        student={student}
        defaultFeeStructure={feeStructure}
      />
    </div>
  );
}
