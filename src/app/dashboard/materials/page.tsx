'use client';
import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { StudyMaterial } from '@/lib/types';
import { getStudyMaterials, addStudyMaterial, updateStudyMaterial, deleteStudyMaterial, uploadStudyMaterialFile } from '@/lib/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MaterialList from '@/components/dashboard/materials/material-list';
import AddEditMaterialDialog from '@/components/dashboard/materials/add-edit-material-dialog';
import { subjectsByClass } from '@/components/dashboard/common/subjects-schema';

const allSubjects = Array.from(new Set(Object.values(subjectsByClass).flat()));
const allClassLevels = ["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
const allSections = ["A", "B", "C"];
const allClassOptions = allClassLevels.flatMap(level => allSections.map(section => `${level}${section}`));

export default function AdminStudyMaterialPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StudyMaterial | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      if (user?.role !== 'admin') return;
      setIsLoading(true);
      try {
        const materialData = await getStudyMaterials();
        setMaterials(materialData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ title: "Error", description: "Could not fetch study materials.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast, user]);

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

  const handleSave = async (data: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'uploadedBy'>, file?: File | null) => {
    const userId = user?.email || user?.id;
    if (!userId) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        let fileUrl = data.fileUrl;
        
        if (data.materialType === 'file' && file) {
          fileUrl = await uploadStudyMaterialFile(file);
        } else if (selectedItem?.materialType === 'file' && !file) {
          fileUrl = selectedItem.fileUrl;
        }

        if (selectedItem) {
          const updatedItem: StudyMaterial = {
            ...selectedItem,
            ...data,
            fileUrl,
            updatedAt: new Date().toISOString(),
          };
          await updateStudyMaterial(updatedItem.id, updatedItem);
          setMaterials(prev => prev.map(m => m.id === updatedItem.id ? updatedItem : m));
          toast({ title: "Success", description: "Material updated successfully." });
        } else {
          const newItem: Omit<StudyMaterial, 'id'> = {
            ...data,
            fileUrl,
            uploadedBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            viewedBy: [],
            completedBy: [],
          };
          const id = await addStudyMaterial(newItem);
          setMaterials(prev => [{ id, ...newItem } as StudyMaterial, ...prev]);
          toast({ title: "Success", description: "Material added successfully." });
        }
        setIsDialogOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error("Failed to save material:", error);
        toast({ title: "Error", description: "Failed to save material.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Study Material Management</h1>
          <p className="text-muted-foreground">Manage learning resources for the entire school.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Material
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Uploaded Materials</CardTitle>
          <CardDescription>A list of all study materials uploaded by all teachers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <MaterialList materials={materials} onEdit={handleEdit} onDelete={handleDelete} isSaving={isSaving} />}
        </CardContent>
      </Card>

      <AddEditMaterialDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={selectedItem}
        onSave={handleSave}
        isSaving={isSaving}
        teacherClasses={allClassOptions}
        teacherSubjects={allSubjects}
      />
    </div>
  );
}
