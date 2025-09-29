'use client';
import type { Fee, Student } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import StatCard from '../stat-card';
import { Banknote, Landmark, Percent } from 'lucide-react';

const COLORS = ['#0088FE', '#FF8042'];

export default function FeeCollectionReport({ fees, students }: { fees: Fee[], students: Student[] }) {
  const totalFeesExpected = fees.reduce((acc, fee) => acc + fee.totalFee, 0);
  const totalFeesCollected = fees.reduce((acc, fee) => acc + fee.paidFee, 0);
  const totalDues = fees.reduce((acc, fee) => acc + fee.dueFee, 0);
  const collectionPercentage = totalFeesExpected > 0 ? (totalFeesCollected / totalFeesExpected) * 100 : 0;

  const chartData = [
    { name: 'Collected', value: totalFeesCollected },
    { name: 'Due', value: totalDues },
  ];

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
             <StatCard title="Total Fees Collected" value={`₹${(totalFeesCollected / 100000).toFixed(2)}L`} icon={Banknote} />
             <StatCard title="Total Outstanding Dues" value={`₹${(totalDues / 100000).toFixed(2)}L`} icon={Landmark} />
             <StatCard title="Collection Rate" value={`${collectionPercentage.toFixed(2)}%`} icon={Percent} />
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Fee Collection Overview</CardTitle>
                <CardDescription>A visual representation of fee collection vs. outstanding dues.</CardDescription>
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
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}
