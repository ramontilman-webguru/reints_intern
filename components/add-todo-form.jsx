"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// We will pass a server action to handle the form submission
export default function AddTodoForm({ customerId, addTodoAction }) {
  const [text, setText] = useState("");

  // We use a form action that calls the server action
  const handleSubmit = async (formData) => {
    // Client-side validation (optional)
    if (!formData.get("text")?.trim()) return;

    try {
      // Pass customerId along with form data to the action
      await addTodoAction(customerId, formData);
      setText(""); // Clear input after successful submission
    } catch (error) {
      console.error("Failed to add todo:", error);
      // Handle error display to the user here
    }
  };

  return (
    <form action={handleSubmit} className='flex gap-2 mb-4'>
      <Input
        type='text'
        name='text' // Name attribute is important for formData
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Nieuwe taak toevoegen...'
        required
        className='flex-grow'
      />
      <Button type='submit'>Toevoegen</Button>
    </form>
  );
}
