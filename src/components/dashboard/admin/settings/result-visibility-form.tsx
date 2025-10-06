
'use client';
import * as React from 'react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import type { ResultVisibilitySettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveResultVisibilitySettings } from '@/lib/firebase/firestore';

type VisibilityFormData = ResultVisibilitySettings;

export default function ResultVisibilityForm({ initialSettings }: { initialSettings: ResultVisibilitySettings | null }) {
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<VisibilityFormData>({
    defaultValues: {
      showQuarterly: initialSettings?.showQuarterly ?? true,
      showHalfYearly: initialSettings?.showHalfYearly ?? true,
      showAnnual: initialSettings?.showAnnual ?? true,
    }
  });

  const onSubmit = (data: VisibilityFormData) => {
    startTransition(async () => {
      try {
        await saveResultVisibilitySettings(data);
        toast({
          title: 'Success',
          description: 'Result visibility settings saved successfully.',
        });
      } catch (error) {
        console.error('Error saving settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to save settings.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Result Visibility Settings</CardTitle>
            <CardDescription>
              Control which exam results for the current session are visible to students in their portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="showQuarterly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Quarterly Results</FormLabel>
                    <FormDescription>Allow students to view their quarterly exam results.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showHalfYearly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Half-Yearly Results</FormLabel>
                    <FormDescription>Allow students to view cumulative half-yearly results.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showAnnual"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Annual Results</FormLabel>
                    <FormDescription>Allow students to view final, annual results.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <div className="p-6 pt-0">
             <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
