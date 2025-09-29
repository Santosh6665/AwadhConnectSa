
import { getParentsWithStudentData, getFeeStructure } from '@/lib/firebase/firestore';
import FamilyFeeList from '@/components/dashboard/fees/family-fee-list';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export default async function FeeManagementPage() {
  const [families, feeStructure] = await Promise.all([
    getParentsWithStudentData(),
    getFeeStructure(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-headline font-bold">Manage Student Fees</h1>
            <p className="text-muted-foreground">
            Grouped by family for your convenience. Click on a family to see individual details.
            </p>
        </div>
        <Button variant="outline" asChild>
            <Link href="/dashboard/fees/settings">
                <Settings className="mr-2 h-4 w-4" />
                Fee Structure Settings
            </Link>
        </Button>
      </div>
      <FamilyFeeList initialFamilies={families} feeStructure={feeStructure} />
    </div>
  );
}
