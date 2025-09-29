
'use client';
import type { StudyMaterial } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Link as LinkIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';

type MaterialListProps = {
  materials: StudyMaterial[];
  onEdit: (item: StudyMaterial) => void;
  onDelete: (item: StudyMaterial) => void;
  isSaving: boolean;
};

export default function MaterialList({ materials, onEdit, onDelete, isSaving }: MaterialListProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Uploaded On</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <Badge variant={item.materialType === 'file' ? 'secondary' : 'outline'}>
                    {item.materialType === 'file' ? <FileText className="mr-2 h-3 w-3"/> : <LinkIcon className="mr-2 h-3 w-3" />}
                    {item.materialType}
                </Badge>
              </TableCell>
              <TableCell>{item.className}-{item.sectionName}</TableCell>
              <TableCell>{item.subject}</TableCell>
              <TableCell>{format(new Date(item.createdAt), 'dd MMM yyyy')}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isSaving}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {materials.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No study materials uploaded yet.
          </div>
        )}
    </div>
  );
}
