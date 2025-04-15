"use client";

import Link from "next/link";
import { Home, FileText, Package, Users, Settings, List } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Sidebar({ navigation, className }) {
  const pathname = usePathname();

  return (
    <div
      className={clsx(
        "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0",
        className
      )}
    >
      <div className='flex flex-col flex-1 min-h-0 bg-slate-900'>
        <div className='flex items-center h-16 flex-shrink-0 px-4 bg-slate-900 border-b border-slate-800'>
          <Link href='/dashboard' className='flex items-center'>
            <span className='text-xl font-bold text-white'>Reints Office</span>
          </Link>
        </div>
        <div className='flex-1 flex flex-col pt-5 pb-4 overflow-y-auto'>
          <nav className='mt-5 flex-1 px-2 space-y-1'>
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                href={item.href}
                icon={getIcon(item.name)}
                title={item.name}
                isActive={pathname === item.href}
              />
            ))}
            <NavItem
              href='/dashboard/settings'
              icon={<Settings className='w-5 h-5' />}
              title='Instellingen'
              isActive={pathname === "/dashboard/settings"}
            />
          </nav>
        </div>
      </div>
    </div>
  );
}

function getIcon(name) {
  switch (name.toLowerCase()) {
    case "dashboard":
      return <Home className='w-5 h-5' />;
    case "orders":
      return <FileText className='w-5 h-5' />;
    case "products":
      return <Package className='w-5 h-5' />;
    case "tasks":
      return <List className='w-5 h-5' />;
    case "customers":
      return <Users className='w-5 h-5' />;
    default:
      return null;
  }
}

function NavItem({ href, icon, title, isActive }) {
  return (
    <Link
      href={href}
      className={clsx(
        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
        isActive
          ? "bg-slate-800 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
    >
      {icon}
      <span className='ml-3'>{title}</span>
    </Link>
  );
}
