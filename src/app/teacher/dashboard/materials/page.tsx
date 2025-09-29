'use client';
import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { StudyMaterial } from '@/lib/types';
import { getStudyMaterials, deleteStudyMaterial, getTeacherById } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MaterialList from '@/components/dashboard/materials/material-list';
import AddEditMaterialDialog from '@/components/dashboard/materials/add-edit-material-dialog';

export default function StudyMaterialPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StudyMaterial | null>(null);
  
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  const { toast } = useToast();

  const fetchMaterials = async () => {
      if (user?.role !== 'teacher' || !user.id) return;
      setIsLoading(true);
      try {
        const [materialData, teacherData] = await Promise.all([
          getStudyMaterials({ uploadedBy: user.id }),
          getTeacherById(user.id)
        ]);
        setMaterials(materialData);
        if (teacherData) {
          setAvailableClasses(teacherData.classes || []);
          setAvailableSubjects(teacherData.subjects || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Could not fetch study materials.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: StudyMaterial) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: StudyMaterial) => {
    const confirmation = window.confirm(`Are you sure you want to delete "${item.title}"?`);
    if (!confirmation) return;

    startTransition(async () => {
      try {
        await deleteStudyMaterial(item.id, item.materialType === 'file' ? item.fileUrl : undefined);
        setMaterials(prev => prev.filter(m => m.id !== item.id));
        toast({ title: "Success", description: "Material deleted successfully." });
      } catch (error) {
        console.error("Failed to delete material:", error);
        toast({ title: "Error", description: "Failed to delete material.", variant: "destructive" });
      }
    });
  };

  const handleDialogSave = () => {
    setIsDialogOpen(false);
    fetchMaterials(); // Re-fetch materials after a save
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Study Material Management</h1>
          <p className="text-muted-foreground">Upload and manage learning resources for your students.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Material
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Materials</CardTitle>
          <CardDescription>A list of all study materials you have uploaded.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <MaterialList materials={materials} onEdit={handleEdit} onDelete={handleDelete} isSaving={isSaving} />}
        </CardContent>
      </Card>

      <AddEditMaterialDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={selectedItem}
        onSaveSuccess={handleDialogSave}
        teacherClasses={availableClasses}
        teacherSubjects={availableSubjects}
        user={user}
      />
    </div>
  );
}
