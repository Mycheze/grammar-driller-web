'use client';

import { useState, useEffect } from 'react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  drillId: string;
  question: {
    blankSentence: string;
    targetWord: string;
    grammarConcept: string;
    fullSentence?: string;
  };
  userAnswer: string;
  targetLanguage?: string;
}

export default function ExplanationModal({ 
  isOpen, 
  onClose, 
  drillId,
  question, 
  userAnswer,
  targetLanguage 
}: ExplanationModalProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && !explanation) {
      generateExplanation();
    }
  }, [isOpen]);

  const generateExplanation = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/quiz/${drillId}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.blankSentence,
          userAnswer: userAnswer,
          targetWord: question.targetWord,
          targetLanguage: targetLanguage,
          grammarConcept: question.grammarConcept,
          fullSentence: question.fullSentence || question.blankSentence.replace('_____', question.targetWord)
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExplanation(result.explanation);
      } else {
        setError(result.error || 'Failed to generate explanation');
      }
    } catch (error) {
      console.error('Explanation error:', error);
      setError('Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text: string) => {
    // Simple markdown formatting for better display
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
      .replace(/\n\n/g, '</p><p>')                       // Paragraphs
      .replace(/\n/g, '<br>')                            // Line breaks
      .replace(/^/, '<p>')                               // Start paragraph
      .replace(/$/, '</p>');                             // End paragraph
  };

  const handleClose = () => {
    setExplanation('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Grammar Explanation</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          {/* Question Context */}
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Question:</div>
            <div className="font-medium">{question.blankSentence}</div>
            <div className="text-sm text-muted-foreground mt-2">
              <span className="font-medium">Correct answer:</span> {question.targetWord}
            </div>
            {userAnswer && userAnswer.toLowerCase() !== question.targetWord.toLowerCase() && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Your answer:</span> {userAnswer}
              </div>
            )}
          </div>

          {/* Explanation Content */}
          <div className="min-h-[200px]">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                <span>Generating explanation...</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
                <p className="text-sm text-destructive">{error}</p>
                <button
                  onClick={generateExplanation}
                  className="mt-2 px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded hover:bg-destructive/90"
                >
                  Try Again
                </button>
              </div>
            )}

            {explanation && !loading && (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(explanation) }}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-border">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}