
import { getFeeStructure } from '@/lib/firebase/firestore';
import FeeStructureForm from '@/components/dashboard/fees/fee-structure-form';

export default async function FeeSettingsPage() {
  const feeStructure = await getFeeStructure();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Fee Structure Settings</h1>
        <p className="text-muted-foreground">
          Set the default fee amounts and monthly multipliers for each class.
        </p>
      </div>
      <FeeStructureForm initialData={feeStructure} />
    </div>
  );
}
