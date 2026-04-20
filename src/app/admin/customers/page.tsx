'use client';

import { useState, useEffect } from 'react';
import { customersAPI } from '@/lib/api';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Loader2,
  Ruler,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  has_measurements: boolean;
  created_at: string;
  is_active: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await customersAPI.list();
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customersAPI.create(formData);
        toast.success('Customer added successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this customer?')) return;
    try {
      await customersAPI.remove(id);
      toast.success('Customer deactivated');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to deactivate customer');
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      password: ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      password: ''
    });
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-dark">Customer Directory</h1>
          <p className="text-warm-gray mt-1">Manage your customer client base and their measurements.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-sm font-bold hover:bg-gold/90 transition-all shadow-lg shadow-gold/10"
        >
          <Plus size={20} />
          Add New Customer
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray" size={20} />
          <input 
            type="text"
            placeholder="Search customers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
          />
        </div>
        <div className="bg-white p-4 border border-black/5 rounded-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-warm-gray uppercase font-bold tracking-wider">Total Clients</p>
            <p className="text-xl font-bold text-dark">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white border border-black/5 rounded-sm overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-gold" size={40} />
            <p className="text-warm-gray font-medium">Loading customer database...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-warm-gray italic">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark text-white text-[10px] uppercase font-bold tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Measurements</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark text-gold rounded-full flex items-center justify-center font-bold">
                          {(customer.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-dark">{customer.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-warm-gray">
                            <Calendar size={10} />
                            Joined {new Date(customer.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-dark">{customer.email}</p>
                      <p className="text-xs text-warm-gray">{customer.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {customer.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.has_measurements ? (
                        <Link 
                          href={`/admin/customers/${customer.id}/measurements`}
                          className="inline-flex items-center gap-2 text-xs font-bold text-gold hover:underline"
                        >
                          <Ruler size={14} /> View Details
                        </Link>
                      ) : (
                        <Link 
                          href={`/admin/customers/${customer.id}/measurements`}
                          className="inline-flex items-center gap-2 text-xs font-bold text-warm-gray hover:text-dark border-b border-dotted"
                        >
                          <Plus size={14} /> Add Measurements
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditModal(customer)}
                          className="p-2 text-warm-gray hover:text-gold hover:bg-gold/10 rounded-full transition-all"
                          title="Edit Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 text-warm-gray hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          title="Delete Customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-dark text-white">
              <h3 className="text-xl font-serif font-bold">
                {editingCustomer ? 'Edit Client Info' : 'Register New Client'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Richard West"
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Email Address</label>
                  <input 
                    required
                    type="email"
                    disabled={!!editingCustomer}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="richard@example.com"
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

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Physical address for delivery or reference..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-black/5 focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>

                {!editingCustomer && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-warm-gray">Password</label>
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
                  {editingCustomer ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
