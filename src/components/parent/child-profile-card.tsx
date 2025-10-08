
'use client';
import type { Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { ArrowRight, BarChart, CalendarCheck, Banknote } from 'lucide-react';
import Link from 'next/link';

// This type must match the one defined in the parent dashboard page
import type { ProcessedChild } from '@/app/parent/dashboard/page';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string; value: React.ReactNode }) => (
    <div className="flex items-center gap-3">
        <div className="bg-muted p-2 rounded-md">
            <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-semibold">{value}</div>
        </div>
    </div>
);

export default function ChildProfileCard({ student }: { student: ProcessedChild }) {

  const { feeStatus } = student;

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://picsum.photos/seed/${student.admissionNumber}/150`} alt={student.firstName} />
              <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{student.firstName} {student.lastName}</CardTitle>
              <CardDescription>
                Class: {student.className}-{student.sectionName} | Roll No: {student.rollNo}
              </CardDescription>
            </div>
          </div>
           <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href={`/parent/dashboard/child/${student.admissionNumber}`}>
                    View Full Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
           </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t">
           <DetailItem 
                icon={Banknote}
                label="Fee Status" 
                value={<Badge variant={feeStatus === 'Paid' ? 'default' : feeStatus === 'Due' ? 'destructive' : 'secondary'}>{feeStatus}</Badge>} 
           />
           <DetailItem 
                icon={CalendarCheck}
                label="Attendance (This Month)" 
                value={`${student.monthlyAttendance.toFixed(0)}%`}
            />
            <DetailItem 
                icon={BarChart}
                label="Recent Exam Score" 
                value={`${student.recentExamScore.toFixed(2)}% (Avg.)`}
            />
        </div>
      </CardContent>
    </Card>
  );
}
