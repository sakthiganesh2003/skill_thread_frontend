'use client';

import { useState, useEffect, useRef } from 'react';

interface DeleteConfirmProps {
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  isLoading?: boolean;
  className?: string;
}

export default function DeleteConfirm({ 
  onConfirm, 
  title = "Delete item?", 
  itemName,
  isLoading = false,
  className = "text-xs"
}: DeleteConfirmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close when loading finishes (item deleted)
  // We can't easily detect success here without passing more props, 
  // but usually the component unmounts if the item is removed from the list.

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`font-medium text-red-600 hover:text-red-700 hover:underline transition-colors ${className}`}
      >
        Delete
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-border shadow-xl rounded-sm p-3 z-50 animate-fade-in">
          <p className="text-xs font-bold text-dark mb-1">{title}</p>
          {itemName && <p className="text-[10px] text-warm-gray mb-3 line-clamp-2 italic">"{itemName}"</p>}
          
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleConfirm}
              className="flex-1 bg-red-600 text-white text-[10px] py-1.5 rounded-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-surface text-warm-gray text-[10px] py-1.5 rounded-sm font-bold border border-border hover:bg-border/20 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-white border-r border-b border-border rotate-45"></div>
        </div>
      )}
    </div>
  );
}
