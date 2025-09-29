
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Student, FeeStructure, FeeReceipt, PreviousSession } from '@/lib/types';
import { Download, GraduationCap, Mail, Phone, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import SingleReceiptDialog from './single-receipt-dialog';

const DetailItem = ({ label, value, className }: { label: string; value: React.ReactNode, className?: string }) => (
    <div className={cn("grid grid-cols-2 gap-4 items-start py-1", className)}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold text-end">{value || 'N/A'}</span>
    </div>
);


export default function FeeDetailsDialog({ isOpen, onOpenChange, student, defaultFeeStructure }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; student: Student | null; defaultFeeStructure: FeeStructure | null }) {
  const receiptRef = React.useRef(null);
  const handlePrint = useReactToPrint({
      contentRef: () => receiptRef.current,
  });

  const [selectedReceipt, setSelectedReceipt] = React.useState<FeeReceipt | null>(null);
  const [isSingleReceiptOpen, setIsSingleReceiptOpen] = React.useState(false);

  const handlePrintSingle = (receipt: FeeReceipt) => {
    setSelectedReceipt(receipt);
    setIsSingleReceiptOpen(true);
  };


  if (!student) return null;
  
  const currentTransactions = student.fees?.[student.session]?.transactions || [];
  
  const studentFeeData = student.fees?.[student.session];
  const studentStructure = studentFeeData?.structure || defaultFeeStructure?.[student.className] || {};

  const annualFee = Object.values(studentStructure).reduce((sum, head) => sum + (head.amount * head.months), 0);
  const concession = studentFeeData?.concession || 0;
  const totalPaid = currentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const previousDue = (student.previousSessions || []).reduce((sum, session) => sum + session.dueFee, 0);
  const balanceDue = Math.max(0, annualFee - concession - totalPaid + previousDue);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div ref={receiptRef} className="p-8 max-h-[90vh] print:max-h-none overflow-y-scroll no-scrollbar">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-4">
                  <GraduationCap className="h-12 w-12 text-primary" />
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
                    <DetailItem label="Class:" value={`${student.className}-${student.sectionName}`} className="grid-cols-[auto_1fr] text-left" />
                    <DetailItem label="Roll No:" value={student.rollNo} className="grid-cols-[auto_1fr] text-left" />
                    <DetailItem label="Father's Name:" value={student.parentName} className="grid-cols-[auto_1fr] text-left" />
                </div>
                 <div className="text-right">
                    <h3 className="font-semibold text-muted-foreground mb-2">Receipt Details</h3>
                    <DetailItem label="Receipt Date:" value={new Date().toLocaleDateString('en-GB')} />
                    <DetailItem label="Student ID:" value={student.admissionNumber} />
                </div>
            </div>
            
            <div className="mt-8">
                <h3 className="font-semibold text-muted-foreground mb-2">Payment History for {student.session}</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Remarks</TableHead><TableHead className="no-print">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {currentTransactions.length > 0 ? (
                            currentTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell>₹{tx.amount.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant="secondary">{tx.mode}</Badge></TableCell>
                                    <TableCell>{tx.remarks}</TableCell>
                                    <TableCell className="no-print">
                                        <Button variant="ghost" size="icon" onClick={() => handlePrintSingle(tx)}>
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">No payments recorded for this session.</TableCell></TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="font-semibold text-muted-foreground mb-2">Fee Structure Details</h3>
                    <div className="border rounded-lg p-4 space-y-2">
                        {Object.entries(studentStructure).map(([key, value]) => (
                            <DetailItem key={key} label={`${key}:`} value={`₹${value.amount.toLocaleString()}`} />
                        ))}
                        <Separator/>
                         <DetailItem label="Concession:" value={`- ₹${concession.toLocaleString()}`} />
                    </div>
                </div>
                <div className="space-y-4">
                     <h3 className="font-semibold text-muted-foreground mb-2">Summary</h3>
                     <div className="border rounded-lg p-4 space-y-3">
                        <DetailItem label="Annual Fee:" value={`₹${annualFee.toLocaleString()}`} />
                        <DetailItem label="Total Paid:" value={`₹${totalPaid.toLocaleString()}`} />
                        <Separator/>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-bold">Balance Due:</span>
                            <span className="text-2xl font-bold text-destructive">₹{balanceDue.toLocaleString()}</span>
                        </div>
                     </div>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-muted-foreground print:block">
              <p>This is a computer-generated receipt and does not require a signature. If you have any questions, please contact the school office.</p>
              <div className="flex justify-center items-center gap-4 mt-2">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> info@awadhcollege.edu</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> +91 6393071946</span>
              </div>
            </div>
        </div>

        <DialogFooter className="p-4 border-t no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" />Print Summary</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {selectedReceipt && (
        <SingleReceiptDialog
            isOpen={isSingleReceiptOpen}
            onOpenChange={setIsSingleReceiptOpen}
            student={student}
            receipt={selectedReceipt}
            balanceDue={balanceDue}
        />
    )}
    </>
  );
}
