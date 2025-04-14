// app/dashboard/tasks/page.jsx
"use client";

import { useState, useEffect } from "react";
import { getTasks, getCustomers, getAllTags } from "@/lib/data-service";
import TasksBoard from "@/components/task-board";
import TasksList from "@/components/tasks-list";
import AddTaskDialog from "@/components/add-task-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, List, LayoutGrid, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState("board");
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedTasks, fetchedCustomers, fetchedTags] = await Promise.all(
          [getTasks(), getCustomers(), getAllTags()]
        );
        setTasks(fetchedTasks);
        setCustomers(fetchedCustomers);
        setAllTags(fetchedTags);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTasks = selectedTag
    ? tasks.filter((task) => task.tags && task.tags.includes(selectedTag))
    : tasks;

  const todoTasks = filteredTasks.filter((task) => task.status === "todo");
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "in_progress"
  );
  const doneTasks = filteredTasks.filter((task) => task.status === "done");

  const handleTagFilterChange = (tagValue) => {
    setSelectedTag(tagValue === "all" || !tagValue ? null : tagValue);
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <h2 className='text-3xl font-bold tracking-tight'>Taken</h2>
        <div className='flex gap-2 items-center flex-wrap'>
          <Select
            onValueChange={handleTagFilterChange}
            value={selectedTag || "all"}
          >
            <SelectTrigger className='w-[180px]'>
              <Filter className='h-4 w-4 mr-2' />
              <SelectValue placeholder='Filter op tag...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Alle Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTag && (
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleTagFilterChange("all")}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Clear filter</span>
            </Button>
          )}
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
          <AddTaskDialog customers={customers} allTags={allTags} />
        </div>
      </div>

      {viewMode === "board" ? (
        <TasksBoard
          todoTasks={todoTasks}
          inProgressTasks={inProgressTasks}
          doneTasks={doneTasks}
          customers={customers}
          allTags={allTags}
        />
      ) : (
        <TasksList tasks={filteredTasks} customers={customers} />
      )}
    </div>
  );
}
