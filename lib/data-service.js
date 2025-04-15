import { supabase } from "./supabase";

// Product services
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data;
}

// Customer services
export async function getCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return data;
}

// NEW function to create a customer if they don't exist
export async function createCustomer(companyName) {
  console.log(
    `Attempting to create customer with company name: ${companyName}`
  );
  const { data, error } = await supabase
    .from("customers")
    .insert([
      {
        name: companyName, // Use company name as default name
        company: companyName,
        // Add other default fields if necessary based on your table schema (e.g., email: null)
      },
    ])
    .select()
    .single(); // Return the newly created single record

  if (error) {
    console.error(`Error creating customer "${companyName}":`, error);
    // Check for specific errors like unique constraint violations if needed
    if (error.code === "23505") {
      // unique_violation
      console.warn(
        `Customer with company name "${companyName}" might already exist (unique constraint violation).`
      );
      // Optionally, try to fetch the existing customer again here
    }
    throw error; // Re-throw to be handled by the caller
  }

  console.log(`Customer "${companyName}" created successfully:`, data);
  return data; // Return the new customer object { id, name, company, ... }
}

// Order services
export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data;
}

// Dashboard stats
export async function getDashboardStats() {
  // Get product count
  const { count: productCount, error: productError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // Get customer count
  const { count: customerCount, error: customerError } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  // Get open order count
  const { count: openOrderCount, error: orderError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Get open task count
  const { count: openTaskCount, error: taskError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "todo");

  // Get total notes count
  const { count: noteCount, error: noteError } = await supabase
    .from("customer_notes") // Assuming your notes table is named 'customer_notes'
    .select("*", { count: "exact", head: true });

  // Basic error handling (log errors)
  if (productError) console.error("Error counting products:", productError);
  if (customerError) console.error("Error counting customers:", customerError);
  if (orderError) console.error("Error counting open orders:", orderError);
  if (taskError) console.error("Error counting open tasks:", taskError);
  if (noteError) console.error("Error counting notes:", noteError);

  return {
    productCount: productCount || 0,
    customerCount: customerCount || 0,
    openOrderCount: openOrderCount || 0,
    openTaskCount: openTaskCount || 0,
    noteCount: noteCount || 0, // Add note count here
  };
}

// Tasks services
export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      tags,
      customer:customers(id, name, company)
    `
    )
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data.map((task) => ({ ...task, tags: task.tags || [] }));
}

export async function getTasksByStatus(status) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      tags,
      customer:customers(id, name, company)
    `
    )
    .eq("status", status)
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching tasks by status:", error);
    return [];
  }

  return data.map((task) => ({ ...task, tags: task.tags || [] }));
}

