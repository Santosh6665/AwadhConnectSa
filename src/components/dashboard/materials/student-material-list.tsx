
'use client';
import type { StudyMaterial } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, ExternalLink, FileText, Link as LinkIcon, Circle } from 'lucide-react';
import { format } from 'date-fns';

type StudentMaterialListProps = {
  materials: StudyMaterial[];
  studentId: string;
  onToggleComplete: (materialId: string) => void;
};

export default function StudentMaterialList({ materials, studentId, onToggleComplete }: StudentMaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center p-16 text-muted-foreground bg-card rounded-lg">
        No study materials found for the selected filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {materials.map((item) => {
        const isCompleted = item.completedBy?.includes(studentId);
        return (
          <Card key={item.id} className="flex flex-col">
            <CardHeader>
               <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                           {item.materialType === 'file' ? <FileText className="w-6 h-6 text-primary" /> : <LinkIcon className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-headline">{item.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), 'dd MMM yyyy')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary">{item.subject}</Badge>
                        <Badge variant="outline">{item.topic}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center gap-2">
                <Button 
                    variant={isCompleted ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => onToggleComplete(item.id)}
                >
                    {isCompleted ? <CheckCircle className="mr-2 h-4 w-4 text-green-600"/> : <Circle className="mr-2 h-4 w-4"/>}
                    {isCompleted ? 'Completed' : 'Mark as Complete'}
                </Button>
                 <Button asChild size="sm">
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                        {item.materialType === 'file' ? <Download className="mr-2 h-4 w-4"/> : <ExternalLink className="mr-2 h-4 w-4"/>}
                        {item.materialType === 'file' ? 'Download' : 'Open Link'}
                    </a>
                </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
