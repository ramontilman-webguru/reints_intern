import { getCustomerById, getTasksByCustomer } from "@/lib/data-service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import TaskCard from "@/components/task-card"; // Reuse TaskCard for consistency
import CustomerNotes from "@/components/customer-notes"; // Import the new component

export default async function CustomerDetailPage({ params }) {
  const customerId = params.customerId;
  const customer = await getCustomerById(customerId);
  const tasks = await getTasksByCustomer(customerId);

  if (!customer) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <p className='text-lg text-muted-foreground'>Klant niet gevonden.</p>
        <Link href='/dashboard/customers'>
          <Button variant='link' className='mt-4'>
            <ArrowLeft className='mr-2 h-4 w-4' /> Terug naar Klanten
          </Button>
        </Link>
      </div>
    );
  }

  // Group tasks by status for display
  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            {customer.company || customer.name}
          </h2>
          {customer.company && customer.name && (
            <p className='text-muted-foreground'>{customer.name}</p>
          )}
        </div>
        <Link href='/dashboard/customers'>
          <Button variant='outline'>
            <ArrowLeft className='mr-2 h-4 w-4' /> Terug naar Klanten
          </Button>
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Customer Details Card */}
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle>Klantgegevens</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {customer.email && (
              <div className='flex items-center text-sm'>
                <Mail className='mr-2 h-4 w-4 text-muted-foreground' />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className='flex items-center text-sm'>
                <Phone className='mr-2 h-4 w-4 text-muted-foreground' />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className='flex items-start text-sm'>
                <MapPin className='mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                <span>{customer.address}</span>
              </div>
            )}
            {customer.notes && (
              <>
                <Separator />
                <div>
                  <h4 className='text-sm font-medium mb-1'>Notities</h4>
                  <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                    {customer.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <div className='md:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                Openstaande Taken ({todoTasks.length + inProgressTasks.length})
              </CardTitle>
              <CardDescription>
                Taken die nog aandacht nodig hebben voor deze klant.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {todoTasks.length === 0 && inProgressTasks.length === 0 && (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  Geen openstaande taken.
                </p>
              )}
              {todoTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Afgeronde Taken ({doneTasks.length})</CardTitle>
              <CardDescription>
                Voltooide taken voor deze klant.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {doneTasks.length === 0 && (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  Nog geen afgeronde taken.
                </p>
              )}
              {doneTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add the CustomerNotes component here */}
      <CustomerNotes customerId={customerId} />
    </div>
  );
}
