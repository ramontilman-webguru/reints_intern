"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import CreateNoteDialog from "@/components/create-note-dialog";
import EditNoteDialog from "@/components/edit-note-dialog";
import DeleteNoteDialog from "@/components/delete-note-dialog";
import NoteDetailDialog from "@/components/note-detail-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);

  const [viewingNote, setViewingNote] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data = await response.json();
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Kon notities niet laden.");
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    toast.success("Notitie succesvol aangemaakt!");
    fetchNotes();
  };

  const handleEditSuccess = () => {
    setEditingNote(null);
    toast.success("Notitie succesvol bijgewerkt!");
    fetchNotes();
  };

  const handleDeleteSuccess = () => {
    setDeletingNote(null);
    toast.success("Notitie succesvol verwijderd!");
    fetchNotes();
  };

  const handleViewClick = (note) => {
    setViewingNote(note);
    setIsDetailDialogOpen(true);
  };

  const handleEditFromDetail = (note) => {
    setIsDetailDialogOpen(false);
    setTimeout(() => {
      setEditingNote(note);
    }, 100);
  };

  const filteredNotes = notes.filter((note) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      note.note_title?.toLowerCase().includes(lowerSearchTerm) ||
      note.note_text?.toLowerCase().includes(lowerSearchTerm) ||
      note.location?.toLowerCase().includes(lowerSearchTerm) ||
      note.customer_name?.toLowerCase().includes(lowerSearchTerm)
    );
  });

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Alle Notities</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className='mr-2 h-4 w-4' /> Nieuwe Notitie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notities Overzicht</CardTitle>
          <CardDescription>
            Bekijk, zoek, bewerk of verwijder notities.
          </CardDescription>
          <div className='mt-4'>
            <Input
              placeholder='Zoek notities...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-3'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='flex items-center space-x-4 p-2'>
                  <Skeleton className='h-8 w-[200px]' />
                  <Skeleton className='h-8 w-[100px]' />
                  <Skeleton className='h-8 w-[150px]' />
                  <Skeleton className='h-8 w-[150px]' />
                  <Skeleton className='h-8 w-[80px] ml-auto' />
                </div>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <p className='text-center text-muted-foreground py-4'>
              {searchTerm
                ? "Geen notities gevonden."
                : "Er zijn nog geen notities."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[30%]'>Titel</TableHead>
                  <TableHead>Locatie</TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className='text-right'>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note) => (
                  <TableRow
                    key={note.id}
                    className='hover:bg-muted/50 cursor-pointer'
                    onClick={(e) => {
                      const target = e.target;
                      if (target.closest('[data-no-row-click="true"]')) {
                        return;
                      }
                      handleViewClick(note);
                    }}
                  >
                    <TableCell className='font-medium'>
                      {note.note_title}
                    </TableCell>
                    <TableCell>{note.location || "-"}</TableCell>
                    <TableCell>{note.customer_name}</TableCell>
                    <TableCell>
                      {format(new Date(note.created_at), "P p", { locale: nl })}
                    </TableCell>
                    <TableCell
                      className='text-right space-x-2'
                      data-no-row-click='true'
                    >
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNote(note);
                        }}
                        className='h-8 w-8'
                        aria-label='Bewerk notitie'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingNote(note);
                        }}
                        className='h-8 w-8'
                        aria-label='Verwijder notitie'
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

      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditNoteDialog
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSuccess={handleEditSuccess}
      />

      <DeleteNoteDialog
        note={deletingNote}
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onSuccess={handleDeleteSuccess}
      />

      <NoteDetailDialog
        note={viewingNote}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
}
