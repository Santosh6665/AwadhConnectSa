
'use client';

import * as React from 'react';
import type { Teacher, SalaryPayment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Download, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type SalaryDetails = {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  payableDays: number;
  perDaySalary: number;
  deduction: number;
  payableSalary: number;
};

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value || 'N/A'}</span>
    </div>
);

type SalarySlipProps = {
  teacher: Teacher;
  month: Date;
  salaryDetails: SalaryDetails;
  payment: SalaryPayment | null;
};

export default function SalarySlip({ teacher, month, salaryDetails, payment }: SalarySlipProps) {
    const slipRef = React.useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
      contentRef: slipRef,
    });
    
    const baseSalary = teacher.salary || 0;
    const { totalDays, presentDays, absentDays, payableDays, deduction, payableSalary } = salaryDetails;

    return (
        <Card ref={slipRef} className="admin-print-container result-card p-4 sm:p-8 space-y-6 print:shadow-none print:border-none print:min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Image src="/logo.png" alt="School Logo" width={48} height={48} className="h-12 w-12" />
                    <div>
                        <h1 className="text-2xl font-bold font-headline">Awadh Inter College</h1>
                        <p className="text-sm text-muted-foreground">Ghosiyari bazar, bansi, Siddharth Nagar, 272148</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold text-lg">Salary Slip</p>
                        <Badge variant={payment?.status === 'Paid' ? 'default' : 'destructive'}>
                           {payment?.status || 'Pending'}
                        </Badge>
                    </div>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        size="icon"
                        className="no-print"
                    >
                        <Download className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Teacher ID:</strong> {teacher.id}</div>
                <div><strong>Name:</strong> {teacher.name}</div>
                <div><strong>Designation:</strong> {teacher.designation}</div>
                <div><strong>Month:</strong> {format(month, 'MMMM yyyy')}</div>
            </div>

            <Separator/>

            {/* Salary Breakdown */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Earnings */}
                <div>
                    <h3 className="font-bold text-lg mb-2 text-green-600">Earnings</h3>
                    <div className="border rounded-lg p-4 space-y-2">
                        <DetailItem label="Base Salary" value={`Rs ${baseSalary.toLocaleString()}`} />
                        <Separator />
                        <div className="flex justify-between items-center py-2 font-bold">
                            <span>Gross Earnings</span>
                            <span>Rs {baseSalary.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Deductions */}
                 <div>
                    <h3 className="font-bold text-lg mb-2 text-red-600">Deductions</h3>
                     <div className="border rounded-lg p-4 space-y-2">
                        <DetailItem label="Loss of Pay (LOP)" value={`- Rs ${deduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                        <Separator />
                        <div className="flex justify-between items-center py-2 font-bold">
                            <span>Total Deductions</span>
                            <span>- Rs {deduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Net Salary */}
            <Card className="bg-muted/50">
                <CardContent className="p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Net Payable Salary</h3>
                    <p className="text-2xl font-bold font-headline">Rs {payableSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </CardContent>
            </Card>

            {/* Attendance Summary */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-2"><Calendar className="w-5 h-5 text-primary"/>Attendance Summary</h3>
              <div className="grid sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Total Days</p>
                      <p className="font-bold text-lg">{totalDays}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-md">
                      <p className="text-sm text-green-700 dark:text-green-300">Present</p>
                      <p className="font-bold text-lg">{presentDays}</p>
                  </div>
                   <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-md">
                      <p className="text-sm text-red-700 dark:text-red-300">Absent</p>
                      <p className="font-bold text-lg">{absentDays}</p>
                  </div>
                   <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                      <p className="text-sm text-blue-700 dark:text-blue-300">Payable Days</p>
                      <p className="font-bold text-lg">{payableDays}</p>
                  </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-12 text-center text-xs text-muted-foreground">
                <p>This is a computer-generated salary slip and does not require a signature.</p>
            </div>
        </Card>
    );
}
