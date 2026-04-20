'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fabricsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import ImageUploader from '@/components/ui/ImageUploader';
import DeleteConfirm from '@/components/ui/DeleteConfirm';

export default function AdminFabricsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    type: '',
    image_url: '',
    price_per_meter: 0,
    stock_quantity: 0,
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: fabrics = [], isLoading } = useQuery({
    queryKey: ['fabrics'],
    queryFn: async () => {
      const { data } = await fabricsAPI.list();
      return data.filter((f: any) => f.name);
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fabricsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      setForm({ name: '', type: '', image_url: '', price_per_meter: 0, stock_quantity: 0, is_active: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => fabricsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      setEditingId(null);
      setForm({ name: '', type: '', image_url: '', price_per_meter: 0, stock_quantity: 0, is_active: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fabricsAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fabrics'] }),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      price_per_meter: Number(form.price_per_meter),
      stock_quantity: Number(form.stock_quantity),
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const startEdit = (fabric: any) => {
    setEditingId(fabric.id);
    setForm({
      name: fabric.name || '',
      type: fabric.type || '',
      image_url: fabric.image_url || '',
      price_per_meter: fabric.price_per_meter || 0,
      stock_quantity: fabric.stock_quantity || 0,
      is_active: fabric.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', type: '', image_url: '', price_per_meter: 0, stock_quantity: 0, is_active: true });
  };

  const filteredFabrics = useMemo(() => {
    return fabrics
      .filter((f: any) => 
        f.name?.toLowerCase().includes(search.toLowerCase()) || 
        f.type?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
  }, [fabrics, search]);

  return (
    <div className="w-full space-y-8">
      <div className="mb-4">
        <p className="text-warm-gray text-sm">Curate your textile library and set base material costs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="bg-white border border-border shadow-md rounded-sm p-6 self-start">
          <h2 className="text-xl font-serif font-light mb-6">
            {editingId ? 'Edit Fabric Style' : 'Import New Fabric'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUploader
              currentUrl={form.image_url}
              onUploaded={(url) => setForm({ ...form, image_url: url })}
              label="Fabric Texture Preview"
            />

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Fabric Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                required
                placeholder="e.g. Mulberry Silk"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Material Type</label>
              <input
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                placeholder="e.g. 100% Cotton"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Price (₹/m) *</label>
                     <input
                        type="text"
                        inputMode="decimal"
                        value={form.price_per_meter}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                setForm({ ...form, price_per_meter: val as any });
                            }
                        }}
                        className="w-full border border-border rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                        required
                    />
                </div>
                <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">In Stock (m)</label>
                     <input
                        type="number"
                        value={form.stock_quantity}
                        onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                        className="w-full border border-border rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary flex-1 disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
              >
                {editingId ? 'Update Ledger' : 'Register Entry'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary text-xs uppercase font-bold tracking-widest">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Fabrics List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library..."
              className="w-full border border-border rounded-sm px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white shadow-sm"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</div>
          </div>

          <div className="flex items-center justify-between">
              <p className="text-[10px] text-warm-gray font-black uppercase tracking-[0.2em]">{filteredFabrics.length} materials in archive</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : filteredFabrics.length === 0 ? (
            <div className="bg-white p-20 text-center border border-dashed border-border rounded-sm">
                <p className="text-warm-gray italic">No fabrics found matching "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredFabrics.map((fabric: any) => (
                <div key={fabric.id} className="group bg-white border border-border p-4 flex items-center justify-between rounded-sm hover:border-gold/50 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-surface rounded-sm overflow-hidden flex-shrink-0 border border-border">
                        {fabric.image_url ? (
                            <img src={fabric.image_url} alt={fabric.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-tighter text-warm-gray">Texture</div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-serif text-lg font-semibold truncate group-hover:text-gold transition-colors">{fabric.name}</h4>
                            {!fabric.is_active && <span className="text-[8px] text-red-500 font-black uppercase tracking-widest border border-red-100 px-1 bg-red-50">Inactive</span>}
                        </div>
                        <div className="flex gap-4 mt-0.5">
                            <p className="text-xs text-warm-gray uppercase font-bold tracking-tighter opacity-60">Price: <span className="text-dark">₹{fabric.price_per_meter}/m</span></p>
                            <p className="text-xs text-warm-gray uppercase font-bold tracking-tighter opacity-60">Stock: <span className="text-dark">{fabric.stock_quantity}m</span></p>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                        onClick={() => startEdit(fabric)}
                        className="p-2 hover:bg-gold/10 rounded-sm text-gold transition-colors"
                    >
                        ✏️
                    </button>
                    <DeleteConfirm
                      onConfirm={() => deleteMutation.mutate(fabric.id)}
                      itemName={fabric.name}
                      isLoading={deleteMutation.isPending && deleteMutation.variables === fabric.id}
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
