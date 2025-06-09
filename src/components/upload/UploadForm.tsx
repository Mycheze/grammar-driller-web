'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UploadResponse {
  success: boolean;
  drillFile?: {
    id: string;
    title: string;
  };
  questionCount?: number;
  error?: string;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.tsv')) {
        setError('Please select a .tsv file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/drills/upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (result.success && result.drillFile) {
        setSuccess(`Successfully uploaded "${result.drillFile.title}" with ${result.questionCount} questions`);
        setFile(null);
        
        // Reset the file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        // Redirect to drills list after a short delay
        setTimeout(() => {
          router.push('/drills');
        }, 2000);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="file-input" className="block text-sm font-medium mb-2">
            Select TSV File
          </label>
          <input
            id="file-input"
            type="file"
            accept=".tsv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Only .tsv files are supported
          </p>
        </div>

        {file && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">
              <span className="font-medium">Selected:</span> {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Size: {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">{success}</p>
            <p className="text-xs text-green-600 mt-1">
              Redirecting to drills list...
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Drill File'}
        </button>
      </form>

      <div className="mt-8 p-4 bg-muted rounded-md">
        <h3 className="font-medium mb-2">TSV File Format</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Your file should include:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Metadata lines starting with #META</li>
          <li>• Header line starting with #HEADER</li>
          <li>• Question data lines with tab separators</li>
        </ul>
      </div>
    </div>
  );
}