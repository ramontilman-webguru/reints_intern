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

  return {
    productCount: productCount || 0,
    customerCount: customerCount || 0,
    openOrderCount: openOrderCount || 0,
    openTaskCount: openTaskCount || 0,
  };
}

// Tasks services
export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      customer:customers(id, name, company)
    `
    )
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data;
}

export async function getTasksByStatus(status) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
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

  return data;
}

export async function getTasksByCustomer(customerId) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
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

  return data;
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

  // Prepare the final payload for Supabase
  const payload = {
    title: taskData.title, // Assuming title is required by the form
    description: taskData.description || null, // Ensure null if empty
    customer_id: customerId,
    priority: taskData.priority || "medium", // Default priority if needed
    due_date: taskData.due_date || null, // Ensure null if empty date
    week_number: weekNumber,
    status: taskData.status || "todo", // Default status to 'todo' if not provided
    // Supabase likely handles created_at/updated_at automatically
  };

  // Optional: Log the payload before sending to help debug
  console.log("Attempting to create task with payload:", payload);

  const { data, error } = await supabase
    .from("tasks")
    .insert([payload]) // Use the structured payload
    .select();

  if (error) {
    // Log the detailed error from Supabase
    console.error("Error creating task in Supabase:", error);
    // Stringify the error for potentially more details in the console
    console.error("Supabase error details:", JSON.stringify(error, null, 2));
    throw error; // Re-throw the original Supabase error object
  }

  console.log("Task created successfully:", data);
  return data[0];
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
  // Ensure updated_at is set
  const dataToUpdate = { ...taskData, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("tasks")
    .update(dataToUpdate)
    .eq("id", taskId)
    .select();

  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }

  return data[0];
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
