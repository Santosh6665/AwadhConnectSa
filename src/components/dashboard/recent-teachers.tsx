'use client';

import * as React from 'react';
import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import TeacherDetailDialog from './admin/teachers/teacher-detail-dialog';
import { BookUser } from 'lucide-react';

export default function RecentTeachers({ teachers }: { teachers: Teacher[] }) {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailDialogOpen(true);
  };

  const recentTeachers = teachers.slice(0, 5);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Hires</CardTitle>
            <CardDescription>The latest additions to our faculty.</CardDescription>
          </div>
          <BookUser className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTeachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://picsum.photos/seed/${teacher.id}/100/100`} alt={teacher.name} />
                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{teacher.name}</p>
                <p className="text-sm text-muted-foreground">{teacher.designation}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleViewTeacher(teacher)}>
                View
              </Button>
            </div>
          ))}
           <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/teachers">View All Teachers</Link>
            </Button>
        </CardContent>
      </Card>
      <TeacherDetailDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        teacher={selectedTeacher}
      />
    </>
  );
}
