'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ordersAPI, tailorsAPI, customersAPI, garmentsAPI, fabricsAPI, customizationsAPI, measurementsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    ChevronDown,
    CreditCard,
    User,
    Scissors,
    X,
    Ruler,
    Calendar,
    Palette,
    Package,
    Plus,
    Loader2,
    Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Order State
  const [newOrder, setNewOrder] = useState<any>({
    customer_id: '',
    garment_id: '',
    fabric_id: '',
    fabric_source: 'website',
    color: '',
    customization_notes: '',
    customizations: {},
    measurements: {},
    due_date: '',
    tailor_id: '',
    status: 'pending'
  });

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

  const { data: customers = [] } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data } = await customersAPI.list();
      return data;
    },
    enabled: isCreateModalOpen,
  });

  const { data: garments = [] } = useQuery({
    queryKey: ['admin-garments'],
    queryFn: async () => {
      const { data } = await garmentsAPI.list();
      return data;
    },
    enabled: isCreateModalOpen,
  });

  const { data: fabrics = [] } = useQuery({
    queryKey: ['admin-fabrics'],
    queryFn: async () => {
      const { data } = await fabricsAPI.list();
      return data;
    },
    enabled: isCreateModalOpen,
  });

  const { data: allCustomizations = [] } = useQuery({
    queryKey: ['admin-customs'],
    queryFn: async () => {
      const { data } = await customizationsAPI.list();
      return data;
    },
    enabled: isCreateModalOpen,
  });

  // Fetch customer measurements when customer is selected
  useEffect(() => {
    if (newOrder.customer_id && isCreateModalOpen) {
      measurementsAPI.getUser(newOrder.customer_id).then(({ data }) => {
        if (data) {
          setNewOrder((prev: any) => ({
            ...prev,
            measurements: { ...prev.measurements, ...data }
          }));
        }
      });
    }
  }, [newOrder.customer_id, isCreateModalOpen]);

  const assignMutation = useMutation({
    mutationFn: ({ orderId, tailorId }: { orderId: string; tailorId: string }) =>
      ordersAPI.assign(orderId, tailorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      ordersAPI.updateStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => ordersAPI.create(data),
    onSuccess: () => {
        toast.success('Order created successfully');
        setIsCreateModalOpen(false);
        setCreateStep(1);
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setNewOrder({
          customer_id: '',
          garment_id: '',
          fabric_id: '',
          fabric_source: 'website',
          color: '',
          customization_notes: '',
          customizations: {},
          measurements: {},
          due_date: '',
          tailor_id: '',
          status: 'pending'
        });
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to create order');
    }
  });

  const validStatuses = [
    'pending',
    'assigned',
    'cutting',
    'stitching',
    'finishing',
    'ready',
    'dispatched',
    'delivered',
  ];

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
        order.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const selectedOrder = orders.find((o: any) => o.id === selectedOrderId);

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
        case 'delivered': return 'bg-green-500/10 text-green-600 border-green-200';
        case 'assigned': return 'bg-blue-500/10 text-blue-600 border-blue-200';
        default: return 'bg-gold/10 text-gold border-gold/20';
    }
  };

  const handleCreateOrder = () => {
    if (!newOrder.customer_id || !newOrder.garment_id) {
        toast.error('Please select a customer and garment');
        return;
    }
    createOrderMutation.mutate(newOrder);
  };

  const selectedGarmentObj = garments.find((g: any) => g.id === newOrder.garment_id);
  const filteredCustoms = allCustomizations.filter((c: any) => 
    c.garment_type === selectedGarmentObj?.category || c.garment_type === 'all'
  );

  return (
    <div className="w-full space-y-6 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-serif font-bold text-dark mb-1">Order Management</h1>
            <p className="text-warm-gray text-sm opacity-80 italic">Monitor and route all tailoring operations in real-time.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gold text-dark px-6 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-gold/90 transition-all shadow-lg flex items-center gap-2"
            >
                <Plus size={18} />
                Create New Order
            </button>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
                    <input 
                        type="text" 
                        placeholder="Search ID/Customer..." 
                        className="bg-white border border-border rounded-sm pl-10 pr-4 py-2 text-xs w-48 focus:w-64 focus:ring-1 focus:ring-gold outline-none transition-all shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="bg-white border border-border p-2 rounded-sm text-warm-gray hover:text-gold shadow-sm transition-all grayscale hover:grayscale-0">
                    <Filter size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px scrollbar-hide">
         {['all', ...validStatuses].map(tab => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab 
                    ? 'border-gold text-gold bg-gold/5' 
                    : 'border-transparent text-warm-gray hover:text-dark'
                }`}
             >
                {tab}
                <span className="ml-2 py-0.5 px-1.5 bg-surface text-[8px] rounded-full opacity-60">
                    {tab === 'all' ? orders.length : orders.filter((o:any) => o.status === tab).length}
                </span>
             </button>
         ))}
      </div>

      <div className="bg-white border border-border shadow-2xl rounded-sm overflow-hidden min-h-[500px]">
        {ordersLoading || tailorsLoading ? (
            <div className="p-10 space-y-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 bg-border/20 rounded-sm animate-pulse" />
                ))}
            </div>
        ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 opacity-40">
                <Scissors size={48} className="mb-4" />
                <p className="font-serif text-xl italic">No orders in "{activeTab}" status</p>
                <p className="text-xs uppercase font-bold tracking-widest mt-2">Adjust filters to see context</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface/50 border-b border-border">
                        <tr className="text-[10px] uppercase font-black tracking-[0.2em] text-warm-gray">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Client Detail</th>
                            <th className="px-6 py-4">Project</th>
                            <th className="px-6 py-4">Financials</th>
                            <th className="px-6 py-4">Assignment</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredOrders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-gold/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedOrderId(order.id)}>
                                <td className="px-6 py-5 font-black text-xs text-gold">#{order.order_number}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-[10px] text-gold font-bold">
                                            {order.customer_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-dark">{order.customer_name || 'Generic Client'}</p>
                                            <p className="text-[10px] text-warm-gray font-medium tracking-tighter">{order.customer_phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-surface rounded-sm">
                                            <Scissors size={12} className="text-warm-gray" />
                                        </div>
                                        <p className="text-xs font-medium text-dark">{order.garment_name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div>
                                        <p className="text-xs font-black text-dark">₹{order.total_price || 0}</p>
                                        <div className="flex items-center gap-1 opacity-60">
                                            <CreditCard size={10} />
                                            <p className="text-[10px] uppercase font-black tracking-tighter">{order.payment_status || 'UNPAID'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-2 group/select relative">
                                        <User size={12} className="text-gold" />
                                        <select
                                            className="appearance-none bg-transparent border-none text-xs text-dark focus:ring-0 cursor-pointer pr-6 hover:text-gold transition-colors font-semibold"
                                            value={order.tailor_id || ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    assignMutation.mutate({ orderId: order.id, tailorId: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="" disabled>NOT ASSIGNED</option>
                                            {tailors.map((tailor: any) => (
                                                <option key={tailor.id} value={tailor.id}>
                                                    {tailor.name} ({tailor.active_orders} Active)
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={10} className="absolute right-0 pointer-events-none opacity-40 group-hover/select:opacity-100" />
                                    </div>
                                </td>
                                <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                                    <select
                                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-gold/10 outline-none cursor-pointer transition-all ${getStatusColor(order.status)}`}
                                        value={order.status || 'pending'}
                                        onChange={(e) =>
                                            statusMutation.mutate({ orderId: order.id, status: e.target.value })
                                        }
                                    >
                                        {validStatuses.map((s) => (
                                            <option key={s} value={s} className="bg-white text-dark py-2">
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="p-2 hover:bg-gold/10 rounded-sm text-warm-gray hover:text-gold transition-all">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Detail Drawer Overlay */}
      {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in text-dark">
              <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setSelectedOrderId(null)} />
              <div className="relative w-full max-w-xl bg-surface h-full shadow-2xl animate-slide-in-right overflow-y-auto">
                  <div className="sticky top-0 bg-dark text-white p-6 flex items-center justify-between border-b border-white/10 z-10">
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-1">Order Specification</p>
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
                                  <p className="text-[10px] uppercase font-black tracking-widest text-warm-gray">Assignment</p>
                                  <p className="text-xs font-bold text-gold">{selectedOrder.tailor_name || 'Unassigned'}</p>
                              </div>
                          </div>
                      </section>

                      {/* Design & Material */}
                      <section className="grid grid-cols-2 gap-6">
                           <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4 flex items-center gap-2">
                                    <Palette size={12} className="text-gold" /> Material Details
                                </h3>
                                <div className="bg-white border border-border p-4 rounded-sm">
                                    <p className="text-[10px] font-black uppercase text-warm-gray opacity-40">Source</p>
                                    <p className="text-xs font-bold mb-3">{selectedOrder.fabric_source === 'website' ? 'House Collection' : 'Customer Provided'}</p>
                                    
                                    <p className="text-[10px] font-black uppercase text-warm-gray opacity-40">Fabric Name</p>
                                    <p className="text-xs font-bold mb-3">{selectedOrder.fabric_id ? selectedOrder.fabric_name : 'N/A'}</p>

                                    <p className="text-[10px] font-black uppercase text-warm-gray opacity-40">Primary Color</p>
                                    <p className="text-xs font-bold">{selectedOrder.color || 'Unspecified'}</p>
                                </div>
                           </div>
                           <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4 flex items-center gap-2">
                                    <Scissors size={12} className="text-gold" /> Style Profile
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
                                        <p className="text-xs italic text-warm-gray opacity-60 font-serif">Standard Silhouette selected.</p>
                                    )}
                                </div>
                           </div>
                      </section>

                      {/* Measurements Section */}
                      <section>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4 flex items-center gap-2">
                              <Ruler size={12} className="text-gold" /> Measurements (Inches)
                          </h3>
                          <div className="grid grid-cols-4 gap-2">
                              {selectedOrder.measurements && Object.entries(selectedOrder.measurements).length > 0 ? (
                                  Object.entries(selectedOrder.measurements).map(([key, val]: [string, any]) => (
                                      <div key={key} className="bg-white border border-border p-3 rounded-sm text-center">
                                          <p className="text-[8px] font-black uppercase text-warm-gray opacity-40 mb-1 leading-tight">{key}</p>
                                          <p className="text-xs font-black text-dark">{val || '--'}</p>
                                      </div>
                                  ))
                              ) : (
                                  <div className="col-span-4 bg-yellow-50 border border-yellow-100 p-4 text-center rounded-sm">
                                      <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">⚠️ Missing Measurements</p>
                                  </div>
                              )}
                          </div>
                      </section>

                      {/* Instructions & Notes */}
                      <section>
                           <h3 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4">Artisan Instructions</h3>
                           <div className="bg-gold/5 border border-gold/20 p-5 rounded-sm">
                               <p className="text-xs text-dark leading-relaxed font-medium italic">
                                   "{selectedOrder.customization_notes || 'No special instructions provided.'}"
                               </p>
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
                                   <p className="text-[8px] font-black uppercase text-gold">Total Receivable</p>
                                   <p className="text-lg font-serif">₹{selectedOrder.total_price}</p>
                               </div>
                           </div>
                      </section>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-border flex gap-3">
                       <button 
                            className="flex-1 bg-dark text-white py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-gold hover:text-dark transition-all"
                            onClick={() => window.print()}
                       >
                           Print Job Sheet
                       </button>
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

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-dark/70 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-gold/20 text-dark">
                  {/* Modal Header */}
                  <div className="p-6 bg-dark text-white flex items-center justify-between border-b border-gold/20">
                      <div>
                          <h3 className="text-2xl font-serif font-bold text-gold">Artisan Order Creation</h3>
                          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-warm-gray opacity-60">Step {createStep} of 3 — {createStep === 1 ? 'Customer & Base' : createStep === 2 ? 'Design & Fabric' : 'Final Specifications'}</p>
                      </div>
                      <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Multi-step progress bar */}
                  <div className="flex w-full h-1 bg-dark">
                      <div className={`h-full bg-gold transition-all duration-500 ${createStep === 1 ? 'w-1/3' : createStep === 2 ? 'w-2/3' : 'w-full'}`} />
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
                      {createStep === 1 && (
                          <div className="space-y-8 animate-in slide-in-from-right-4">
                              <div className="grid grid-cols-2 gap-10">
                                  <div className="space-y-4">
                                      <label className="text-xs font-black uppercase tracking-widest text-warm-gray flex items-center gap-2">
                                          <User size={14} className="text-gold" /> Select Client
                                      </label>
                                      <select 
                                          className="w-full p-4 bg-surface border border-border rounded-sm focus:ring-1 focus:ring-gold outline-none font-bold text-sm"
                                          value={newOrder.customer_id}
                                          onChange={(e) => setNewOrder({...newOrder, customer_id: e.target.value})}
                                      >
                                          <option value="">Choose a registered client...</option>
                                          {customers.map((c: any) => (
                                              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                          ))}
                                      </select>
                                      <p className="text-[10px] italic text-warm-gray">* If client is new, register them first in the Customer portal.</p>
                                  </div>

                                  <div className="space-y-4">
                                      <label className="text-xs font-black uppercase tracking-widest text-warm-gray flex items-center gap-2">
                                          <Scissors size={14} className="text-gold" /> Select Garment
                                      </label>
                                      <div className="grid grid-cols-2 gap-3">
                                          {garments.map((g: any) => (
                                              <button
                                                  key={g.id}
                                                  onClick={() => setNewOrder({...newOrder, garment_id: g.id})}
                                                  className={`p-4 border rounded-sm flex flex-col items-center gap-2 transition-all ${
                                                      newOrder.garment_id === g.id 
                                                      ? 'bg-gold/10 border-gold ring-1 ring-gold shadow-md' 
                                                      : 'bg-surface border-border hover:border-gold/30'
                                                  }`}
                                              >
                                                  <span className="text-2xl">{g.emoji || '🧵'}</span>
                                                  <span className="text-[10px] font-black uppercase tracking-tighter text-center">{g.name}</span>
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {createStep === 2 && (
                          <div className="space-y-10 animate-in slide-in-from-right-4">
                              <div className="grid grid-cols-2 gap-10">
                                  {/* Fabric Source */}
                                  <div className="space-y-4">
                                      <label className="text-xs font-black uppercase tracking-widest text-warm-gray flex items-center gap-2">
                                          <Palette size={14} className="text-gold" /> Fabric Source
                                      </label>
                                      <div className="flex gap-2">
                                          <button 
                                              onClick={() => setNewOrder({...newOrder, fabric_source: 'website'})}
                                              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-all ${newOrder.fabric_source === 'website' ? 'bg-dark text-gold border-dark shadow-xl' : 'bg-surface border-border text-warm-gray'}`}
                                          >
                                              House Selection
                                          </button>
                                          <button 
                                              onClick={() => setNewOrder({...newOrder, fabric_source: 'customer'})}
                                              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-all ${newOrder.fabric_source === 'customer' ? 'bg-dark text-gold border-dark shadow-xl' : 'bg-surface border-border text-warm-gray'}`}
                                          >
                                              Client Provided
                                          </button>
                                      </div>

                                      {newOrder.fabric_source === 'website' && (
                                          <select 
                                              className="w-full p-4 bg-surface border border-border rounded-sm focus:ring-1 focus:ring-gold outline-none font-bold text-sm mt-4 animate-in fade-in"
                                              value={newOrder.fabric_id}
                                              onChange={(e) => setNewOrder({...newOrder, fabric_id: e.target.value})}
                                          >
                                              <option value="">Select fabric from stock...</option>
                                              {fabrics.map((f: any) => (
                                                  <option key={f.id} value={f.id}>{f.name} (₹{f.price_per_meter}/m)</option>
                                              ))}
                                          </select>
                                      )}

                                      <div className="pt-4">
                                          <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-2 block">Primary Color Note</label>
                                          <input 
                                              type="text"
                                              placeholder="e.g. Midnight Blue with Gold Thread"
                                              className="w-full p-4 bg-surface border border-border rounded-sm focus:ring-1 focus:ring-gold outline-none font-medium text-sm"
                                              value={newOrder.color}
                                              onChange={(e) => setNewOrder({...newOrder, color: e.target.value})}
                                          />
                                      </div>
                                  </div>

                                  {/* Customizations */}
                                  <div className="space-y-4">
                                      <label className="text-xs font-black uppercase tracking-widest text-warm-gray flex items-center gap-2">
                                          <Scissors size={14} className="text-gold" /> Customizations
                                      </label>
                                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                          {Array.from(new Set(filteredCustoms.map((c:any) => c.customization_type))).map((type: any) => (
                                              <div key={type} className="space-y-2">
                                                  <p className="text-[9px] font-black uppercase tracking-tighter text-gold/80">{type}</p>
                                                  <div className="grid grid-cols-2 gap-2">
                                                      {filteredCustoms.filter((c:any) => c.customization_type === type).map((opt: any) => (
                                                          <button 
                                                              key={opt.id}
                                                              onClick={() => setNewOrder({
                                                                  ...newOrder, 
                                                                  customizations: { ...newOrder.customizations, [type]: opt.option_name }
                                                              })}
                                                              className={`px-3 py-2 text-[10px] font-bold border rounded-sm transition-all ${
                                                                  newOrder.customizations[type] === opt.option_name 
                                                                  ? 'bg-gold text-dark border-gold shadow-md' 
                                                                  : 'bg-surface border-border hover:border-gold/30'
                                                              }`}
                                                          >
                                                              {opt.option_name}
                                                          </button>
                                                      ))}
                                                  </div>
                                              </div>
                                          ))}
                                          {filteredCustoms.length === 0 && (
                                              <p className="text-xs italic text-warm-gray opacity-50 py-10 text-center">No customizations available for this garment.</p>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {createStep === 3 && (
                          <div className="space-y-10 animate-in slide-in-from-right-4">
                              <div className="grid grid-cols-3 gap-6">
                                  <div className="col-span-2 space-y-6">
                                      <label className="text-xs font-black uppercase tracking-widest text-warm-gray flex items-center gap-2">
                                          <Ruler size={14} className="text-gold" /> Precise Measurements (Inches)
                                      </label>
                                      <div className="grid grid-cols-4 gap-4">
                                          {['chest', 'waist', 'shoulder', 'sleeve_length', 'shirt_length', 'pant_length', 'neck', 'inseam'].map((key) => (
                                              <div key={key} className="space-y-1">
                                                  <p className="text-[8px] font-black uppercase text-warm-gray">{key.replace('_', ' ')}</p>
                                                  <input 
                                                      type="text"
                                                      placeholder="--"
                                                      value={newOrder.measurements[key] || ''}
                                                      onChange={(e) => setNewOrder({
                                                          ...newOrder,
                                                          measurements: { ...newOrder.measurements, [key]: e.target.value } 
                                                      })}
                                                      className="w-full p-2 bg-surface border border-border rounded-sm focus:ring-1 focus:ring-gold outline-none text-center font-black text-xs"
                                                  />
                                              </div>
                                          ))}
                                      </div>

                                      <div className="pt-4 space-y-4">
                                          <label className="text-xs font-black uppercase tracking-widest text-warm-gray">Artisan Note / Customization Details</label>
                                          <textarea 
                                              placeholder="Any specific instructions for the tailor..."
                                              rows={3}
                                              className="w-full p-4 bg-surface border border-border rounded-sm focus:ring-1 focus:ring-gold outline-none font-medium text-sm italic"
                                              value={newOrder.customization_notes}
                                              onChange={(e) => setNewOrder({...newOrder, customization_notes: e.target.value})}
                                          />
                                      </div>
                                  </div>

                                  <div className="bg-dark text-white p-6 space-y-6 rounded-sm shadow-2xl">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold flex items-center gap-2 border-b border-white/10 pb-4">
                                          <Package size={14} /> Logistical Setup
                                      </h4>
                                      
                                      <div className="space-y-4">
                                          <div>
                                              <p className="text-[9px] font-black uppercase tracking-tighter opacity-40 mb-2">Assign Artisan (Optional)</p>
                                              <select 
                                                  className="w-full p-3 bg-white/5 border border-white/10 rounded-sm text-xs font-bold text-gold outline-none focus:border-gold transition-colors"
                                                  value={newOrder.tailor_id}
                                                  onChange={(e) => setNewOrder({...newOrder, tailor_id: e.target.value, status: e.target.value ? 'assigned' : 'pending'})}
                                              >
                                                  <option value="" className="bg-dark">UNASSIGNED</option>
                                                  {tailors.map((t: any) => (
                                                      <option key={t.id} value={t.id} className="bg-dark">{t.name} ({t.active_orders} Active)</option>
                                                  ))}
                                              </select>
                                          </div>

                                          <div>
                                              <p className="text-[9px] font-black uppercase tracking-tighter opacity-40 mb-2">Delivery Deadline</p>
                                              <input 
                                                  type="date"
                                                  className="w-full p-3 bg-white/5 border border-white/10 rounded-sm text-xs font-bold text-gold outline-none focus:border-gold transition-colors"
                                                  value={newOrder.due_date}
                                                  onChange={(e) => setNewOrder({...newOrder, due_date: e.target.value})}
                                              />
                                          </div>

                                          <div className="pt-10">
                                              <button 
                                                  onClick={handleCreateOrder}
                                                  disabled={createOrderMutation.isPending}
                                                  className="w-full bg-gold text-dark py-4 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                              >
                                                  {createOrderMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                                                  Finalize Order
                                              </button>
                                              <p className="text-[8px] text-center mt-3 opacity-40 font-bold uppercase tracking-widest">Commits to blockchain and production queue</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 bg-surface border-t border-border flex items-center justify-between">
                      <button 
                          onClick={() => setCreateStep(prev => Math.max(1, prev - 1))}
                          className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border border-border hover:bg-white transition-all ${createStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                      >
                          Previous Phase
                      </button>
                      
                      <div className="flex gap-4">
                          <button 
                              onClick={() => setIsCreateModalOpen(false)}
                              className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-warm-gray hover:text-dark transition-all"
                          >
                              Abandon
                          </button>
                          {createStep < 3 && (
                              <button 
                                  onClick={() => setCreateStep(prev => prev + 1)}
                                  className="px-10 py-3 bg-dark text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-gold hover:text-dark shadow-xl transition-all flex items-center gap-2"
                              >
                                  Next Intelligence <ChevronDown size={14} className="-rotate-90" />
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

