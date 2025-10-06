
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getParentByMobile, getStudentByAdmissionNumber, getFeeStructure } from '@/lib/firebase/firestore';
import type { Student, Parent, FeeStructure } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, User } from 'lucide-react';
import FeeDetailsDialog from '@/components/dashboard/fees/fee-details-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const calculateDues = (student: Student, defaultStructure: { [key: string]: FeeStructure } | null) => {
    if (!defaultStructure) return { totalDue: 0 };
    
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
    
    return { totalDue };
};


export default function ParentFeePage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [feeStructure, setFeeStructure] = useState<{ [key: string]: FeeStructure } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (user?.id) {
        try {
          const [parentData, structureData] = await Promise.all([
            getParentByMobile(user.id),
            getFeeStructure()
          ]);
          setFeeStructure(structureData);
          
          if (parentData?.children) {
            const studentPromises = parentData.children.map(id => getStudentByAdmissionNumber(id));
            const studentResults = await Promise.all(studentPromises);
            const validStudents = studentResults.filter((s): s is Student => s !== null);
            setChildren(validStudents);
          }
        } catch (error) {
          console.error("Failed to fetch parent/fee data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Children's Fee Details</h1>
        <p className="text-muted-foreground">
          An overview of fee payments and outstanding dues for each of your children.
        </p>
      </div>

      {children.length > 0 ? (
        <div className="space-y-4">
          {children.map(child => {
             const { totalDue } = calculateDues(child, feeStructure);
            return (
              <Card key={child.admissionNumber}>
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://picsum.photos/seed/${child.admissionNumber}/100`} alt={child.firstName} />
                        <AvatarFallback>{child.firstName[0]}{child.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{child.firstName} {child.lastName}</p>
                      <p className="text-sm text-muted-foreground">Class: {child.className}-{child.sectionName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Due</p>
                        <p className={`font-mono text-lg font-bold ${totalDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                           ₹{totalDue.toLocaleString()}
                        </p>
                    </div>
                    <Button onClick={() => handleViewDetails(child)} variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">No children found linked to your account.</p>
      )}
      
      {selectedStudent && (
        <FeeDetailsDialog
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          student={selectedStudent}
          defaultFeeStructure={feeStructure}
        />
      )}
    </div>
  );
}
