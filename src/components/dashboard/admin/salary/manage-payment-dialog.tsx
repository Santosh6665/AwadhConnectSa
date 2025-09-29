
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Teacher, SalaryPayment } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { saveSalaryPayment } from '@/lib/firebase/firestore';

const paymentSchema = z.object({
  status: z.enum(['Paid', 'Pending']),
  paymentDate: z.date().optional(),
  paymentMode: z.enum(['Bank Transfer', 'Cheque', 'Cash']).optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface ManagePaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teacher: Teacher;
  month: Date;
  payableAmount: number;
  existingPayment: SalaryPayment | null;
  onSave: (payment: SalaryPayment) => void;
}

export default function ManagePaymentDialog({
  isOpen,
  onOpenChange,
  teacher,
  month,
  payableAmount,
  existingPayment,
  onSave,
}: ManagePaymentDialogProps) {
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        status: existingPayment?.status || 'Pending',
        paymentDate: existingPayment?.paymentDate ? parse(existingPayment.paymentDate, 'dd/MM/yyyy', new Date()) : new Date(),
        paymentMode: existingPayment?.paymentMode || 'Bank Transfer',
      });
    }
  }, [isOpen, existingPayment, form]);
  
  const onSubmit = (data: PaymentFormData) => {
    startTransition(async () => {
      try {
        const paymentData: SalaryPayment = {
          id: `${teacher.id}_${month.getFullYear()}-${month.getMonth()}`,
          teacherId: teacher.id,
          year: month.getFullYear(),
          month: month.getMonth(),
          amount: payableAmount,
          status: data.status,
          paymentDate: data.paymentDate ? format(data.paymentDate, 'dd/MM/yyyy') : undefined,
          paymentMode: data.paymentMode,
        };
        await saveSalaryPayment(paymentData);
        onSave(paymentData);
        toast({ title: "Success", description: "Payment status updated." });
      } catch (error) {
        console.error("Failed to save payment:", error);
        toast({ title: "Error", description: "Could not update payment status.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Payment for {teacher.name}</DialogTitle>
          <DialogDescription>
            Update salary payment status for {format(month, 'MMMM yyyy')}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-3 bg-muted rounded-md text-center font-bold text-lg">
              Payable Amount: ₹{payableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch('status') === 'Paid' && (
              <div className="space-y-4 border-t pt-4">
                 <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
