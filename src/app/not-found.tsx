'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <h1 className="font-serif text-7xl font-light mb-4 text-gold">404</h1>
          <h2 className="text-2xl font-serif font-light mb-4">Page not found</h2>
          <p className="text-warm-gray mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="btn-primary">
            Go home
          </Link>
        </div>
      </div>
    </>
  );
}
