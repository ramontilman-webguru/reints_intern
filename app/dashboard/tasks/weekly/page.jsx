"use client";

import { useState, useEffect, useMemo } from "react";
import { getTasks } from "@/lib/data-service";
import { getCurrentWeekNumber } from "@/lib/utils";
import TaskCard from "@/components/task-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WeeklyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekNumber());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Kon taken niet laden.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const tasksForSelectedWeek = useMemo(() => {
    return tasks.filter((task) => task.week_number === selectedWeek);
  }, [tasks, selectedWeek]);

  const tasksGroupedByCustomer = useMemo(() => {
    const grouped = {};
    tasksForSelectedWeek.forEach((task) => {
      const customerKey = task.customer_id || "no_customer";
      if (!grouped[customerKey]) {
        grouped[customerKey] = {
          customer: task.customer || { id: "no_customer", name: "Geen Klant" },
          tasks: [],
        };
      }
      grouped[customerKey].tasks.push(task);
    });
    // Sort customers by name/company
    return Object.values(grouped).sort((a, b) => {
      const nameA = a.customer.company || a.customer.name || "";
      const nameB = b.customer.company || b.customer.name || "";
      return nameA.localeCompare(nameB);
    });
  }, [tasksForSelectedWeek]);

  const handleWeekChange = (e) => {
    const week = parseInt(e.target.value, 10);
    if (!isNaN(week)) {
      setSelectedWeek(week);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <Link href='/dashboard/tasks'>
            <Button variant='outline' size='sm' className='mb-2'>
              <ArrowLeft className='mr-2 h-4 w-4' /> Terug naar Takenbord
            </Button>
          </Link>
          <h2 className='text-3xl font-bold tracking-tight'>
            Weekoverzicht Taken
          </h2>
          <p className='text-muted-foreground'>
            Bekijk taken per klant voor een specifieke week.
          </p>
        </div>
        <div className='space-y-1'>
          <Label htmlFor='week-select'>Selecteer Week</Label>
          <Input
            id='week-select'
            type='number'
            value={selectedWeek}
            onChange={handleWeekChange}
            min='1'
            max='53'
            className='w-32'
          />
        </div>
      </div>

      {isLoading && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-6 w-3/4' />
                <Skeleton className='h-4 w-1/2 mt-1' />
              </CardHeader>
              <CardContent className='space-y-3'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className='text-center text-red-600 bg-red-50 p-4 rounded-md'>
          {error}
        </div>
      )}

      {!isLoading && !error && tasksGroupedByCustomer.length === 0 && (
        <div className='text-center text-muted-foreground bg-slate-50 p-6 rounded-md border'>
          Geen taken gevonden voor week {selectedWeek}.
        </div>
      )}

      {!isLoading && !error && tasksGroupedByCustomer.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {tasksGroupedByCustomer.map(({ customer, tasks: customerTasks }) => (
            <Card key={customer.id}>
              <CardHeader>
                <CardTitle>{customer.company || customer.name}</CardTitle>
                <CardDescription>
                  {customerTasks.length} ta(a)k(en) in week {selectedWeek}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                {customerTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
