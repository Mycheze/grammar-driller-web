'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DrillFile, Question } from '@/lib/db/types';
import { generateTSV } from '@/lib/utils/tsv';

interface DrillDetailsResponse {
  drillFile: DrillFile;
  questions: Question[];
  error?: string;
}

export default function DrillDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [drillFile, setDrillFile] = useState<DrillFile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const drillId = params.id as string;

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (drillId && mounted) {
      fetchDrillDetails();
    }
  }, [drillId, mounted]);

  const fetchDrillDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/drills/${drillId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Drill file not found');
        } else {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          setError(`Failed to load drill: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data: DrillDetailsResponse = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setDrillFile(data.drillFile);
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching drill details:', error);
      setError('Failed to load drill details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (drillFile && questions) {
      const tsvContent = generateTSV(drillFile, questions);
      setEditContent(tsvContent);
      setShowEditModal(true);
    }
  };

  const handleDelete = async () => {
    if (!drillFile) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${drillFile.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/drills/${drillId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/drills');
      } else {
        alert(`Delete failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete drill file');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!editContent.trim()) {
      alert('Content cannot be empty');
      return;
    }

    setSaving(true);
    try {
      // Create a File object from the edited content
      const blob = new Blob([editContent], { type: 'text/tab-separated-values' });
      const file = new File([blob], drillFile?.filename || 'edited.tsv', {
        type: 'text/tab-separated-values'
      });

      // Upload the edited file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/drills/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Delete the old drill file
        await fetch(`/api/drills/${drillId}`, { method: 'DELETE' });
        
        // Redirect to the new drill file
        router.push(`/drills/${result.drillFile.id}`);
      } else {
        alert(`Save failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Fix hydration: use client-only date formatting
  const formatDate = (dateString: string) => {
    if (!mounted) return ''; // Prevent hydration mismatch
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fix hydration: avoid dangerouslySetInnerHTML, use simple highlighting instead
  const HighlightedSentence = ({ sentence, targetWord }: { sentence: string; targetWord: string }) => {
    if (!mounted) return <span>{sentence}</span>; // Prevent hydration mismatch
    
    const parts = sentence.split(targetWord);
    return (
      <span>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <strong className="text-primary font-semibold">{targetWord}</strong>
            )}
          </span>
        ))}
      </span>
    );
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading drill details...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading drill details...</div>
      </div>
    );
  }

  if (error || !drillFile) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-4">Error: {error}</div>
        <div className="space-x-4">
          <button
            onClick={fetchDrillDetails}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
          <Link
            href="/drills"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Back to Drills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{drillFile.title}</h1>
        <p className="text-muted-foreground mb-4">Drill File Details</p>
        
        {/* Action buttons - ONLY CHANGE: Added delete button */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/quiz/${drillFile.id}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Start Quiz
          </Link>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Edit TSV
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <Link
            href="/drills"
            className="px-4 py-2 border border-border rounded-md hover:bg-muted/50"
          >
            Back to Drills
          </Link>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">File Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Filename</dt>
              <dd className="text-sm font-mono bg-muted px-2 py-1 rounded truncate">
                {drillFile.filename}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Target Language</dt>
              <dd className="text-sm">{drillFile.target_language}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Base Language</dt>
              <dd className="text-sm">{drillFile.base_language}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Author</dt>
              <dd className="text-sm">{drillFile.author}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Difficulty</dt>
              <dd>
                <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                  {drillFile.difficulty}
                </span>
              </dd>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Grammar Concept</dt>
              <dd className="text-sm">{drillFile.grammar_concept}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Version</dt>
              <dd className="text-sm">{drillFile.version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Question Count</dt>
              <dd className="text-sm">{drillFile.question_count}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="text-sm">{formatDate(drillFile.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tags</dt>
              <dd className="text-sm">
                {drillFile.tags ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {drillFile.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No tags</span>
                )}
              </dd>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <dt className="text-sm font-medium text-muted-foreground mb-2">Description</dt>
          <dd className="text-sm bg-muted p-3 rounded">
            {drillFile.description}
          </dd>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Questions Preview</h2>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No questions found for this drill file.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-12">
                    #
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Sentence
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground w-32">
                    Target Word
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Grammar Concept
                  </th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question, index) => (
                  <tr
                    key={question.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="py-3 px-2 text-sm">
                      <HighlightedSentence 
                        sentence={question.full_sentence} 
                        targetWord={question.target_word} 
                      />
                    </td>
                    <td className="py-3 px-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {question.target_word}
                      </code>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {question.grammar_concept}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
              <h3 className="text-lg font-semibold">Edit TSV Content</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-4 min-h-0">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full font-mono text-sm border border-border rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Edit the TSV content here..."
              />
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t border-border flex-shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Link
          href={`/quiz/${drillFile.id}`}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
        >
          Start Quiz with {drillFile.question_count} Questions
        </Link>
        <Link
          href="/drills"
          className="px-6 py-3 border border-border rounded-md hover:bg-muted/50 font-medium"
        >
          Back to All Drills
        </Link>
      </div>
    </div>
  );
}