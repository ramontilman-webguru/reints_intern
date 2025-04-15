"use client";

import Link from "next/link";
import {
  Home,
  FileText,
  Package,
  Users,
  Settings,
  List,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

export default function Sidebar({
  navigation,
  className,
  sidebarOpen,
  setSidebarOpen,
}) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className='flex flex-col flex-1 min-h-0 bg-slate-900'>
      <div className='flex items-center h-16 flex-shrink-0 px-4 bg-slate-900 border-b border-slate-800 justify-between'>
        <Link href='/dashboard' className='flex items-center'>
          <span className='text-xl font-bold text-white'>Reints Office</span>
        </Link>
        <button
          type='button'
          className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden'
          onClick={() => setSidebarOpen(false)}
        >
          <span className='sr-only'>Close sidebar</span>
          <X className='h-6 w-6' aria-hidden='true' />
        </button>
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
              onClick={() => setSidebarOpen(false)}
            />
          ))}
          <NavItem
            href='/dashboard/settings'
            icon={<Settings className='w-5 h-5' />}
            title='Instellingen'
            isActive={pathname === "/dashboard/settings"}
            onClick={() => setSidebarOpen(false)}
          />
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={clsx(
          "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0",
          className
        )}
      >
        {sidebarContent}
      </div>

      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-40 md:hidden'
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter='transition-opacity ease-linear duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity ease-linear duration-300'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-600 bg-opacity-75' />
          </Transition.Child>

          <div className='fixed inset-0 z-40 flex'>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-300 transform'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <Dialog.Panel className='relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 pt-5 pb-4'>
                {sidebarContent}
              </Dialog.Panel>
            </Transition.Child>
            <div className='w-14 flex-shrink-0' aria-hidden='true'>
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
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

function NavItem({ href, icon, title, isActive, onClick }) {
  return (
    <Link
      href={href}
      className={clsx(
        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
        isActive
          ? "bg-slate-800 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
      onClick={onClick}
    >
      {icon}
      <span className='ml-3'>{title}</span>
    </Link>
  );
}
