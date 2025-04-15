"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

// Assuming Sidebar accepts a navigation prop or similar
// We'll need to update the Sidebar component itself later
const navigation = [
  { name: "Dashboard", href: "/dashboard", current: false },
  { name: "Customers", href: "/dashboard/customers", current: false },

  { name: "Products", href: "/dashboard/products", current: false },
  { name: "Orders", href: "/dashboard/orders", current: false }, // Representing quotes/orders/invoices
  { name: "Tasks", href: "/dashboard/tasks", current: false },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Sidebar */}
      <Sidebar
        navigation={navigation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        className='flex-shrink-0'
      />

      {/* Main Content */}
      <div className='flex flex-col flex-1 overflow-hidden md:pl-64'>
        <Header setSidebarOpen={setSidebarOpen} />
        <main className='flex-1 overflow-y-auto p-4 bg-slate-50'>
          {children}
        </main>
      </div>
    </div>
  );
}
