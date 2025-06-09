import Link from 'next/link';
import UploadForm from '@/components/upload/UploadForm';

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Upload Drill File</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload a TSV file containing grammar drill questions. The file will be parsed
          and added to your available drills for practice.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <UploadForm />
      </div>

      <div className="text-center">
        <Link
          href="/drills"
          className="text-primary hover:underline"
        >
          ← Back to Drills
        </Link>
      </div>
    </div>
  );
}