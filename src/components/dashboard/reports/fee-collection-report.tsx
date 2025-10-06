
'use client';
import type { Student, FeeStructure } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import StatCard from '../stat-card';
import { Banknote, Landmark, Percent, CalendarCheck } from 'lucide-react';
import { useMemo } from 'react';

const COLORS = ['#0088FE', '#FF8042'];

export default function FeeCollectionReport({ students, feeStructure }: { students: Student[], feeStructure: { [key: string]: FeeStructure } | null }) {

  const { allTimeFeesCollected, currentSessionFeesCollected, totalDues, collectionPercentage } = useMemo(() => {
    let allTimeFeesCollected = 0;
    let currentSessionFeesCollected = 0;
    let totalDues = 0;
    let totalExpected = 0;

    students.forEach(student => {
        let studentTotalExpected = 0;
        let studentTotalPaid = 0;

        // All time calculation
        Object.keys(student.fees || {}).forEach(className => {
            const feeData = student.fees[className];
            const structure = feeData.structure || feeStructure?.[className];
            if (structure) {
                const annualFee = Object.values(structure).reduce((sum, head) => sum + (head.amount * head.months), 0);
                const concession = feeData.concession || 0;
                studentTotalExpected += (annualFee - concession);
            }
            studentTotalPaid += (feeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);

            // Current session calculation
            if (className === student.className) {
                currentSessionFeesCollected += (feeData.transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
            }
        });
        
        studentTotalExpected += student.previousDue || 0;
        
        allTimeFeesCollected += studentTotalPaid;
        totalExpected += studentTotalExpected;
    });
    
    totalDues = Math.max(0, totalExpected - allTimeFeesCollected);
    const collectionPercentage = totalExpected > 0 ? (allTimeFeesCollected / totalExpected) * 100 : 0;

    return { allTimeFeesCollected, currentSessionFeesCollected, totalDues, collectionPercentage };
  }, [students, feeStructure]);

  const chartData = [
    { name: 'Collected', value: allTimeFeesCollected },
    { name: 'Due', value: totalDues },
  ];

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatCard title="All-Time Collection" value={`Rs ${(allTimeFeesCollected / 1000).toFixed(1)}k`} icon={Banknote} description="Across all sessions"/>
             <StatCard title="Current Session Collection" value={`Rs ${(currentSessionFeesCollected / 1000).toFixed(1)}k`} icon={CalendarCheck} />
             <StatCard title="Total Outstanding Dues" value={`Rs ${(totalDues / 1000).toFixed(1)}k`} icon={Landmark} />
             <StatCard title="Overall Collection Rate" value={`${collectionPercentage.toFixed(2)}%`} icon={Percent} />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Fee Collection Overview (All-Time)</CardTitle>
                <CardDescription>A visual representation of all-time fee collection vs. outstanding dues.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `Rs ${value.toLocaleString()}`} />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}
