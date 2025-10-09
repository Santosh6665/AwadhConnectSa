
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Student, FeeStructure, FeeReceipt } from '@/lib/types';
import { Download, Mail, Phone, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { parse } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SingleReceiptDialog from './single-receipt-dialog';
import Image from 'next/image';


const DetailItem = ({ label, value, className }: { label: string; value: React.ReactNode, className?: string }) => (
    <div className={cn("grid grid-cols-2 gap-4 items-start py-1", className)}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold text-end">{value || 'N/A'}</span>
    </div>
);


export default function FeeDetailsDialog({ isOpen, onOpenChange, student, defaultFeeStructure }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; student: Student | null; defaultFeeStructure: { [key: string]: FeeStructure } | null }) {
  const summaryReceiptRef = React.useRef(null);
  const handleSummaryPrint = useReactToPrint({
      contentRef: summaryReceiptRef,
  });

  const [selectedReceipt, setSelectedReceipt] = React.useState<FeeReceipt | null>(null);
  const [isSingleReceiptOpen, setIsSingleReceiptOpen] = React.useState(false);
  const [classFilter, setClassFilter] = React.useState<string>('all');

  React.useEffect(() => {
    if (student) {
        setClassFilter(student.className);
    }
  }, [student]);


  const handlePrintSingle = (receipt: FeeReceipt) => {
    setSelectedReceipt(receipt);
    setIsSingleReceiptOpen(true);
  };


  if (!student) return null;
  
  const allTransactions = Object.entries(student.fees || {}).flatMap(([className, feeData]) => 
    (feeData.transactions || []).map(tx => ({ ...tx, className }))
  ).sort((a, b) => parse(a.date, 'dd/MM/yyyy', new Date()).getTime() - parse(b.date, 'dd/MM/yyyy', new Date()).getTime());

  const filteredTransactions = classFilter === 'all' 
    ? allTransactions 
    : allTransactions.filter(tx => tx.className === classFilter);
  
  const classOptions = ['all', ...Object.keys(student.fees || {}).sort((a, b) => Number(b) - Number(a))];

  const classForSummary = classFilter === 'all' ? student.className : classFilter;

  const studentFeeData = student.fees?.[classForSummary];
  const studentStructure = studentFeeData?.structure || defaultFeeStructure?.[classForSummary] || {};

  const annualFee = Object.values(studentStructure).reduce((sum, head) => sum + (head.amount * head.months), 0);
  const concession = studentFeeData?.concession || 0;
  
  const currentClassTransactions = student.fees?.[classForSummary]?.transactions || [];
  const currentClassPaid = currentClassTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const previousDue = student.previousDue || 0;
  const currentClassDue = Math.max(0, annualFee - concession - currentClassPaid);
  const totalBalanceDue = currentClassDue + (classForSummary === student.className ? previousDue : 0);
  
  const totalPaidAllTime = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const previousSessionData = student.previousSessions?.find(s => s.className === classForSummary);

  const displayData = {
    session: previousSessionData?.session || student.session,
    className: previousSessionData?.className || student.className,
    sectionName: previousSessionData?.sectionName || student.sectionName,
    rollNo: previousSessionData?.rollNo || student.rollNo,
  };


  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
         <DialogHeader className="p-8 pb-0">
          <DialogTitle className="sr-only">Fee Receipt for {student.firstName}</DialogTitle>
        </DialogHeader>
        <div ref={summaryReceiptRef} className="p-8 pt-0 max-h-[90vh] print:max-h-none overflow-y-scroll no-scrollbar">
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
                <p className="text-sm text-muted-foreground">Session: {displayData.session}</p>
              </div>
            </div>

            <Separator className="my-6" />

             <div className="grid sm:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold text-muted-foreground mb-2">Student Details</h3>
                    <DetailItem label="Name:" value={`${student.firstName} ${student.lastName}`} className="grid-cols-[auto_1fr] text-left" />
                    <DetailItem label="Class:" value={`${displayData.className}-${displayData.sectionName}`} className="grid-cols-[auto_1fr] text-left" />
                    <DetailItem label="Roll No:" value={displayData.rollNo} className="grid-cols-[auto_1fr] text-left" />
                    <DetailItem label="Father's Name:" value={student.parentName} className="grid-cols-[auto_1fr] text-left" />
                </div>
                 <div className="text-right">
                    <h3 className="font-semibold text-muted-foreground mb-2">Receipt Details</h3>
                    <DetailItem label="Receipt Date:" value={new Date().toLocaleDateString('en-GB')} />
                    <DetailItem label="Student ID:" value={student.admissionNumber} />
                </div>
            </div>
            
            <div className="mt-8">
                <div className="flex justify-between items-center mb-2 no-print">
                    <h3 className="font-semibold text-muted-foreground">Payment History</h3>
                    <Select value={classFilter} onValueChange={setClassFilter} >
                        <SelectTrigger className="w-48"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {classOptions.map(c => (
                                <SelectItem key={c} value={c}>{c === 'all' ? 'All Classes' : `Class ${c}`}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Remarks</TableHead><TableHead className="no-print">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx, index) => (
                                <TableRow key={`${tx.id || index}-${tx.date}-${tx.amount}`}>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell>Rs {tx.amount.toLocaleString()}</TableCell>
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
                            <TableRow><TableCell colSpan={5} className="text-center h-24">No payments recorded for this selection.</TableCell></TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="font-semibold text-muted-foreground mb-2">Fee Structure (Class {classForSummary})</h3>
                    <div className="border rounded-lg p-4 space-y-2">
                        {Object.entries(studentStructure).map(([key, value]) => (
                            <DetailItem key={key} label={`${key}:`} value={`Rs ${value.amount.toLocaleString()}`} />
                        ))}
                        <Separator/>
                         <DetailItem label="Concession:" value={`- Rs ${concession.toLocaleString()}`} />
                    </div>
                </div>
                <div className="space-y-4">
                     <h3 className="font-semibold text-muted-foreground mb-2">Summary</h3>
                     <div className="border rounded-lg p-4 space-y-3">
                        <DetailItem label={`Annual Fee (Class ${classForSummary}):`} value={`Rs ${annualFee.toLocaleString()}`} />
                        <DetailItem label={`Total Paid (Class ${classForSummary}):`} value={`Rs ${currentClassPaid.toLocaleString()}`} />
                        <DetailItem label="Previous Dues:" value={classForSummary === student.className ? `Rs ${previousDue.toLocaleString()}` : 'N/A'} />
                        <Separator/>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-bold">Total Balance Due:</span>
                            <span className="text-2xl font-bold text-destructive">Rs {totalBalanceDue.toLocaleString()}</span>
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
          <Button onClick={handleSummaryPrint}><Download className="mr-2 h-4 w-4" />Print Summary</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {selectedReceipt && (
        <SingleReceiptDialog
            isOpen={isSingleReceiptOpen}
            onOpenChange={setIsSingleReceiptOpen}
            student={student}
            receipt={selectedReceipt}
            balanceDue={totalBalanceDue}
        />
    )}
    </>
  );
}

    
