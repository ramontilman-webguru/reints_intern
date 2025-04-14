// app/dashboard/tasks/page.jsx
"use client";

import { useState, useEffect } from "react";
import { getTasks, getCustomers } from "@/lib/data-service";
import TasksBoard from "@/components/task-board";
import TasksList from "@/components/tasks-list";
import AddTaskDialog from "@/components/add-task-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, List, LayoutGrid } from "lucide-react";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState("board");
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedTasks, fetchedCustomers] = await Promise.all([
          getTasks(),
          getCustomers(),
        ]);
        setTasks(fetchedTasks);
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Failed to fetch tasks or customers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h2 className='text-3xl font-bold tracking-tight'>Taken</h2>
        <div className='flex gap-2 items-center'>
          <Button
            variant={viewMode === "board" ? "secondary" : "outline"}
            size='icon'
            onClick={() => setViewMode("board")}
          >
            <LayoutGrid className='h-4 w-4' />
            <span className='sr-only'>Board View</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "outline"}
            size='icon'
            onClick={() => setViewMode("list")}
          >
            <List className='h-4 w-4' />
            <span className='sr-only'>List View</span>
          </Button>
          <Link href='/dashboard/tasks/weekly'>
            <Button variant='outline'>
              <CalendarDays className='mr-2 h-4 w-4' />
              Weekoverzicht
            </Button>
          </Link>
          <AddTaskDialog customers={customers} />
        </div>
      </div>

      {viewMode === "board" ? (
        <TasksBoard
          todoTasks={todoTasks}
          inProgressTasks={inProgressTasks}
          doneTasks={doneTasks}
          customers={customers}
        />
      ) : (
        <TasksList tasks={tasks} customers={customers} />
      )}
    </div>
  );
}
