// app/dashboard/tasks/page.jsx
import { getTasks, getCustomers } from "@/lib/data-service";
import TasksBoard from "@/components/task-board";
import AddTaskDialog from "@/components/add-task-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export default async function TasksPage() {
  const tasks = await getTasks();
  const customers = await getCustomers();

  // Groepeer taken op status
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h2 className='text-3xl font-bold tracking-tight'>Takenbord</h2>
        <div className='flex gap-2'>
          <Link href='/dashboard/tasks/weekly'>
            <Button variant='outline'>
              <CalendarDays className='mr-2 h-4 w-4' />
              Weekoverzicht
            </Button>
          </Link>
          <AddTaskDialog customers={customers} />
        </div>
      </div>

      <TasksBoard
        todoTasks={todoTasks}
        inProgressTasks={inProgressTasks}
        doneTasks={doneTasks}
      />
    </div>
  );
}
