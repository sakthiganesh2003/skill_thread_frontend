'use client';

import { useState, useEffect } from 'react';
import { tailorsAPI } from '@/lib/api';
import { 
  Plus, 
  Search, 
  UserCheck, 
  Mail, 
  Phone, 
  Star, 
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Loader2,
  Scissors
} from 'lucide-react';
import { toast } from 'sonner';

interface Tailor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  experience_years: number;
  bio: string;
  rating: number;
  total_orders: number;
  active_orders: number;
  max_capacity: number;
  is_active: boolean;
}

export default function AdminTailorsPage() {
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTailor, setEditingTailor] = useState<Tailor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specializations: '',
    max_capacity: 5,
    experience_years: 0,
    bio: ''
  });

  useEffect(() => {
    fetchTailors();
  }, []);

  const fetchTailors = async () => {
    try {
      const { data } = await tailorsAPI.list();
      setTailors(data);
    } catch (error) {
      toast.error('Failed to load tailors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s)
      };

      if (editingTailor) {
        await tailorsAPI.update(editingTailor.id, payload);
        toast.success('Tailor updated successfully');
      } else {
        await tailorsAPI.create(payload);
        toast.success('Tailor added successfully');
      }
      setIsModalOpen(false);
      fetchTailors();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save tailor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this tailor?')) return;
    try {
      await tailorsAPI.remove(id);
      toast.success('Tailor deactivated');
      fetchTailors();
    } catch (error) {
      toast.error('Failed to deactivate tailor');
    }
  };

  const openEditModal = (tailor: Tailor) => {
    setEditingTailor(tailor);
    setFormData({
      name: tailor.name,
      email: tailor.email,
      phone: tailor.phone,
      password: '', // Don't show password
      specializations: tailor.specializations.join(', '),
      max_capacity: tailor.max_capacity,
      experience_years: tailor.experience_years || 0,
      bio: tailor.bio || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTailor(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      specializations: '',
      max_capacity: 5,
      experience_years: 0,
      bio: ''
    });
  };

  const filteredTailors = tailors.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-dark">Tailors Management</h1>
          <p className="text-warm-gray mt-1">Manage your professional tailoring staff and workload.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-sm font-bold hover:bg-gold/90 transition-all shadow-lg shadow-gold/10"
        >
          <Plus size={20} />
          Add New Tailor
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray" size={20} />
          <input 
            type="text"
            placeholder="Search tailors by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
          />
        </div>
        <div className="bg-white p-4 border border-black/5 rounded-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-warm-gray uppercase font-bold tracking-wider">Total Tailors</p>
            <p className="text-xl font-bold text-dark">{tailors.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 border border-black/5 rounded-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
            <Scissors size={24} />
          </div>
          <div>
            <p className="text-xs text-warm-gray uppercase font-bold tracking-wider">Active Orders</p>
            <p className="text-xl font-bold text-dark">
              {tailors.reduce((acc, t) => acc + (t.active_orders || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tailors Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-gold" size={40} />
          <p className="text-warm-gray font-medium">Fetching our master tailors...</p>
        </div>
      ) : filteredTailors.length === 0 ? (
        <div className="bg-white border border-dashed border-warm-gray/30 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-warm-gray/10 rounded-full flex items-center justify-center mx-auto mb-4 text-warm-gray">
            <UserCheck size={32} />
          </div>
          <h3 className="text-lg font-bold text-dark">No tailors found</h3>
          <p className="text-warm-gray">Try adjusting your search or add a new tailor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTailors.map((tailor) => (
            <div key={tailor.id} className={`bg-white border ${tailor.is_active ? 'border-black/5' : 'border-red-100 opacity-75'} rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300 group`}>
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-dark text-gold rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    {tailor.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1 bg-gold/10 text-gold px-2 py-1 rounded text-sm font-bold">
                    <Star size={14} fill="currentColor" />
                    {tailor.rating?.toFixed(1) || '0.0'}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-dark group-hover:text-gold transition-colors truncate">
                    {tailor.name}
                    {!tailor.is_active && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">Inactive</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                    <Mail size={14} />
                    <span className="truncate">{tailor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                    <Phone size={14} />
                    <span>{tailor.phone || 'No phone'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.isArray(tailor.specializations) && tailor.specializations.length > 0 ? (
                    tailor.specializations.map((spec, i) => (
                      <span key={i} className="text-[10px] uppercase font-bold tracking-wider bg-dark/5 text-dark px-2 py-1 rounded">
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-warm-gray italic">No specializations set</span>
                  )}
                </div>

                <div className="pt-4 border-t border-black/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-warm-gray tracking-tighter">Workload</p>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              (tailor.active_orders / tailor.max_capacity) > 0.8 ? 'bg-red-500' : 'bg-gold'
                            }`}
                            style={{ width: `${Math.min((tailor.active_orders / tailor.max_capacity) * 100, 100)}%` }}
                          />
                       </div>
                       <span className="text-xs font-bold text-dark">{tailor.active_orders}/{tailor.max_capacity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-warm-gray tracking-tighter">Total Completed</p>
                    <p className="text-sm font-bold text-dark mt-1">{tailor.total_orders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/5 px-6 py-3 flex items-center justify-between border-t border-black/5">
                <button 
                  onClick={() => openEditModal(tailor)}
                  className="flex items-center gap-2 text-xs font-bold text-warm-gray hover:text-dark transition-colors"
                >
                  <Edit2 size={14} />
                  Edit Profile
                </button>
                {tailor.is_active && (
                  <button 
                    onClick={() => handleDelete(tailor.id)}
                    className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-dark text-white">
              <h3 className="text-xl font-serif font-bold">
                {editingTailor ? 'Edit Tailor Profile' : 'Add New Tailor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Master John Doe"
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Email Address</label>
                  <input 
                    required
                    type="email"
                    disabled={!!editingTailor}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="tailor@silkthread.com"
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Phone Number</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                {!editingTailor && (
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Initial Password</label>
                    <input 
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                )}

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Specializations (comma separated)</label>
                  <input 
                    type="text"
                    value={formData.specializations}
                    onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                    placeholder="Suits, Bridal, Alterations"
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Max Capacity (Orders)</label>
                  <input 
                    type="number"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({...formData, max_capacity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Experience (Years)</label>
                  <input 
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Artisan Bio / Notes</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Brief description of the tailor's background and style..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 font-bold border border-black/5 hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 font-bold bg-gold text-dark hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  {editingTailor ? 'Update Tailor' : 'Create Tailor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
