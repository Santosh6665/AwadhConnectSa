
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
import { subjectsByClass } from './subjects-schema';

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
    if (isOpen && student && examType) {
      const classResults = student.results?.[student.className];
      const existingExamResults = classResults?.examResults?.[examType];
      
      const subjectsForClass = subjectsByClass[student.className as keyof typeof subjectsByClass] || [];

      if (existingExamResults && existingExamResults.subjects.length > 0) {
        const orderedSubjects = subjectsForClass.map(subjectName => {
          const existingSubject = existingExamResults.subjects.find(s => s.subjectName === subjectName);
          return existingSubject || { subjectName, maxMarks: 100, obtainedMarks: 0 };
        });
        replace(orderedSubjects);
      } else {
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
    if (!student?.className) {
      toast({ title: "Error", description: "Student class not found.", variant: "destructive" });
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
        await saveStudentResults(student.admissionNumber, student.className, resultData);
        
        const updatedStudent = { ...student };
        if (!updatedStudent.results) updatedStudent.results = {};
        if (!updatedStudent.results[student.className]) updatedStudent.results[student.className] = { examResults: {} };
        if (!updatedStudent.results[student.className].examResults) updatedStudent.results[student.className].examResults = {};
        
        updatedStudent.results[student.className].examResults[examType] = resultData;

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
