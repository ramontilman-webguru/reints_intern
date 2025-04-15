// Define users here so they can be imported into client components

export const users = [
  {
    id: "1",
    name: process.env.NEXT_PUBLIC_USER1_NAME || "Gebruiker 1", // Use NEXT_PUBLIC_ prefix for env vars needed client-side
  },
  {
    id: "2",
    name: process.env.NEXT_PUBLIC_USER2_NAME || "Gebruiker 2",
  },
  {
    id: "3",
    name: process.env.NEXT_PUBLIC_USER3_NAME || "Gebruiker 3",
  },
];

// Helper function to get user name by ID
export const getUserNameById = (userId) => {
  if (!userId) return "Onbekend"; // Handle null/undefined userId
  const user = users.find((u) => u.id === String(userId)); // Ensure comparison is string vs string
  return user ? user.name : "Onbekende Gebruiker"; // Handle case where user ID might not exist
};
