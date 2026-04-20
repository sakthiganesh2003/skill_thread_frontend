'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Bell, Search, User, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrate } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    hydrate().then(() => {
      const u = useAuthStore.getState().user;
      if (!u || u.role !== 'admin') {
        router.push('/login');
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router, hydrate]);

  if (!user || user.role !== 'admin') {
    return (
        <div className="flex items-center justify-center min-h-screen bg-cream">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname.includes('/orders')) return 'Order Management';
    if (pathname.includes('/garments')) return 'Garment Catalog';
    if (pathname.includes('/fabrics')) return 'Fabric Library';
    if (pathname.includes('/customizations')) return 'Tailoring Customizations';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans">
      {/* Sidebar - Desktop Always On, Mobile Toggle */}
      <div className={`hidden lg:block w-72 flex-shrink-0 transition-all duration-300`}>
        <AdminSidebar />
      </div>

      {/* Main Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative scroll-smooth">
        {/* Top Floating Header */}
        <header className={`sticky top-0 z-40 transition-all duration-300 px-6 lg:px-10 py-4 flex items-center justify-between ${
          scrolled ? 'bg-white/90 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
        }`}>
          <div className="flex items-center gap-4">
             <button 
                className="lg:hidden p-2 hover:bg-gold/10 rounded-sm text-dark transition-colors"
                onClick={() => setSidebarOpen(true)}
             >
                <Menu size={24} />
             </button>
             <div>
                <h2 className="text-xl lg:text-2xl font-serif font-semibold text-dark tracking-tight">
                    {getPageTitle()}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 opacity-60">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                   <p className="text-[10px] uppercase font-black tracking-widest">System Operational</p>
                </div>
             </div>
          </div>

          <div className="flex gap-4 lg:gap-6 items-center">
            {/* Search Bar - Hidden on Mobile */}
            <div className="hidden md:flex relative items-center group">
               <Search className="absolute left-3 text-warm-gray transition-colors group-focus-within:text-gold" size={16} />
               <input 
                  type="text" 
                  placeholder="Global Search..." 
                  className="bg-surface border border-transparent focus:border-gold/20 focus:bg-white px-10 py-2.5 rounded-sm text-sm w-48 lg:w-64 transition-all duration-300 focus:w-80 outline-none shadow-sm"
               />
            </div>

            <div className="h-8 w-[1px] bg-border mx-2 hidden lg:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button className="p-2.5 hover:bg-gold/10 rounded-sm text-warm-gray hover:text-gold transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>
                <Link href="/profile" className="flex items-center gap-3 group px-1">
                    <div className="hidden lg:block text-right">
                        <p className="text-xs font-bold group-hover:text-gold transition-colors">{user.name}</p>
                        <p className="text-[10px] text-warm-gray font-black uppercase tracking-tighter opacity-70">Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-sm bg-dark p-[2px] shadow-lg transition-transform hover:scale-105">
                        <div className="w-full h-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                            {user.name?.charAt(0) || <User size={18} />}
                        </div>
                    </div>
                </Link>
            </div>
          </div>
        </header>

        {/* Real Content Scrolling Area */}
        <div className="px-6 lg:px-10 pb-20 pt-8 animate-fade-in relative z-10 w-full max-w-[1600px] mx-auto overflow-x-hidden">
            {children}
        </div>
      </main>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
          <div 
             className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[100] transition-opacity"
             onClick={() => setSidebarOpen(false)}
          >
              <div 
                className="w-72 h-full bg-dark relative animate-in slide-in-from-left duration-300"
                onClick={e => e.stopPropagation()}
              >
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-6 right-6 text-white/50 hover:text-gold"
                  >
                      <X size={24} />
                  </button>
                  <AdminSidebar />
              </div>
          </div>
      )}
    </div>
  );
}
