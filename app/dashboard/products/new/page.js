import React from "react";
import ProductForm from "@/components/ProductForm"; // We will create this component

export const metadata = {
  title: "Create New Product | Reints Office",
  description: "Add a new product to your catalog",
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Create New Product</h1>
      <ProductForm />
    </div>
  );
}
