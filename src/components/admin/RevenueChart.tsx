'use client';

import { useMemo } from 'react';

interface RevenueChartProps {
  data: number[];
  labels: string[];
}

export default function RevenueChart({ data, labels }: RevenueChartProps) {
  const maxVal = Math.max(...data, 1000) * 1.1;
  const minVal = 0;
  
  const width = 800;
  const height = 300;
  const padding = 20;
  
  const points = useMemo(() => {
    if (!data.length) return [];
    
    const xStep = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / (maxVal - minVal);
    
    return data.map((val, i) => ({
      x: padding + i * xStep,
      y: height - padding - (val - minVal) * yScale
    }));
  }, [data, maxVal, minVal]);

  const pathData = useMemo(() => {
    if (points.length < 2) return '';
    
    return points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, '');
  }, [points]);

  const areaData = useMemo(() => {
    if (points.length < 2) return '';
    return `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  }, [pathData, points]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif font-light">Revenue Trend</h3>
          <p className="text-xs text-warm-gray uppercase tracking-widest font-bold">Monthly Performance Analysis</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gold rounded-full"></span>
                <span className="text-[10px] text-warm-gray uppercase font-bold">Projected</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
                <span className="w-3 h-3 bg-white border border-gold rounded-full"></span>
                <span className="text-[10px] text-warm-gray uppercase font-bold">Actual</span>
            </div>
        </div>
      </div>

      <div className="relative w-full aspect-[8/3]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full drop-shadow-2xl overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grids */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={padding}
              y1={padding + p * (height - padding * 2)}
              x2={width - padding}
              y2={padding + p * (height - padding * 2)}
              stroke="currentColor"
              className="text-warm-gray"
              strokeWidth="0.5"
              strokeDasharray="4,8"
              opacity="0.1"
            />
          ))}

          {/* Area Gradient */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.01" />
            </linearGradient>
            
            <filter id="glow">
               <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
               <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
          </defs>

          {/* Fill Area */}
          <path d={areaData} fill="url(#chartGradient)" />

          {/* Path Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="animate-draw-path"
          />

          {/* Data Points */}
          {points.map((point, i) => (
             <g key={i} className="group cursor-help transition-all duration-300">
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  fill="#1A1A1A"
                  stroke="#D4AF37"
                  strokeWidth="2.5"
                  className="hover:r-6 hover:fill-gold transition-all duration-200"
                />
                
                {/* Tooltip on hover */}
                <foreignObject 
                    x={point.x - 40} 
                    y={point.y - 45} 
                    width="80" 
                    height="35"
                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                    <div className="bg-dark text-white text-[9px] px-2 py-1 rounded-sm border border-gold font-bold text-center">
                        ₹{data[i]}
                    </div>
                </foreignObject>
             </g>
          ))}
        </svg>
      </div>

      {/* Axis Labels */}
      <div className="flex justify-between mt-4 px-3 opacity-60">
        {labels.map((label, i) => (
          <span key={i} className="text-[10px] font-bold uppercase tracking-tighter text-warm-gray">
            {label}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes drawPath {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-path {
          stroke-dasharray: 2000;
          animation: drawPath 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
