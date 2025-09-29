
'use client';

import { useState, useEffect } from 'react';
import type { StudyMaterial } from '@/lib/types';
import { getStudyMaterials, toggleMaterialCompleted, getStudentByAdmissionNumber } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import StudentMaterialList from '@/components/dashboard/materials/student-material-list';

export default function StudentMaterialsPage() {
  const { user } = useAuth();
  const [allMaterials, setAllMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  
  const [studentClassName, setStudentClassName] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const student = await getStudentByAdmissionNumber(user.id);
            if (student) {
                setStudentClassName(student.className);
                const materials = await getStudyMaterials({ className: student.className });
                setAllMaterials(materials);
                setFilteredMaterials(materials);
            }
        } catch (error) {
            console.error("Failed to fetch study materials:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    let materials = allMaterials;
    if (searchTerm) {
        materials = materials.filter(m => 
            m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.topic.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (subjectFilter !== 'all') {
        materials = materials.filter(m => m.subject === subjectFilter);
    }
    setFilteredMaterials(materials);
  }, [searchTerm, subjectFilter, allMaterials]);

  const handleToggleComplete = async (materialId: string) => {
    if (!user?.id) return;

    // Optimistic update
    const originalMaterials = [...allMaterials];
    const newMaterials = allMaterials.map(m => {
        if (m.id === materialId) {
            const completedBy = m.completedBy || [];
            const isCompleted = completedBy.includes(user.id!);
            return {
                ...m,
                completedBy: isCompleted 
                    ? completedBy.filter(id => id !== user.id)
                    : [...completedBy, user.id!]
            };
        }
        return m;
    });
    setAllMaterials(newMaterials);

    try {
        await toggleMaterialCompleted(materialId, user.id);
    } catch (error) {
        console.error("Failed to update status:", error);
        // Revert on error
        setAllMaterials(originalMaterials);
    }
  };

  const availableSubjects = ['all', ...new Set(allMaterials.map(m => m.subject))];

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-headline font-bold">Study Materials</h1>
        <p className="text-muted-foreground">Find resources uploaded by your teachers for Class {studentClassName}.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Find Materials</CardTitle>
            <CardDescription>Search and filter to find the resources you need.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by title, topic..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                    {availableSubjects.map(sub => <SelectItem key={sub} value={sub}>{sub === 'all' ? 'All Subjects' : sub}</SelectItem>)}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <StudentMaterialList 
            materials={filteredMaterials} 
            studentId={user?.id || ''} 
            onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
}
