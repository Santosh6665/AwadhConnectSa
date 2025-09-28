
'use client';
import * as React from 'react';
import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { Student, ExamResult, ExamType } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { saveStudentResults } from '@/lib/firebase/firestore';

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

interface EditMarksDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student;
  examType: ExamType;
  onSave: (updatedStudent: Student) => void;
}

type MarksFormData = {
  subjects: {
    subjectName: string;
    maxMarks: number;
    obtainedMarks: number;
  }[];
};

export default function EditMarksDialog({ isOpen, onOpenChange, student, examType, onSave }: EditMarksDialogProps) {
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<MarksFormData>();
  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });

  React.useEffect(() => {
    if (student && examType) {
      const sessionResults = student.results?.[student.session];
      const existingExamResults = sessionResults?.examResults?.[examType];

      if (existingExamResults) {
        replace(existingExamResults.subjects);
      } else {
        const subjectsForClass = subjectsByClass[student.className] || [];
        const initialMarks = subjectsForClass.map(subjectName => ({
          subjectName,
          maxMarks: 100,
          obtainedMarks: 0,
        }));
        replace(initialMarks);
      }
    }
  }, [isOpen, student, examType, replace]);

  const onSubmit = (data: MarksFormData) => {
    if (!student?.session) {
      toast({ title: "Error", description: "Student session not found.", variant: "destructive" });
      return;
    }
    
    const hasInvalidMarks = data.subjects.some(m => m.obtainedMarks > m.maxMarks || m.obtainedMarks < 0);
    if(hasInvalidMarks) {
        toast({ title: "Invalid Marks", description: "Obtained marks cannot exceed maximum marks.", variant: "destructive"});
        return;
    }

    startTransition(async () => {
      try {
        const resultData: ExamResult = {
          examType: examType,
          subjects: data.subjects,
        };
        await saveStudentResults(student.admissionNumber, student.session, resultData);
        
        // Optimistically update the student object to reflect in the UI
        const updatedStudent = { ...student };
        if (!updatedStudent.results) updatedStudent.results = {};
        if (!updatedStudent.results[student.session]) updatedStudent.results[student.session] = { examResults: {} };
        if (!updatedStudent.results[student.session].examResults) updatedStudent.results[student.session].examResults = {};
        
        updatedStudent.results[student.session].examResults[examType] = resultData;

        onSave(updatedStudent);
        onOpenChange(false);
        toast({ title: "Success", description: `Marks for ${examType} saved successfully.` });
      } catch (error) {
        console.error("Error saving results:", error);
        toast({ title: "Error", description: "Failed to save results.", variant: "destructive" });
      }
    });
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Marks: {student.firstName} - {examType}</DialogTitle>
          <DialogDescription>
            Enter or update the marks for each subject for the {examType} exam.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-36">Obtained Marks</TableHead>
                    <TableHead className="w-36">Maximum Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.subjectName}</TableCell>
                      <TableCell>
                        <Controller
                          control={form.control}
                          name={`subjects.${index}.obtainedMarks`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}
                              max={form.getValues(`subjects.${index}.maxMarks`)}
                              min={0}
                            />
                          )}
                        />
                      </TableCell>
                       <TableCell>
                         <Controller
                          control={form.control}
                          name={`subjects.${index}.maxMarks`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value, 10) || 100)}
                            />
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Results
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
