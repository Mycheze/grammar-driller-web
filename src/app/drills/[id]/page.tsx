'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchDrillDetails = useCallback(async () => {
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
  }, [drillId]);

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (drillId && mounted) {
      fetchDrillDetails();
    }
  }, [drillId, mounted, fetchDrillDetails]);

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

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'difficulty-beginner';
      case 'Intermediate': return 'difficulty-intermediate';
      case 'Advanced': return 'difficulty-advanced';
      case 'Expert': return 'difficulty-expert';
      default: return 'difficulty-intermediate';
    }
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
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <div className="text-lg loading-pulse">Loading drill details...</div>
      </div>
    );
  }

  if (error || !drillFile) {
    return (
      <div className="text-center py-16">
        <div className="enhanced-card max-w-md mx-auto">
          <div className="text-destructive mb-4 text-lg font-medium">⚠️ Error</div>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchDrillDetails}
              className="btn-primary w-full"
            >
              Try Again
            </button>
            <Link
              href="/drills"
              className="btn-secondary block text-center w-full"
            >
              Back to Drills
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold gradient-text">{drillFile.title}</h1>
        <p className="text-xl text-muted-foreground">Drill File Details</p>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/quiz/${drillFile.id}`}
            className="btn-primary"
          >
            🚀 Start Quiz
          </Link>
          <button
            onClick={handleEdit}
            className="btn-secondary"
          >
            📝 Edit TSV
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-all duration-300"
          >
            {deleting ? '🗑️ Deleting...' : '🗑️ Delete'}
          </button>
          <Link
            href="/drills"
            className="btn-secondary"
          >
            ← Back to Drills
          </Link>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="enhanced-card">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          📋 File Information
          <div className="ml-2 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Filename</dt>
              <dd className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-lg border">
                {drillFile.filename}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Target Language</dt>
              <dd><span className="tag">{drillFile.target_language}</span></dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Base Language</dt>
              <dd className="text-sm">{drillFile.base_language}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Author</dt>
              <dd className="text-sm">{drillFile.author}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Difficulty</dt>
              <dd>
                <span className={getDifficultyClass(drillFile.difficulty)}>
                  {drillFile.difficulty}
                </span>
              </dd>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Grammar Concept</dt>
              <dd className="text-sm">{drillFile.grammar_concept}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Version</dt>
              <dd className="text-sm">{drillFile.version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Question Count</dt>
              <dd className="text-sm font-semibold text-primary">{drillFile.question_count}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Created</dt>
              <dd className="text-sm">{formatDate(drillFile.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Tags</dt>
              <dd>
                {drillFile.tags ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {drillFile.tags.split(',').map((tag, index) => (
                      <span key={index} className="tag">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No tags</span>
                )}
              </dd>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <dt className="text-sm font-medium text-muted-foreground mb-2">Description</dt>
          <dd className="text-sm bg-muted/50 p-4 rounded-lg border">
            {drillFile.description}
          </dd>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="enhanced-card">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          🔍 Questions Preview
          <div className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </h2>
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-muted-foreground">
              No questions found for this drill file.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
                      <code className="bg-muted/50 px-2 py-1 rounded text-xs border">
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
        <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="modal-content w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
              <h3 className="text-xl font-semibold">📝 Edit TSV Content</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-6 min-h-0">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full font-mono text-sm rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-border bg-background text-foreground"
                placeholder="Edit the TSV content here..."
              />
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-border flex-shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? '💾 Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <Link
          href={`/quiz/${drillFile.id}`}
          className="btn-primary text-lg px-8 py-4 animate-glow inline-block"
        >
          🎯 Start Quiz with {drillFile.question_count} Questions
        </Link>
        <div>
          <Link
            href="/drills"
            className="btn-secondary"
          >
            ← Back to All Drills
          </Link>
        </div>
      </div>
    </div>
  );
}