'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Shirt,
  Scissors,
  Settings,
  LogOut,
  ChevronRight,
  PlusCircle,
  Shapes,
  Users,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/tailors', label: 'Tailors Staff', icon: UserCheck },
  { href: '/admin/garments', label: 'Garment Catalog', icon: Shirt },
  { href: '/admin/fabrics', label: 'Fabric Library', icon: Scissors },
  { href: '/admin/customizations', label: 'Customizations', icon: Shapes },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-dark text-white z-50 overflow-y-auto border-r border-white/5 shadow-2xl transition-all duration-300">
      {/* Brand Logo */}
      <div className="p-8 pb-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gold rounded-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <Shirt size={22} className="text-dark" strokeWidth={2.5} />
          </div>
          <p className="font-serif text-2xl font-semibold tracking-tight">
            Silk<span className="text-gold">thread</span>
          </p>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="px-5 space-y-1">
        <p className="px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-warm-gray mb-3 opacity-50">
          Management
        </p>
        {sidebarLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between group px-4 py-3.5 rounded-sm transition-all duration-200 ${isActive
                ? 'bg-gold text-dark font-semibold'
                : 'text-warm-gray hover:bg-white/5 hover:text-gold'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm tracking-wide">{label}</span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="absolute bottom-0 left-0 w-full p-6 space-y-4">
        <div className="pt-6 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-warm-gray hover:text-red-400 hover:bg-red-400/5 rounded-sm transition-all duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* User Card */}
        <div className="bg-white/5 p-4 rounded-sm border border-white/10 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold flex-shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">Admin Name</p>
            <p className="text-[10px] text-warm-gray uppercase tracking-tighter opacity-70">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
