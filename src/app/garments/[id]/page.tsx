'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { garmentsAPI, fabricsAPI, customizationsAPI, ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import ImageUploader from '@/components/ui/ImageUploader';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Scissors, 
  Info, 
  ShieldCheck,
  Package,
  Ruler,
  Palette,
  Video,
  MapPin
} from 'lucide-react';

const STEPS = [
  { id: 'fabric', title: 'Choose Fabric', icon: Palette },
  { id: 'custom', title: 'Design Style', icon: Scissors },
  { id: 'measure', title: 'Measurements', icon: Ruler },
  { id: 'review', title: 'Review Order', icon: ShieldCheck }
];

export default function CustomOrderWizard() {
  const router = useRouter();
  const params = useParams();
  const garmentId = params.id as string;
  const { user } = useAuthStore();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  
  // Selection States
  const [fabricSource, setFabricSource] = useState<'website' | 'customer'>('website');
  const [selectedFabricId, setSelectedFabricId] = useState<string>('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
  const [measurementMethod, setMeasurementMethod] = useState<'manual' | 'shop' | 'video'>('manual');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [color, setColor] = useState('');
  const [customizationNotes, setCustomizationNotes] = useState('');
  const [designImages, setDesignImages] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  // Queries
  const { data: garment, isLoading: garmentLoading } = useQuery({
    queryKey: ['garment', garmentId],
    queryFn: async () => {
      const { data } = await garmentsAPI.get(garmentId);
      return data;
    },
  });

  const { data: fabrics = [] } = useQuery({
    queryKey: ['fabrics'],
    queryFn: async () => {
      const { data } = await fabricsAPI.list();
      return data.filter((f: any) => f.is_active);
    },
  });

  const { data: customizations = [] } = useQuery({
    queryKey: ['customizations'],
    queryFn: async () => {
      const { data } = await customizationsAPI.list();
      return data.filter((c: any) => c.is_active);
    },
  });

  // Derived Data
  const selectedFabric = useMemo(
    () => fabrics.find((f: any) => f.id === selectedFabricId),
    [fabrics, selectedFabricId]
  );

  const relevantCustomizations = useMemo(() => {
    if (!garment) return {};
    const relevant = customizations.filter(
      (c: any) =>
        c.garment_type === garment.category ||
        c.garment_type?.toLowerCase() === garment.name?.toLowerCase() ||
        c.garment_type === 'all'
    );
    return relevant.reduce((acc: any, c: any) => {
      if (!acc[c.customization_type]) acc[c.customization_type] = [];
      acc[c.customization_type].push(c);
      return acc;
    }, {});
  }, [customizations, garment]);

  const estimatedTotal = useMemo(() => {
    if (!garment) return 0;
    let total = garment.base_price || 0;
    
    // Fabric
    if (fabricSource === 'website' && selectedFabric) {
      total += (selectedFabric.price_per_meter * 2.5);
    }
    
    // Customizations
    Object.entries(selectedCustomizations).forEach(([type, optName]) => {
        const opt = customizations.find(c => 
            c.customization_type === type && 
            c.option_name === optName && 
            (c.garment_type === garment.category || c.garment_type === 'all')
        );
        if (opt) total += (opt.extra_price || 0);
    });

    return Math.round(total);
  }, [garment, fabricSource, selectedFabric, selectedCustomizations, customizations]);

  const createOrder = useMutation({
    mutationFn: () =>
      ordersAPI.create({
        garment_id: garmentId,
        fabric_id: selectedFabricId,
        fabric_source: fabricSource,
        color,
        customization_notes: customizationNotes,
        customizations: selectedCustomizations,
        measurements: measurementMethod === 'manual' ? measurements : { method: measurementMethod },
        design_images: designImages,
        due_date: dueDate || undefined,
      }),
    onSuccess: () => {
      router.push('/customer');
    },
  });

  const nextStep = () => setCurrentStepIdx(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStepIdx(prev => Math.max(prev - 1, 0));

  if (garmentLoading) return <div className="pt-40 text-center font-serif italic text-warm-gray">Preparing your design studio...</div>;
  if (!garment) return <div className="pt-40 text-center">Design not found.</div>;

  const currentStep = STEPS[currentStepIdx];

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-20 min-h-screen bg-surface">
        {/* Progress Stepper */}
        <div className="bg-white border-b border-border sticky top-16 z-30">
          <div className="max-w-5xl mx-auto px-6 py-4">
             <div className="flex items-center justify-between">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 group flex-1">
                       <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          idx <= currentStepIdx ? 'bg-gold border-gold text-dark' : 'border-border text-warm-gray'
                       }`}>
                          {idx < currentStepIdx ? <Check size={16} strokeWidth={3} /> : <Icon size={14} />}
                       </div>
                       <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                          idx <= currentStepIdx ? 'text-dark' : 'text-warm-gray'
                       }`}>
                          {step.title}
                       </p>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Pane */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Fabric */}
            {currentStep.id === 'fabric' && (
              <div className="space-y-8 animate-fade-in">
                <div className="mb-6">
                    <h2 className="font-serif text-3xl font-light mb-2">Select Your Material</h2>
                    <p className="text-warm-gray">Choose from our house library or provide your own fabric.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setFabricSource('website')}
                        className={`p-6 border-2 rounded-sm text-left transition-all ${
                            fabricSource === 'website' ? 'border-gold bg-gold/5 shadow-lg' : 'border-border bg-white hover:border-gold/30'
                        }`}
                    >
                        <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                            <Package size={20} className="text-gold" />
                        </div>
                        <h4 className="font-bold text-dark mb-1">House Collection</h4>
                        <p className="text-xs text-warm-gray leading-relaxed">Select from our range of high-quality silks, linens, and cottons.</p>
                    </button>

                    <button 
                        onClick={() => setFabricSource('customer')}
                        className={`p-6 border-2 rounded-sm text-left transition-all ${
                            fabricSource === 'customer' ? 'border-gold bg-gold/5 shadow-lg' : 'border-border bg-white hover:border-gold/30'
                        }`}
                    >
                        <div className="w-10 h-10 bg-dark/10 rounded-full flex items-center justify-center mb-4">
                            <Scissors size={20} className="text-dark" />
                        </div>
                        <h4 className="font-bold text-dark mb-1">I'll Provide Fabric</h4>
                        <p className="text-xs text-warm-gray leading-relaxed">Book a session and bring your own fabric to our studio.</p>
                    </button>
                </div>

                {fabricSource === 'website' && (
                    <div className="animate-fade-in grid grid-cols-2 gap-4">
                        {fabrics.map((f: any) => (
                            <div 
                                key={f.id}
                                onClick={() => setSelectedFabricId(f.id)}
                                className={`group cursor-pointer bg-white border rounded-sm overflow-hidden transition-all ${
                                    selectedFabricId === f.id ? 'border-gold ring-1 ring-gold shadow-md' : 'border-border hover:border-gold/50'
                                }`}
                            >
                                <div className="h-32 bg-surface relative">
                                    {f.image_url ? (
                                        <img src={f.image_url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-warm-gray">Texture</div>
                                    )}
                                    {selectedFabricId === f.id && <div className="absolute top-2 right-2 bg-gold text-dark p-1 rounded-full"><Check size={12} strokeWidth={4} /></div>}
                                </div>
                                <div className="p-3">
                                    <p className="text-xs font-bold text-dark truncate">{f.name}</p>
                                    <p className="text-[10px] text-warm-gray uppercase tracking-tighter">{f.type}</p>
                                    <p className="text-[10px] font-black text-gold mt-1">₹{f.price_per_meter}/m</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-2">Primary Color / Color Code</label>
                    <input 
                        type="text" 
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        placeholder="e.g. Royal Navy, Pearl White"
                        className="w-full bg-white border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                </div>
              </div>
            )}

            {/* Step 2: Customizations */}
            {currentStep.id === 'custom' && (
              <div className="space-y-10 animate-fade-in">
                <div className="mb-6">
                    <h2 className="font-serif text-3xl font-light mb-2">Refine Your Style</h2>
                    <p className="text-warm-gray">Choose the details that define your garment's silhouette.</p>
                </div>

                {Object.entries(relevantCustomizations).map(([type, options]: [string, any]) => (
                    <div key={type} className="border-b border-border pb-8">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-warm-gray block mb-4">{type}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {options.map((opt: any) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedCustomizations(prev => ({...prev, [type]: opt.option_name}))}
                                    className={`px-4 py-3 border-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                                        selectedCustomizations[type] === opt.option_name
                                        ? 'border-gold bg-gold/5 text-dark'
                                        : 'border-border bg-white text-warm-gray hover:border-gold/30 hover:text-dark'
                                    }`}
                                >
                                    {opt.option_name}
                                    {opt.extra_price > 0 && <span className="block text-[8px] text-gold mt-1">+₹{opt.extra_price}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-2">Reference Inspiration</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageUploader 
                            currentUrl={designImages[0]}
                            onUploaded={(url) => setDesignImages(prev => [url, ...prev.slice(1)])}
                            label="Upload Sketch/Referene 1"
                        />
                        <ImageUploader 
                            currentUrl={designImages[1]}
                            onUploaded={(url) => setDesignImages(prev => [prev[0], url, ...prev.slice(2)])}
                            label="Upload Sketch/Reference 2"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-2">Additional Instructions</label>
                    <textarea 
                        value={customizationNotes}
                        onChange={e => setCustomizationNotes(e.target.value)}
                        placeholder="Detail any special requests here..."
                        rows={3}
                        className="w-full bg-white border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none"
                    />
                </div>
              </div>
            )}

            {/* Step 3: Measurements */}
            {currentStep.id === 'measure' && (
              <div className="space-y-8 animate-fade-in">
                <div className="mb-6">
                    <h2 className="font-serif text-3xl font-light mb-2">Precise Fit</h2>
                    <p className="text-warm-gray">Choose how you'd like to provide your measurements.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => setMeasurementMethod('manual')}
                        className={`p-6 border-2 rounded-sm text-left transition-all ${
                            measurementMethod === 'manual' ? 'border-gold bg-gold/5 shadow-lg' : 'border-border bg-white hover:border-gold/30'
                        }`}
                    >
                        <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                            <Ruler size={20} className="text-gold" />
                        </div>
                        <h4 className="font-bold text-dark mb-1">Self Measure</h4>
                        <p className="text-xs text-warm-gray leading-relaxed">Enter your measurements manually using a tape.</p>
                    </button>

                    <button 
                        onClick={() => setMeasurementMethod('shop')}
                        className={`p-6 border-2 rounded-sm text-left transition-all ${
                            measurementMethod === 'shop' ? 'border-gold bg-gold/5 shadow-lg' : 'border-border bg-white hover:border-gold/30'
                        }`}
                    >
                        <div className="w-10 h-10 bg-dark/10 rounded-full flex items-center justify-center mb-4">
                            <MapPin size={20} className="text-dark" />
                        </div>
                        <h4 className="font-bold text-dark mb-1">Visit Shop</h4>
                        <p className="text-xs text-warm-gray leading-relaxed">Get professionally measured by our master tailors.</p>
                    </button>

                    <button 
                        onClick={() => setMeasurementMethod('video')}
                        className={`p-6 border-2 rounded-sm text-left transition-all ${
                            measurementMethod === 'video' ? 'border-gold bg-gold/5 shadow-lg' : 'border-border bg-white hover:border-gold/30'
                        }`}
                    >
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Video size={20} className="text-blue-500" />
                        </div>
                        <h4 className="font-bold text-dark mb-1">Video Guide</h4>
                        <p className="text-xs text-warm-gray leading-relaxed">Learn how to measure yourself with our video tutorial.</p>
                    </button>
                </div>

                {measurementMethod === 'manual' && (
                    <div className="animate-fade-in space-y-6 mt-8 p-6 bg-white border border-border rounded-sm">
                        <div className="flex items-center justify-between mb-2">
                             <h4 className="font-serif text-xl font-light">Enter Your Measurements</h4>
                             <div className="bg-gold/10 px-3 py-1.5 rounded-sm flex items-center gap-2">
                                <Info size={14} className="text-gold" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Inches (IN)</span>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {['Neck', 'Chest', 'Waist', 'Sleeve Length', 'Shoulder Width', 'Total Length', 'Wrist', 'Hips'].map(field => (
                                <div key={field}>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-2">{field}</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={measurements[field] || ''}
                                            onChange={e => setMeasurements(prev => ({...prev, [field]: e.target.value}))}
                                            placeholder="00.0"
                                            className="w-full bg-surface border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-warm-gray opacity-40">IN</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {measurementMethod === 'shop' && (
                    <div className="animate-fade-in mt-8 p-8 bg-dark text-white rounded-sm text-center border-t-4 border-gold shadow-xl">
                        <MapPin size={40} className="text-gold mx-auto mb-4" />
                        <h4 className="font-serif text-2xl font-light mb-2">Book an Appointment</h4>
                        <p className="text-sm text-white/70 max-w-md mx-auto mb-6">
                            Visit our boutique to get professionally measured by our master tailors. We'll assist you with the perfect fit and styling details.
                        </p>
                        <div className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-sm">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold text-left">Boutique Address:</p>
                            <p className="text-sm mt-1">123 Mastercraft Avenue, Fashion District<br/>Call: +91 98765 43210</p>
                        </div>
                    </div>
                )}

                {measurementMethod === 'video' && (
                     <div className="animate-fade-in mt-8 p-6 bg-white border border-border rounded-sm">
                        <h4 className="font-serif text-xl font-light mb-4">How to Measure Yourself</h4>
                        <div className="w-full aspect-video bg-dark/5 rounded-sm relative overflow-hidden group flex items-center justify-center border border-border">
                            {/* Video Placeholder */}
                            <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1200" alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 bg-dark/30 group-hover:bg-dark/20 transition-colors" />
                            <button className="relative z-10 w-16 h-16 bg-gold text-white rounded-full flex items-center justify-center pl-1 shadow-2xl transform group-hover:scale-110 transition-transform">
                                <Video size={24} className="fill-white" />
                            </button>
                        </div>
                        <p className="text-sm text-warm-gray mt-4 text-center">Watch our 2-minute comprehensive guide on measuring yourself accurately at home.</p>
                     </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep.id === 'review' && (
              <div className="space-y-8 animate-fade-in">
                <div className="mb-6">
                    <h2 className="font-serif text-3xl font-light mb-2">Review & Confirm</h2>
                    <p className="text-warm-gray">Verify your masterpiece before we begin the craft.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="card p-6 border-gold/20 bg-gold/[0.02]">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">Design Selection</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-gold/10 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Master Garment</span>
                                <span className="text-xs font-bold">{garment.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-gold/10 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Fabric Source</span>
                                <span className="text-xs font-bold capitalize">{fabricSource} Collection</span>
                            </div>
                            {selectedFabric && (
                                <div className="flex justify-between border-b border-gold/10 pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Chosen Material</span>
                                    <span className="text-xs font-bold">{selectedFabric.name}</span>
                                </div>
                            )}
                             <div className="flex justify-between border-b border-gold/10 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">Primary Color</span>
                                <span className="text-xs font-bold">{color || 'By Choice'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-warm-gray mb-4">Final Pricing</h4>
                         <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-border/40 pb-2">
                                <span className="opacity-60">Base Stitching</span>
                                <span>₹{garment.base_price}</span>
                            </div>
                            {selectedFabric && (
                                <div className="flex justify-between border-b border-border/40 pb-2 text-gold">
                                    <span className="opacity-60 text-warm-gray">Fabric (Estimate 2.5m)</span>
                                    <span>+₹{selectedFabric.price_per_meter * 2.5}</span>
                                </div>
                            )}
                            {Object.entries(selectedCustomizations).map(([type, optName]) => {
                                const opt = customizations.find(c => c.option_name === optName && c.customization_type === type);
                                if (!opt || opt.extra_price === 0) return null;
                                return (
                                    <div key={type} className="flex justify-between border-b border-border/40 pb-2 text-gold">
                                        <span className="opacity-60 text-warm-gray">{optName} ({type})</span>
                                        <span>+₹{opt.extra_price}</span>
                                    </div>
                                );
                            })}
                            <div className="flex justify-between pt-4">
                                <span className="font-serif text-lg">Order Total</span>
                                <span className="font-black text-2xl text-gold">₹{estimatedTotal}</span>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="pt-6">
                     <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-2">Preferred Delivery Date</label>
                     <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]} // Min 1 week
                        className="w-full bg-white border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border">
                {currentStepIdx > 0 && (
                    <button 
                        onClick={prevStep}
                        className="px-8 py-3 border border-dark rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-dark hover:text-white transition-all flex items-center gap-2"
                    >
                        <ChevronLeft size={14} /> Back
                    </button>
                )}
                
                {currentStepIdx < STEPS.length - 1 ? (
                    <button 
                        onClick={nextStep}
                        className="flex-1 btn-primary py-3 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        Save & Continue <ChevronRight size={14} />
                    </button>
                ) : (
                    <button 
                        onClick={() => createOrder.mutate()}
                        disabled={createOrder.isPending || !user}
                        className="flex-1 btn-primary py-4 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {createOrder.isPending ? 'Processing Artisan Request...' : 'Confirm Mastery Order'}
                    </button>
                )}
            </div>

          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
             <div className="sticky top-40 space-y-6">
                <div className="bg-dark text-white p-6 rounded-sm shadow-2xl">
                    <div className="w-full h-40 bg-white/5 rounded-sm overflow-hidden mb-6 flex items-center justify-center border border-white/10">
                        {garment.image_url ? (
                            <img src={garment.image_url} alt={garment.name} className="w-full h-full object-cover" />
                        ) : (
                            <Scissors size={32} className="text-gold opacity-40" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gold">{garment.category}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-light mb-4">{garment.name}</h3>
                    
                    <div className="border-t border-white/10 pt-4 space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-warm-gray">
                            <span>Base Price</span>
                            <span className="text-white">₹{garment.base_price}</span>
                        </div>
                        {selectedFabric && (
                             <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gold italic">
                                <span>Fabric Added</span>
                                <span>+₹{Math.round(selectedFabric.price_per_meter * 2.5)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-4 text-xl font-serif text-gold">
                            <span>Total</span>
                            <span className="font-bold">₹{estimatedTotal}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-border p-6 rounded-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-dark mb-4">Selection Path</h4>
                    <div className="space-y-3">
                        {Object.entries(selectedCustomizations).length > 0 ? (
                            Object.entries(selectedCustomizations).map(([type, val]) => (
                                <div key={type} className="flex gap-2">
                                     <div className="p-1 bg-surface rounded-full self-start mt-1">
                                        <Check size={8} className="text-gold" strokeWidth={5} />
                                     </div>
                                     <span className="text-[10px] font-bold uppercase tracking-tighter text-warm-gray">
                                        <span className="text-dark opacity-100">{type}</span>: {val}
                                     </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-warm-gray italic">No customizations selected yet.</p>
                        )}
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </>
  );
}
