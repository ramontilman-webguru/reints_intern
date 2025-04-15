import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { data, error } = await supabase
    .from("customer_notes")
    .select(
      `
      *,
      customer:customers (id, name, company)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  // Add customer name/company fallback
  const notesWithCustomerName = data.map((note) => ({
    ...note,
    customer_name:
      note.customer?.company || note.customer?.name || "Onbekende Klant",
  }));

  return NextResponse.json(notesWithCustomerName);
}
