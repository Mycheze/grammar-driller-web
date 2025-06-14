import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Grammar Driller',
  description: 'Practice grammar concepts through interactive quizzes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" storageKey="grammar-driller-theme">
          <div className="min-h-screen bg-background">
            <header className="app-header sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold gradient-text animate-float">
                      Grammar Driller
                    </h1>
                    <div className="hidden md:flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-accent rounded-full animate-pulse delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href="/"
                        className="nav-link"
                      >
                        Home
                      </Link>
                      <Link
                        href="/drills"
                        className="nav-link"
                      >
                        Drills
                      </Link>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <ThemeToggle />
                      <Link href="https://coff.ee/benslanguagelab" target="_blank"
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-sm font-medium text-white cursor-pointer hover:scale-110 transition-transform">
                        🧠
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>
            </header>
            
            <main className="container mx-auto px-4 py-8 relative">
              {/* Floating background elements */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float"></div>
                <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-accent/5 rounded-full blur-3xl animate-float delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-primary/3 rounded-full blur-2xl animate-float delay-2000"></div>
              </div>
              <div className="relative z-10">
                {children}
              </div>
            </main>
            
            {/* Footer */}
            <footer className="border-t border-border/50 mt-16">
              <div className="container mx-auto px-4 py-8">
                <div className="text-center text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <span className="text-sm">Built for language learners worldwide</span>
                    <div className="w-1 h-1 bg-accent rounded-full"></div>
                  </div>
                  <div className="text-xs opacity-70">
                    Made by Ben and Claude AI
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}