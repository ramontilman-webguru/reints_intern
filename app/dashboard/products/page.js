import React from "react";
import { supabase } from "@/lib/supabase"; // Import Supabase client
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming ShadCN Card
import { Button } from "@/components/ui/button"; // Assuming ShadCN Button
import Link from "next/link"; // For linking to product details/edit
import ProductCardActions from "@/components/ProductCardActions"; // Import the new component

export const metadata = {
  title: "Products | Reints Office",
  description: "Manage your products",
};

// Fetch products data on the server
async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, sku, category, stock");

  if (error) {
    console.error("Error fetching products:", error);
    // Handle error appropriately, maybe throw or return an empty array
    return [];
  }
  return data;
}

// Make the page component async to fetch data
export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Products</h1>
        <Button asChild>
          <Link href='/dashboard/products/new'>Create New Product</Link>
        </Button>
      </div>

      {/* Product List using Cards */}
      {products.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className='flex justify-between items-start'>
                  <span>{product.name}</span>
                  <span className='text-sm font-medium text-blue-600'>
                    €{product.price}
                  </span>
                </CardTitle>
                {product.sku && (
                  <p className='text-xs text-gray-500'>SKU: {product.sku}</p>
                )}
                {product.category && (
                  <p className='text-xs text-gray-500'>
                    Category: {product.category}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-700 mb-4'>
                  {product.description || "No description provided."}
                </p>
                <div className='flex justify-between items-center text-sm mt-4'>
                  <span className='text-gray-500'>
                    Stock: {product.stock !== null ? product.stock : "N/A"}
                  </span>
                  <ProductCardActions productId={product.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className='text-center text-gray-500 mt-10'>No products found.</p>
      )}
    </div>
  );
}
