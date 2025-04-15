"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function EditNoteDialog({ note, isOpen, onClose, onSuccess }) {
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setEditNoteTitle(note.note_title || "");
      setEditText(note.note_text || "");
      setEditLocation(note.location || "");
    } else {
      setEditNoteTitle("");
      setEditText("");
      setEditLocation("");
    }
  }, [note]);

  const handleUpdateNote = async () => {
    if (!note || !editNoteTitle.trim() || !editText.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/customers/${note.customer_id}/notes/${note.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note_title: editNoteTitle,
            note_text: editText,
            location: editLocation,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update note");
      }

      onSuccess();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error(`Kon notitie niet bijwerken: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Notitie Bewerken</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <Input
            placeholder='Notitie Titel'
            value={editNoteTitle}
            onChange={(e) => setEditNoteTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <Textarea
            placeholder='Notitie tekst...'
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={6}
            disabled={isSubmitting}
            required
          />
          <Input
            placeholder='Locatie (optioneel)'
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Annuleren
            </Button>
          </DialogClose>
          <Button
            type='button'
            onClick={handleUpdateNote}
            disabled={!editNoteTitle.trim() || !editText.trim() || isSubmitting}
          >
            {isSubmitting ? "Opslaan..." : "Wijzigingen Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
