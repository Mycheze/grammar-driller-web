'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { DrillFile } from '@/lib/db/types';
import GenerateDrillModal from '@/components/GenerateDrillModal';

interface DrillsResponse {
  drillFiles: DrillFile[];
  error?: string;
}

export default function DrillsPage() {
  const [allDrillFiles, setAllDrillFiles] = useState<DrillFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Get unique languages and difficulties for filters from all data
  const languages = useMemo(() => 
    Array.from(new Set(allDrillFiles.map(df => df.target_language))).sort(),
    [allDrillFiles]
  );
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Client-side filtering - no API calls, no loading states
  const filteredDrillFiles = useMemo(() => {
    return allDrillFiles.filter(drillFile => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          drillFile.title.toLowerCase().includes(searchLower) ||
          drillFile.grammar_concept.toLowerCase().includes(searchLower) ||
          drillFile.description.toLowerCase().includes(searchLower) ||
          drillFile.author.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Language filter
      if (languageFilter && drillFile.target_language !== languageFilter) {
        return false;
      }

      // Difficulty filter
      if (difficultyFilter && drillFile.difficulty !== difficultyFilter) {
        return false;
      }

      return true;
    });
  }, [allDrillFiles, searchTerm, languageFilter, difficultyFilter]);

  // Only fetch data once on component mount
  useEffect(() => {
    fetchAllDrillFiles();
  }, []);

  const fetchAllDrillFiles = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/drills');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch drills: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('API returned non-JSON response');
      }

      const data: DrillsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAllDrillFiles(data.drillFiles || []);
    } catch (error) {
      console.error('Error fetching drill files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load drill files');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLanguageFilter('');
    setDifficultyFilter('');
  };

  const handleGenerateSuccess = () => {
    // Refresh the drill files list after successful generation
    fetchAllDrillFiles();
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

  // Only show loading screen on initial data load
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <div className="text-lg loading-pulse">Loading drill files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="enhanced-card max-w-md mx-auto">
          <div className="text-destructive mb-4 text-lg font-medium">⚠️ Error</div>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchAllDrillFiles}
              className="btn-primary w-full"
            >
              Try Again
            </button>
            <Link
              href="/drills/upload"
              className="btn-secondary block text-center w-full"
            >
              Upload New Drill Instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Grammar Drills</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master grammar concepts with AI-powered interactive exercises
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary animate-glow"
          >
            ✨ Generate with AI
          </button>
          <Link
            href="/drills/upload"
            className="btn-secondary"
          >
            📁 Upload File
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="enhanced-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          🔍 Find Your Perfect Drill
          <div className="ml-2 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drills..."
              className="enhanced-input w-full"
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium mb-2">
              Language
            </label>
            <select
              id="language"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="enhanced-input w-full"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="enhanced-input w-full"
            >
              <option value="">All Difficulties</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-effect">
          <span className="text-sm text-muted-foreground">
            {searchTerm || languageFilter || difficultyFilter ? (
              <>Showing {filteredDrillFiles.length} of {allDrillFiles.length} drill files</>
            ) : (
              <>Showing {allDrillFiles.length} drill file{allDrillFiles.length !== 1 ? 's' : ''}</>
            )}
          </span>
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Drill Files Grid */}
      {filteredDrillFiles.length === 0 ? (
        <div className="text-center py-16">
          <div className="enhanced-card max-w-lg mx-auto">
            <div className="text-6xl mb-4 animate-float">🤔</div>
            <h3 className="text-xl font-semibold mb-3">No drill files found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || languageFilter || difficultyFilter
                ? `No drills match your current filters. Try adjusting your search criteria.`
                : 'Get started by generating a drill with AI or uploading your own file'
              }
            </p>
            {searchTerm || languageFilter || difficultyFilter ? (
              <button
                onClick={clearFilters}
                className="btn-secondary mr-3"
              >
                Clear Filters
              </button>
            ) : null}
            <div className="space-x-3">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="btn-primary"
              >
                ✨ Generate with AI
              </button>
              <Link
                href="/drills/upload"
                className="btn-secondary"
              >
                📁 Upload File
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrillFiles.map((drillFile, index) => (
            <div
              key={drillFile.id}
              className="enhanced-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {drillFile.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    by {drillFile.author}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="tag">
                    {drillFile.target_language}
                  </span>
                  <span className={getDifficultyClass(drillFile.difficulty)}>
                    {drillFile.difficulty}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {drillFile.description}
                </p>

                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{drillFile.question_count} questions</span>
                  <span>•</span>
                  <span>{drillFile.grammar_concept}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/quiz/${drillFile.id}`}
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    🚀 Start Quiz
                  </Link>
                  <Link
                    href={`/drills/${drillFile.id}`}
                    className="btn-secondary px-4 text-sm"
                  >
                    📋 Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      <GenerateDrillModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}