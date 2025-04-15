"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner"; // Assuming you use sonner for toasts
import { Trash2, Edit } from "lucide-react"; // Icons for buttons

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

export default function CustomerNotes({ customerId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/notes`);
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Kon notities niet laden.");
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note_text: newNote,
          location: newLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add note");
      }

      await fetchNotes();
      setNewNote("");
      setNewLocation("");
      toast.success("Notitie toegevoegd.");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(`Kon notitie niet toevoegen: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    setEditText(note.note_text || "");
    setEditLocation(note.location || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editText.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/customers/${customerId}/notes/${editingNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            note_text: editText,
            location: editLocation,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update note");
      }

      await fetchNotes();
      setIsEditDialogOpen(false);
      setEditingNote(null);
      toast.success("Notitie bijgewerkt.");
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error(`Kon notitie niet bijwerken: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNoteId) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/customers/${customerId}/notes/${deletingNoteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      await fetchNotes();
      setDeletingNoteId(null);
      toast.success("Notitie verwijderd.");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error(`Kon notitie niet verwijderen: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Card>
          <CardHeader>
            <CardTitle>Notities</CardTitle>
            <CardDescription>
              Voeg notities toe of bewerk bestaande.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4 mb-6'>
              <h4 className='text-md font-medium'>Nieuwe Notitie Toevoegen</h4>
              <Textarea
                placeholder='Typ hier je nieuwe notitie...'
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
              <Input
                placeholder='Locatie (optioneel)'
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                disabled={isSubmitting}
              />
              <Button type='submit' disabled={!newNote.trim() || isSubmitting}>
                {isSubmitting && !editingNote
                  ? "Toevoegen..."
                  : "Nieuwe Notitie Opslaan"}
              </Button>
            </form>

            <Separator className='my-6' />

            <h4 className='text-md font-medium mb-4'>Bestaande Notities</h4>
            {isLoading ? (
              <p className='text-sm text-muted-foreground'>Notities laden...</p>
            ) : notes.length > 0 ? (
              <ScrollArea className='h-[300px]'>
                <div className='space-y-3 pr-4'>
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className='p-3 border rounded-md bg-muted/50 flex justify-between items-start'
                    >
                      <div className='flex-1 mr-2'>
                        <p className='text-sm whitespace-pre-wrap mb-1'>
                          {truncateText(note.note_text, 150)}
                        </p>
                        {note.location && (
                          <p className='text-xs text-muted-foreground mb-1'>
                            Locatie: {note.location}
                          </p>
                        )}
                        <p className='text-xs text-muted-foreground'>
                          {new Date(note.created_at).toLocaleString("nl-NL", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className='flex flex-col space-y-1'>
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => handleEditClick(note)}
                          className='h-7 w-7'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => setDeletingNoteId(note.id)}
                            className='h-7 w-7'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className='text-sm text-muted-foreground text-center py-4'>
                Nog geen notities voor deze klant.
              </p>
            )}
          </CardContent>
        </Card>

        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Notitie Bewerken</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <Textarea
              placeholder='Notitie tekst...'
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={6}
              disabled={isSubmitting}
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
              disabled={!editText.trim() || isSubmitting}
            >
              {isSubmitting ? "Opslaan..." : "Wijzigingen Opslaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Weet je het zeker?</AlertDialogTitle>
          <AlertDialogDescription>
            Deze actie kan niet ongedaan worden gemaakt. Dit verwijdert de
            notitie permanent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeletingNoteId(null)}>
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
