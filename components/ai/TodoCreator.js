"use client";

import { useState } from "react";

export default function TodoCreator() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdTask, setCreatedTask] = useState(null); // Changed from createdTodo to createdTask

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);
    setCreatedTask(null); // Reset previous task

    try {
      const response = await fetch("/api/ai/todos/create", {
        // Endpoint remains the same
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const responseData = await response.json(); // Get JSON regardless of status

      if (!response.ok) {
        // Use error message from API response if available
        throw new Error(
          responseData.error || `HTTP fout! Status: ${response.status}`
        );
      }

      setCreatedTask(responseData); // Store the successfully created task object from API
      setMessage(""); // Clear input field
    } catch (err) {
      console.error("Kon taak niet aanmaken:", err);
      setError(err.message || "Er is een onverwachte fout opgetreden.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-4 border rounded-lg shadow-sm'>
      <h3 className='text-lg font-semibold mb-2'>Maak Taak aan met AI</h3>
      <form onSubmit={handleSubmit} className='flex items-center space-x-2'>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='bv. Herinner me eraan Reints te bellen week 48'
          className='flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none'
          disabled={isLoading}
        />
        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? "Aanmaken..." : "Maak aan"}
        </button>
      </form>
      {error && <p className='mt-2 text-sm text-red-600'>Fout: {error}</p>}
      {createdTask && (
        <div className='mt-3 p-3 bg-green-100 border border-green-300 rounded-md'>
          <p className='text-sm font-medium text-green-800'>
            Taak succesvol aangemaakt:
          </p>
          <p className='text-sm text-green-700'>Taak: {createdTask.title}</p>
          {createdTask.customer_id && (
            <p className='text-sm text-green-700'>
              Klant ID: {createdTask.customer_id}
            </p>
          )}
          {createdTask.due_date && (
            <p className='text-sm text-green-700'>
              Deadline: {createdTask.due_date}
            </p>
          )}
          {createdTask.week_number && (
            <p className='text-sm text-green-700'>
              Week: {createdTask.week_number}
            </p>
          )}
          <p className='text-sm text-green-700'>Status: {createdTask.status}</p>
        </div>
      )}
    </div>
  );
}
