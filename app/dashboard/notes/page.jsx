"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Edit, Plus } from "lucide-react";
import EditNoteDialog from "@/components/edit-note-dialog";
import DeleteNoteDialog from "@/components/delete-note-dialog";
import CreateNoteDialog from "@/components/create-note-dialog";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

// Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

export default function AllNotesPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchAllNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notes"); // Fetch from the new API endpoint
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
  }, []);

  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  const handleEditSuccess = () => {
    setEditingNote(null);
    fetchAllNotes(); // Refresh notes after successful edit
    toast.success("Notitie bijgewerkt.");
  };

  const handleDeleteSuccess = () => {
    setDeletingNote(null);
    fetchAllNotes(); // Refresh notes after successful deletion
    toast.success("Notitie verwijderd.");
  };

  const handleAddSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchAllNotes();
    toast.success("Notitie toegevoegd.");
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Alle Notities</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' /> Nieuwe Notitie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overzicht Notities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className='text-center text-muted-foreground'>
              Notities laden...
            </p>
          ) : notes.length === 0 ? (
            <p className='text-center text-muted-foreground'>
              Geen notities gevonden.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[40%]'>Notitie</TableHead>
                  <TableHead>Locatie</TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className='text-right'>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className='font-medium whitespace-pre-wrap'>
                      {truncateText(note.note_text, 100)} // Truncate for table
                      view
                    </TableCell>
                    <TableCell>{note.location || "-"}</TableCell>
                    <TableCell>{note.customer_name}</TableCell>
                    <TableCell>
                      {format(new Date(note.created_at), "P p", { locale: nl })}
                    </TableCell>
                    <TableCell className='text-right space-x-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => setEditingNote(note)}
                        className='h-8 w-8'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        onClick={() => setDeletingNote(note)}
                        className='h-8 w-8'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditNoteDialog
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNoteDialog
        note={deletingNote}
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onSuccess={handleDeleteSuccess}
      />

      {/* Create Note Dialog */}
      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
