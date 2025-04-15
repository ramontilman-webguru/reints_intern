"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react"; // Import useSession
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
import NoteDetailDialog from "./note-detail-dialog"; // Import the new dialog
import { getUserNameById } from "@/lib/users"; // Import helper

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

export default function CustomerNotes({ customerId }) {
  const { data: session } = useSession(); // Get session data
  const currentUserId = session?.user?.id; // Extract user ID

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for viewing note details
  const [viewingNote, setViewingNote] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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
    if (
      !newNoteTitle.trim() ||
      !newNote.trim() ||
      !currentUserId ||
      isSubmitting
    ) {
      if (!currentUserId)
        toast.error("Gebruiker niet gevonden. Log opnieuw in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note_title: newNoteTitle,
          note_text: newNote,
          location: newLocation,
          user_id: currentUserId, // Include current user ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add note");
      }

      await fetchNotes();
      setNewNoteTitle("");
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
    setEditNoteTitle(note.note_title || "");
    setEditText(note.note_text || "");
    setEditLocation(note.location || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editNoteTitle.trim() || !editText.trim()) return;
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

  // Handler to open the detail view
  const handleViewClick = (note) => {
    setViewingNote(note);
    setIsDetailDialogOpen(true);
  };

  // Handler for the edit action from the detail dialog
  const handleEditFromDetail = (note) => {
    setIsDetailDialogOpen(false); // Close detail dialog
    // Small delay to allow detail dialog to close before opening edit
    setTimeout(() => {
      handleEditClick(note); // Reuse existing edit click handler
    }, 100); // Adjust delay if needed
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
              <Input
                placeholder='Notitie Titel'
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                disabled={!currentUserId || isSubmitting} // Disable if no user
                required
              />
              <Textarea
                placeholder='Typ hier je nieuwe notitie...'
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                disabled={!currentUserId || isSubmitting} // Disable if no user
                required
              />
              <Input
                placeholder='Locatie (optioneel)'
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                disabled={!currentUserId || isSubmitting} // Disable if no user
              />
              <Button
                type='submit'
                disabled={
                  !newNoteTitle.trim() ||
                  !newNote.trim() ||
                  !currentUserId ||
                  isSubmitting
                }
              >
                {isSubmitting ? "Toevoegen..." : "Nieuwe Notitie Opslaan"}
              </Button>
              {!currentUserId && (
                <p className='text-xs text-destructive'>
                  Log in om een notitie toe te voegen.
                </p>
              )}
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
                      <div
                        className='flex-1 mr-2 cursor-pointer hover:bg-muted/80 rounded p-1 -m-1'
                        onClick={() => handleViewClick(note)}
                        role='button'
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleViewClick(note);
                          }
                        }}
                      >
                        <p className='font-medium mb-1'>{note.note_title}</p>
                        <p className='text-sm text-muted-foreground whitespace-pre-wrap mb-1'>
                          {truncateText(note.note_text, 100)}
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
                        <p className='text-xs text-muted-foreground mb-1'>
                          Door: {getUserNameById(note.user_id)}
                        </p>
                      </div>
                      <div className='flex flex-col space-y-1 ml-2'>
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => handleEditClick(note)}
                          className='h-7 w-7'
                          aria-label='Bewerk notitie'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => setDeletingNoteId(note.id)}
                            className='h-7 w-7'
                            aria-label='Verwijder notitie'
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
              disabled={
                !editNoteTitle.trim() || !editText.trim() || isSubmitting
              }
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

      <NoteDetailDialog
        note={
          viewingNote
            ? {
                ...viewingNote,
                user_name: getUserNameById(viewingNote.user_id),
              }
            : null
        }
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onEdit={handleEditFromDetail}
      />
    </AlertDialog>
  );
}
