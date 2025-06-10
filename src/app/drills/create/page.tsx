'use client';

import { useState } from 'react';
import Link from 'next/link';
import GenerateDrillModal from '@/components/GenerateDrillModal';

export default function CreateDrillPage() {
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const handleGenerateSuccess = () => {
    // Modal will handle redirect to the new drill
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">Create Custom Drills</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Generate AI-powered grammar exercises or upload your own custom TSV files. 
          Take control of your language learning journey.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="enhanced-card text-center group cursor-pointer" onClick={() => setShowGenerateModal(true)}>
          <div className="space-y-4">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
              Generate with AI
            </h3>
            <p className="text-muted-foreground">
              Let AI create personalized grammar drills for any language, concept, and difficulty level.
            </p>
            <div className="btn-primary inline-block">
              🤖 Generate New Drill
            </div>
          </div>
        </div>

        <Link href="/drills/upload" className="enhanced-card text-center group cursor-pointer block">
          <div className="space-y-4">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</div>
            <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
              Upload Your Own
            </h3>
            <p className="text-muted-foreground">
              Upload a custom TSV file with your own grammar exercises and questions.
            </p>
            <div className="btn-secondary inline-block">
              📤 Upload TSV File
            </div>
          </div>
        </Link>
      </div>

      {/* TSV Documentation */}
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold gradient-text mb-4">Create Your Own TSV Files</h2>
          <p className="text-lg text-muted-foreground">
            Learn how to write grammar drill files from scratch using our simple TSV format
          </p>
        </div>

        {/* Overview */}
        <div className="enhanced-card">
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            📋 TSV Format Overview
            <div className="ml-2 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          </h3>
          <p className="text-muted-foreground mb-4">
            TSV (Tab-Separated Values) is a simple, human-readable format that&apos;s perfect for creating grammar drills. 
            Each file contains metadata about your drill and the questions themselves.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-2">A TSV file has three main sections:</h4>
            <ul className="space-y-1 text-sm">
              <li><strong>1. Metadata Section:</strong> Information about your drill (language, difficulty, etc.)</li>
              <li><strong>2. Header Line:</strong> Column definitions for your questions</li>
              <li><strong>3. Data Lines:</strong> Your actual grammar questions</li>
            </ul>
          </div>
        </div>

        {/* File Structure */}
        <div className="enhanced-card">
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            🏗️ File Structure
            <div className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </h3>
          
          <div className="space-y-6">
            {/* Metadata Section */}
            <div>
              <h4 className="text-lg font-semibold mb-3">1. Metadata Section</h4>
              <p className="text-muted-foreground mb-3">
                Each metadata line starts with <code className="bg-muted px-2 py-1 rounded text-sm">#META</code> followed by a key and value:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border font-mono text-sm overflow-x-auto">
                <div className="space-y-1">
                  <div><span className="text-accent">#META</span>	target_language	<span className="text-primary">Spanish</span></div>
                  <div><span className="text-accent">#META</span>	base_language	<span className="text-primary">English</span></div>
                  <div><span className="text-accent">#META</span>	title	<span className="text-primary">Spanish Present Tense</span></div>
                  <div><span className="text-accent">#META</span>	author	<span className="text-primary">Your Name</span></div>
                  <div><span className="text-accent">#META</span>	difficulty	<span className="text-primary">Intermediate</span></div>
                  <div><span className="text-accent">#META</span>	description	<span className="text-primary">Practice present tense verb conjugation</span></div>
                  <div><span className="text-accent">#META</span>	grammar_concept	<span className="text-primary">Present tense conjugation</span></div>
                  <div><span className="text-accent">#META</span>	version	<span className="text-primary">1.0</span></div>
                  <div><span className="text-accent">#META</span>	tags	<span className="text-primary">verbs,present,conjugation</span></div>
                </div>
              </div>
            </div>

            {/* Header Section */}
            <div>
              <h4 className="text-lg font-semibold mb-3">2. Header Line</h4>
              <p className="text-muted-foreground mb-3">
                The header defines the columns for your questions. It starts with <code className="bg-muted px-2 py-1 rounded text-sm">#HEADER</code>:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border font-mono text-sm overflow-x-auto">
                <span className="text-accent">#HEADER</span>	full_sentence	target_word	prompt	grammar_concept	alternate_answers	hint
              </div>
            </div>

            {/* Data Section */}
            <div>
              <h4 className="text-lg font-semibold mb-3">3. Question Data</h4>
              <p className="text-muted-foreground mb-3">
                Each line contains one question with tab-separated values matching the header columns:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border font-mono text-sm overflow-x-auto">
                <div className="space-y-1">
                  <div>Yo <span className="text-primary">hablo</span> español con mis amigos.	<span className="text-primary">hablo</span>	Fill in the correct form of &ldquo;hablar&rdquo;	Present tense conjugation		Remember: yo = -o ending</div>
                  <div>Ella <span className="text-primary">come</span> una manzana.	<span className="text-primary">come</span>	Fill in the correct form of &ldquo;comer&rdquo;	Present tense conjugation		Remember: ella = -e ending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Field Descriptions */}
        <div className="enhanced-card">
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            📝 Field Descriptions
            <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metadata Fields */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Metadata Fields</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="bg-muted px-2 py-1 rounded">target_language</code>
                  <p className="text-muted-foreground mt-1">The language being practiced (e.g., &ldquo;Spanish&rdquo;, &ldquo;French&rdquo;)</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">base_language</code>
                  <p className="text-muted-foreground mt-1">The instruction language (usually &ldquo;English&rdquo;)</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">title</code>
                  <p className="text-muted-foreground mt-1">A clear title for your drill</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">author</code>
                  <p className="text-muted-foreground mt-1">Your name or organization</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">difficulty</code>
                  <p className="text-muted-foreground mt-1">Beginner, Intermediate, Advanced, or Expert</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">description</code>
                  <p className="text-muted-foreground mt-1">Brief description of what students will practice</p>
                </div>
              </div>
            </div>

            {/* Question Fields */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Question Fields</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <code className="bg-muted px-2 py-1 rounded">full_sentence</code>
                  <p className="text-muted-foreground mt-1">Complete sentence with the target word</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">target_word</code>
                  <p className="text-muted-foreground mt-1">The correct answer students should provide</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">prompt</code>
                  <p className="text-muted-foreground mt-1">Instructions for the student (e.g., &ldquo;Fill in the verb&rdquo;)</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">grammar_concept</code>
                  <p className="text-muted-foreground mt-1">Specific concept this question practices</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">alternate_answers</code>
                  <p className="text-muted-foreground mt-1">Other acceptable answers, comma-separated (optional)</p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">hint</code>
                  <p className="text-muted-foreground mt-1">Helpful hint for struggling students (optional)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Example */}
        <div className="enhanced-card">
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            💡 Complete Example
            <div className="ml-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </h3>
          <p className="text-muted-foreground mb-4">
            Here&apos;s a complete TSV file for a Spanish present tense drill:
          </p>
          <div className="bg-muted/50 rounded-lg p-4 border font-mono text-xs overflow-x-auto">
            <div className="space-y-1">
              <div className="text-accent">#META	target_language	Spanish</div>
              <div className="text-accent">#META	base_language	English</div>
              <div className="text-accent">#META	title	Spanish Present Tense Practice</div>
              <div className="text-accent">#META	author	Grammar Teacher</div>
              <div className="text-accent">#META	difficulty	Intermediate</div>
              <div className="text-accent">#META	description	Practice conjugating regular verbs in present tense</div>
              <div className="text-accent">#META	grammar_concept	Present tense conjugation</div>
              <div className="text-accent">#META	version	1.0</div>
              <div className="text-accent">#META	tags	verbs,present,regular</div>
              <div className="mt-2"></div>
              <div className="text-primary">#HEADER	full_sentence	target_word	prompt	grammar_concept	alternate_answers	hint</div>
              <div className="mt-2"></div>
              <div>Yo <span className="text-green-400">hablo</span> español todos los días.	<span className="text-green-400">hablo</span>	Conjugate &ldquo;hablar&rdquo; for &ldquo;yo&rdquo;	Present tense conjugation		Yo endings are -o</div>
              <div>Tú <span className="text-green-400">comes</span> pizza con frecuencia.	<span className="text-green-400">comes</span>	Conjugate &ldquo;comer&rdquo; for &ldquo;tú&rdquo;	Present tense conjugation		Tú endings are -es</div>
              <div>Ella <span className="text-green-400">vive</span> en la ciudad.	<span className="text-green-400">vive</span>	Conjugate &ldquo;vivir&rdquo; for &ldquo;ella&rdquo;	Present tense conjugation		Ella endings are -e</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="enhanced-card">
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            💡 Pro Tips
            <div className="ml-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">✅ Best Practices</h4>
                <ul className="text-sm space-y-1">
                  <li>• Use realistic, contextual sentences</li>
                  <li>• Keep target words focused on one concept</li>
                  <li>• Provide helpful hints for difficult questions</li>
                  <li>• Test with 5-15 questions per drill</li>
                  <li>• Use consistent grammar terminology</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">❌ Common Mistakes</h4>
                <ul className="text-sm space-y-1">
                  <li>• Mixing tabs and spaces (use only tabs)</li>
                  <li>• Forgetting the #META and #HEADER prefixes</li>
                  <li>• Making sentences too complex</li>
                  <li>• Using ambiguous target words</li>
                  <li>• Inconsistent difficulty levels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          <div className="enhanced-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Ready to Create Your Drill?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="btn-primary"
              >
                ✨ Generate with AI
              </button>
              <Link href="/drills/upload" className="btn-secondary">
                📁 Upload Your TSV
              </Link>
            </div>
          </div>
          
          <Link href="/drills" className="btn-secondary">
            ← Back to All Drills
          </Link>
        </div>
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