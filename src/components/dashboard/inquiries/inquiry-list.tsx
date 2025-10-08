
'use client';

import { useState, useTransition } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import InquiryDetailsModal from './inquiry-details-modal';
import DeleteConfirmationModal from './delete-confirmation-modal';

const formatDateSafe = (dateSource) => {
  if (!dateSource) return 'N/A';
  if (typeof dateSource.toDate === 'function') {
    return format(dateSource.toDate(), 'PPP');
  }
  const date = new Date(dateSource);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return format(date, 'PPP');
};

export default function InquiryList({ inquiries: initialInquiries }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'submissionDate', direction: 'descending' });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id) => {
    startTransition(async () => {
        try {
            await deleteDoc(doc(db, 'admissions', id));
            setInquiries((currentInquiries) => currentInquiries.filter((inquiry) => inquiry.id !== id));
            toast.success('Inquiry deleted successfully!');
        } catch (error) {
            console.error("Error deleting document: ", error);
            toast.error('Failed to delete inquiry. Please try again.');
        }
        setDeleteModalOpen(false);
        setInquiryToDelete(null);
    });
  };

  const openDeleteModal = (inquiry) => {
    setInquiryToDelete(inquiry);
    setDeleteModalOpen(true);
  };

  const sortedInquiries = [...inquiries].sort((a, b) => {
    const key = sortConfig.key;
    const aValue = a[key];
    const bValue = b[key];

    let compareA = aValue;
    let compareB = bValue;

    if (key === 'dob' || key === 'submissionDate') {
        compareA = aValue?.toDate ? aValue.toDate() : new Date(aValue || 0);
        compareB = bValue?.toDate ? bValue.toDate() : new Date(bValue || 0);
    }

    if (compareA < compareB) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (compareA > compareB) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredInquiries = sortedInquiries.filter(
    (inquiry) =>
      (inquiry.studentFullName && inquiry.studentFullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.classForAdmission && inquiry.classForAdmission.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const exportToCsv = () => {
    const headers = [
      'Student Name', 'Class Applied For', 'Parent/Guardian Name', 'Contact Number', 'Email Address', 'Date of Birth', 'Submission Date',
    ];
    const rows = filteredInquiries.map((inquiry) => [
      inquiry.studentFullName, inquiry.classForAdmission, inquiry.parentName, inquiry.contactNumber, inquiry.emailAddress,
      formatDateSafe(inquiry.dob), formatDateSafe(inquiry.submissionDate),
    ]);
    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach(rowArray => {
      csvContent += rowArray.join(',') + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'admission_inquiries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Input placeholder="Filter by student name or class..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
              <Button onClick={exportToCsv}>Export to CSV</Button>
            </div>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => requestSort('studentFullName')}>Student Name</TableHead>
                    <TableHead onClick={() => requestSort('classForAdmission')}>Class Applied For</TableHead>
                    <TableHead>Parent/Guardian Name</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead onClick={() => requestSort('dob')}>Date of Birth</TableHead>
                    <TableHead onClick={() => requestSort('submissionDate')}>Submission Date</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>{inquiry.studentFullName}</TableCell>
                      <TableCell>{inquiry.classForAdmission}</TableCell>
                      <TableCell>{inquiry.parentName}</TableCell>
                      <TableCell>{inquiry.contactNumber}</TableCell>
                      <TableCell>{inquiry.emailAddress}</TableCell>
                      <TableCell>{formatDateSafe(inquiry.dob)}</TableCell>
                      <TableCell>{formatDateSafe(inquiry.submissionDate)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedInquiry(inquiry)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteModal(inquiry)}><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      {selectedInquiry && <InquiryDetailsModal inquiry={selectedInquiry} onClose={() => setSelectedInquiry(null)} />}
      {isDeleteModalOpen && inquiryToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={() => handleDelete(inquiryToDelete.id)}
          isPending={isPending}
        />
      )}
    </>
  );
}
