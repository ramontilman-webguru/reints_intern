"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Import useSession
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { getCustomers } from "@/lib/data-service"; // To fetch customers
import { toast } from "sonner";

export default function CreateNoteDialog({ isOpen, onClose, onSuccess }) {
  const { data: session } = useSession(); // Get session data
  const currentUserId = session?.user?.id; // Extract user ID

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [location, setLocation] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch customers when the dialog is open and customers haven't been loaded yet
    if (isOpen && customers.length === 0) {
      async function loadCustomers() {
        setIsLoadingCustomers(true);
        try {
          const fetchedCustomers = await getCustomers();
          setCustomers(fetchedCustomers || []);
        } catch (error) {
          console.error("Error loading customers:", error);
          toast.error("Kon klantenlijst niet laden.");
          setCustomers([]);
        } finally {
          setIsLoadingCustomers(false);
        }
      }
      loadCustomers();
    }
  }, [isOpen, customers.length]); // Dependency includes isOpen

  const resetForm = () => {
    setSelectedCustomerId("");
    setNoteTitle("");
    setNoteText("");
    setLocation("");
    setIsSubmitting(false);
    // Don't reset customers list
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedCustomerId ||
      !noteTitle.trim() ||
      !noteText.trim() ||
      !currentUserId || // Check for user ID
      isSubmitting
    ) {
      if (!currentUserId)
        toast.error("Gebruiker niet gevonden. Log opnieuw in.");
      else
        toast.warning("Selecteer een klant en voer een titel en notitie in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/customers/${selectedCustomerId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note_title: noteTitle,
            note_text: noteText,
            location: location,
            user_id: currentUserId, // Include current user ID
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add note");
      }

      resetForm();
      onSuccess(); // Call the success callback from the parent page
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(`Kon notitie niet toevoegen: ${error.message}`);
      setIsSubmitting(false); // Ensure submitting state is reset on error
    }
    // No finally block needed for setIsSubmitting here as it's handled in success/error paths
  };

  // Handle dialog open state changes
  const handleOpenChange = (open) => {
    if (!open) {
      resetForm();
      onClose();
    }
    // We don't need to handle the `open = true` case as data loading is triggered by useEffect
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Nieuwe Notitie Toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <Select
            value={selectedCustomerId}
            onValueChange={setSelectedCustomerId}
            disabled={isLoadingCustomers || !currentUserId || isSubmitting} // Disable if no user
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingCustomers
                    ? "Klanten laden..."
                    : !currentUserId
                    ? "Log in om klant te selecteren"
                    : "Selecteer een klant"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.company || customer.name}
                  {customer.company && customer.name
                    ? ` (${customer.name})`
                    : ""}
                </SelectItem>
              ))}
              {!isLoadingCustomers && customers.length === 0 && (
                <SelectItem value='' disabled>
                  Geen klanten gevonden
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Input
            placeholder='Notitie Titel'
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            disabled={!currentUserId || isSubmitting} // Disable if no user
            required
          />

          <Input
            placeholder='Locatie (optioneel)'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={!currentUserId || isSubmitting} // Disable if no user
          />

          <Textarea
            placeholder='Typ hier je notitie...'
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            disabled={!currentUserId || isSubmitting} // Disable if no user
            required
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Annuleren
              </Button>
            </DialogClose>
            <Button
              type='submit'
              disabled={
                !selectedCustomerId ||
                !noteTitle.trim() ||
                !noteText.trim() ||
                !currentUserId || // Check user ID
                isSubmitting
              }
            >
              {isSubmitting ? "Toevoegen..." : "Notitie Toevoegen"}
            </Button>
            {!currentUserId && (
              <p className='text-xs text-destructive mt-2 sm:mt-0 sm:ml-auto'>
                Log in om op te slaan.
              </p>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
