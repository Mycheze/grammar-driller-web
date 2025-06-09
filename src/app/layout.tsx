import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-primary">
                    Grammar Driller
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/drills"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    Drills
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}