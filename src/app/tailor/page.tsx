'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { 
  Scissors, 
  Ruler, 
  Palette, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Box, 
  User,
  Info,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const STAGES = ['pending', 'assigned', 'cutting', 'stitching', 'finishing', 'ready', 'dispatched', 'delivered'];

export default function TailorWorkbench() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, hydrate } = useAuthStore();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    hydrate().then(() => {
      const user = useAuthStore.getState().user;
      if (!user || user.role !== 'tailor') {
        router.push('/login');
      }
    });
  }, [router, hydrate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['tailor-orders'],
    queryFn: async () => {
      const { data } = await ordersAPI.list();
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) => 
        ordersAPI.updateStatus(id, status, note),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tailor-orders'] });
    }
  });

  const activeOrder = orders.find((o: any) => o.id === activeOrderId) || orders[0];

  const handleNextStage = (order: any) => {
      const currentIdx = STAGES.indexOf(order.status);
      if (currentIdx < STAGES.length - 1) {
          const nextStatus = STAGES[currentIdx + 1];
          updateMutation.mutate({ 
              id: order.id, 
              status: nextStatus,
              note: `Stage progressed by Master Artisan ${user?.name}` 
          });
      }
  };

  if (!user) return <div className="h-screen flex items-center justify-center bg-surface font-serif italic text-warm-gray">Establishing Artisan Session...</div>;

  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-surface flex flex-col md:flex-row overflow-hidden h-screen">
        
        {/* Left Sidebar: Queue */}
        <div className="w-full md:w-96 bg-white border-r border-border flex flex-col h-full shadow-xl z-10 transition-all duration-500">
            <div className="p-8 border-b border-border bg-dark text-white">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-gold" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/80">Workshop Control</span>
                </div>
                <h1 className="font-serif text-3xl font-light">My Workbench</h1>
                <p className="text-[10px] text-warm-gray font-bold uppercase tracking-widest mt-2">{orders.length} ACTIVE ASSIGNMENTS</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading ? (
                    [...Array(5)].map((_, i) => <div key={i} className="h-24 bg-surface rounded-sm animate-pulse" />)
                ) : orders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                        <Box size={40} className="mb-4" />
                        <p className="text-xs font-serif font-bold">Workbench is clear.<br/>All crafts are syncronized.</p>
                    </div>
                ) : (
                    orders.map((order: any) => (
                        <div 
                            key={order.id}
                            onClick={() => setActiveOrderId(order.id)}
                            className={`p-5 border cursor-pointer transition-all duration-300 group rounded-sm ${
                                activeOrder?.id === order.id 
                                ? 'bg-gold/5 border-gold shadow-md translate-x-1' 
                                : 'bg-white border-border hover:border-gold/30 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[9px] font-black text-gold uppercase tracking-tighter">#{order.order_number}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    order.status === 'delivered' ? 'bg-green-500/10 text-green-600' : 'bg-gold/10 text-gold'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                            <h4 className={`font-serif text-lg font-light leading-tight transition-colors ${activeOrder?.id === order.id ? 'text-dark' : 'text-warm-gray group-hover:text-dark'}`}>
                                {order.garment_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-2 opacity-60">
                                <User size={10} />
                                <span className="text-[10px] uppercase font-bold tracking-tighter">{order.customer_name}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Right Content: Artisan Detail / Workbench */}
        <div className="flex-1 overflow-y-auto bg-surface custom-scrollbar">
            {!activeOrder ? (
                <div className="h-full flex items-center justify-center italic text-warm-gray/40 font-serif text-lg animate-fade-in">Select a project to begin crafting...</div>
            ) : (
                <div className="p-8 md:p-14 max-w-5xl mx-auto space-y-12 animate-fade-in">
                    
                    {/* Header Spec */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">Project Specification</p>
                            <h2 className="font-serif text-5xl font-light mb-4">{activeOrder.garment_name}</h2>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-dark rounded-full text-gold"><Palette size={12} /></div>
                                    <span className="text-xs font-bold uppercase tracking-tighter">{activeOrder.fabric_name || 'Customer Provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-dark rounded-full text-gold"><Calendar size={12} /></div>
                                    <span className="text-xs font-bold uppercase tracking-tighter">Due: {new Date(activeOrder.due_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-40">Financial Value</p>
                             <p className="text-3xl font-serif text-dark font-black">₹{activeOrder.total_price}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        
                        {/* Job Sheet (Center Primary) */}
                        <div className="lg:col-span-2 space-y-12">
                            
                            {/* Workflow Control */}
                            <section className="bg-white border border-border p-8 rounded-sm shadow-xl">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-dark mb-8 flex items-center gap-2">
                                    <Clock size={14} className="text-gold" /> Production Control
                                </h3>
                                <div className="flex flex-col gap-6">
                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                                        {STAGES.map((s, idx) => {
                                            const currentIdx = STAGES.indexOf(activeOrder.status);
                                            const isDone = idx < currentIdx;
                                            const isCurrent = idx === currentIdx;
                                            return (
                                                <div key={s} className="flex flex-col items-center gap-2">
                                                    <div className={`w-full h-1 rounded-full transition-all duration-500 ${
                                                        isDone || isCurrent ? 'bg-gold' : 'bg-border/30'
                                                    }`} />
                                                    <span className={`text-[7px] font-black uppercase text-center leading-none ${
                                                        isCurrent ? 'text-gold' : 'opacity-30'
                                                    }`}>
                                                        {s}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => handleNextStage(activeOrder)}
                                            disabled={activeOrder.status === 'delivered' || updateMutation.isPending}
                                            className="flex-1 btn-primary py-4 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-30"
                                        >
                                            {updateMutation.isPending ? 'Syncing...' : (
                                                <>Progress to Next Stage <ArrowRight size={14} /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Measurement Chart */}
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-dark flex items-center gap-2">
                                        <Ruler size={14} className="text-gold" /> Precision Measurements
                                    </h3>
                                    <div className="bg-dark text-white px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest">Job Sheet Reference</div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {activeOrder.measurements && Object.entries(activeOrder.measurements).length > 0 ? (
                                        Object.entries(activeOrder.measurements).map(([key, val]: [string, any]) => (
                                            <div key={key} className="bg-white border border-border p-5 rounded-sm text-center group hover:border-gold transition-colors">
                                                <p className="text-[9px] font-black uppercase text-warm-gray opacity-40 mb-2 leading-none group-hover:text-gold transition-colors">{key}</p>
                                                <p className="text-xl font-black text-dark">{val} <span className="text-[10px] opacity-20">IN</span></p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full p-10 bg-white border border-dashed border-border text-center">
                                            <p className="text-xs font-serif italic text-warm-gray">No measurement profile attached. Consult admin.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Design Instructions */}
                            <section>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-dark mb-6 flex items-center gap-2">
                                    <Scissors size={14} className="text-gold" /> Bespoke Stylings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeOrder.customizations && Object.entries(activeOrder.customizations).map(([type, val]: [string, any]) => (
                                        <div key={type} className="bg-white border-l-4 border-l-gold p-4 shadow-sm border border-border">
                                            <p className="text-[9px] font-black uppercase text-warm-gray opacity-40 leading-none mb-1">{type}</p>
                                            <p className="text-sm font-bold text-dark">{val}</p>
                                        </div>
                                    ))}
                                </div>
                                {activeOrder.customization_notes && (
                                    <div className="mt-6 bg-dark text-white p-6 rounded-sm border-l-4 border-l-gold shadow-2xl">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
                                            <Info size={12} /> Master Artisan Note
                                        </p>
                                        <p className="font-serif italic text-lg leading-relaxed opacity-90">
                                            "{activeOrder.customization_notes}"
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Visual Reference & Context (Right Sidebar) */}
                        <div className="space-y-8">
                             <div className="bg-white border border-border p-4 rounded-sm shadow-sm">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-warm-gray mb-4">Reference Sketches</h4>
                                <div className="space-y-4">
                                    {activeOrder.design_images && activeOrder.design_images.length > 0 ? (
                                        activeOrder.design_images.map((img: string, i: number) => (
                                            <div key={i} className="aspect-square bg-surface border border-border rounded-sm overflow-hidden hover:border-gold transition-colors cursor-zoom-in">
                                                <img src={img} className="w-full h-full object-cover" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="aspect-square bg-surface border border-dashed border-border rounded-sm flex items-center justify-center text-center p-6 grayscale opacity-30">
                                            <div>
                                                <Scissors size={24} className="mx-auto mb-2" />
                                                <p className="text-[9px] font-black uppercase tracking-widest">No Visual<br/>Provided</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </div>

                             <div className="card p-6 border-gold/10 bg-gold/[0.02]">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-gold mb-3">Customer Identity</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-dark text-gold flex items-center justify-center font-black text-sm">
                                        {activeOrder.customer_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark">{activeOrder.customer_name}</p>
                                        <p className="text-[10px] text-warm-gray font-medium">{activeOrder.customer_phone}</p>
                                    </div>
                                </div>
                                <button className="w-full mt-6 bg-dark text-white py-2.5 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-gold hover:text-dark transition-all">
                                    Direct Message
                                </button>
                             </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
}
