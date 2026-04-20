'use client';

interface StatusItem {
  label: string;
  count: number;
}

interface DoughnutStatusProps {
  data: StatusItem[];
}

export default function DoughnutStatus({ data }: DoughnutStatusProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0);
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Custom colors for status
  const goldPalette = ['#D4AF37', '#B8860B', '#DEB887', '#EEE8AA', '#F4A460'];

  let currentOffset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square max-w-[200px] mx-auto shadow-2xl rounded-full">
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90 w-full h-full p-4 overflow-visible drop-shadow-xl">
           {/* Background Circle */}
           <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F5F5F5"
            strokeWidth={strokeWidth}
            opacity="0.1"
          />

          {data.map((item, i) => {
            const percentage = (item.count / (total || 1)) * 100;
            const strokeDasharray = (percentage / 100) * circumference;
            const strokeDashoffset = -currentOffset;
            currentOffset += strokeDasharray;
            
            const color = goldPalette[i % goldPalette.length];
            
            return (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out hover:stroke-width-18 cursor-help origin-center hover:scale-105"
              >
                  <title>{item.label}: {item.count}</title>
              </circle>
            );
          })}
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-widest text-warm-gray font-bold">Total</span>
            <span className="text-3xl font-serif font-light text-dark">{total}</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="mt-10 w-full grid grid-cols-2 gap-y-3 gap-x-4">
        {data.map((item, i) => (
           <div key={item.label} className="flex items-center gap-2 group transition-opacity hover:opacity-100 opacity-70">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: goldPalette[i % goldPalette.length] }}
              ></span>
              <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-tighter truncate">{item.label}</p>
                  <p className="text-[10px] text-warm-gray">{item.count} orders</p>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
