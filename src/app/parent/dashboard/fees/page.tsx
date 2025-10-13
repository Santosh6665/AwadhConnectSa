
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getParentByMobile, getStudentByAdmissionNumber, getFeeStructure } from '@/lib/firebase/firestore';
import type { Student, FeeStructure } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import FeeDetailsDialog from '@/components/dashboard/fees/fee-details-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { calculateTotalDueForFamily, calculateDuesForStudent } from '@/lib/utils';
import FamilyDueCard from '@/components/parent/family-due-card';

export default function ParentFeePage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [feeStructure, setFeeStructure] = useState<{ [key: string]: FeeStructure } | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalFamilyDue, setTotalFamilyDue] = useState(0);
  
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

            if (structureData) {
              const totalDue = calculateTotalDueForFamily(validStudents, structureData);
              setTotalFamilyDue(totalDue);
            }
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
        <h1 className="text-3xl font-headline font-bold">Fee Management</h1>
        <p className="text-muted-foreground">
          Review fee payments, and outstanding dues for your children.
        </p>
      </div>

      <FamilyDueCard totalDue={totalFamilyDue} />

      <Card>
        <CardHeader>
            <CardTitle>Individual Fee Details</CardTitle>
            <CardDescription>An overview of fee payments and outstanding dues for each of your children.</CardDescription>
        </CardHeader>
        <CardContent>
            {children.length > 0 ? (
                <div className="space-y-4">
                {children.map(child => {
                    const { currentSessionDue, previousDue, totalDue } = calculateDuesForStudent(child, feeStructure);
                    return (
                    <Card key={child.admissionNumber} className='overflow-hidden'>
                        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${child.firstName} ${child.lastName}`} alt={child.firstName} />
                                <AvatarFallback>{child.firstName[0]}{child.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-semibold">{child.firstName} {child.lastName}</p>
                            <p className="text-sm text-muted-foreground">Class: {child.className}-{child.sectionName}</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
                            <div className="grid grid-cols-3 gap-x-4 text-right flex-grow">
                              <div>
                                  <p className="text-sm text-muted-foreground">Current Due</p>
                                  <p className='font-mono text-lg font-bold text-destructive'>
                                    &#8377; {currentSessionDue.toLocaleString('en-IN')}
                                  </p>
                              </div>
                              <div>
                                  <p className="text-sm text-muted-foreground">Previous Due</p>
                                  <p className='font-mono text-lg font-bold text-destructive'>
                                    &#8377; {previousDue.toLocaleString('en-IN')}
                                  </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Due</p>
                                  <p className={`font-mono text-lg font-bold ${totalDue > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                      &#8377; {totalDue.toLocaleString('en-IN')}
                                  </p>
                              </div>
                            </div>
                            <Button onClick={() => handleViewDetails(child)} variant="outline" className="w-full sm:w-auto">
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
                <p className="text-muted-foreground text-center py-8">No children found linked to your account.</p>
            )}
        </CardContent>
      </Card>
      
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
