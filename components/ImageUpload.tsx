'use client';

import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (storageId: string) => void;
  currentImageId?: string; // We might want to show preview if we could resolve URL, but for now simple
  label?: string;
}

export default function ImageUpload({ onUploadComplete, currentImageId, label = 'Upload Image' }: ImageUploadProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get URL
      const postUrl = await generateUploadUrl();

      // 2. Upload
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();

      // 3. Callback
      onUploadComplete(storageId);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto"
        >
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {isUploading ? 'Uploading...' : 'Select File'}
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        {currentImageId && !isUploading && (
          <span className="text-xs text-green-600 flex items-center">
            <ImageIcon className="w-3 h-3 mr-1" /> Image Set
          </span>
        )}
      </div>
      <p className="text-xs text-neutral-500">Max size 5MB. Supports JPG, PNG.</p>
    </div>
  );
}
