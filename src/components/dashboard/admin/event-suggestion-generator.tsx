'use client';
import { useState } from 'react';
import { generateEventSuggestions } from '@/ai/flows/generate-event-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2 } from 'lucide-react';

export default function EventSuggestionGenerator() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [historicalData, setHistoricalData] = useState('Last year we held a Science Fair (high attendance), a Cultural Fest (medium attendance), and a Fun Run (high attendance).');
  const [studentFeedback, setStudentFeedback] = useState('Students want more sports events and fewer academic competitions. They enjoyed the hands-on activities at the Science Fair.');
  const [upcomingHolidays, setUpcomingHolidays] = useState('Winter Break (Dec 22 - Jan 5), Republic Day (Jan 26)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuggestions('');

    try {
      const result = await generateEventSuggestions({
        historicalData,
        studentFeedback,
        upcomingHolidays,
      });
      setSuggestions(result.eventSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions('Sorry, an error occurred while generating suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
                <Wand2 className="w-6 h-6 text-primary" />
            </div>
            <div>
                <CardTitle>AI Event Suggestion Generator</CardTitle>
                <CardDescription>Generate creative event ideas for the school calendar.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
             <div>
                <Label htmlFor="historicalData">Historical Data</Label>
                <Textarea id="historicalData" value={historicalData} onChange={(e) => setHistoricalData(e.target.value)} placeholder="e.g., Last year's Science Fair had high attendance." />
            </div>
            <div>
                <Label htmlFor="studentFeedback">Student Feedback</Label>
                <Textarea id="studentFeedback" value={studentFeedback} onChange={(e) => setStudentFeedback(e.target.value)} placeholder="e.g., Students want more sports events." />
            </div>
            <div>
                <Label htmlFor="upcomingHolidays">Upcoming Holidays</Label>
                <Textarea id="upcomingHolidays" value={upcomingHolidays} onChange={(e) => setUpcomingHolidays(e.target.value)} placeholder="e.g., Winter Break, Republic Day" />
            </div>
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Suggestions
              </>
            )}
          </Button>
        </form>

        {suggestions && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Suggested Events:</h4>
            <pre className="p-4 bg-muted rounded-md whitespace-pre-wrap font-body text-sm">{suggestions}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
