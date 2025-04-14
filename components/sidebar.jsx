import Link from "next/link";
import { Home, FileText, Package, Users, Settings, List } from "lucide-react";

export default function Sidebar() {
  return (
    <div className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0'>
      <div className='flex flex-col flex-1 min-h-0 bg-slate-900'>
        <div className='flex items-center h-16 flex-shrink-0 px-4 bg-slate-900 border-b border-slate-800'>
          <Link href='/dashboard' className='flex items-center'>
            <span className='text-xl font-bold text-white'>Reints Office</span>
          </Link>
        </div>
        <div className='flex-1 flex flex-col pt-5 pb-4 overflow-y-auto'>
          <nav className='mt-5 flex-1 px-2 space-y-1'>
            <NavItem
              href='/dashboard'
              icon={<Home className='w-5 h-5' />}
              title='Dashboard'
            />
            <NavItem
              href='/dashboard/orders'
              icon={<FileText className='w-5 h-5' />}
              title='Orders'
            />
            <NavItem
              href='/dashboard/products'
              icon={<Package className='w-5 h-5' />}
              title='Producten'
            />
            <NavItem
              href='/dashboard/tasks'
              icon={<List className='w-5 h-5' />}
              title='Taken'
            />
            <NavItem
              href='/dashboard/customers'
              icon={<Users className='w-5 h-5' />}
              title='Klanten'
            />
            <NavItem
              href='/dashboard/settings'
              icon={<Settings className='w-5 h-5' />}
              title='Instellingen'
            />
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, icon, title }) {
  return (
    <Link
      href={href}
      className='text-slate-300 hover:bg-slate-800 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md'
    >
      {icon}
      <span className='ml-3'>{title}</span>
    </Link>
  );
}
