"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default function NoteDetailDialog({ note, isOpen, onClose }) {
  if (!note) return null; // Don't render if no note is selected

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{note.note_title || "Notitie Details"}</DialogTitle>
        </DialogHeader>
        <div className='py-4 space-y-4'>
          <div>
            <h4 className='text-sm font-semibold mb-1 text-muted-foreground'>
              Notitie Tekst:
            </h4>
            <p className='text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md'>
              {note.note_text}
            </p>
          </div>
          {note.location && (
            <div>
              <h4 className='text-sm font-semibold mb-1 text-muted-foreground'>
                Locatie:
              </h4>
              <p className='text-sm'>{note.location}</p>
            </div>
          )}
          <div>
            <h4 className='text-sm font-semibold mb-1 text-muted-foreground'>
              Aangemaakt op:
            </h4>
            <p className='text-sm'>
              {format(new Date(note.created_at), "PPPp", { locale: nl })}
            </p>
          </div>
          {/* Optionally add Customer Name if available */}
          {note.customer_name && (
            <div>
              <h4 className='text-sm font-semibold mb-1 text-muted-foreground'>
                Klant:
              </h4>
              <p className='text-sm'>{note.customer_name}</p>
            </div>
          )}
          {/* If viewing from customer page, customerId is available, could link back */}
          {/* We might need to adjust data fetching/passing if customer name isn't always present */}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Sluiten
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
