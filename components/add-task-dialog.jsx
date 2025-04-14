// components/add-task-dialog.jsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircle } from "lucide-react";
import { createTask } from "@/lib/data-service";

export default function AddTaskDialog({ customers }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customer_id: "",
    priority: "medium",
    due_date: "",
    week_number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const taskDataToSubmit = {
      ...formData,
    };

    try {
      await createTask(taskDataToSubmit);

      setFormData({
        title: "",
        description: "",
        customer_id: "",
        priority: "medium",
        due_date: "",
        week_number: "",
      });
      setOpen(false);

      window.location.reload();
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Er is een fout opgetreden bij het toevoegen van de taak.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className='mr-2 h-4 w-4' />
          Nieuwe Taak
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[525px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nieuwe taak toevoegen</DialogTitle>
            <DialogDescription>
              Vul de details in voor de nieuwe taak.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Titel *</Label>
              <Input
                id='title'
                name='title'
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Beschrijving</Label>
              <Textarea
                id='description'
                name='description'
                value={formData.description}
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
                value={formData.customer_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecteer een klant' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Geen klant</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
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
                value={formData.priority}
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
                value={formData.due_date}
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
                value={formData.week_number}
                onChange={handleChange}
                placeholder='Bijv. 25'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? "Bezig..." : "Taak Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
