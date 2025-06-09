# Grammar Driller Web

A modern web application for language learners to practice grammar concepts through interactive quizzes. Generate custom drills with AI or upload your own TSV files for targeted grammar practice.

## 🚀 Features

- **Interactive Grammar Quizzes**: Fill-in-the-blank exercises with instant feedback
- **AI-Powered Content**: Generate custom drill files and get explanations for grammar concepts
- **TSV Format Support**: Human-readable file format for easy editing and sharing
- **Progress Tracking**: Monitor your learning progress across quiz sessions
- **Voting System**: Community-driven quality assessment for drill files
- **Multi-Language Support**: Practice grammar in any language
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Turso (LibSQL) - Edge-distributed SQLite
- **ORM**: Drizzle ORM with type-safe queries
- **Styling**: Tailwind CSS + Shadcn/ui components
- **AI Integration**: Vercel AI SDK with DeepSeek API
- **State Management**: TanStack Query for server state
- **Validation**: Zod for runtime type checking
- **Deployment**: Vercel (serverless)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Home page
│   ├── quiz/              # Quiz-related pages
│   ├── drills/           # Drill management pages
│   └── api/              # API routes for backend logic
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Shadcn/ui)
│   ├── quiz/             # Quiz-specific components
│   └── layout/           # Layout components
└── lib/                  # Utilities and configurations
    ├── db/               # Database schema and client
    ├── utils/            # Helper functions
    └── ai/               # AI integration utilities
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Turso account and database
- DeepSeek API key for AI features

### 1. Clone and Install

```bash
git clone <repository-url>
cd grammar-driller-web
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Database
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# AI Provider
DEEPSEEK_API_KEY=your-deepseek-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate database migrations
npm run db:generate

# Apply migrations to your database
npm run db:migrate

# (Optional) Open Drizzle Studio to view your database
npm run db:studio
```

### 4. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

### DrillFiles
Stores metadata about quiz sets including language, difficulty, and voting information.

### Questions
Individual quiz questions linked to drill files with full sentences, target words, and hints.

### UserSessions
Tracks user progress through quizzes including correct/incorrect answers and completion status.

## 📝 TSV File Format

Grammar Driller uses a simple TSV (Tab-Separated Values) format that's both human-readable and machine-parseable:

```tsv
#META	target_language	Spanish
#META	base_language	English
#META	title	Spanish Present Tense
#META	author	AI Generated
#META	difficulty	Intermediate
#META	description	Practice present tense verb conjugation
#META	version	1.0
#META	tags	verbs,present,conjugation

#HEADER	full_sentence	target_word	prompt	grammar_concept	alternate_answers	hint

Yo hablo español con mis amigos.	hablo	Fill in the correct form of "hablar"	Present tense conjugation		Remember: yo = -o ending
```

### File Structure:
1. **Metadata Section**: Key-value pairs with drill information
2. **Header Line**: Column definitions
3. **Content Lines**: Quiz questions with tab-separated fields

## 🤖 AI Features

### Drill Generation
- Specify target language, grammar concept, and difficulty
- AI generates contextually appropriate sentences
- Automatic validation and formatting

### Grammar Explanations
- Get detailed explanations for quiz questions
- Contextual help based on user's answer
- Markdown-formatted responses for better readability

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate new migrations
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio

# Project Management
npm run sync         # Collect files for AI context
```

## 🚀 Deployment

This application is optimized for Vercel deployment:

1. Push your code to a Git repository
2. Connect the repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically on every push

The app is designed to work seamlessly with Vercel's serverless environment and edge functions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Check the [Issues](../../issues) page for common problems
- Create a new issue for bugs or feature requests
- Review the `QUICK_REFERENCE.md` for development guidance

## 🔮 Roadmap

- [ ] Spaced repetition algorithm for better learning
- [ ] Audio pronunciation support
- [ ] Collaborative drill editing
- [ ] Advanced analytics and learning insights
- [ ] Mobile app version
- [ ] Offline mode support

---

Built with ❤️ for language learners worldwide.