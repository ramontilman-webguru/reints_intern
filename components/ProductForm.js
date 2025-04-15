"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProductAction } from "@/app/actions/productActions";
import { updateProductAction } from "@/app/actions/productActions"; // Import the update action

export default function ProductForm({ product }) {
  // Accept optional product prop for editing later
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  // Initialize form state based on whether product exists
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    // Format price for input if it exists
    price: product?.price ? product.price.toString() : "",
    sku: product?.sku || "",
    category: product?.category || "",
    // Use optional chaining and nullish coalescing for safety
    stock: product?.stock?.toString() ?? "0",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.price) {
      setError("Product name and price are required.");
      return;
    }

    startTransition(async () => {
      let result;
      if (product) {
        // If product exists, call update action
        result = await updateProductAction(product.id, formData);
      } else {
        // Otherwise, call create action
        result = await createProductAction(formData);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect to products page on success (for both create and update)
        router.push("/dashboard/products");
        // Optionally: Add a success toast/message here
        router.refresh(); // Refresh server components on the target page
      }
    });
  };

  return (
    <Card className='max-w-2xl mx-auto'>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {product ? "Edit Product" : "New Product Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Product Name</Label>
              <Input
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isPending}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='price'>Price (€)</Label>
              <Input
                id='price'
                name='price'
                type='number'
                step='0.01'
                value={formData.price}
                onChange={handleChange}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='sku'>SKU</Label>
              <Input
                id='sku'
                name='sku'
                value={formData.sku}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='category'>Category</Label>
              <Input
                id='category'
                name='category'
                value={formData.category}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='stock'>Stock</Label>
              <Input
                id='stock'
                name='stock'
                type='number'
                value={formData.stock}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>
          </div>

          {error && <p className='text-sm text-red-600'>{error}</p>}
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
          <Button type='submit' disabled={isPending}>
            {isPending
              ? product
                ? "Saving..."
                : "Creating..."
              : product
              ? "Save Changes"
              : "Create Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
