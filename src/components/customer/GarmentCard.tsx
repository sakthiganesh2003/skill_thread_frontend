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
      className="group cursor-pointer flex flex-col h-full overflow-hidden transition-all duration-500 hover:-translate-y-1"
    >
      <div className="relative w-full aspect-[3/4] bg-surface overflow-hidden">
        {garment.image_url ? (
          <img 
            src={garment.image_url} 
            alt={garment.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerHTML = '<div class="flex items-center justify-center h-full text-warm-gray text-xs uppercase tracking-widest">No Image</div>';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-warm-gray text-xs uppercase tracking-widest">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 pt-4 pb-2 px-1">
        <h3 className="text-base font-serif font-medium mb-1 text-dark group-hover:text-gold transition-colors">{garment.name}</h3>
        {garment.description && <p className="text-xs text-warm-gray mb-3 line-clamp-1">{garment.description}</p>}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/40">
          <span className="text-sm text-dark font-semibold">₹{garment.base_price}</span>
          <span className="text-[10px] text-warm-gray uppercase tracking-widest font-bold">{garment.category}</span>
        </div>
      </div>
    </div>
  );
}
