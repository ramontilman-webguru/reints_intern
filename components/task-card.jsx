"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  MoreVertical,
  User,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Hash,
  Pencil,
} from "lucide-react";
import { deleteTask, updateTaskStatus } from "@/lib/data-service";
import EditTaskDialog from "./edit-task-dialog";

// Functie om prioriteit badge te renderen
function PriorityBadge({ priority }) {
  const colors = {
    low: "bg-green-100 text-green-800 hover:bg-green-100",
    medium: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    high: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  const labels = {
    low: "Laag",
    medium: "Middel",
    high: "Hoog",
  };

  return (
    <Badge className={colors[priority]} variant='outline'>
      {labels[priority]}
    </Badge>
  );
}

export default function TaskCard({ task, customers }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Functie om de datum te formatteren
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("nl-NL");
  };

  // Functie om taak te verwijderen
  const handleDelete = async () => {
    if (window.confirm("Weet je zeker dat je deze taak wilt verwijderen?")) {
      try {
        await deleteTask(task.id);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Er is een fout opgetreden bij het verwijderen van de taak.");
      }
    }
  };

  // Function to handle status change
  const handleStatusChange = async (newStatus) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateTaskStatus(task.id, newStatus);
      // Refresh the page to reflect the changes
      // In a more complex app, you might update local state instead
      window.location.reload();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de taakstatus.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Bepaal welke status knoppen we moeten tonen
  const renderStatusActions = () => {
    switch (task.status) {
      case "todo":
        return (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleStatusChange("in_progress")}
            disabled={isUpdating}
          >
            <ArrowRight className='h-4 w-4 mr-1' />
            Start
          </Button>
        );
      case "in_progress":
        return (
          <>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleStatusChange("todo")}
              disabled={isUpdating}
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              Terug
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleStatusChange("done")}
              disabled={isUpdating}
            >
              <ArrowRight className='h-4 w-4 mr-1' />
              Afronden
            </Button>
          </>
        );
      case "done":
        return (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleStatusChange("in_progress")}
            disabled={isUpdating}
          >
            <ArrowLeft className='h-4 w-4 mr-1' />
            Heropenen
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardContent className='p-4'>
          <div className='flex justify-between items-start mb-2'>
            <h4 className='font-medium'>{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className='h-4 w-4 mr-2' />
                  Bewerken
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className='text-red-600'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Verwijderen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className='text-sm text-slate-500 mb-3'>{task.description}</p>
          )}

          <div className='flex flex-wrap gap-2 mb-3'>
            <PriorityBadge priority={task.priority} />

            {task.customer && (
              <Badge variant='outline' className='bg-slate-100 text-slate-800'>
                <User className='h-3 w-3 mr-1' />
                {task.customer.company || task.customer.name}
              </Badge>
            )}

            {task.due_date && (
              <Badge
                variant='outline'
                className='bg-purple-100 text-purple-800'
              >
                <Calendar className='h-3 w-3 mr-1' />
                {formatDate(task.due_date)}
              </Badge>
            )}

            {task.week_number && (
              <Badge variant='outline' className='bg-blue-100 text-blue-800'>
                <Hash className='h-3 w-3 mr-1' />
                Week {task.week_number}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className='pt-0 px-4 pb-4 flex justify-between'>
          {renderStatusActions()}
        </CardFooter>
      </Card>
      <EditTaskDialog
        task={task}
        customers={customers}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
