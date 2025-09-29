
'use client';
import type { Event, Notice } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

type EventNoticeListProps = {
  type: 'event' | 'notice';
  data: (Event | Notice)[];
  onEdit: (item: Event | Notice) => void;
  onDelete: (item: Event | Notice) => void;
};

export default function EventNoticeList({ type, data, onEdit, onDelete }: EventNoticeListProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>{type === 'event' ? 'Start Date' : 'Date'}</TableHead>
            {type === 'event' && <TableHead>End Date</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <Badge variant="secondary">{item.category}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                    {item.targetAudience.map(aud => <Badge key={aud} variant="outline">{aud}</Badge>)}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(type === 'event' ? (item as Event).startDate : (item as Notice).date), 'dd MMM yyyy')}
              </TableCell>
              {type === 'event' && (
                <TableCell>
                  {format(new Date((item as Event).endDate), 'dd MMM yyyy')}
                </TableCell>
              )}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
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
       {data.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No {type === 'event' ? 'events' : 'notices'} found.
          </div>
        )}
    </div>
  );
}
