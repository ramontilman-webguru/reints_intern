// components/customers-table.jsx
"use client"; // Make it a client component
import { useState } from "react"; // Import useState
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import EditCustomerDialog from "./edit-customer-dialog"; // Import the dialog

export default function CustomersTable({ customers }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  // Add a delete handler function (optional, if needed)
  // const handleDeleteClick = (customerId) => { ... };

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bedrijf</TableHead>
              <TableHead>Contactpersoon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefoon</TableHead>
              <TableHead className='text-right'>Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className='hover:underline'
                    >
                      {customer.company || "-"}
                    </Link>
                  </TableCell>
                  <TableCell className='font-medium'>
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className='hover:underline'
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{customer.email || "-"}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleEditClick(customer)} // Call handler
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      {/* Optional: Delete Button */}
                      {/* <Button variant='ghost' size='icon' className='text-destructive' onClick={() => handleDeleteClick(customer.id)}> <Trash2 className='h-4 w-4' /> </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center py-8 text-muted-foreground'
                >
                  Geen klanten gevonden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <EditCustomerDialog
        customer={selectedCustomer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
