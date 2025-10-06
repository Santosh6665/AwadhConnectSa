
import { getResultVisibilitySettings } from '@/lib/firebase/firestore';
import ResultVisibilityForm from '@/components/dashboard/admin/settings/result-visibility-form';
import type { ResultVisibilitySettings } from '@/lib/types';

export default async function SettingsPage() {
  const resultSettings = await getResultVisibilitySettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">School Settings</h1>
        <p className="text-muted-foreground">
          Manage global settings for the application.
        </p>
      </div>
      <ResultVisibilityForm initialSettings={resultSettings} />
    </div>
  );
}
