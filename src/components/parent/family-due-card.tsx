
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, IndianRupee } from "lucide-react";

interface FamilyDueCardProps {
    totalDue: number;
}

export default function FamilyDueCard({ totalDue }: FamilyDueCardProps) {
    return (
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-orange-200">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg"><Wallet className="w-6 h-6 text-primary" /></div>
                    <div>
                        <CardTitle>Total Family Dues</CardTitle>
                        <CardDescription>This is the total outstanding fee amount for all your children.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold flex items-center">
                    <IndianRupee className="w-7 h-7" /> {totalDue.toLocaleString('en-IN')}
                </div>
            </CardContent>
        </Card>
    );
}
