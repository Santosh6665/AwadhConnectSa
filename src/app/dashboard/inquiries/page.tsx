
import { Mail } from 'lucide-react';
import InquiryList from '@/components/dashboard/inquiries/inquiry-list';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

async function getInquiries() {
  const inquiriesCollection = collection(db, 'admissions');
  const inquirySnapshot = await getDocs(inquiriesCollection);
  const inquiryList = inquirySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  return inquiryList;
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Admission Inquiries
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the admission inquiries from the website.
          </p>
        </div>
      </div>
      <InquiryList inquiries={inquiries} />
    </div>
  );
}
