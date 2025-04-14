// components/add-customer-dialog.jsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AddCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from("customers").insert([formData]);

      if (error) throw error;

      // Reset form and close dialog on success
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      setOpen(false);

      // Refresh the page to show the new customer
      window.location.reload();
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Er is een fout opgetreden bij het toevoegen van de klant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className='mr-2 h-4 w-4' />
          Nieuwe Klant
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[525px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nieuwe klant toevoegen</DialogTitle>
            <DialogDescription>
              Vul de gegevens in van de nieuwe klant.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='company'>Bedrijf</Label>
                <Input
                  id='company'
                  name='company'
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='name'>Naam *</Label>
                <Input
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Telefoon</Label>
                <Input
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Adres</Label>
              <Input
                id='address'
                name='address'
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notities</Label>
              <Textarea
                id='notes'
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                className='min-h-[80px]'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Annuleren
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? "Bezig met opslaan..." : "Klant toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
