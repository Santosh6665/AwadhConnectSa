
'use client';
import * as React from 'react';
import { useTransition } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { FeeStructure } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveFeeStructure } from '@/lib/firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const feeHeadSchema = z.object({
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  months: z.coerce.number().min(0).max(12),
});

const classFeeSchema = z.object({
  'Tuition Fee': feeHeadSchema,
  'Transport Fee': feeHeadSchema,
  'Computer Fee': feeHeadSchema,
  'Admission Fee': feeHeadSchema,
  'Exam Fee': feeHeadSchema,
  'Miscellaneous/Enrolment': feeHeadSchema,
});

const feeStructureSchema = z.object({
  classes: z.record(classFeeSchema),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

const classNames = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const feeHeads: (keyof z.infer<typeof classFeeSchema>)[] = [
  'Tuition Fee',
  'Transport Fee',
  'Computer Fee',
  'Admission Fee',
  'Exam Fee',
  'Miscellaneous/Enrolment',
];
const monthOptions = Array.from({ length: 13 }, (_, i) => i);


export default function FeeStructureForm({ initialData }: { initialData: FeeStructure | null }) {
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
        classes: classNames.reduce((acc, className) => {
            acc[className] = feeHeads.reduce((classAcc, head) => {
                classAcc[head] = {
                    amount: initialData?.[className]?.[head]?.amount || 0,
                    months: initialData?.[className]?.[head]?.months ?? (head === 'Tuition Fee' ? 12 : 1),
                };
                return classAcc;
            }, {} as z.infer<typeof classFeeSchema>);
            return acc;
        }, {} as Record<string, z.infer<typeof classFeeSchema>>),
    }
  });

  const onSubmit = (data: FeeStructureFormData) => {
    startTransition(async () => {
      try {
        await saveFeeStructure(data.classes);
        toast({
          title: 'Success',
          description: 'Fee structure saved successfully.',
        });
      } catch (error) {
        console.error('Error saving fee structure:', error);
        toast({
          title: 'Error',
          description: 'Failed to save fee structure.',
          variant: 'destructive',
        });
      }
    });
  };
  
  const calculateAnnualTotal = (className: string) => {
      const classData = form.watch(`classes.${className}`);
      if (!classData) return 0;
      return feeHeads.reduce((total, head) => {
        const feeHead = classData[head];
        return total + (feeHead.amount * feeHead.months);
      }, 0);
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Class-wise Fee Structure Defaults</CardTitle>
            <CardDescription>
                 <Alert variant="default" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Enter the base amount for each fee head here (e.g., monthly tuition fee). Annual totals are calculated automatically based on the multiplier.
                    </AlertDescription>
                 </Alert>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="Nursery">
              {classNames.map((className) => (
                <AccordionItem value={className} key={className}>
                  <AccordionTrigger className="font-semibold text-lg">
                    <div className="flex justify-between w-full pr-4">
                        <span>Class {className}</span>
                        <span className="text-muted-foreground font-mono text-base">
                            Annual: Rs {calculateAnnualTotal(className).toLocaleString()}
                        </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 p-4 border rounded-md">
                      {feeHeads.map((head) => (
                        <div key={head} className="space-y-2">
                           <FormLabel>{head}</FormLabel>
                           <div className="flex gap-2">
                             <FormField
                                control={form.control}
                                name={`classes.${className}.${head}.amount`}
                                render={({ field }) => (
                                  <FormItem className="flex-grow">
                                    <FormControl>
                                      <Input type="number" placeholder="Amount (Rs)" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`classes.${className}.${head}.months`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                                        <FormControl>
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='h-[300px]'>
                                            {monthOptions.map(m => (
                                                <SelectItem key={m} value={m.toString()}>x {m} mo</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                           </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
