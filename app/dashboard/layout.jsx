import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function DashboardLayout({ children }) {
  return (
    <div className='flex h-screen overflow-hidden'>
      {/* Sidebar */}
      <Sidebar className='flex-shrink-0' />

      {/* Main Content */}
      <div className='flex flex-col flex-1 overflow-hidden md:pl-64'>
        <Header />
        <main className='flex-1 overflow-y-auto p-4 bg-slate-50'>
          {children}
        </main>
      </div>
    </div>
  );
}
