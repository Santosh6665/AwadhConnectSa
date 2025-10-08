
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// Helper function to safely format dates
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

export default function InquiryDetailsModal({ inquiry, onClose }) {
  if (!inquiry) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inquiry Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h4 className="font-semibold">Student Name</h4>
              <p>{inquiry.studentFullName}</p>
            </div>
            <div>
              <h4 className="font-semibold">Class Applied For</h4>
              <p>{inquiry.classForAdmission}</p>
            </div>
            <div>
              <h4 className="font-semibold">Date of Birth</h4>
              <p>{formatDateSafe(inquiry.dob)}</p>
            </div>
            <div>
              <h4 className="font-semibold">Gender</h4>
              <p>{inquiry.gender}</p>
            </div>
            <div>
              <h4 className="font-semibold">Parent/Guardian Name</h4>
              <p>{inquiry.parentName}</p>
            </div>
            <div>
              <h4 className="font-semibold">Relationship</h4>
              <p>{inquiry.relationshipWithStudent || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Contact Number</h4>
              <p>{inquiry.contactNumber}</p>
            </div>
            <div>
              <h4 className="font-semibold">Alternate Contact</h4>
              <p>{inquiry.alternateContactNumber || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <h4 className="font-semibold">Email Address</h4>
              <p>{inquiry.emailAddress || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <h4 className="font-semibold">Residential Address</h4>
              <p>{`${inquiry.residentialAddress}, ${inquiry.city}, ${inquiry.state} - ${inquiry.pinCode}`}</p>
            </div>
            <div className="col-span-2">
              <h4 className="font-semibold">Previous School</h4>
              <p>{inquiry.previousSchoolName || 'N/A'}</p>
            </div>
             <div className="col-span-2">
              <h4 className="font-semibold">Submission Date</h4>
              <p>{formatDateSafe(inquiry.submissionDate)}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
