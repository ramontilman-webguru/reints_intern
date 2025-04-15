"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getCustomers } from "@/lib/data-service"; // Assuming this fetches all customers
import { toast } from "sonner";

export default function QuickNoteForm() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [location, setLocation] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedCustomerId ||
      !noteTitle.trim() ||
      !noteText.trim() ||
      !currentUserId ||
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
            user_id: currentUserId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add quick note");
      }

      setNoteTitle("");
      setNoteText("");
      setLocation("");
      setSelectedCustomerId("");
      toast.success("Snelle notitie toegevoegd.");
    } catch (error) {
      console.error("Error adding quick note:", error);
      toast.error(`Kon snelle notitie niet toevoegen: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snelle Notitie</CardTitle>
        <CardDescription>
          Voeg snel een notitie toe voor een klant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Select
            value={selectedCustomerId}
            onValueChange={setSelectedCustomerId}
            disabled={isLoadingCustomers || !currentUserId || isSubmitting}
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
            disabled={!currentUserId || isSubmitting}
            required
          />

          <Input
            placeholder='Locatie (optioneel)'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={!currentUserId || isSubmitting}
          />

          <Textarea
            placeholder='Typ hier je notitie...'
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            disabled={!currentUserId || isSubmitting}
            required
          />

          <Button
            type='submit'
            disabled={
              !selectedCustomerId ||
              !noteTitle.trim() ||
              !noteText.trim() ||
              !currentUserId ||
              isSubmitting
            }
            className='w-full'
          >
            {isSubmitting ? "Toevoegen..." : "Notitie Opslaan"}
          </Button>
          {!currentUserId && (
            <p className='text-xs text-destructive text-center'>
              Log in om een notitie toe te voegen.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
