'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GenerateDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface GenerateParams {
  target_language: string;
  base_language: string;
  grammar_concept: string;
  difficulty_level: string;
  number_of_sentences: number;
  title: string;
  tags: string;
}

export default function GenerateDrillModal({ isOpen, onClose, onSuccess }: GenerateDrillModalProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<GenerateParams>({
    target_language: '',
    base_language: 'English',
    grammar_concept: '',
    difficulty_level: 'Intermediate',
    number_of_sentences: 10,
    title: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.target_language || !formData.grammar_concept) {
      setError('Target language and grammar concept are required');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/drills/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success && result.drillFile) {
        // Close modal and redirect to the new drill
        onClose();
        if (onSuccess) onSuccess();
        router.push(`/drills/${result.drillFile.id}`);
      } else {
        setError(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError('Failed to generate drill. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleInputChange = (field: keyof GenerateParams, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Generate New Drill with AI</h2>
          <button
            onClick={onClose}
            disabled={generating}
            className="text-muted-foreground hover:text-foreground text-xl leading-none disabled:opacity-50"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="target_language" className="block text-sm font-medium mb-1">
                Target Language *
              </label>
              <input
                id="target_language"
                type="text"
                value={formData.target_language}
                onChange={(e) => handleInputChange('target_language', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                placeholder="e.g., Spanish, Czech, German"
                disabled={generating}
                required
              />
            </div>

            <div>
              <label htmlFor="base_language" className="block text-sm font-medium mb-1">
                Base Language
              </label>
              <input
                id="base_language"
                type="text"
                value={formData.base_language}
                onChange={(e) => handleInputChange('base_language', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                disabled={generating}
              />
            </div>
          </div>

          <div>
            <label htmlFor="grammar_concept" className="block text-sm font-medium mb-1">
              Grammar Concept *
            </label>
            <input
              id="grammar_concept"
              type="text"
              value={formData.grammar_concept}
              onChange={(e) => handleInputChange('grammar_concept', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="e.g., Present tense conjugation, Dative case declension"
              disabled={generating}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty_level" className="block text-sm font-medium mb-1">
                Difficulty Level
              </label>
              <select
                id="difficulty_level"
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                disabled={generating}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label htmlFor="number_of_sentences" className="block text-sm font-medium mb-1">
                Number of Questions
              </label>
              <input
                id="number_of_sentences"
                type="number"
                min="5"
                max="50"
                value={formData.number_of_sentences}
                onChange={(e) => handleInputChange('number_of_sentences', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                disabled={generating}
              />
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title (optional)
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="Will be auto-generated if left blank"
              disabled={generating}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags (optional)
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="e.g., verbs,present,regular"
              disabled={generating}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={generating}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating || !formData.target_language || !formData.grammar_concept}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Generating...
                </>
              ) : (
                'Generate Drill'
              )}
            </button>
          </div>

          {generating && (
            <div className="text-center text-sm text-muted-foreground">
              This may take a few minutes. I pay for the generation costs, so I chose a slow, but cheap model. Please be patient while the AI creates your drill.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}