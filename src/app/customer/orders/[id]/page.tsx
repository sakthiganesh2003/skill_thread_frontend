'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { 
  Package, 
  Scissors, 
  Ruler, 
  Palette, 
  CheckCircle2, 
  MessageSquare, 
  History,
  ChevronLeft,
  Calendar,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:    { label: 'Pending Approval',    bg: 'bg-yellow-500/10',  text: 'text-yellow-600',  dot: 'bg-yellow-500'  },
  assigned:   { label: 'Assigned to Tailor',  bg: 'bg-blue-500/10',    text: 'text-blue-600',    dot: 'bg-blue-500'    },
  cutting:    { label: 'Fabric Cutting',      bg: 'bg-orange-500/10',  text: 'text-orange-600',  dot: 'bg-orange-500'  },
  stitching:  { label: 'Stitching in Progress', bg: 'bg-purple-500/10',  text: 'text-purple-600',  dot: 'bg-purple-500'  },
  finishing:  { label: 'Final Finishing',     bg: 'bg-indigo-500/10',  text: 'text-indigo-600',  dot: 'bg-indigo-500'  },
  ready:      { label: 'Quality Passed',      bg: 'bg-teal-500/10',    text: 'text-teal-600',    dot: 'bg-teal-500'    },
  dispatched: { label: 'Out for Delivery',    bg: 'bg-sky-500/10',     text: 'text-sky-600',     dot: 'bg-sky-500'     },
  delivered:  { label: 'Delivered',           bg: 'bg-green-500/10',   text: 'text-green-600',   dot: 'bg-green-500'   },
};

