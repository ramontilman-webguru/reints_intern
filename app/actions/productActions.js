"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Server Action to create a new product
export async function createProductAction(formData) {
  const productData = {
    name: formData.name,
    description: formData.description || null,
    price: parseFloat(formData.price), // Ensure price is a number
    sku: formData.sku || null,
    category: formData.category || null,
    // Ensure stock is a number or null if empty/invalid
    stock:
      formData.stock !== "" && !isNaN(parseInt(formData.stock))
        ? parseInt(formData.stock)
        : 0,
  };

  // Validate price and stock again on server
  if (isNaN(productData.price) || productData.price <= 0) {
    return { error: "Invalid price." };
  }
  if (isNaN(productData.stock) || productData.stock < 0) {
    return { error: "Invalid stock quantity." };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .insert([productData]) // Insert data into Supabase
      .select(); // Optionally select the inserted data

    if (error) {
      console.error("Supabase Insert Error:", error);
      return { error: `Failed to create product: ${error.message}` };
    }

    // Revalidate the products page cache to show the new product immediately
    revalidatePath("/dashboard/products");

    // No need to return data here as we redirect in the component
    // return { success: true, data }; // Or just { success: true }
  } catch (e) {
    console.error("Create Product Action Error:", e);
    return { error: "An unexpected error occurred." };
  }

  // Redirect is now handled in the client component after action success
  // redirect('/dashboard/products'); // Can't redirect here if returning error object
}

// Server Action to update an existing product
export async function updateProductAction(productId, formData) {
  if (!productId) {
    return { error: "Product ID is missing." };
  }

  const productData = {
    name: formData.name,
    description: formData.description || null,
    price: parseFloat(formData.price),
    sku: formData.sku || null,
    category: formData.category || null,
    stock:
      formData.stock !== "" && !isNaN(parseInt(formData.stock))
        ? parseInt(formData.stock)
        : 0,
    updated_at: new Date(), // Update the timestamp
  };

  // Validate price and stock again on server
  if (isNaN(productData.price) || productData.price <= 0) {
    return { error: "Invalid price." };
  }
  if (isNaN(productData.stock) || productData.stock < 0) {
    return { error: "Invalid stock quantity." };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId) // Match the product ID
      .select();

    if (error) {
      console.error("Supabase Update Error:", error);
      return { error: `Failed to update product: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { error: "Product not found or update failed." };
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${productId}/edit`); // Revalidate the edit page too
  } catch (e) {
    console.error("Update Product Action Error:", e);
    return { error: "An unexpected error occurred." };
  }
}

// Server Action to delete a product
export async function deleteProductAction(productId) {
  if (!productId) {
    return { error: "Product ID is missing." };
  }

  try {
    // Check if product is linked to any order items
    // Note: This depends on your RLS and desired behavior.
    // If you want to prevent deletion if linked, uncomment and adjust:
    // const { count, error: countError } = await supabase
    //   .from('order_items')
    //   .select('id', { count: 'exact' })
    //   .eq('product_id', productId);
    //
    // if (countError) {
    //   console.error('Supabase Count Error:', countError);
    //   return { error: 'Failed to check product links.' };
    // }
    // if (count > 0) {
    //    return { error: 'Cannot delete product because it is linked to existing orders/quotes.' };
    // }

    // Proceed with deletion
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Supabase Delete Error:", error);
      // Handle specific errors like foreign key constraints if needed
      return { error: `Failed to delete product: ${error.message}` };
    }

    // Revalidate the products list page
    revalidatePath("/dashboard/products");
    return { success: true }; // Indicate success
  } catch (e) {
    console.error("Delete Product Action Error:", e);
    return { error: "An unexpected error occurred during deletion." };
  }
}
