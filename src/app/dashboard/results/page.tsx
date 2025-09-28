
'use client';
import { useState, useEffect, useTransition } from 'react';
import { getStudents, saveStudentResults } from '@/lib/firebase/firestore';
import type { Student, ExamResult, SubjectResult, ExamType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const examTypes: ExamType[] = ['Quarterly', 'Half-Yearly', 'Annual'];
const classOptions = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const sectionOptions = ["A", "B", "C"];

const subjectsByClass: { [key: string]: string[] } = {
  '1': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '2': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '3': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '4': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '5': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '6': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '7': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '8': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '9': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '10': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  '11': ['English', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'Computer'],
  '12': ['English', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'Computer'],
  'Nursery': ['Oral', 'English', 'Hindi', 'Mathematics'],
  'LKG': ['Oral', 'English', 'Hindi', 'Mathematics'],
  'UKG': ['Oral', 'English', 'Hindi', 'Mathematics'],
};

export default function AdminEnterResultsPage() {
  const { toast } = useToast();
  const [isSaving, startTransition] = useTransition();

  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamType | ''>('');

  const [subjectMarks, setSubjectMarks] = useState<SubjectResult[]>([]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      getStudents({ className: selectedClass, sectionName: selectedSection, status: 'Active' }).then(setStudents);
      setSelectedStudent(null);
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (selectedStudent && selectedExam) {
      const sessionResults = selectedStudent.results?.[selectedStudent.session];
      const existingExamResults = sessionResults?.examResults?.[selectedExam];

      if (existingExamResults) {
        setSubjectMarks(existingExamResults.subjects);
        toast({ title: "Existing Marks Loaded", description: `Editing marks for ${selectedExam} exam.` });
      } else {
        const subjectsForClass = subjectsByClass[selectedStudent.className] || [];
        const initialMarks = subjectsForClass.map(subjectName => ({
          subjectName,
          maxMarks: 100,
          obtainedMarks: 0,
        }));
        setSubjectMarks(initialMarks);
      }
    } else {
      setSubjectMarks([]);
    }
  }, [selectedStudent, selectedExam, toast]);

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
        toast({ title: "Error", description: "Please select a student and exam type.", variant: "destructive" });
        return;
    }
    
    const hasInvalidMarks = subjectMarks.some(m => m.obtainedMarks > m.maxMarks || m.obtainedMarks < 0);
    if(hasInvalidMarks) {
        toast({ title: "Invalid Marks", description: "Obtained marks cannot exceed maximum marks.", variant: "destructive"});
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
        <h1 className="text-3xl font-headline font-bold">Manage Student Results</h1>
        <p className="text-muted-foreground">
          Select a class, student, and exam to enter or update marks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Select</CardTitle>
          <CardDescription>Choose the class, student, and exam to manage.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>{classOptions.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={setSelectedSection} value={selectedSection} disabled={!selectedClass}>
            <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
            <SelectContent>{sectionOptions.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={(admNo) => setSelectedStudent(students.find(s => s.admissionNumber === admNo) || null)} value={selectedStudent?.admissionNumber || ''} disabled={students.length === 0}>
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
