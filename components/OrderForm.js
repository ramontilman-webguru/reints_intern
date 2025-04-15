"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, PlusCircle } from "lucide-react";
import { createOrderAction } from "@/app/actions/orderActions"; // Server Action (to be created)

// Helper to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount || 0);
}

export default function OrderForm({ customers, products, order }) {
  // Add order prop for editing later
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    order?.customer_id || ""
  );
  const [status, setStatus] = useState(order?.status || "quote"); // Default to quote
  const [notes, setNotes] = useState(order?.notes || "");
  const [lineItems, setLineItems] = useState(order?.order_items || []); // Expecting order_items from fetched order for edit
  const [selectedProductId, setSelectedProductId] = useState("");

  // Calculate total whenever line items change
  const total = useMemo(() => {
    return lineItems.reduce(
      (sum, item) => sum + item.quantity * item.price_at_time,
      0
    );
  }, [lineItems]);

  const handleAddProduct = () => {
    const productToAdd = products.find((p) => p.id === selectedProductId);
    if (!productToAdd) return;

    // Check if product already exists in line items
    const existingItemIndex = lineItems.findIndex(
      (item) => item.product_id === productToAdd.id
    );

    if (existingItemIndex > -1) {
      // Increment quantity if product exists
      const updatedItems = [...lineItems];
      updatedItems[existingItemIndex].quantity += 1;
      setLineItems(updatedItems);
    } else {
      // Add new line item
      setLineItems((prevItems) => [
        ...prevItems,
        {
          // Generate a temporary client-side ID for key prop, won't be sent to server
          temp_id: Math.random().toString(36).substring(2),
          product_id: productToAdd.id,
          name: productToAdd.name, // Store name for display
          quantity: 1,
          price_at_time: parseFloat(productToAdd.price), // Store price at time of adding
        },
      ]);
    }
    setSelectedProductId(""); // Reset product selection
  };

  const handleQuantityChange = (temp_id, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1); // Ensure quantity is at least 1
    setLineItems((prevItems) =>
      prevItems.map((item) =>
        item.temp_id === temp_id ? { ...item, quantity: quantity } : item
      )
    );
  };

  const handleRemoveItem = (temp_id) => {
    setLineItems((prevItems) =>
      prevItems.filter((item) => item.temp_id !== temp_id)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }
    if (lineItems.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    // Prepare data for server action
    const orderData = {
      customer_id: selectedCustomerId,
      status: status,
      notes: notes,
      total: total,
      // Map line items, removing temp_id and name
      order_items: lineItems.map(({ product_id, quantity, price_at_time }) => ({
        product_id,
        quantity,
        price_at_time,
      })),
    };

    startTransition(async () => {
      // TODO: Add update logic later
      const result = await createOrderAction(orderData);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/orders");
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {order ? "Edit Order" : "New Quote/Order Details"}
          </CardTitle>
          {/* Potentially add Order ID display when editing */}
        </CardHeader>
        <CardContent className='grid gap-6'>
          {/* Customer and Status Selection */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='customer'>Customer</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                required
                disabled={isPending}
              >
                <SelectTrigger id='customer'>
                  <SelectValue placeholder='Select a customer...' />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
                required
                disabled={isPending}
              >
                <SelectTrigger id='status'>
                  <SelectValue placeholder='Select status...' />
                </SelectTrigger>
                <SelectContent>
                  {/* Define relevant statuses */}
                  <SelectItem value='quote'>Quote</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='ordered'>Ordered</SelectItem>
                  <SelectItem value='invoiced'>Invoiced</SelectItem>
                  <SelectItem value='paid'>Paid</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Product Section */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-medium mb-4'>Products</h3>
            <div className='flex items-end gap-2 mb-4'>
              <div className='flex-grow space-y-2'>
                <Label htmlFor='product'>Add Product</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  disabled={isPending}
                >
                  <SelectTrigger id='product'>
                    <SelectValue placeholder='Select a product...' />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({formatCurrency(product.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type='button'
                onClick={handleAddProduct}
                disabled={!selectedProductId || isPending}
                variant='outline'
              >
                <PlusCircle className='h-4 w-4 mr-2' /> Add
              </Button>
            </div>

            {/* Line Items Table */}
            {lineItems.length > 0 && (
              <div className='border rounded-md'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className='w-[100px]'>Quantity</TableHead>
                      <TableHead className='text-right'>Unit Price</TableHead>
                      <TableHead className='text-right'>Line Total</TableHead>
                      <TableHead className='w-[50px]'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.temp_id || item.id}>
                        {" "}
                        {/* Use item.id if editing existing */}
                        <TableCell className='font-medium'>
                          {item.name ||
                            products.find((p) => p.id === item.product_id)
                              ?.name ||
                            "Product not found"}
                        </TableCell>
                        <TableCell>
                          <Input
                            type='number'
                            min='1'
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.temp_id || item.id,
                                e.target.value
                              )
                            }
                            className='w-full h-8'
                            disabled={isPending}
                          />
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(item.price_at_time)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(item.quantity * item.price_at_time)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() =>
                              handleRemoveItem(item.temp_id || item.id)
                            }
                            disabled={isPending}
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Notes and Total Section */}
          <div className='border-t pt-6 grid gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes</Label>
              <Textarea
                id='notes'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder='Add any relevant notes for this order...'
                rows={3}
                disabled={isPending}
              />
            </div>
            <div className='flex justify-end font-semibold text-lg'>
              <span>Total: {formatCurrency(total)}</span>
            </div>
          </div>

          {error && (
            <p className='text-sm text-red-600 text-center mt-2'>{error}</p>
          )}
        </CardContent>
        <CardFooter className='flex justify-end gap-2'>
          <Button
            variant='outline'
            type='button'
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending || lineItems.length === 0}>
            {isPending
              ? order
                ? "Saving..."
                : "Creating..."
              : order
              ? "Save Changes"
              : "Create Quote/Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
