
import type { PreviousSession, Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { generatePreviousSessionReport, downloadReport } from '@/lib/report-utils';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
    <span className="font-medium text-muted-foreground">{label}</span>
    <span className="">{value || 'N/A'}</span>
  </div>
);

export default function PreviousSessionCard({ student, session }: { student: Student, session: PreviousSession }) {
  const feeStatus = session.dueFee > 0 ? 'Due' : 'Paid';

  const handleDownload = () => {
    const doc = generatePreviousSessionReport(student, session);
    downloadReport(doc, `report-card-${student.admissionNumber}-${session.session}.pdf`);
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl">Session: {session.session}</CardTitle>
                <CardDescription>Class: {session.className}-{session.sectionName} | Roll No: {session.rollNo}</CardDescription>
            </div>
             <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
            </Button>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
            <h4 className="font-semibold mb-2 text-primary">Academic Summary</h4>
            <DetailItem label="Final Status" value={<Badge variant={session.finalStatus === 'Promoted' ? 'default' : 'destructive'}>{session.finalStatus}</Badge>} />
            <DetailItem label="Percentage" value={`${(session.overallPercentage || 0).toFixed(2)}%`} />
        </div>
        <div>
            <h4 className="font-semibold mb-2 text-primary">Financial Summary</h4>
            <DetailItem 
                label="Fee Status" 
                value={<Badge variant={feeStatus === 'Paid' ? 'secondary' : 'destructive'}>{feeStatus}</Badge>}
            />
            <DetailItem label="Due Amount" value={`Rs ${session.dueFee.toLocaleString()}`} />
        </div>
      </CardContent>
    </Card>
  );
}
