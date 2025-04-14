// components/customers-table.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default function CustomersTable({ customers }) {
  return (
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
                  <Link href={`/dashboard/customers/${customer.id}`}>
                    {customer.company || "-"}
                  </Link>
                </TableCell>
                <TableCell className='font-medium'>
                  <Link href={`/dashboard/customers/${customer.id}`}>
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell>{customer.email || "-"}</TableCell>
                <TableCell>{customer.phone || "-"}</TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button variant='ghost' size='icon'>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon'>
                      <Trash2 className='h-4 w-4' />
                    </Button>
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
  );
}
