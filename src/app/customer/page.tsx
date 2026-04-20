'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Pending',    bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  assigned:   { label: 'Assigned',   bg: 'bg-blue-50',    text: 'text-blue-700'   },
  cutting:    { label: 'Cutting',    bg: 'bg-orange-50',  text: 'text-orange-700' },
  stitching:  { label: 'Stitching',  bg: 'bg-purple-50',  text: 'text-purple-700' },
  finishing:  { label: 'Finishing',  bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  ready:      { label: 'Ready',      bg: 'bg-teal-50',    text: 'text-teal-700'   },
  dispatched: { label: 'Dispatched', bg: 'bg-sky-50',     text: 'text-sky-700'    },
  delivered:  { label: 'Delivered',  bg: 'bg-green-50',   text: 'text-green-700'  },
};

export default function CustomerPage() {
  const router = useRouter();
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate().then(() => {
      const user = useAuthStore.getState().user;
      if (!user || user.role !== 'customer') {
        router.push('/login');
      }
    });
  }, [router, hydrate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await ordersAPI.list();
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="pt-32 pb-24 px-8 md:px-20 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="section-label">My Account</p>
            <h1 className="font-serif text-5xl font-light mb-2">My Orders</h1>
            <p className="text-warm-gray">Track and manage your custom tailoring orders.</p>
          </div>
          <Link href="/garments" className="btn-primary inline-block text-center whitespace-nowrap">
            + New Order
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-border/40 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="text-5xl mb-4">🧵</div>
            <h2 className="font-serif text-2xl font-light mb-2">No orders yet</h2>
            <p className="text-warm-gray mb-6">Start by browsing our garment collection.</p>
            <Link href="/garments" className="btn-primary inline-block">
              Browse Garments
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? {
                label: order.status,
                bg: 'bg-gray-50',
                text: 'text-gray-600',
              };
              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/customer/orders/${order.id}`)}
                  className="card p-6 hover:shadow-md transition-all cursor-pointer group animate-fade-in"
                >
                  <div className="flex items-start gap-5">
                    {/* Garment image icon */}
                    <div className="w-14 h-14 flex items-center justify-center bg-surface rounded-sm flex-shrink-0 overflow-hidden border border-border">
                      {order.image_url ? (
                        <img 
                          src={order.image_url} 
                          alt={order.garment_name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-gold font-serif font-bold">ST</span>';
                            }
                          }}
                        />
                      ) : (
                        <span className="text-gold font-serif font-bold">ST</span>
                      )}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="text-xs text-gold font-semibold tracking-wider mb-1">
                            {order.order_number}
                          </p>
                          <h3 className="font-serif text-xl font-light group-hover:text-gold transition-colors">
                            {order.garment_name}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-warm-gray">
                            {order.tailor_name && (
                              <span>🧶 Tailor: <span className="text-dark">{order.tailor_name}</span></span>
                            )}
                            {!order.tailor_name && (
                              <span className="italic">Tailor not yet assigned</span>
                            )}
                            {order.fabric && order.fabric.trim() !== '' && (
                              <span>🪡 Fabric: <span className="text-dark">{order.fabric}</span></span>
                            )}
                            {order.color && order.color.trim() !== '' && (
                              <span>🎨 Color: <span className="text-dark">{order.color}</span></span>
                            )}
                            {order.due_date && (
                              <span>📅 Due: <span className="text-dark">{new Date(order.due_date._seconds ? order.due_date._seconds * 1000 : order.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
                            )}
                          </div>
                        </div>

                        {/* Right column */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.label}
                          </span>
                          <p className="text-lg font-semibold text-dark">₹{order.total_price}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <ProgressBar status={order.status} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const STAGES = ['pending', 'assigned', 'cutting', 'stitching', 'finishing', 'ready', 'dispatched', 'delivered'];

function ProgressBar({ status }: { status: string }) {
  const currentIndex = STAGES.indexOf(status);
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / STAGES.length) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="w-full bg-border rounded-full h-1.5">
        <div
          className="bg-gold h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-warm-gray">
        Step {Math.max(currentIndex + 1, 0)} of {STAGES.length}
      </p>
    </div>
  );
}
