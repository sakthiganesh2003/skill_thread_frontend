'use client';
import { useRouter } from 'next/navigation';

interface Garment {
  id: number;
  name: string;
  category: string;
  description: string;
  base_price: number;
  emoji: string;
  image_url?: string;
}

export default function GarmentCard({ garment }: { garment: Garment }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/garments/${garment.id}`)}
      className="card p-6 cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full"
    >
      {garment.image_url ? (
        <div className="w-full h-48 mb-4 bg-surface rounded-sm overflow-hidden flex-shrink-0 border border-border">
          <img 
            src={garment.image_url} 
            alt={garment.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerHTML = '<div class="flex items-center justify-center h-full text-warm-gray text-xs uppercase tracking-widest">No Image</div>';
              }
            }}
          />
        </div>
      ) : (
        <div className="w-full h-48 mb-4 bg-surface rounded-sm flex items-center justify-center border border-border text-warm-gray text-xs uppercase tracking-widest">
          No Image
        </div>
      )}
      <h3 className="text-lg font-serif font-light mb-2">{garment.name}</h3>
      {garment.description && <p className="text-sm text-warm-gray mb-4 flex-1">{garment.description}</p>}
      <div className="flex justify-between items-center mt-auto">
        <span className="text-sm text-gold font-semibold">₹{garment.base_price}</span>
        <span className="text-xs text-warm-gray uppercase">{garment.category}</span>
      </div>
    </div>
  );
}
