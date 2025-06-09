# Grammar Driller - Project Focus Statement

## Project Context
**Purpose**: Modern web application for grammar practice through interactive quizzes  
**Target**: Language learners who want personalized grammar drilling  
**Deployment**: Vercel serverless with Turso edge database  
**Legacy**: Modernized from Flask app, maintaining TSV format compatibility

## Architecture Decisions

### Core Stack
- **Next.js 14 App Router**: Serverless-first, eliminates Flask bloat
- **TypeScript**: Type safety for quiz logic and data validation
- **Turso + Drizzle**: Edge database with type-safe ORM
- **Tailwind + Shadcn/ui**: Modern styling without Bootstrap overhead
- **Vercel AI SDK**: Streaming AI responses, better than custom OpenAI integration

### Key Design Principles
1. **Serverless-First**: All functions work in Vercel's edge runtime
2. **Type Safety**: End-to-end TypeScript with Zod validation
3. **Hybrid Data Strategy**: Database for performance, TSV for portability
4. **Progressive Enhancement**: Works without JavaScript for core features
5. **Performance**: Minimize bundle size, optimize for Core Web Vitals

## Data Strategy
**TSV Compatibility**: Maintain original human-readable format
- Parse uploaded TSV files into database
- Generate TSV downloads from database
- Keep original metadata structure intact

**Database Schema**: 
- `drill_files`: Quiz metadata + voting system
- `questions`: Individual quiz items with ordering
- `user_sessions`: Progress tracking across devices

## Coding Standards

### File Organization
- **Flat imports**: Use `@/` alias consistently
- **Colocation**: Keep related components together
- **Naming**: `kebab-case` for files, `PascalCase` for components

### Component Patterns
```tsx
// Preferred pattern - Server Component by default
export default function ComponentName({ prop }: Props) {
  return <div>Content</div>
}

// Client components only when needed
'use client'
export default function InteractiveComponent() {
  const [state] = useState()
  return <div>Interactive content</div>
}
```

### API Routes
```ts
// RESTful patterns with proper HTTP methods
export async function GET(request: NextRequest) {
  // Always return NextResponse.json()
}
```

### Database Queries
```ts
// Always use Drizzle's type-safe queries
const drills = await db.select().from(drillFiles).where(eq(drillFiles.id, id))
```

## Technical Constraints

### Performance
- **Bundle Size**: Keep under 200KB initial JavaScript
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Edge Runtime**: All API routes must work in edge environment

### Compatibility
- **TSV Format**: Maintain exact compatibility with original format
- **Progressive Enhancement**: Core quiz functionality without JavaScript
- **Mobile First**: Touch-friendly interface, works on all devices

### AI Integration
- **Streaming**: Use Vercel AI SDK for real-time responses
- **Fallbacks**: Graceful degradation when AI unavailable
- **Rate Limiting**: Prevent API abuse, user-friendly error messages

## Development Workflow

### File Structure Rules
```
src/app/           # Pages only, minimal logic
src/components/    # Reusable UI components
src/lib/          # Business logic, utilities, database
```

### Testing Strategy
- **Type Safety**: Rely on TypeScript for compile-time checks
- **Integration**: Test API routes with actual database
- **Manual**: Quiz flow testing across devices

### Migration Notes
**From Flask App**:
- Session management → Database-backed progress tracking
- Template rendering → React Server Components
- Python AI client → Vercel AI SDK
- File system → Database with TSV export

## Common Patterns

### Data Fetching
```tsx
// Server Component - fetch directly
async function DrillList() {
  const drills = await db.select().from(drillFiles)
  return <div>{/* render */}</div>
}

// Client Component - use TanStack Query
function InteractiveDrillList() {
  const { data } = useQuery({ queryKey: ['drills'], queryFn: fetchDrills })
  return <div>{/* render */}</div>
}
```

### Form Handling
```tsx
// Server Actions for mutations
async function createDrill(formData: FormData) {
  'use server'
  // Handle form submission
}

// Client forms for interactivity
function QuizForm() {
  const [answer, setAnswer] = useState('')
  // Handle real-time validation
}
```

### Error Handling
```tsx
// Always provide fallback UI
function Component() {
  try {
    return <MainContent />
  } catch (error) {
    return <ErrorFallback error={error} />
  }
}
```

## Key Decisions

### Why Next.js over Remix/SvelteKit?
- **Vercel Integration**: Zero-config deployment
- **App Router**: Better for our file-based drill system
- **Ecosystem**: Largest React ecosystem

### Why Turso over Supabase/PlanetScale?
- **Edge Distribution**: Lower latency globally
- **SQLite**: Simpler than PostgreSQL for our use case
- **Cost**: Better scaling economics

### Why Drizzle over Prisma?
- **Lighter**: Smaller bundle size
- **SQL-like**: Easier to optimize queries
- **Edge Compatible**: Works in all runtimes

## Success Metrics
- **Page Load**: < 2 seconds on 3G
- **Quiz Completion**: > 80% completion rate
- **Error Rate**: < 1% API failures
- **User Experience**: Smooth interactions, clear feedback

## Anti-Patterns to Avoid
- **Over-engineering**: Keep components simple
- **Premature Optimization**: Profile before optimizing
- **Client State**: Use server state when possible
- **Large Bundles**: Code split aggressively
- **Blocking Requests**: Stream when possible

This project prioritizes simplicity, performance, and developer experience while maintaining the core educational value of the original Flask application.