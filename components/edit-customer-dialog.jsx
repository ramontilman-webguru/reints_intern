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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCustomer } from "@/lib/data-service";

export default function EditCustomerDialog({ customer, open, onOpenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        company: customer.company || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) return;
    setIsLoading(true);

    const customerDataToSubmit = {
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
    };

    try {
      await updateCustomer(customer.id, customerDataToSubmit);
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de klant.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer && open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Klant Bewerken</DialogTitle>
            <DialogDescription>
              Pas de gegevens van de klant aan.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Naam
              </Label>
              <Input
                id='name'
                name='name'
                value={formData.name || ""}
                onChange={handleChange}
                className='col-span-3'
                required
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='company' className='text-right'>
                Bedrijf
              </Label>
              <Input
                id='company'
                name='company'
                value={formData.company || ""}
                onChange={handleChange}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='email' className='text-right'>
                Email
              </Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email || ""}
                onChange={handleChange}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='phone' className='text-right'>
                Telefoon
              </Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone || ""}
                onChange={handleChange}
                className='col-span-3'
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
