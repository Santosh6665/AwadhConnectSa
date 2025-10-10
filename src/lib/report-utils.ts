
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student, PreviousSession } from './types';
import { schoolDetails } from './config';

const addReportHeader = (doc: jsPDF, title: string) => {
  // Add school logo
  const logo = new Image();
  logo.src = '/logo.png';
  doc.addImage(logo, 'PNG', 15, 15, 30, 30);

  // Add school details
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(schoolDetails.name, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(schoolDetails.address, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
  doc.text(schoolDetails.contact, doc.internal.pageSize.getWidth() / 2, 36, { align: 'center' });

  // Add report title
  doc.setFontSize(14);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
  doc.setDrawColor(0, 0, 255);
  doc.line(20, 55, doc.internal.pageSize.getWidth() - 20, 55);
  doc.setFontSize(12);
};

const addStudentDetails = (doc: jsPDF, student: Student, session: PreviousSession) => {
  const details = [
    [`Student Name:`, `${student.firstName} ${student.lastName}`],
    [`Admission No:`, student.admissionNumber],
    [`Session:`, session.session],
  ];

  autoTable(doc, {
    body: details,
    startY: 60,
    theme: 'grid',
    styles: {
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

export const generatePreviousSessionReport = (student: Student, session: PreviousSession) => {
  const doc = new jsPDF();
  addReportHeader(doc, `Report Card - ${session.session}`);
  const lastY = addStudentDetails(doc, student, session);

  doc.setFontSize(14);
  doc.text('Academic Summary', 20, lastY);
  const academicData = [
    ['Final Status', session.finalStatus],
    ['Overall Percentage', `${session.overallPercentage.toFixed(2)}%`]
  ];

  autoTable(doc, {
    head: [['Description', 'Value']],
    body: academicData,
    startY: lastY + 5,
    theme: 'striped',
  });

  const financialY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text('Financial Summary', 20, financialY);
  const financialData = [
    ['Fee Status', session.dueFee > 0 ? 'Due' : 'Paid'],
    ['Due Amount', `Rs ${session.dueFee.toLocaleString()}`],
  ];

  autoTable(doc, {
    head: [['Description', 'Value']],
    body: financialData,
    startY: financialY + 5,
    theme: 'striped',
  });

  return doc;
};

export const downloadReport = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};
