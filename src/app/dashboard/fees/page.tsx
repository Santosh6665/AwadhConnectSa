
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCog } from 'lucide-react';
import Link from 'next/link';

export default function FeeManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Fee Management</h1>
        <p className="text-muted-foreground">
          Configure fee structures, generate invoices, and track payments.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle>Fee Structure</CardTitle>
                <CardDescription>Define the default fee amounts for each class and fee type.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/fees/settings">
                        <FileCog className="mr-2 h-4 w-4" />
                        Configure Fee Structure
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