const STAGES = ['pending','assigned','cutting','stitching','finishing','ready','dispatched','delivered'];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await ordersAPI.get(orderId);
      return data;
    },
    enabled: !!orderId,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: async () => {
      const { data } = await ordersAPI.getMessages(orderId);
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 10000,
  });

  const sendMessage = useMutation({
    mutationFn: () => ordersAPI.sendMessage(orderId, message),
    onSuccess: () => {
      setMessage('');
      refetchMessages();
    },
  });

  if (isLoading) return <div className="pt-40 text-center font-serif text-warm-gray italic">Retrieving order specifications...</div>;
  if (!order) return <div className="pt-40 text-center">Order not found.</div>;

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
  const currentStageIndex = STAGES.indexOf(order.status);
  const progress = currentStageIndex >= 0 ? ((currentStageIndex + 1) / STAGES.length) * 100 : 0;

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-24 bg-surface min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="flex items-center justify-between mb-8">
              <Link href="/customer" className="flex items-center gap-2 text-dark hover:text-gold transition-colors">
                  <ChevronLeft size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back to Orders</span>
              </Link>
              <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-gold/10 ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                  </span>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Side — Main Info */}
              <div className="lg:col-span-2 space-y-8">
                  
                  {/* Order Hero */}
                  <div className="bg-white border border-border p-8 rounded-sm shadow-sm flex flex-col md:flex-row gap-8">
                      <div className="w-32 h-40 bg-surface rounded-sm border border-border overflow-hidden flex-shrink-0">
                          {order.image_url ? (
                              <img src={order.image_url} alt={order.garment_name} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-gold font-serif text-2xl font-bold">ST</div>
                          )}
                      </div>
                      <div className="flex-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-2">Order ID #{order.order_number}</p>
                          <h1 className="font-serif text-4xl font-light mb-4 text-dark">{order.garment_name}</h1>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-6 mt-2">
                               <div className="flex items-center gap-3">
                                   <Palette size={16} className="text-gold" />
                                   <div>
                                       <p className="text-[8px] font-black uppercase text-warm-gray opacity-50">Fabric</p>
                                       <p className="text-xs font-bold">{order.fabric_name || 'Customer'}</p>
                                   </div>
                               </div>
                               <div className="flex items-center gap-3">
                                   <Calendar size={16} className="text-gold" />
                                   <div>
                                       <p className="text-[8px] font-black uppercase text-warm-gray opacity-50">Due Date</p>
                                       <p className="text-xs font-bold">{new Date(order.due_date).toLocaleDateString()}</p>
                                   </div>
                               </div>
                               <div className="flex items-center gap-3">
                                   <CreditCard size={16} className="text-gold" />
                                   <div>
                                       <p className="text-[8px] font-black uppercase text-warm-gray opacity-50">Total Price</p>
                                       <p className="text-xs font-bold text-dark">₹{order.total_price}</p>
                                   </div>
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-white border border-border p-8 rounded-sm shadow-sm">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-8 flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-gold" /> Artisan Workflow Progress
                      </h3>
                      
                      <div className="space-y-4">
                          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-gold h-full transition-all duration-1000 ease-out" 
                                style={{ width: `${progress}%` }}
                              />
                          </div>
                          <div className="flex justify-between items-start">
                              {STAGES.map((s, idx) => {
                                  const isActive = idx === currentStageIndex;
                                  const isPast = idx < currentStageIndex;
                                  return (
                                    <div key={s} className="flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full border-2 ${
                                            isActive ? 'bg-gold border-gold scale-125' : 
                                            isPast ? 'bg-gold/40 border-gold/40' : 'bg-transparent border-border'
                                        }`} />
                                    </div>
                                  );
                              })}
                          </div>
                          <div className="flex justify-between items-start text-[8px] font-black uppercase tracking-tighter text-warm-gray opacity-60">
                                <span>Initiated</span>
                                <span>In Hand</span>
                                <span>Finished</span>
                                <span>Delivered</span>
                          </div>
                      </div>

                      {/* History Feed */}
                      <div className="mt-10 border-t border-border pt-8 space-y-6">
                            {order.history && order.history.map((entry: any, i: number) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[8px] font-black">
                                            {order.history.length - i}
                                        </div>
                                        {i < order.history.length - 1 && <div className="w-px h-full bg-border" />}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-dark">
                                            Stage: <span className="text-gold">{entry.status}</span>
                                        </p>
                                        <p className="text-xs text-warm-gray italic mt-1">{entry.notes || 'Status synchronized by workshop control.'}</p>
                                        <p className="text-[8px] font-black uppercase text-warm-gray opacity-40 mt-1">
                                            {new Date(entry.created_at._seconds ? entry.created_at._seconds * 1000 : entry.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )).reverse()}
                      </div>
                  </div>

                  {/* Measurements & Design Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white border border-border p-6 rounded-sm shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-6 flex items-center gap-2">
                                <Ruler size={12} className="text-gold" /> Body Measurements
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {order.measurements && Object.entries(order.measurements).length > 0 ? (
                                    Object.entries(order.measurements).map(([key, val]: [string, any]) => (
                                        <div key={key} className="flex justify-between items-center border-b border-border/50 pb-2">
                                            <span className="text-[10px] font-black uppercase text-warm-gray opacity-50">{key}</span>
                                            <span className="text-xs font-bold text-dark">{val} IN</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs italic text-warm-gray">Standard sizing applied.</p>
                                )}
                            </div>
                       </div>

                       <div className="bg-white border border-border p-6 rounded-sm shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-6 flex items-center gap-2">
                                <Scissors size={12} className="text-gold" /> Bespoke Styles
                            </h3>
                            <div className="space-y-4">
                                {order.customizations && Object.entries(order.customizations).map(([type, val]: [string, any]) => (
                                    <div key={type}>
                                        <p className="text-[10px] font-black uppercase text-warm-gray opacity-40 leading-none mb-1">{type}</p>
                                        <p className="text-xs font-bold text-dark">{val}</p>
                                    </div>
                                ))}
                                {order.customization_notes && (
                                    <div className="bg-surface p-4 border border-border mt-4 rounded-sm">
                                        <p className="text-[10px] font-black uppercase text-gold mb-1">Special Instruction</p>
                                        <p className="text-xs italic text-dark leading-relaxed font-serif">"{order.customization_notes}"</p>
                                    </div>
                                )}
                            </div>
                       </div>
                  </div>

              </div>

              {/* Right Side — Chat & Status Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                  
                  {/* Workshop Chat */}
                  <div className="bg-white border border-border rounded-sm shadow-xl flex flex-col h-[600px] sticky top-24">
                        <div className="p-4 bg-dark text-white rounded-t-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={14} className="text-gold" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Master Tailor Concierge</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] font-black uppercase">Studio Online</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                    <MessageSquare size={32} className="mb-4" />
                                    <p className="text-xs font-serif italic font-bold">Inquiry channel active. Our artisans will reach out if design clarification is required.</p>
                                </div>
                            ) : (
                                messages.map((msg: any) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-sm text-xs shadow-sm ${
                                                isMe ? 'bg-dark text-white' : 'bg-surface border border-border text-dark'
                                            }`}>
                                                {!isMe && <p className="text-[8px] font-black uppercase text-gold mb-1">{msg.sender_name}</p>}
                                                <p className="leading-relaxed font-medium">{msg.content}</p>
                                                <p className={`text-[8px] text-right mt-1 opacity-40 font-black ${isMe ? 'text-white' : 'text-dark'}`}>
                                                    {new Date(msg.created_at._seconds ? msg.created_at._seconds * 1000 : msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (message.trim()) sendMessage.mutate();
                            }}
                            className="p-4 border-t border-border bg-surface/50"
                        >
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Message current tailor..."
                                    className="w-full bg-white border border-border px-4 py-3 pr-16 text-xs focus:ring-1 focus:ring-gold outline-none"
                                />
                                <button 
                                    disabled={sendMessage.isPending || !message.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gold font-black uppercase text-[10px] hover:text-dark transition-colors disabled:opacity-30"
                                >
                                    {sendMessage.isPending ? '...' : 'Send'}
                                </button>
                            </div>
                        </form>
                  </div>

                  {/* Reference Design Images if any */}
                  {order.design_images && order.design_images.length > 0 && (
                      <div className="bg-white border border-border p-6 rounded-sm">
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4 flex items-center gap-2">
                               <ImageIcon size={12} className="text-gold" /> Reference Gallery
                           </h3>
                           <div className="grid grid-cols-2 gap-3">
                               {order.design_images.map((img: string, idx: number) => (
                                   <div key={idx} className="h-24 bg-surface rounded-sm border border-border overflow-hidden cursor-pointer hover:border-gold transition-all">
                                       <img src={img} className="w-full h-full object-cover" />
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}

                  {/* Order Support Card */}
                  <div className="p-6 bg-gold text-dark rounded-sm shadow-xl">
                       <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                           <History size={12} /> Support Inquiry
                       </h4>
                       <p className="text-xs font-medium leading-relaxed mb-4">For immediate modifications or shipping address changes, please quote your reference: <span className="font-bold underline">#{order.order_number}</span></p>
                       <button className="w-full bg-dark text-white py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm">Call Direct Concierge</button>
                  </div>

              </div>

          </div>

        </div>
      </div>
    </>
  );
}
