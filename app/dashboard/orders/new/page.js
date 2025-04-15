import React from "react";
import { supabase } from "@/lib/supabase";
import OrderForm from "@/components/OrderForm"; // We will create this component

export const metadata = {
  title: "Create New Quote/Order | Reints Office",
  description: "Create a new quote or sales order",
};

// Fetch customers and products
async function getFormData() {
  const customerPromise = supabase
    .from("customers")
    .select("id, name")
    .order("name");
  const productPromise = supabase
    .from("products")
    .select("id, name, price")
    .order("name");

  const [customerResult, productResult] = await Promise.all([
    customerPromise,
    productPromise,
  ]);

  if (customerResult.error) {
    console.error("Error fetching customers:", customerResult.error);
  }
  if (productResult.error) {
    console.error("Error fetching products:", productResult.error);
  }

  return {
    customers: customerResult.data || [],
    products: productResult.data || [],
  };
}

export default async function NewOrderPage() {
  const { customers, products } = await getFormData();

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Create New Quote / Order</h1>
      <OrderForm customers={customers} products={products} />
    </div>
  );
}
