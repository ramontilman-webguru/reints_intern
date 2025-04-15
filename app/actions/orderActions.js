"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Server Action to create a new order and its items
export async function createOrderAction(orderData) {
  // Basic validation
  if (!orderData.customer_id) {
    return { error: "Customer is required." };
  }
  if (!orderData.order_items || orderData.order_items.length === 0) {
    return { error: "At least one product item is required." };
  }

  try {
    // 1. Insert the main order details
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: orderData.customer_id,
        status: orderData.status,
        notes: orderData.notes,
        total: orderData.total,
      })
      .select("id") // Select the ID of the newly created order
      .single(); // Expecting a single row back

    if (orderError || !newOrder) {
      console.error("Supabase Order Insert Error:", orderError);
      return {
        error: `Failed to create order: ${
          orderError?.message || "Unknown error"
        }`,
      };
    }

    const orderId = newOrder.id;

    // 2. Prepare and insert the order items
    const itemsToInsert = orderData.order_items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Supabase Order Items Insert Error:", itemsError);
      // Attempt to delete the order if items fail? (Compensation logic)
      // This might be complex depending on requirements.
      // For now, return an error indicating partial failure.
      await supabase.from("orders").delete().eq("id", orderId); // Rollback order
      return {
        error: `Order created, but failed to add items: ${itemsError.message}. Order creation rolled back.`,
      };
    }

    // 3. Revalidate and signal success
    revalidatePath("/dashboard/orders");
    // No redirect here, handled by client
    return { success: true, orderId: orderId };
  } catch (e) {
    console.error("Create Order Action Error:", e);
    return { error: "An unexpected error occurred while creating the order." };
  }
}

// TODO: Add updateOrderAction and potentially deleteOrderAction later
