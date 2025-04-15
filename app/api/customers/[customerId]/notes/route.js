import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request, context) {
  const { customerId } = context.params;
  const { note_text, location, note_title, user_id } = await request.json();

  if (!note_text || !note_title || !user_id) {
    return NextResponse.json(
      { error: "Note title, text, and user ID are required" },
      { status: 400 }
    );
  }

  // Check if customer exists (optional but recommended)
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .single();

  if (customerError || !customerData) {
    console.error(
      "Error finding customer or customer not found:",
      customerError
    );
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("customer_notes") // Assuming your notes table is named 'customer_notes'
    .insert([
      {
        customer_id: customerId,
        note_text: note_text,
        location: location,
        note_title: note_title,
        user_id: user_id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function GET(request, context) {
  const { customerId } = context.params;

  // Check if customer exists (optional but recommended)
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .single();

  if (customerError || !customerData) {
    console.error(
      "Error finding customer or customer not found:",
      customerError
    );
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("customer_notes") // Assuming your notes table is named 'customer_notes'
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
