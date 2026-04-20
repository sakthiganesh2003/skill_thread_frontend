'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customizationsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import DeleteConfirm from '@/components/ui/DeleteConfirm';

export default function AdminCustomizationsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    garment_type: '',
    customization_type: '',
    option_name: '',
    extra_price: 0,
    is_active: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: options = [], isLoading } = useQuery({
    queryKey: ['customizations'],
    queryFn: async () => {
      const { data } = await customizationsAPI.list();
      return data.filter((o: any) => o.option_name);
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => customizationsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizations'] });
      setForm({ garment_type: '', customization_type: '', option_name: '', extra_price: 0, is_active: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customizationsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizations'] });
      setEditingId(null);
      setForm({ garment_type: '', customization_type: '', option_name: '', extra_price: 0, is_active: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customizationsAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customizations'] }),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      extra_price: Number(form.extra_price),
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const startEdit = (option: any) => {
    setEditingId(option.id);
    setForm({
      garment_type: option.garment_type || '',
      customization_type: option.customization_type || '',
      option_name: option.option_name || '',
      extra_price: option.extra_price || 0,
      is_active: option.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ garment_type: '', customization_type: '', option_name: '', extra_price: 0, is_active: true });
  };

  const filteredOptions = useMemo(() => {
    return options
      .filter((o: any) => 
        o.option_name?.toLowerCase().includes(search.toLowerCase()) || 
        o.garment_type?.toLowerCase().includes(search.toLowerCase()) ||
        o.customization_type?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a: any, b: any) => {
        if (a.garment_type === b.garment_type) {
          return (a.customization_type || '').localeCompare(b.customization_type || '');
        }
        return (a.garment_type || '').localeCompare(b.garment_type || '');
      });
  }, [options, search]);

  return (
    <div className="w-full space-y-8">
      <div className="mb-4">
        <p className="text-warm-gray text-sm italic opacity-80">Define specific tailoring options and their respective surcharges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="bg-white border border-border shadow-md rounded-sm p-6 self-start">
          <h2 className="text-xl font-serif font-light mb-6">
            {editingId ? 'Modify Option' : 'Register Customization'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Master Garment *</label>
              <input
                value={form.garment_type}
                onChange={(e) => setForm({ ...form, garment_type: e.target.value })}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                required
                placeholder="e.g. Kurta"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Category Type *</label>
              <input
                value={form.customization_type}
                onChange={(e) => setForm({ ...form, customization_type: e.target.value })}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                required
                placeholder="e.g. Collar Style"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Option Display Name *</label>
              <input
                value={form.option_name}
                onChange={(e) => setForm({ ...form, option_name: e.target.value })}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                required
                placeholder="e.g. Mandatory Mandarin"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-warm-gray block mb-1">Surcharge (₹) *</label>
              <input
                type="number"
                value={form.extra_price}
                onChange={(e) => setForm({ ...form, extra_price: Number(e.target.value) })}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-surface/30"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary flex-1 disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
              >
                {editingId ? 'Commit Update' : 'Forge Option'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary text-xs uppercase font-bold tracking-widest">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Options List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search specifications..."
              className="w-full border border-border rounded-sm px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white shadow-sm"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</div>
          </div>

          <div className="flex items-center justify-between">
              <p className="text-[10px] text-warm-gray font-black uppercase tracking-[0.2em]">{filteredOptions.length} customization rules active</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-border/20 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="bg-white p-20 text-center border border-dashed border-border rounded-sm">
                <p className="text-warm-gray italic">No options found matching "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredOptions.map((option: any) => (
                <div key={option.id} className="group bg-white border border-border p-4 flex items-center justify-between rounded-sm hover:border-gold/50 transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-dark rounded-sm flex items-center justify-center text-gold font-bold">
                        {option.garment_type?.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-serif text-lg font-semibold truncate group-hover:text-gold transition-colors">{option.option_name}</h4>
                            {!option.is_active && <span className="text-[8px] text-red-500 font-black uppercase tracking-widest border border-red-100 px-1 bg-red-50">Inactive</span>}
                        </div>
                        <div className="flex gap-4 mt-0.5">
                            <p className="text-xs text-warm-gray uppercase font-bold tracking-tighter opacity-60">{option.garment_type} • <span className="text-dark opacity-100">{option.customization_type}</span></p>
                            <p className="text-xs text-gold uppercase font-bold tracking-tighter self-end">+₹{option.extra_price}</p>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                        onClick={() => startEdit(option)}
                        className="p-2 hover:bg-gold/10 rounded-sm text-gold transition-colors"
                    >
                        ✏️
                    </button>
                    <DeleteConfirm
                      onConfirm={() => deleteMutation.mutate(option.id)}
                      itemName={option.option_name}
                      isLoading={deleteMutation.isPending && deleteMutation.variables === option.id}
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
