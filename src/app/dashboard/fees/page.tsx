
import { getParentsWithStudentData, getFeeStructure } from '@/lib/firebase/firestore';
import FamilyFeeList from '@/components/dashboard/fees/family-fee-list';

export default async function FeeManagementPage() {
  const [families, feeStructure] = await Promise.all([
    getParentsWithStudentData(),
    getFeeStructure(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Manage Student Fees</h1>
        <p className="text-muted-foreground">
          Grouped by family for your convenience. Click on a family to see individual details.
        </p>
      </div>
      <FamilyFeeList initialFamilies={families} feeStructure={feeStructure} />
    </div>
  );
}
