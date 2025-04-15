import React from "react";
import { supabase } from "@/lib/supabase";
import ProductForm from "@/components/ProductForm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Product | Reints Office",
  description: "Update product details",
};

// Fetch specific product data
async function getProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*") // Select all columns for editing
    .eq("id", id)
    .single(); // Expect only one result

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, handle below
    console.error("Error fetching product:", error);
    // Handle other errors appropriately
  }

  if (!data) {
    notFound(); // Trigger 404 if product doesn't exist
  }

  return data;
}

export default async function EditProductPage({ params }) {
  const productId = params.productId;
  const product = await getProduct(productId);

  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Edit Product</h1>
      {/* Pass the fetched product data to the form */}
      <ProductForm product={product} />
    </div>
  );
}
