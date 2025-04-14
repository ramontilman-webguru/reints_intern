import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils"; // Assuming you have a utility for initials
import { format } from "date-fns"; // For date formatting

// Helper to map status to variant and text
const statusMap = {
  todo: { variant: "secondary", text: "To Do" },
  in_progress: { variant: "default", text: "In Progress" },
  done: { variant: "outline", text: "Done" },
};

export default function TasksList({ tasks, customers }) {
  const getCustomerById = (id) => customers.find((c) => c.id === id);

  return (
    <div className='border rounded-lg'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Taak</TableHead>
            <TableHead>Klant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Week</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='h-24 text-center'>
                Geen taken gevonden.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const customer = getCustomerById(task.customer_id);
              const statusInfo = statusMap[task.status] || statusMap.todo;
              return (
                <TableRow key={task.id}>
                  <TableCell className='font-medium'>{task.title}</TableCell>
                  <TableCell>
                    {customer ? (
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-6 w-6'>
                          <AvatarImage
                            src={customer.avatar_url}
                            alt={customer.company || customer.name}
                          />
                          <AvatarFallback>
                            {getInitials(customer.company || customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        {customer.company || "N.v.t."}
                      </div>
                    ) : (
                      "N.v.t."
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.text}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    {task.week_number || "-"}
                  </TableCell>
                  <TableCell>
                    {task.due_date
                      ? format(new Date(task.due_date), "dd-MM-yyyy")
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
