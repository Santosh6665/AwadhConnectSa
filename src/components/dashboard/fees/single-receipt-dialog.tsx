
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Mail, Phone } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import type { Student, FeeReceipt } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const DetailItem = ({ label, value, className }: { label: string; value: React.ReactNode, className?: string }) => (
    <div className={cn("grid grid-cols-2 gap-4 items-start py-1", className)}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold text-end">{value || 'N/A'}</span>
    </div>
);

interface SingleReceiptDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: Student;
  receipt: FeeReceipt & { className?: string };
  balanceDue: number;
}

export default function SingleReceiptDialog({ isOpen, onOpenChange, student, receipt, balanceDue }: SingleReceiptDialogProps) {
  const receiptRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <div ref={receiptRef} className="p-8">
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-4">
                  <Image src="/logo.png" alt="School Logo" width={48} height={48} className="h-12 w-12" />
                  <div>
                      <h1 className="text-2xl font-bold font-headline">Awadh Inter College</h1>
                      <p className="text-sm text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                  </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold font-headline">Fee Receipt</h2>
                <p className="text-sm text-muted-foreground">Session: {student.session}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid sm:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold text-muted-foreground mb-2">Student Details</h3>
                    <DetailItem label="Name:" value={`${student.firstName} ${student.lastName}`} className="grid-cols-[auto_1fr] text-left" />
                    <DetailItem label="Class:" value={`${receipt.className || student.className}-${student.sectionName}`} className="grid-cols-[auto_1fr] text-left" />
                    <DetailItem label="Father's Name:" value={student.parentName} className="grid-cols-[auto_1fr] text-left" />
                </div>
                 <div className="text-right">
                    <h3 className="font-semibold text-muted-foreground mb-2">Receipt Details</h3>
                    <DetailItem label="Transaction ID:" value={receipt.id} />
                    <DetailItem label="Payment Date:" value={receipt.date} />
                    <DetailItem label="Payment Mode:" value={receipt.mode} />
                </div>
            </div>
            
            <div className="mt-8">
                 <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <DetailItem label="Amount Paid:" value={<span className="text-xl font-bold">Rs {receipt.amount.toLocaleString()}</span>} />
                    {receipt.remarks && <DetailItem label="Remarks:" value={receipt.remarks} />}
                    <Separator/>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-base font-bold">Remaining Balance after this transaction:</span>
                        <span className="text-xl font-bold text-destructive">Rs {balanceDue.toLocaleString()}</span>
                    </div>
                 </div>
            </div>
            
             <div className="mt-12 text-center text-xs text-muted-foreground print:block">
              <p>This is a computer-generated receipt and does not require a signature.</p>
              <div className="flex justify-center items-center gap-4 mt-2">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> info@awadhcollege.edu</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> +91 6393071946</span>
              </div>
            </div>

        </div>
        <DialogFooter className="p-4 border-t no-print">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" />Print Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
