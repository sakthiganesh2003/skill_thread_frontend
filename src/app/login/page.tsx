'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  EyeOff,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const { register } = useAuthStore.getState();
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(formData.name, formData.email, formData.password, formData.phone);
      } else {
        await login(formData.email, formData.password);
      }
      
      // Redirect based on role
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') router.push('/admin');
      else if (user?.role === 'tailor') router.push('/tailor');
      else router.push('/customer');
      
    } catch (err: any) {
      const apiError = err.response?.data?.error || err.response?.data?.message;
      setError(typeof apiError === 'string' ? apiError : (err.message || 'Authentication failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 md:p-12 overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-dark/5 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white shadow-2xl rounded-sm overflow-hidden border border-border animate-fade-in">
            
            {/* Left Side: Brand Image/Hero */}
            <div className="hidden lg:flex flex-col justify-between bg-dark p-12 text-white relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-transparent to-transparent" />
                
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-12 group">
                        <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
                            <Sparkles size={16} className="text-dark" />
                        </div>
                        <span className="font-serif text-xl font-semibold tracking-tight">Silk<span className="text-gold">thread</span></span>
                    </Link>
                    
                    <h1 className="font-serif text-5xl font-light leading-tight mb-6">
                        Crafting <br/>
                        <span className="text-gold italic">Your Identity,</span><br/>
                        Not Just Clothes.
                    </h1>
                    <p className="text-warm-gray text-sm leading-relaxed max-w-xs font-medium">
                        Join the elite circle of bespoke fashion recipients. Every stitch is a commitment to perfection.
                    </p>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-gold/60">
                        <ShieldCheck size={16} />
                        Trusted by 2.4k+ Clients
                    </div>
                </div>
            </div>

            {/* Right Side: Authentication Form */}
            <div className="p-8 md:p-14 flex flex-col justify-center">
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-serif font-light text-dark mb-2">
                        {isRegister ? 'Begin Your Journey' : 'Welcome Back'}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-gray opacity-50">
                        {isRegister ? 'Create your artisan profile' : 'Access your digital studio'}
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isRegister && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray group-focus-within:text-gold transition-colors" size={16} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-surface border border-border px-10 py-3 text-xs focus:ring-1 focus:ring-gold outline-none transition-all"
                                    placeholder="FULL NAME"
                                />
                            </div>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray group-focus-within:text-gold transition-colors" size={16} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-surface border border-border px-10 py-3 text-xs focus:ring-1 focus:ring-gold outline-none transition-all"
                                    placeholder="PHONE (OPTIONAL)"
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray group-focus-within:text-gold transition-colors" size={16} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-surface border border-border px-10 py-3 text-xs focus:ring-1 focus:ring-gold outline-none transition-all"
                            placeholder="EMAIL ADDRESS"
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray group-focus-within:text-gold transition-colors" size={16} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-surface border border-border px-10 py-3 text-xs focus:ring-1 focus:ring-gold outline-none transition-all"
                            placeholder="PASSWORD"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-gold"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {isRegister && (
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray group-focus-within:text-gold transition-colors" size={16} />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full bg-surface border border-border px-10 py-3 text-xs focus:ring-1 focus:ring-gold outline-none transition-all"
                                placeholder="CONFIRM PASSWORD"
                            />
                        </div>
                    )}

                    {!isRegister && (
                        <div className="text-right">
                            <button type="button" className="text-[10px] font-black uppercase text-gold hover:text-dark transition-colors">Forgot Password?</button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-dark text-white py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-gold hover:text-dark transition-all duration-500 disabled:opacity-50 group flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                {isRegister ? 'Establish Account' : 'Secure Sign In'}
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-border text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4">
                        {isRegister ? 'Already within the circle?' : 'New to our establishment?'}
                    </p>
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                        }}
                        className="text-dark font-serif text-lg italic hover:text-gold transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {isRegister ? 'Return to Sign In' : 'Create an Account'}
                    </button>
                </div>

                {/* Quick Demo Credentials */}
                {!isRegister && (
                    <div className="mt-8 grid grid-cols-3 gap-2">
                        {[
                            { role: 'Client', email: 'arjun@example.com' },
                            { role: 'Artisan', email: 'ramesh@silkthread.in' },
                            { role: 'Admin', email: 'admin@silkthread.in' }
                        ].map(demo => (
                            <button 
                                key={demo.role}
                                onClick={() => setFormData({ ...formData, email: demo.email, password: demo.role.toLowerCase() === 'client' ? 'pass123' : demo.role.toLowerCase() === 'artisan' ? 'tailor123' : 'admin123' })}
                                className="bg-surface border border-border py-2 text-[8px] font-black uppercase tracking-tighter text-warm-gray hover:border-gold hover:text-gold transition-all"
                            >
                                {demo.role}
                            </button>
                        ))}
                    </div>
                )}
            </div>

        </div>
      </div>
    </>
  );
}
