import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Grammar Driller
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Practice grammar concepts in different languages with interactive exercises.
          Generate custom drills with AI or upload your own TSV files.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
        <div className={cn(
          "p-6 rounded-lg border border-border bg-card",
          "hover:shadow-lg transition-shadow"
        )}>
          <h3 className="text-xl font-semibold mb-3">Browse & Practice Drills</h3>
          <p className="text-muted-foreground mb-4">
            Explore existing drill files, filter by language and difficulty, then start practicing with interactive fill-in-the-blank exercises.
          </p>
          <Link
            href="/drills"
            className="inline-flex items-center text-primary hover:underline"
          >
            Browse Drills →
          </Link>
        </div>

        <div className={cn(
          "p-6 rounded-lg border border-border bg-card",
          "hover:shadow-lg transition-shadow"
        )}>
          <h3 className="text-xl font-semibold mb-3">Create Custom Drills</h3>
          <p className="text-muted-foreground mb-4">
            Generate custom drill files with AI for specific grammar concepts and difficulty levels, or upload your own TSV files.
          </p>
          <Link
            href="/drills"
            className="inline-flex items-center text-primary hover:underline"
          >
            Create Drills →
          </Link>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm max-w-3xl mx-auto">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-semibold">
              1
            </div>
            <p>Browse existing drills or create new ones with AI</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-semibold">
              2
            </div>
            <p>Start practicing with fill-in-the-blank exercises</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-semibold">
              3
            </div>
            <p>Get AI explanations and track your progress</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <Link
          href="/drills"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
        >
          Get Started with Grammar Drills
        </Link>
      </div>
    </div>
  );
}