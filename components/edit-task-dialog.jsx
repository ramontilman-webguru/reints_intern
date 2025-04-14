"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTask } from "@/lib/data-service";
import { useRouter } from "next/navigation";
import { TagInput } from "./tag-input";

// Helper function to format date for input type='date'
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export default function EditTaskDialog({
  task,
  customers,
  allTags = [],
  open,
  onOpenChange,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        customer_id: task.customer_id ? String(task.customer_id) : "none",
        priority: task.priority || "medium",
        due_date: formatDateForInput(task.due_date),
        week_number: task.week_number || "",
        tags: Array.isArray(task.tags) ? task.tags : [],
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "none" ? "none" : value,
    }));
  };

  const handleTagsChange = (newTags) => {
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;
    setIsLoading(true);

    const taskDataToSubmit = {
      title: formData.title,
      description: formData.description,
      customer_id:
        formData.customer_id === "none" || !formData.customer_id
          ? null
          : formData.customer_id,
      priority: formData.priority,
      due_date: formData.due_date ? formData.due_date : null,
      week_number: formData.week_number
        ? parseInt(formData.week_number, 10)
        : null,
      tags: formData.tags,
    };

    console.log("Submitting Task Update:", taskDataToSubmit);

    try {
      await updateTask(task.id, taskDataToSubmit);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de taak.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!task && open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Taak Bewerken</DialogTitle>
            <DialogDescription>
              Pas de details van de taak aan.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Titel *</Label>
              <Input
                id='title'
                name='title'
                value={formData.title || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Beschrijving</Label>
              <Textarea
                id='description'
                name='description'
                value={formData.description || ""}
                onChange={handleChange}
                className='min-h-[80px]'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='customer_id'>Klant *</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("customer_id", value)
                }
                value={
                  formData.customer_id ? String(formData.customer_id) : "none"
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecteer een klant' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Geen klant</SelectItem>
                  {customers &&
                    customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.company || customer.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='priority'>Prioriteit</Label>
              <Select
                onValueChange={(value) => handleSelectChange("priority", value)}
                value={formData.priority || "medium"}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecteer prioriteit' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>Laag</SelectItem>
                  <SelectItem value='medium'>Middel</SelectItem>
                  <SelectItem value='high'>Hoog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='due_date'>Vervaldatum</Label>
              <Input
                id='due_date'
                name='due_date'
                type='date'
                value={formData.due_date || ""}
                onChange={handleChange}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='week_number'>Weeknummer</Label>
              <Input
                id='week_number'
                name='week_number'
                type='number'
                min='1'
                max='53'
                value={formData.week_number || ""}
                onChange={handleChange}
                placeholder='Bijv. 25'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tags'>Tags</Label>
              <TagInput
                id='tags'
                availableTags={allTags}
                value={formData.tags || []}
                onChange={handleTagsChange}
                placeholder='Selecteer of maak tags...'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? "Opslaan..." : "Wijzigingen Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
