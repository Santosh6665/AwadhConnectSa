
'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Student, FeeStructure, FeeReceipt, PreviousSession } from '@/lib/types';
import { Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function FeeDetailsDialog({ isOpen, onOpenChange, student, defaultFeeStructure }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; student: Student | null; defaultFeeStructure: FeeStructure | null }) {
  const receiptRef = React.useRef(null);
  const handlePrint = useReactToPrint({
      contentRef: receiptRef,
  });

  if (!student) return null;
  
  const currentTransactions = student.fees?.[student.session]?.transactions || [];
  const previousSessions = student.previousSessions || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div ref={receiptRef}>
          <DialogHeader>
            <DialogTitle>Fee Details for {student.firstName} {student.lastName}</DialogTitle>
            <DialogDescription>
              Class: {student.className}-{student.sectionName} | Session: {student.session}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] p-1">
              <div className="space-y-6 pr-4">
                  {/* Current Session Transactions */}
                  <div>
                      <h4 className="font-semibold mb-2">Current Session Transactions ({student.session})</h4>
                      <div className="border rounded-lg">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Mode</TableHead>
                                      <TableHead>Remarks</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {currentTransactions.length > 0 ? (
                                      currentTransactions.map(tx => (
                                          <TableRow key={tx.id}>
                                              <TableCell>{tx.date}</TableCell>
                                              <TableCell>₹{tx.amount.toLocaleString()}</TableCell>
                                              <TableCell><Badge variant="secondary">{tx.mode}</Badge></TableCell>
                                              <TableCell>{tx.remarks}</TableCell>
                                          </TableRow>
                                      ))
                                  ) : (
                                      <TableRow><TableCell colSpan={4} className="text-center h-24">No transactions for this session.</TableCell></TableRow>
                                  )}
                              </TableBody>
                          </Table>
                      </div>
                  </div>

                  {/* Previous Dues Section */}
                  {previousSessions.length > 0 && (
                      <div>
                           <h4 className="font-semibold mb-2">Previous Dues Breakdown</h4>
                           <div className="border rounded-lg">
                               <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Session</TableHead>
                                          <TableHead>Class</TableHead>
                                          <TableHead>Due Amount</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {previousSessions.map(session => (
                                          session.dueFee > 0 && (
                                              <TableRow key={session.sessionId}>
                                                  <TableCell>{session.session}</TableCell>
                                                  <TableCell>{session.className}-{session.sectionName}</TableCell>
                                                  <TableCell className="text-destructive">₹{session.dueFee.toLocaleString()}</TableCell>
                                              </TableRow>
                                          )
                                      ))}
                                  </TableBody>
                               </Table>
                           </div>
                      </div>
                  )}
              </div>
          </ScrollArea>
        </div>

        <DialogFooter className="no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" />Print Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
