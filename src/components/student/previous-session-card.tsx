
import type { PreviousSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
    <span className="font-medium text-muted-foreground">{label}</span>
    <span className="">{value || 'N/A'}</span>
  </div>
);

export default function PreviousSessionCard({ session }: { session: PreviousSession }) {
  const feeStatus = session.dueFee > 0 ? 'Due' : 'Paid';

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-xl">Session: {session.session}</CardTitle>
                <CardDescription>Class: {session.className}-{session.sectionName} | Roll No: {session.rollNo}</CardDescription>
            </div>
             <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Report
            </Button>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
            <h4 className="font-semibold mb-2 text-primary">Academic Summary</h4>
            <DetailItem label="Final Status" value={<Badge variant={session.finalStatus === 'Promoted' ? 'default' : 'destructive'}>{session.finalStatus}</Badge>} />
            <DetailItem label="Attendance" value="95% (180/190 days)" />
             <DetailItem label="Overall Grade" value="A+" />
        </div>
        <div>
            <h4 className="font-semibold mb-2 text-primary">Financial Summary</h4>
            <DetailItem 
                label="Fee Status" 
                value={<Badge variant={feeStatus === 'Paid' ? 'secondary' : 'destructive'}>{feeStatus}</Badge>}
            />
            <DetailItem label="Due Amount" value={`₹${session.dueFee.toLocaleString()}`} />
        </div>
      </CardContent>
    </Card>
  );
}
