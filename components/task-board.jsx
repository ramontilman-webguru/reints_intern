// components/tasks-board.jsx
"use client";
import { useState } from "react";
import TaskCard from "@/components/task-card";
import { updateTaskStatus } from "@/lib/data-service";
import { ClipboardList, PlayCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TasksBoard({
  todoTasks,
  inProgressTasks,
  doneTasks,
  customers,
  allTags,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (taskId, newStatus) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de taakstatus.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      {/* Te Doen Kolom */}
      <div className='bg-slate-50 rounded-lg border border-slate-200 p-4'>
        <div className='flex items-center mb-4'>
          <ClipboardList className='h-5 w-5 text-slate-500 mr-2' />
          <h3 className='font-medium text-lg'>Te Doen</h3>
          <span className='ml-2 bg-slate-200 text-slate-700 rounded-full px-2 py-0.5 text-xs font-medium'>
            {todoTasks.length}
          </span>
        </div>

        <div className='space-y-3'>
          {todoTasks.length > 0 ? (
            todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                customers={customers}
                allTags={allTags}
              />
            ))
          ) : (
            <div className='text-center p-4 text-slate-500 text-sm'>
              Geen openstaande taken
            </div>
          )}
        </div>
      </div>

      {/* In Uitvoering Kolom */}
      <div className='bg-slate-50 rounded-lg border border-slate-200 p-4'>
        <div className='flex items-center mb-4'>
          <PlayCircle className='h-5 w-5 text-blue-500 mr-2' />
          <h3 className='font-medium text-lg'>In Uitvoering</h3>
          <span className='ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium'>
            {inProgressTasks.length}
          </span>
        </div>

        <div className='space-y-3'>
          {inProgressTasks.length > 0 ? (
            inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                customers={customers}
                allTags={allTags}
              />
            ))
          ) : (
            <div className='text-center p-4 text-slate-500 text-sm'>
              Geen taken in uitvoering
            </div>
          )}
        </div>
      </div>

      {/* Afgerond Kolom */}
      <div className='bg-slate-50 rounded-lg border border-slate-200 p-4'>
        <div className='flex items-center mb-4'>
          <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
          <h3 className='font-medium text-lg'>Afgerond</h3>
          <span className='ml-2 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium'>
            {doneTasks.length}
          </span>
        </div>

        <div className='space-y-3'>
          {doneTasks.length > 0 ? (
            doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                customers={customers}
                allTags={allTags}
              />
            ))
          ) : (
            <div className='text-center p-4 text-slate-500 text-sm'>
              Geen afgeronde taken
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