export async function getTasksByCustomer(customerId) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      tags,
      customer:customers(id, name, company)
    `
    )
    .eq("customer_id", customerId)
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching tasks by customer:", error);
    return [];
  }

  return data.map((task) => ({ ...task, tags: task.tags || [] }));
}

export async function createTask(taskData) {
  let weekNumber = null;
  // Ensure week_number is a valid integer or null
  if (
    taskData.week_number !== null &&
    taskData.week_number !== undefined &&
    taskData.week_number !== ""
  ) {
    const parsedWeek = parseInt(taskData.week_number, 10);
    if (!isNaN(parsedWeek)) {
      weekNumber = parsedWeek;
    } else {
      // Handle invalid number input? Log a warning? For now, treat as null.
      console.warn(
        "Invalid week_number input, setting to null:",
        taskData.week_number
      );
    }
  }

  // Handle 'none' customer selection explicitly
  const customerId =
    taskData.customer_id === "none" || !taskData.customer_id
      ? null
      : taskData.customer_id;

  // Ensure tags is an array, even if empty or null/undefined
  const tags = Array.isArray(taskData.tags) ? taskData.tags : [];

  // Prepare the final payload for Supabase
  const payload = {
    title: taskData.title,
    description: taskData.description || null,
    customer_id: customerId,
    priority: taskData.priority || "medium",
    due_date: taskData.due_date || null,
    week_number: weekNumber,
    status: taskData.status || "todo",
    tags: tags,
  };

  // Optional: Log the payload before sending to help debug
  console.log("Attempting to create task with payload:", payload);

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select(`*, tags, customer:customers(id, name, company)`)
    .single();

  if (error) {
    // Log the detailed error from Supabase
    console.error("Error creating task in Supabase:", error);
    // Stringify the error for potentially more details in the console
    console.error("Supabase error details:", JSON.stringify(error, null, 2));
    throw error; // Re-throw the original Supabase error object
  }

  console.log("Task created successfully:", data);
  return { ...data, tags: data.tags || [] };
}

export async function updateTaskStatus(taskId, status) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select();

  if (error) {
    console.error("Error updating task status:", error);
    throw error;
  }

  return data[0];
}

export async function updateTask(taskId, taskData) {
  // Optional: Log the incoming data for debugging
  console.log(`Updating task ${taskId} with data:`, taskData);

  // Prepare the update payload, only including fields that are present in taskData
  const payload = {};
  if (taskData.title !== undefined) payload.title = taskData.title;
  if (taskData.description !== undefined)
    payload.description = taskData.description;
  if (taskData.customer_id !== undefined) {
    payload.customer_id =
      taskData.customer_id === "none" ? null : taskData.customer_id;
  }
  if (taskData.priority !== undefined) payload.priority = taskData.priority;
  if (taskData.due_date !== undefined) payload.due_date = taskData.due_date;
  if (taskData.week_number !== undefined) {
    const parsedWeek = parseInt(taskData.week_number, 10);
    payload.week_number = isNaN(parsedWeek) ? null : parsedWeek;
  }
  if (taskData.status !== undefined) payload.status = taskData.status;
  // Handle tags: ensure it's an array or null. If undefined, don't update.
  if (taskData.tags !== undefined) {
    payload.tags = Array.isArray(taskData.tags) ? taskData.tags : null;
  }

  // Add updated_at timestamp
  payload.updated_at = new Date().toISOString();

  // If payload is empty (except for updated_at), maybe return early or throw error?
  if (Object.keys(payload).length <= 1) {
    console.warn("No fields to update for task", taskId);
    // Optionally fetch and return the current task data if needed
    // For now, just return null or handle as appropriate
    // Let's try fetching the current task data
    const { data: currentData, error: fetchError } = await supabase
      .from("tasks")
      .select("*, tags, customer:customers(id, name, company)")
      .eq("id", taskId)
      .single();
    if (fetchError) {
      console.error(
        "Error fetching current task data after empty update:",
        fetchError
      );
      throw fetchError;
    }
    return { ...currentData, tags: currentData.tags || [] };
    // return null;
  }

  console.log(`Applying update payload for task ${taskId}:`, payload);

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .select(`*, tags, customer:customers(id, name, company)`) // Select updated data including tags and customer
    .single(); // Expecting a single updated task back

  if (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }

  console.log(`Task ${taskId} updated successfully:`, data);
  // Ensure tags is always an array in the returned data
  return { ...data, tags: data.tags || [] };
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }

  return true;
}

export async function updateCustomer(customerId, customerData) {
  // Ensure updated_at is set if your table uses it
  const dataToUpdate = {
    ...customerData,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("customers")
    .update(dataToUpdate)
    .eq("id", customerId)
    .select();

  if (error) {
    console.error("Error updating customer:", error);
    throw error;
  }

  return data[0];
}

// Get a single customer by ID
export async function getCustomerById(id) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single(); // Use single() to get one record or null

  if (error) {
    console.error("Error fetching customer by ID:", error);
    return null;
  }

  return data;
}

// NEW function to get all unique tags
export async function getAllTags() {
  const { data, error } = await supabase.from("tasks").select("tags");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  // Process the tags: flatten the array of arrays and get unique values
  const allTags = data.reduce((acc, task) => {
    if (task.tags && Array.isArray(task.tags)) {
      acc.push(...task.tags);
    }
    return acc;
  }, []);

  // Filter out null/empty strings and get unique tags
  const uniqueTags = [...new Set(allTags)].filter(
    (tag) => tag && tag.trim() !== ""
  );

  console.log("Fetched unique tags:", uniqueTags);
  return uniqueTags;
}
