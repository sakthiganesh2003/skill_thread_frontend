'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { measurementsAPI, customersAPI } from '@/lib/api';
import { 
  ChevronLeft, 
  Save, 
  Ruler, 
  Info,
  Loader2,
  CheckCircle2,
  Smartphone, 
  Eye, 
  History,
  Shirt as ShirtIcon,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';

const measurementFields = [
  // Shirt Fields
  { key: 'chest', label: 'Chest', unit: 'in', type: 'shirt' },
  { key: 'waist', label: 'Waist (Natural)', unit: 'in', type: 'shirt' },
  { key: 'shoulder', label: 'Shoulder', unit: 'in', type: 'shirt' },
  { key: 'neck', label: 'Neck', unit: 'in', type: 'shirt' },
  { key: 'sleeve_length', label: 'Sleeve Length', unit: 'in', type: 'shirt' },
  { key: 'shirt_length', label: 'Shirt Length', unit: 'in', type: 'shirt' },
  
  // Pant Fields
  { key: 'pant_waist', label: 'Trouser Waist', unit: 'in', type: 'pants' },
  { key: 'hip', label: 'Hip', unit: 'in', type: 'pants' },
  { key: 'inseam', label: 'Inseam', unit: 'in', type: 'pants' },
  { key: 'pant_length', label: 'Pant Length', unit: 'in', type: 'pants' },
  
  // General Fields
  { key: 'height', label: 'Total Height', unit: 'in/cm', type: 'general' },
];

export default function CustomerMeasurementsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [customer, setCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'shirt' | 'pants'>('all');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [{ data: mData }, { data: cData }] = await Promise.all([
        measurementsAPI.getUser(id as string),
        customersAPI.get(id as string)
      ]);
      setFormData(mData || {});
      setCustomer(cData);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await measurementsAPI.saveUser(id as string, formData);
      toast.success('Measurements updated successfully');
    } catch (error) {
      toast.error('Failed to save measurements');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-gold" size={40} />
        <p className="text-warm-gray font-serif italic text-lg animate-pulse">Gathering dimensions...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-black/5 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors border border-black/5"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-dark">
              {customer?.name || 'Loading...'}&apos;s Dimensions
            </h1>
            <p className="text-warm-gray text-sm mt-1 uppercase tracking-widest font-bold">Client Record Matrix</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-3 bg-dark text-white px-8 py-3.5 rounded-sm font-bold shadow-xl shadow-dark/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="text-gold" />}
          {saving ? 'Updating Matrix...' : 'Commit Changes'}
        </button>
      </div>

      {/* Garment Selector Tabs */}
      <div className="flex gap-4 p-1 bg-black/5 rounded-sm w-fit">
        {[
          { id: 'all', label: 'Unified Matrix', icon: Ruler },
          { id: 'shirt', label: 'Upper (Shirts)', icon: ShirtIcon },
          { id: 'pants', label: 'Lower (Pants)', icon: ShoppingBag }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${
              activeTab === tab.id 
              ? 'bg-dark text-white shadow-lg' 
              : 'text-warm-gray hover:text-dark'
            }`}
          >
            <tab.icon size={14} className={activeTab === tab.id ? 'text-gold' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-white p-8 border border-black/5 shadow-sm">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {measurementFields
            .filter(f => activeTab === 'all' || f.type === activeTab || f.type === 'general')
            .map((field) => (
              <div key={field.key} className="relative group">
                <label className="text-[10px] uppercase font-bold text-warm-gray tracking-widest absolute -top-2.5 left-3 bg-white px-1 z-10 transition-colors group-hover:text-gold">
                  {field.label} ({field.unit})
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-black/10 text-dark font-serif text-lg focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all text-center"
                    placeholder="--"
                  />
                  {formData[field.key] && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle2 size={14} className="text-green-500 opacity-60" />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Global Notes */}
        <div className="md:col-span-2 space-y-4 pt-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-full text-gold">
                 <Info size={18} />
              </div>
              <h3 className="text-lg font-serif font-bold">Special Considerations</h3>
           </div>
           <textarea 
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Record any specific anomalies, posture notes, or persistent fit preferences here..."
              rows={5}
              className="w-full p-6 bg-white border border-black/10 text-dark font-serif text-lg focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all resize-none italic"
           />
        </div>

        {/* Status Indicators */}
        <div className="md:col-span-2 flex flex-wrap gap-4 pt-8 border-t border-black/5">
           <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-warm-gray">
              <CheckCircle2 size={12} className="text-green-500" />
              Auto-saved to Cloud
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-warm-gray">
              <Eye size={12} className="text-gold" />
              Visible to assigned Tailors
           </div>
           {formData.updated_at && (
             <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-warm-gray">
               <History size={12} />
               Last sync: {new Date(formData.updated_at).toLocaleString()}
             </div>
           )}
        </div>
      </form>
    </div>
  );
}
