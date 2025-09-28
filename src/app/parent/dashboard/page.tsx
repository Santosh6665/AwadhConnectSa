
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getParentByMobile, getStudentByAdmissionNumber } from '@/lib/firebase/firestore';
import type { Parent, Student } from '@/lib/types';
import { Loader2, User as UserIcon, BookOpen, Calendar, Banknote, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ChildProfileCard from '@/components/parent/child-profile-card';

export default function ParentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [parent, setParent] = useState<Parent | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      const fetchParentData = async () => {
        setLoading(true);
        const parentData = await getParentByMobile(user.id!);
        setParent(parentData);

        if (parentData?.children) {
            const studentPromises = parentData.children.map(getStudentByAdmissionNumber);
            const studentResults = await Promise.all(studentPromises);
            const validStudents = studentResults.filter((s): s is Student => s !== null);
            setChildren(validStudents);
        }

        setLoading(false);
      };
      fetchParentData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!parent) {
      return <div>Could not load parent data.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {parent.name}!</p>
      </div>

      <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
                <div>
                    <CardTitle>My Children</CardTitle>
                    <CardDescription>An overview of your children's profiles.</CardDescription>
                </div>
            </div>
          </CardHeader>
      </Card>

      <div className="space-y-6">
        {children.length > 0 ? (
          children.map(child => <ChildProfileCard key={child.admissionNumber} student={child} />)
        ) : (
          <p className="text-muted-foreground text-center">No children found linked to this account.</p>
        )}
      </div>

    </div>
  );
}
