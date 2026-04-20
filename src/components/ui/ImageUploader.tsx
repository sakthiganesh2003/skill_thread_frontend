'use client';

import { useState, useRef, useEffect } from 'react';
import { uploadAPI } from '@/lib/api';

interface ImageUploaderProps {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ currentUrl, onUploaded, label = 'Image' }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>(currentUrl || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentUrl prop changes (e.g. switching items to edit)
  useEffect(() => {
    setPreview(currentUrl || '');
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview instantly
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError('');
    setLoading(true);

    try {
      const { data } = await uploadAPI.image(file);
      const finalUrl = data.url.startsWith('http') 
        ? data.url 
        : `http://localhost:5000${data.url}`;
      
      setPreview(finalUrl);
      onUploaded(finalUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      setPreview(currentUrl || '');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview('');
    onUploaded('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {/* Image preview */}
      {preview && (
        <div className="mb-3 relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-sm border border-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            title="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors ${
          loading ? 'border-gold/40 bg-gold/5' : 'border-border hover:border-gold hover:bg-gold/5'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <p className="text-sm text-warm-gray animate-pulse">Uploading...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gold">
              {preview ? '📷 Change Image' : '📷 Upload Image'}
            </p>
            <p className="text-xs text-warm-gray mt-1">JPG, PNG, WebP · Max 5 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
