import React from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye } from "lucide-react";

export const metadata = {
  title: "Orders | Reints Office",
  description: "Manage your quotes, orders, and invoices",
};

// Fetch orders data on the server, joining with customer name
async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      total,
      created_at,
      customer:customers ( name )
    `
    )
    .order("created_at", { ascending: false }); // Show newest first

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  // The result includes a nested customer object like { customer: { name: 'Customer Name' } }
  // Or { customer: null } if customer_id is null
  return data;
}

// Helper to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Helper to get badge variant based on status
function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return "secondary";
    case "quote":
      return "outline"; // Example: Use outline for quotes
    case "ordered":
      return "default"; // Example: Use default for orders
    case "invoiced":
      return "success"; // Example: Custom variant? Or just default?
    case "paid":
      return "success"; // Example: Paid invoices
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

// Make the page component async
export default async function OrdersPage() {
  const orders = await getOrders();

  // TEMP: Just display raw data for now
  // console.log(orders);

  return (
    <div className='container mx-auto py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Quotes / Orders / Invoices</h1>
        <Button asChild>
          <Link href='/dashboard/orders/new'>Create New Quote/Order</Link>
        </Button>
      </div>

      {orders.length > 0 ? (
        <div className='border rounded-lg overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right'>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className='font-medium truncate w-1/6'>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className='hover:underline'
                    >
                      {order.id.substring(0, 8)}...
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.created_at
                      ? format(new Date(order.created_at), "dd-MM-yyyy HH:mm")
                      : "N/A"}
                  </TableCell>
                  <TableCell className='text-right'>
                    {order.total ? formatCurrency(order.total) : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant='outline' size='icon' asChild>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Eye className='h-4 w-4' />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className='text-center py-10 border rounded-lg bg-gray-50'>
          <h3 className='text-lg font-semibold mb-2'>No orders found</h3>
          <p className='text-sm text-gray-500 mb-4'>
            Get started by creating a new quote or order.
          </p>
          <Button asChild>
            <Link href='/dashboard/orders/new'>Create New Quote/Order</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
