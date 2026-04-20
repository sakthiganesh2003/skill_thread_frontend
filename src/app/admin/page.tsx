'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ordersAPI, tailorsAPI, analyticsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Sparkles,
  ShoppingBag,
  UserCheck,
  X,
  Palette,
  Scissors as ScissorsIcon,
  Ruler,
  Calendar,
  CreditCard,
  User
} from 'lucide-react';
import { useState } from 'react';
import RevenueChart from '@/components/admin/RevenueChart';
import DoughnutStatus from '@/components/admin/DoughnutStatus';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await ordersAPI.list();
      return data;
    },
    enabled: !!user,
  });

  const { data: tailors = [], isLoading: tailorsLoading } = useQuery({
    queryKey: ['tailors'],
    queryFn: async () => {
      const { data } = await tailorsAPI.list();
      return data;
    },
    enabled: !!user,
  });

  const { data: analytics = {} } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await analyticsAPI.dashboard();
      return data;
    },
    enabled: !!user,
  });

  const selectedOrder = orders.find((o: any) => o.id === selectedOrderId);

  // Mock revenue data for the chart
  const revenueHistory = [400, 600, 480, 800, 720, 1100, 950];
  const revenueLabels = ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];

  // Calculate order distribution for the doughnut
  const statusCounts = orders.reduce((acc: any, order: any) => {
    const status = order.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const doughnutData = Object.entries(statusCounts).map(([label, count]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    count: count as number
  })).slice(0, 5);

  const stats = [
    { 
        icon: ShoppingBag, 
        label: 'Total Orders', 
        value: analytics.totalOrders || 0,
        delta: '+12%',
        isPositive: true,
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600'
    },
    { 
        icon: Zap, 
        label: 'Active Orders', 
        value: analytics.activeOrders || 0,
        delta: '+5%',
        isPositive: true,
        bgColor: 'bg-gold/10',
        textColor: 'text-gold'
    },
    { 
        icon: TrendingUp, 
        label: 'Total Revenue', 
        value: `₹${analytics.totalRevenue?.toLocaleString() || 0}`,
        delta: '+24%',
        isPositive: true,
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-600'
    },
    { 
        icon: UserCheck, 
        label: 'Top Tailors', 
        value: analytics.highRatedTailors || 0,
        delta: '-2%',
        isPositive: false,
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-600'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
        case 'delivered': return 'bg-green-500/10 text-green-600 border-green-200';
        case 'assigned': return 'bg-blue-500/10 text-blue-600 border-blue-200';
        default: return 'bg-gold/10 text-gold border-gold/20';
    }
  };

  return (
    <div className="space-y-10 animate-fade-in relative">
      
      {/* KPI Grid */}
      <div className="mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ icon: Icon, label, value, delta, isPositive, bgColor, textColor }) => (
          <div key={label} className="group relative bg-white border border-border shadow-md rounded-sm p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-gold/30 hover:-translate-y-1">
             <div className={`p-3 rounded-sm ${bgColor} ${textColor} w-fit mb-4 transition-transform group-hover:scale-110`}>
                <Icon size={24} strokeWidth={2.5}/>
             </div>
             <div>
                <p className="text-warm-gray text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">{label}</p>
                <div className="flex items-baseline gap-3">
                   <h3 className="text-3xl font-serif font-black text-dark">{value}</h3>
                   <div className={`flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {delta}
                   </div>
                </div>
             </div>
             {/* Decorative element */}
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Icon size={80} />
             </div>
          </div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto">
        <div className="lg:col-span-2 bg-white border border-border shadow-lg rounded-sm p-8">
            <RevenueChart data={revenueHistory} labels={revenueLabels} />
        </div>
        <div className="bg-dark text-white border border-white/10 shadow-lg rounded-sm p-8 flex flex-col items-center">
            <div className="w-full mb-8">
                <h3 className="text-xl font-serif font-light">Order Flow</h3>
                <p className="text-xs text-warm-gray uppercase tracking-widest font-bold opacity-60">Distribution by status</p>
            </div>
            <DoughnutStatus data={doughnutData} />
            <div className="mt-8 pt-6 border-t border-white/5 w-full text-center">
                <Link href="/admin/orders" className="text-xs font-bold text-gold uppercase tracking-widest hover:underline transition-all">
                    View Complete Flow →
                </Link>
            </div>
        </div>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Recent Orders List */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif font-light text-dark leading-tight flex items-center gap-3">
                    Recent Orders <Sparkles size={20} className="text-gold" />
                </h3>
                <p className="text-xs text-warm-gray font-bold uppercase tracking-widest opacity-60">Monitor new requests</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-black uppercase tracking-widest text-gold hover:translate-x-1 transition-transform"
              >
                    See all history
              </Link>
           </div>

           <div className="space-y-3">
              {ordersLoading ? (
                 [...Array(3)].map((_, i: number) => <div key={i} className="h-16 bg-border/40 animate-pulse rounded-sm" />)
              ) : orders.length === 0 ? (
                 <div className="bg-surface p-10 text-center rounded-sm border border-dashed border-border text-warm-gray">
                    No recent orders found.
                 </div>
              ) : (
                 orders.slice(0, 5).map((order: any, i: number) => (
                    <div 
                        key={order.id} 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="group flex items-center justify-between p-4 bg-white border border-border rounded-sm hover:border-gold cursor-pointer transition-all duration-300 shadow-sm"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                       <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 bg-surface flex items-center justify-center rounded-sm group-hover:bg-gold/10 transition-colors">
                            <Clock size={16} className="text-warm-gray group-hover:text-gold" />
                          </div>
                          <div className="min-w-0 overflow-hidden">
                             <p className="text-sm font-bold text-dark truncate">{order.garment_name}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-warm-gray uppercase font-black tracking-tighter opacity-60">{order.customer_name}</span>
                                <span className="text-[10px] text-gold font-bold">#{order.order_number}</span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right flex-shrink-0 ml-4">
                           <p className="text-sm font-black text-dark">₹{order.total_price || 0}</p>
                           <p className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 border rounded-full inline-block ${getStatusColor(order.status)}`}>
                               {order.status || 'New'}
                           </p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

        {/* Top Tailors List */}
        <div className="space-y-6">
           <div>
              <h3 className="text-2xl font-serif font-light text-dark leading-tight">Master Craftspeople</h3>
              <p className="text-xs text-warm-gray font-bold uppercase tracking-widest opacity-60">High rated artisans</p>
           </div>
           
           <div className="space-y-3">
              {tailorsLoading ? (
                 [...Array(3)].map((_, i: number) => <div key={i} className="h-16 bg-border/40 animate-pulse rounded-sm" />)
              ) : tailors.length === 0 ? (
                 <div className="bg-surface p-10 text-center rounded-sm border border-dashed border-border text-warm-gray">
                    No tailors currently registered.
                 </div>
              ) : (
                tailors.slice(0, 5).map((tailor: any, i: number) => (
                    <div 
                        key={tailor.id} 
                        className="group flex items-center justify-between p-4 bg-white border border-border rounded-sm hover:border-gold transition-all duration-300 shadow-sm"
                        style={{ animationDelay: `${(i+5) * 100}ms` }}
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-dark rounded-sm flex items-center justify-center text-gold font-bold relative group-hover:scale-105 transition-transform">
                             {tailor.name?.charAt(0)}
                             {tailor.rating >= 4.5 && (
                                <div className="absolute -top-1 -right-1 bg-gold text-dark w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                    <Sparkles size={8} />
                                </div>
                             )}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-dark">{tailor.name}</p>
                             <p className="text-[10px] text-gold uppercase font-black tracking-tighter">Rating: ⭐ {tailor.rating || 0}</p>
                          </div>
                       </div>
                       <div className="text-right">
                           <p className="text-sm font-black text-dark">{tailor.active_orders}</p>
                           <p className="text-[10px] uppercase font-bold text-warm-gray tracking-tighter opacity-60">Active Orders</p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>
      </div>

      {/* Detail Drawer Overlay (Quick View) */}
      {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in">
              <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setSelectedOrderId(null)} />
              <div className="relative w-full max-w-xl bg-surface h-full shadow-2xl animate-slide-in-right overflow-y-auto">
                  <div className="sticky top-0 bg-dark text-white p-6 flex items-center justify-between border-b border-white/10 z-10">
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-1">Quick Specification</p>
                          <h2 className="font-serif text-2xl font-light">#{selectedOrder.order_number} — {selectedOrder.garment_name}</h2>
                      </div>
                      <button onClick={() => setSelectedOrderId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-8 space-y-10 pb-24">
                      {/* Customer Info Card */}
                      <section>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4 flex items-center gap-2">
                             <User size={12} className="text-gold" /> Client Identity
                          </h3>
                          <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                              <div>
                                  <p className="text-sm font-bold text-dark">{selectedOrder.customer_name}</p>
                                  <p className="text-xs text-warm-gray">{selectedOrder.customer_phone}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] uppercase font-black tracking-widest text-warm-gray">Current Stage</p>
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                                      {selectedOrder.status}
                                  </span>
                              </div>
                          </div>
                      </section>

                      {/* Design Details */}
                      <section className="grid grid-cols-2 gap-6">
                           <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4 flex items-center gap-2">
                                    <Palette size={12} className="text-gold" /> Material Details
                                </h3>
                                <div className="bg-white border border-border p-4 rounded-sm">
                                    <p className="text-[10px] font-black uppercase text-warm-gray opacity-40">Source</p>
                                    <p className="text-xs font-bold mb-3">{selectedOrder.fabric_source === 'website' ? 'House Collection' : 'Customer Provided'}</p>
                                    <p className="text-[10px] font-black uppercase text-warm-gray opacity-40">Color</p>
                                    <p className="text-xs font-bold">{selectedOrder.color || 'Unspecified'}</p>
                                </div>
                           </div>
                           <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4 flex items-center gap-2">
                                    <ScissorsIcon size={12} className="text-gold" /> Style Profile
                                </h3>
                                <div className="bg-white border border-border p-4 rounded-sm space-y-3">
                                    {selectedOrder.customizations && Object.entries(selectedOrder.customizations).length > 0 ? (
                                        Object.entries(selectedOrder.customizations).map(([type, val]: [string, any]) => (
                                            <div key={type}>
                                                <p className="text-[9px] font-black uppercase text-warm-gray opacity-40">{type}</p>
                                                <p className="text-xs font-bold">{val}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs italic text-warm-gray opacity-60 font-serif">Standard Silhouette.</p>
                                    )}
                                </div>
                           </div>
                      </section>

                      {/* Schedule & Financials */}
                      <section className="grid grid-cols-2 gap-4">
                           <div className="flex items-center gap-3 p-4 border border-border rounded-sm bg-white">
                               <Calendar size={18} className="text-gold opacity-50" />
                               <div>
                                   <p className="text-[8px] font-black uppercase text-warm-gray opacity-40">Deadline</p>
                                   <p className="text-xs font-bold">{new Date(selectedOrder.due_date).toLocaleDateString()}</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-3 p-4 border border-border rounded-sm bg-dark text-white shadow-xl">
                               <CreditCard size={18} className="text-gold" />
                               <div>
                                   <p className="text-[8px] font-black uppercase text-gold">Receivable</p>
                                   <p className="text-lg font-serif">₹{selectedOrder.total_price}</p>
                               </div>
                           </div>
                      </section>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-border flex gap-3">
                       <Link 
                            href="/admin/orders" 
                            className="flex-1 bg-dark text-white py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-gold hover:text-dark transition-all text-center"
                       >
                           Manage Full Process
                       </Link>
                       <button 
                            className="px-6 py-3 border border-border text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-surface transition-all"
                            onClick={() => setSelectedOrderId(null)}
                       >
                           Close
                       </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
