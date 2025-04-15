"use client";

import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

export default function Header({ setSidebarOpen }) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className='bg-white border-b border-slate-200 sticky top-0 z-10'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center md:hidden'>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Open sidebar'
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className='h-6 w-6' />
              </Button>
            </div>
            <div className='hidden sm:ml-6 sm:flex sm:items-center'>
              <h1 className='text-2xl font-semibold text-slate-900'>
                Dashboard
              </h1>
            </div>
          </div>
          <div className='flex items-center'>
            <Button variant='ghost' size='icon' className='mr-2'>
              <Bell className='h-5 w-5' />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='rounded-full'>
                  <User className='h-5 w-5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profiel</DropdownMenuItem>
                <DropdownMenuItem>Instellingen</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='cursor-pointer'
                >
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
