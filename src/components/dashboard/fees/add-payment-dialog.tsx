
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student, FeeReceipt } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function AddPaymentDialog({ isOpen, onOpenChange, student, onSave, isSaving }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; student: Student | null; onSave: (amount: number, mode: FeeReceipt['mode'], remarks: string) => void; isSaving: boolean; }) {
  const [amount, setAmount] = React.useState('');
  const [mode, setMode] = React.useState<FeeReceipt['mode']>('Cash');
  const [remarks, setRemarks] = React.useState('');

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onSave(parsedAmount, mode, remarks);
    } else {
      alert('Please enter a valid amount.');
    }
  };
  
  React.useEffect(() => {
    if(!isOpen) {
        setAmount('');
        setMode('Cash');
        setRemarks('');
    }
  }, [isOpen]);

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Fee Payment</DialogTitle>
          <DialogDescription>
            Record a new payment for {student.firstName} {student.lastName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 5000" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="mode">Payment Mode</Label>
                 <Select onValueChange={(value: FeeReceipt['mode']) => setMode(value)} value={mode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g., Late fee waiver" />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
