'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // The main login page now handles both login and register with a unified luxury interface
    router.replace('/login');
  }, [router]);

  return <div className="h-screen flex items-center justify-center bg-dark font-serif italic text-gold animate-pulse">Entering Studio...</div>;
}
