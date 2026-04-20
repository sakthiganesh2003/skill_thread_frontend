'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import GarmentCard from '@/components/customer/GarmentCard';
import { garmentsAPI, fabricsAPI } from '@/lib/api';
import { Shirt, Layers, LayoutGrid } from 'lucide-react';

export default function GarmentsPage() {
  const [viewMode, setViewMode] = useState<'garments' | 'fabrics'>('garments');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: garments = [], isLoading: loadingGarments } = useQuery({
    queryKey: ['garments'],
    queryFn: async () => {
      const { data } = await garmentsAPI.list();
      return data;
    },
  });

  const { data: fabrics = [], isLoading: loadingFabrics } = useQuery({
    queryKey: ['fabrics'],
    queryFn: async () => {
      const { data } = await fabricsAPI.list();
      return data;
    },
  });

  const isLoading = loadingGarments || loadingFabrics;

  const filteredItems = (viewMode === 'garments' ? garments : fabrics).filter((item: any) => {
    if (selectedCategory === 'all') return true;
    
    const cat = item.category?.toLowerCase() || '';
    const name = item.name?.toLowerCase() || '';
    
    // Logic for Garments
    if (viewMode === 'garments') {
      if (selectedCategory === 'shirt') return cat.includes('shirt') || name.includes('shirt');
      if (selectedCategory === 'pant') return cat.includes('pant') || cat.includes('trouser') || name.includes('pant') || name.includes('trouser');
      if (selectedCategory === 'suit') return cat.includes('suit') || name.includes('suit') || cat.includes('sherwani') || name.includes('sherwani');
    }
    
    // Logic for Fabrics
    if (viewMode === 'fabrics') {
      if (selectedCategory === 'silk') return cat.includes('silk') || name.includes('silk');
      if (selectedCategory === 'cotton') return cat.includes('cotton') || name.includes('cotton');
      if (selectedCategory === 'wool') return cat.includes('wool') || name.includes('wool');
    }
    
    return cat.includes(selectedCategory);
  });

  const switchMode = (mode: 'garments' | 'fabrics') => {
    setViewMode(mode);
    setSelectedCategory('all');
  };

  return (
    <>
      <Navbar />
      <div className="pt-32 pb-24 px-8 md:px-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <Link href="/" className="text-gold text-sm mb-4 inline-block hover:opacity-80 transition-opacity">← Back to home</Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl font-light mb-4 capitalize">
                {viewMode === 'garments' ? 'Garment Catalog' : 'Fabric Library'}
              </h1>
              <p className="text-warm-gray max-w-lg">
                {viewMode === 'garments' 
                  ? 'Explore our curated selection of bespoke garments, each customizable to your perfect fit.'
                  : 'Browse our exclusive library of premium fabrics from the finest mills across the world.'}
              </p>
            </div>
            <div className="flex gap-2 bg-surface p-1 rounded-sm border border-border">
              <button 
                onClick={() => switchMode('garments')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${viewMode === 'garments' ? 'bg-gold text-dark shadow-md' : 'text-warm-gray hover:text-dark'}`}
              >
                Garments
              </button>
              <button 
                onClick={() => switchMode('fabrics')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm ${viewMode === 'fabrics' ? 'bg-gold text-dark shadow-md' : 'text-warm-gray hover:text-dark'}`}
              >
                Fabrics
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-32 space-y-10">
              {/* Garment Catalog Section */}
              <div>
                <button 
                  onClick={() => switchMode('garments')}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-6 transition-colors ${viewMode === 'garments' ? 'text-dark' : 'text-warm-gray hover:text-dark'}`}
                >
                  <Shirt size={14} className={viewMode === 'garments' ? 'text-gold' : ''} />
                  Garment Catalog
                </button>
                {viewMode === 'garments' && (
                  <nav className="flex flex-col gap-4 pl-4 border-l border-gold/20 ml-1.5">
                    {[
                      { id: 'all', label: 'All Garments' },
                      { id: 'shirt', label: 'Custom Shirts' },
                      { id: 'pant', label: 'Trousers & Pants' },
                      { id: 'suit', label: 'Suits & Sherwanis' }
                    ].map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-left text-sm font-medium transition-colors hover:text-gold ${selectedCategory === cat.id ? 'text-gold' : 'text-warm-gray'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </nav>
                )}
              </div>

              {/* Fabric Library Section */}
              <div>
                <button 
                  onClick={() => switchMode('fabrics')}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-6 transition-colors ${viewMode === 'fabrics' ? 'text-dark' : 'text-warm-gray hover:text-dark'}`}
                >
                  <Layers size={14} className={viewMode === 'fabrics' ? 'text-gold' : ''} />
                  Fabric Library
                </button>
                {viewMode === 'fabrics' && (
                  <nav className="flex flex-col gap-4 pl-4 border-l border-gold/20 ml-1.5">
                    {[
                      { id: 'all', label: 'All Fabrics' },
                      { id: 'silk', label: 'Pure Silks' },
                      { id: 'cotton', label: 'Egyptian Cotton' },
                      { id: 'wool', label: 'Superfine Wool' }
                    ].map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-left text-sm font-medium transition-colors hover:text-gold ${selectedCategory === cat.id ? 'text-gold' : 'text-warm-gray'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </nav>
                )}
              </div>

              <div className="pt-8 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-widest text-dark mb-6">Expert Service</h3>
                <div className="bg-dark/5 p-4 rounded-sm border border-black/5">
                  <p className="text-xs text-warm-gray leading-relaxed italic">
                    "Our master tailors help you select the perfect fabric for your chosen garment style."
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-surface border border-border rounded-sm animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                  <p className="text-sm text-warm-gray">Showing {filteredItems.length} {viewMode} results</p>
                  <div className="flex items-center gap-4">
                    <LayoutGrid size={16} className="text-gold" />
                    <select className="text-xs font-bold uppercase tracking-wider bg-transparent border-none focus:ring-0 cursor-pointer">
                      <option>Newest Arrivals</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                    </select>
                  </div>
                </div>
                
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {filteredItems.map((item: any) => (
                      <GarmentCard 
                        key={item.id} 
                        garment={viewMode === 'fabrics' ? {
                          ...item,
                          base_price: item.price_per_meter || item.base_price,
                          category: item.material || item.category || 'Fabric'
                        } : item} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center border border-dashed border-border rounded-sm">
                    <p className="text-warm-gray italic">No items found in this {viewMode === 'garments' ? 'collection' : 'library'}.</p>
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className="mt-4 text-sm text-gold hover:underline font-bold"
                    >
                      Browse full {viewMode} list
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
