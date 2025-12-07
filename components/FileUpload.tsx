'use client';

import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Loader2, FileUp, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (storageId: string) => void;
  label?: string;
  accept?: string;
}

export default function FileUpload({ onUploadComplete, label = 'Upload File', accept = '*' }: FileUploadProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsUploaded(false);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!result.ok) throw new Error('Upload failed');
      const { storageId } = await result.json();

      onUploadComplete(storageId);
      setIsUploaded(true);
    } catch (error) {
      console.error(error);
      alert('Failed to upload file.');
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
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
          {isUploading ? 'Uploading...' : isUploaded ? 'Replace File' : 'Select File'}
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" accept={accept} onChange={handleFileChange} />
        {isUploaded && (
          <span className="text-xs text-green-600 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" /> File Ready
          </span>
        )}
      </div>
    </div>
  );
}
