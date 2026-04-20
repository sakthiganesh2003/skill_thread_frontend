'use client';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Shield, Scissors, User, LogOut } from 'lucide-react';
import { useEffect } from 'react';

export default function Navbar() {
  const { user, logout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-semibold">
          Silk<span className="text-gold">thread</span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/garments" className="text-sm hover:text-gold transition-colors">
            Browse
          </Link>
          <Link href="/#how" className="text-sm hover:text-gold transition-colors">
            How it works
          </Link>
          <Link href="/#faq" className="text-sm hover:text-gold transition-colors">
            Contact
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-6">
              <Link 
                href={`/${user.role}`} 
                className="flex items-center gap-2 text-sm font-medium text-dark hover:text-gold transition-colors"
                title={`Go to ${user.role} dashboard`}
              >
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-gold">
                  {user.role === 'admin' ? (
                    <Shield size={16} />
                  ) : user.role === 'tailor' ? (
                    <Scissors size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <span className="capitalize">{user.name || user.role}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-warm-gray hover:text-gold transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm border border-gold text-gold px-4 py-2 rounded-sm hover:bg-gold/10 transition-colors">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
