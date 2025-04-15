"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function DeleteNoteDialog({ note, isOpen, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteNote = async () => {
    if (!note) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        // Use the generic note delete endpoint
        `/api/customers/${note.customer_id}/notes/${note.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      onSuccess(); // Call the success callback
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error(`Kon notitie niet verwijderen: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle dialog open state based on isOpen prop
  const handleOpenChange = (open) => {
    if (!open) {
      onClose(); // Call onClose when dialog is dismissed
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
          <AlertDialogDescription>
            Deze actie kan niet ongedaan worden gemaakt. Dit verwijdert de
            notitie permanent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Annuleren
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteNote}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting ? "Verwijderen..." : "Verwijder"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
