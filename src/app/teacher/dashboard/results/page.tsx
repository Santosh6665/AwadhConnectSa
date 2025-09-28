
'use client';
import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getTeacherById, getStudents, saveStudentResults } from '@/lib/firebase/firestore';
import type { Teacher, Student, ExamResult, SubjectResult, ExamType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const examTypes: ExamType[] = ['Quarterly', 'Half-Yearly', 'Annual'];
const subjectsByClass: { [key: string]: string[] } = {
  '1': ['English', 'Hindi', 'Mathematics', 'Science'],
  // ... add all classes
  '10': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
};

export default function EnterResultsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, startTransition] = useTransition();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamType | ''>('');

  const [subjectMarks, setSubjectMarks] = useState<SubjectResult[]>([]);

  useEffect(() => {
    if (user?.id) {
      getTeacherById(user.id).then(setTeacher);
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      const [className, sectionName] = selectedClass.match(/^(\d+|[a-zA-Z]+)([A-Z])$/)?.slice(1) || [];
      getStudents({ className, sectionName, status: 'Active' }).then(setStudents);
      setSelectedStudent(null); // Reset student on class change
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      const subjectsForClass = subjectsByClass[selectedStudent.className] || subjectsByClass['10'];
      const initialMarks = subjectsForClass.map(subjectName => ({
        subjectName,
        maxMarks: 100,
        obtainedMarks: 0,
      }));
      setSubjectMarks(initialMarks);
    } else {
      setSubjectMarks([]);
    }
  }, [selectedStudent]);

  const handleMarksChange = (subjectName: string, obtainedMarks: number) => {
    setSubjectMarks(prevMarks =>
      prevMarks.map(mark =>
        mark.subjectName === subjectName
          ? { ...mark, obtainedMarks: isNaN(obtainedMarks) ? 0 : obtainedMarks }
          : mark
      )
    );
  };

  const handleSaveResults = () => {
    if (!selectedStudent || !selectedExam || !selectedStudent.session) {
        toast({ title: "Error", description: "Please select a student, session, and exam type.", variant: "destructive" });
        return;
    }
    
    const hasInvalidMarks = subjectMarks.some(m => m.obtainedMarks > m.maxMarks || m.obtainedMarks < 0);
    if(hasInvalidMarks) {
        toast({ title: "Invalid Marks", description: "Obtained marks cannot be negative or exceed maximum marks.", variant: "destructive"});
        return;
    }

    startTransition(async () => {
        try {
            const resultData: ExamResult = {
                examType: selectedExam,
                subjects: subjectMarks,
            };
            await saveStudentResults(selectedStudent.admissionNumber, selectedStudent.session, resultData);
            toast({ title: "Success", description: "Results saved successfully." });
        } catch (error) {
            console.error("Error saving results:", error);
            toast({ title: "Error", description: "Failed to save results.", variant: "destructive" });
        }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Enter Student Results</h1>
        <p className="text-muted-foreground">
          Select a student and exam to enter or update their marks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selection</CardTitle>
          <CardDescription>Choose the class, student, and exam to enter marks for.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>{teacher?.classes?.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={(admNo) => setSelectedStudent(students.find(s => s.admissionNumber === admNo) || null)} value={selectedStudent?.admissionNumber || ''} disabled={!selectedClass}>
            <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.admissionNumber} value={s.admissionNumber}>
                  {s.firstName} {s.lastName} ({s.rollNo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(val) => setSelectedExam(val as ExamType)} value={selectedExam} disabled={!selectedStudent}>
            <SelectTrigger><SelectValue placeholder="Select Exam Type" /></SelectTrigger>
            <SelectContent>{examTypes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Marks for {selectedStudent.firstName} - {selectedExam}</CardTitle>
            <CardDescription>Session: {selectedStudent.session}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-40">Maximum Marks</TableHead>
                    <TableHead className="w-40">Obtained Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectMarks.map(mark => (
                    <TableRow key={mark.subjectName}>
                      <TableCell className="font-medium">{mark.subjectName}</TableCell>
                      <TableCell>{mark.maxMarks}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={mark.obtainedMarks}
                          onChange={(e) => handleMarksChange(mark.subjectName, parseInt(e.target.value, 10))}
                          max={mark.maxMarks}
                          min={0}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button className="mt-6" onClick={handleSaveResults} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
