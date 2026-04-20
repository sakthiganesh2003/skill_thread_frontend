'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { garmentsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import ImageUploader from '@/components/ui/ImageUploader';
import DeleteConfirm from '@/components/ui/DeleteConfirm';

const EMPTY_FORM = {
  name: '',
  category: '',
  description: '',
  base_price: 0,
  image_url: '',
  fabric_options: '',
  customization_options: '',
  is_active: true,
};

export default function AdminGarmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: garments = [], isLoading } = useQuery({
    queryKey: ['admin-garments'],
    queryFn: async () => {
      const { data } = await garmentsAPI.listAll();
      return data.filter((g: any) => g.name);
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => garmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-garments'] });
      setForm({ ...EMPTY_FORM });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => garmentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-garments'] });
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => garmentsAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-garments'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, base_price: Number(form.base_price) };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (garment: any) => {
    setEditingId(garment.id);
    setForm({
      name: garment.name || '',
      category: garment.category || '',
      description: garment.description || '',
      base_price: garment.base_price || 0,
      image_url: garment.image_url || '',
      fabric_options: garment.fabric_options || '',
      customization_options: garment.customization_options || '',
      is_active: garment.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const filtered = garments.filter((g: any) =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-8">
      <div className="mb-4">
        <p className="text-warm-gray text-sm">Create and organize your master garment collection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="bg-white border border-border shadow-md rounded-sm p-6 self-start">
          <h2 className="text-xl font-serif font-light mb-6">
            {editingId ? 'Edit Master Design' : 'Add New Master'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUploader
              currentUrl={form.image_url}
              onUploaded={(url) => setForm({ ...form, image_url: url })}
              label="Garment Studio Image"
            />

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Garment Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                required
                placeholder="e.g. Imperial Sherwani"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Category</label>
                    <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full border border-border rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                    >
                        <option value="">Select...</option>
                        <option value="formal">Formal</option>
                        <option value="traditional">Traditional</option>
                        <option value="casual">Casual</option>
                        <option value="blouse">Blouse</option>
                    </select>
                </div>
                <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Stitching (₹) *</label>
                     <input
                        type="text"
                        inputMode="decimal"
                        value={form.base_price}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                setForm({ ...form, base_price: val as any });
                            }
                        }}
                        className="w-full border border-border rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                        required
                    />
                </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Design philosophy..."
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none bg-surface/30"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary flex-1 disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
              >
                {editingId
                  ? updateMutation.isPending ? 'Saving...' : 'Update Record'
                  : createMutation.isPending ? 'Creating...' : 'Register Garment'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary text-xs uppercase font-bold tracking-widest">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Garments List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, category or price..."
              className="w-full border border-border rounded-sm px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white shadow-sm transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray opacity-40">
                🔍
            </div>
          </div>

          <div className="flex items-center justify-between">
             <p className="text-[10px] text-warm-gray font-black uppercase tracking-[0.2em]">{filtered.length} master designs active</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-border/20 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white p-20 text-center border border-dashed border-border rounded-sm">
              <p className="text-warm-gray italic">No results found for "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((g: any) => (
                <div
                  key={g.id}
                  className={`group bg-white border border-border p-4 flex items-center gap-6 rounded-sm hover:border-gold/50 hover:shadow-xl transition-all duration-300 ${!g.is_active ? 'opacity-50' : ''}`}
                >
                  <div className="w-16 h-16 flex-shrink-0 bg-surface rounded-sm overflow-hidden border border-border group-hover:scale-105 transition-transform">
                    {g.image_url ? (
                      <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-warm-gray uppercase">No Img</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-serif text-lg font-semibold truncate group-hover:text-gold transition-colors">{g.name}</h4>
                      {g.category && (
                        <span className="text-[8px] px-2 py-0.5 bg-dark text-white rounded-full uppercase font-black tracking-widest">
                          {g.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-warm-gray truncate opacity-80">{g.description || 'No description provided.'}</p>
                    <p className="text-sm font-black text-gold mt-1">₹{g.base_price}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(g)}
                      className="p-2 hover:bg-gold/10 rounded-sm text-gold transition-colors"
                      title="Edit Record"
                    >
                      ✏️
                    </button>
                    <DeleteConfirm
                      onConfirm={() => deleteMutation.mutate(g.id)}
                      itemName={g.name}
                      isLoading={deleteMutation.isPending && deleteMutation.variables === g.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
