
'use client';
import * as React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { StudyMaterial } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { subjectsByClass } from '../common/subjects-schema';

const materialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  className: z.string().min(1, 'Class is required'),
  sectionName: z.string().min(1, 'Section is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic/Link is required'),
  materialType: z.enum(['file', 'link']),
});

type FormData = z.infer<typeof materialSchema>;

interface AddEditMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: StudyMaterial | null;
  onSave: (data: any, file?: File | null) => void;
  isSaving: boolean;
  teacherClasses: string[];
  teacherSubjects: string[];
}

export default function AddEditMaterialDialog({ isOpen, onOpenChange, item, onSave, isSaving, teacherClasses, teacherSubjects }: AddEditMaterialDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(materialSchema),
  });

  const parseClassSection = (classSection: string) => {
    if (!classSection) return { className: '', sectionName: '' };
    const classPartMatch = classSection.match(/^(\d+|[a-zA-Z]+)/);
    const className = classPartMatch ? classPartMatch[0] : '';
    const sectionName = classSection.replace(className, '');
    return { className, sectionName };
  };

  React.useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset({
          title: item.title,
          description: item.description,
          className: item.className,
          sectionName: item.sectionName,
          subject: item.subject,
          topic: item.materialType === 'link' ? item.fileUrl : item.topic,
          materialType: item.materialType,
        });
      } else {
        form.reset({
          title: '',
          description: '',
          className: '',
          sectionName: '',
          subject: '',
          topic: '',
          materialType: 'file',
        });
      }
      setFile(null);
    }
  }, [isOpen, item, form]);

  const onSubmit = (data: FormData) => {
    const { className: parsedClassName, sectionName } = parseClassSection(data.className);
    
    const saveData = {
      title: data.title,
      description: data.description,
      className: parsedClassName,
      sectionName: sectionName,
      subject: data.subject,
      topic: data.topic,
      materialType: data.materialType,
      visibleTo: ['student', 'parent'],
    };

    onSave(saveData, file);
  };
  
  const selectedClass = form.watch('className');
  const materialType = form.watch('materialType');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit' : 'Add'} Study Material</DialogTitle>
          <DialogDescription>
            Fill in the details for the learning resource.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            
            <FormField name="materialType" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Material Type</FormLabel>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="file" id="file" /></FormControl><Label htmlFor="file">File Upload</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="link" id="link" /></FormControl><Label htmlFor="link">Video/Web Link</Label></FormItem>
                </RadioGroup>
              <FormMessage /></FormItem>
            )}/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="title" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Chapter 1 Notes" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="topic" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>{materialType === 'file' ? 'Topic' : 'URL'}</FormLabel><FormControl><Input placeholder={materialType === 'file' ? "e.g., Photosynthesis" : "https://youtube.com/watch?v=..."} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
             <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief overview of the material." {...field} rows={3} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="className" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Class</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl><SelectContent>{teacherClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )}/>
                <FormField name="subject" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Subject</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedClass}><FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {teacherSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
            </div>

            {materialType === 'file' && (
                 <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl><Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} /></FormControl>
                    {item?.materialType === 'file' && item.fileUrl && !file && (
                        <p className="text-sm text-muted-foreground">Current file: <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View File</a>. Upload a new file to replace it.</p>
                    )}
                 </FormItem>
            )}

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Material
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
