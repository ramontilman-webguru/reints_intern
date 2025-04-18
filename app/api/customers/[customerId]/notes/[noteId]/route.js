import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Handler to DELETE a specific note
export async function DELETE(request, context) {
  const { noteId } = context.params;

  if (!noteId) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("customer_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    console.error("Error deleting note:", error);
    // Check for specific errors like RLS violation if needed
    return NextResponse.json(
      { error: "Failed to delete note", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Note deleted successfully" },
    { status: 200 }
  );
}

// Handler to UPDATE (PUT) a specific note
export async function PUT(request, context) {
  const { noteId } = context.params;
  const { note_text, location, note_title } = await request.json();

  if (!noteId) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  if (!note_text || !note_title) {
    return NextResponse.json(
      { error: "Note title and text are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("customer_notes")
    .update({
      note_text: note_text,
      location: location,
      note_title: note_title,
    })
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    console.error("Error updating note:", error);
    // Check for specific errors like RLS violation if needed
    return NextResponse.json(
      { error: "Failed to update note", details: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Note not found after update" },
      { status: 404 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
