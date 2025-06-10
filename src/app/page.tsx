import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 relative">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute top-20 right-1/3 w-16 h-16 bg-accent/10 rounded-full blur-2xl animate-float delay-1000"></div>
          <div className="absolute top-32 left-2/3 w-12 h-12 bg-primary/5 rounded-full blur-xl animate-float delay-2000"></div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="text-4xl animate-float">🧠</div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-accent rounded-full animate-pulse delay-75"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold gradient-text animate-float mb-6">
            Welcome to Grammar Driller
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Master grammar concepts in any language with{' '}
            <span className="text-primary font-semibold">AI-powered</span> interactive exercises.
            Generate custom drills or upload your own content.
          </p>

          <div className="flex items-center justify-center space-x-4 mt-8">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full glass-effect">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">AI-Powered Learning</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full glass-effect">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
              <span className="text-sm text-muted-foreground">Multi-Language Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Link href="/drills" className="enhanced-card group cursor-pointer block">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📚</div>
              <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                Browse & Practice Drills
              </h3>
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Explore a curated collection of grammar exercises. Filter by language and difficulty, 
              then dive into interactive fill-in-the-blank challenges designed to reinforce your learning.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="tag">Interactive Exercises</span>
              <span className="tag">Progress Tracking</span>
              <span className="tag">Multiple Languages</span>
            </div>

            <div className="inline-flex items-center text-primary hover:text-accent transition-colors group font-medium">
              Browse Drills
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/drills/create" className="enhanced-card group cursor-pointer block">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">✨</div>
              <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                Create Custom Drills
              </h3>
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Harness the power of AI to generate personalized grammar drills for any concept or difficulty level. 
              Or upload your own TSV files for complete customization.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="tag">AI Generation</span>
              <span className="tag">Custom Upload</span>
              <span className="tag">Any Difficulty</span>
            </div>

            <div className="inline-flex items-center text-primary hover:text-accent transition-colors group font-medium">
              Create Drills
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* How It Works */}
      <div className="text-center space-y-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with grammar practice in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="enhanced-card text-center group">
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-ping opacity-75"></div>
              </div>
              <h4 className="text-lg font-semibold">Choose Your Path</h4>
              <p className="text-muted-foreground">
                Browse existing drills or create new ones with AI for your specific learning needs
              </p>
            </div>
          </div>

          <div className="enhanced-card text-center group">
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-ping opacity-75 delay-500"></div>
              </div>
              <h4 className="text-lg font-semibold">Practice Interactively</h4>
              <p className="text-muted-foreground">
                Engage with fill-in-the-blank exercises designed to reinforce grammar concepts
              </p>
            </div>
          </div>

          <div className="enhanced-card text-center group">
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-gradient-to-r from-primary via-accent to-primary rounded-full flex items-center justify-center mx-auto font-bold text-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping opacity-75 delay-1000"></div>
              </div>
              <h4 className="text-lg font-semibold">Learn & Improve</h4>
              <p className="text-muted-foreground">
                Get AI explanations for concepts and track your progress as you master new skills
              </p>
            </div>
          </div>
        </div>

        {/* Connection lines for desktop */}
        <div className="hidden md:block relative -mt-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-8">
        <div className="enhanced-card max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="text-4xl animate-float">🚀</div>
            <h3 className="text-2xl md:text-3xl font-bold gradient-text">
              Ready to Master Grammar?
            </h3>
            <p className="text-lg text-muted-foreground">
              Join thousands of learners who are improving their language skills with Grammar Driller
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/drills"
                className="btn-primary text-lg px-8 py-4 animate-glow"
              >
                🎯 Start Learning Now
              </Link>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Free to use</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>AI-powered</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Multi-language</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-xs text-muted-foreground">Languages</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-accent">AI</div>
            <div className="text-xs text-muted-foreground">Powered</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-green-400">24/7</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-blue-400">FREE</div>
            <div className="text-xs text-muted-foreground">To Use</div>
          </div>
        </div>
      </div>
    </div>
  );
}