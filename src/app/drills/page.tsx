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

  // Only show loading screen on initial data load
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading drill files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-4">Error: {error}</div>
        <button
          onClick={fetchAllDrillFiles}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
        <div className="mt-4">
          <Link
            href="/drills/upload"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Upload New Drill Instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grammar Drills</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Generate with AI
          </button>
          <Link
            href="/drills/upload"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Upload File
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search drills..."
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1">
            Language
          </label>
          <select
            id="language"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
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
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted/50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Drill Files Grid */}
      {filteredDrillFiles.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">No drill files found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || languageFilter || difficultyFilter
              ? `No drills match your current filters. Try adjusting your search criteria.`
              : 'Get started by generating a drill with AI or uploading your own file'
            }
          </p>
          {searchTerm || languageFilter || difficultyFilter ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 mr-2"
            >
              Clear Filters
            </button>
          ) : null}
          <div className="space-x-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Generate with AI
            </button>
            <Link
              href="/drills/upload"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Upload File
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrillFiles.map((drillFile) => (
            <div
              key={drillFile.id}
              className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{drillFile.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {drillFile.author}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {drillFile.target_language}
                  </span>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                    {drillFile.difficulty}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {drillFile.description}
                </p>

                <div className="text-xs text-muted-foreground">
                  {drillFile.question_count} questions • {drillFile.grammar_concept}
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/quiz/${drillFile.id}`}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground text-sm text-center rounded-md hover:bg-primary/90"
                  >
                    Start Quiz
                  </Link>
                  <Link
                    href={`/drills/${drillFile.id}`}
                    className="px-3 py-2 border border-border text-sm rounded-md hover:bg-muted/50"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results info */}
      <div className="text-xs text-muted-foreground text-center">
        {searchTerm || languageFilter || difficultyFilter ? (
          <>Showing {filteredDrillFiles.length} of {allDrillFiles.length} drill files</>
        ) : (
          <>Showing {allDrillFiles.length} drill file{allDrillFiles.length !== 1 ? 's' : ''}</>
        )}
      </div>

      {/* Generate Modal */}
      <GenerateDrillModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}