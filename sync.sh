#!/bin/bash

# Grammar Driller Project Sync Script
# Collects all relevant project files for AI context

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Grammar Driller Project Sync${NC}"
echo -e "Generated: $(date)"
echo "==============================="

# Create sync directory
SYNC_DIR="project_sync_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$SYNC_DIR"

echo -e "${YELLOW}Creating project sync in: $SYNC_DIR${NC}"

# Function to copy and flatten files
copy_file() {
    local source_path="$1"
    local target_name="$2"
    
    if [[ -f "$source_path" ]]; then
        cp "$source_path" "$SYNC_DIR/$target_name"
        echo "✓ $source_path -> $target_name"
        return 0
    else
        echo "✗ Missing: $source_path"
        return 1
    fi
}

# Function to recursively find and copy files
copy_directory_files() {
    local source_dir="$1"
    local file_pattern="$2"
    local prefix="$3"
    
    if [[ -d "$source_dir" ]]; then
        find "$source_dir" -name "$file_pattern" -type f | while IFS= read -r file; do
            # Convert path to flattened name
            flat_name="${prefix}$(echo "$file" | sed "s|$source_dir/||g" | tr '/' '_')"
            copy_file "$file" "$flat_name"
        done
    fi
}

# Initialize counters
total_files=0
copied_files=0

echo
echo -e "${GREEN}Root Configuration Files:${NC}"
for file in package.json next.config.js tsconfig.json tailwind.config.js postcss.config.mjs eslint.config.mjs .env.example; do
    copy_file "$file" "$(basename "$file" | sed 's/^\.//g')" && ((copied_files++))
    ((total_files++))
done

echo
echo -e "${GREEN}Documentation:${NC}"
for file in README.md PROJECT_FOCUS.md; do
    copy_file "$file" "$file" && ((copied_files++))
    ((total_files++))
done

echo
echo -e "${GREEN}Core App Files:${NC}"
copy_file "src/app/layout.tsx" "app__layout.tsx" && ((copied_files++)); ((total_files++))
copy_file "src/app/page.tsx" "app__page.tsx" && ((copied_files++)); ((total_files++))
copy_file "src/app/globals.css" "app__globals.css" && ((copied_files++)); ((total_files++))

echo
echo -e "${GREEN}Database & Schema:${NC}"
copy_file "src/lib/db/index.ts" "lib__db__index.ts" && ((copied_files++)); ((total_files++))
copy_file "src/lib/db/types.ts" "lib__db__types.ts" && ((copied_files++)); ((total_files++))
copy_file "src/lib/db/schema.sql" "lib__db__schema.sql" && ((copied_files++)); ((total_files++))

echo
echo -e "${GREEN}Core Libraries:${NC}"
copy_file "src/lib/utils.ts" "lib__utils.ts" && ((copied_files++)); ((total_files++))
copy_file "src/lib/quiz-sessions.ts" "lib__quiz-sessions.ts" && ((copied_files++)); ((total_files++))
copy_file "src/lib/utils/tsv.ts" "lib__utils__tsv.ts" && ((copied_files++)); ((total_files++))

echo
echo -e "${GREEN}React Components:${NC}"
if [[ -d "src/components" ]]; then
    find src/components -name "*.tsx" -type f | while IFS= read -r file; do
        flat_name="components__$(echo "$file" | sed 's|src/components/||g' | tr '/' '_')"
        copy_file "$file" "$flat_name" && ((copied_files++))
        ((total_files++))
    done
else
    echo "No components directory found"
fi

echo
echo -e "${GREEN}App Router Pages:${NC}"
# Get all page.tsx files except the root ones we already copied
if [[ -d "src/app" ]]; then
    find src/app -name "page.tsx" -type f | grep -v "^src/app/page.tsx$" | while IFS= read -r file; do
        # Convert src/app/drills/page.tsx -> app__drills__page.tsx
        flat_name="app__$(echo "$file" | sed 's|src/app/||g' | tr '/' '_')"
        copy_file "$file" "$flat_name" && ((copied_files++))
        ((total_files++))
    done
    
    # Get all layout.tsx files except the root one
    find src/app -name "layout.tsx" -type f | grep -v "^src/app/layout.tsx$" | while IFS= read -r file; do
        flat_name="app__$(echo "$file" | sed 's|src/app/||g' | tr '/' '_')"
        copy_file "$file" "$flat_name" && ((copied_files++))
        ((total_files++))
    done
    
    # Get any other .tsx files in app directory
    find src/app -name "*.tsx" -type f | grep -v "page.tsx\|layout.tsx" | while IFS= read -r file; do
        flat_name="app__$(echo "$file" | sed 's|src/app/||g' | tr '/' '_')"
        copy_file "$file" "$flat_name" && ((copied_files++))
        ((total_files++))
    done
fi

echo
echo -e "${GREEN}API Routes:${NC}"
if [[ -d "src/app/api" ]]; then
    find src/app/api -name "*.ts" -type f | while IFS= read -r file; do
        # Convert src/app/api/drills/route.ts -> app__api__drills__route.ts
        flat_name="app__api__$(echo "$file" | sed 's|src/app/api/||g' | tr '/' '_')"
        copy_file "$file" "$flat_name" && ((copied_files++))
        ((total_files++))
    done
else
    echo "No API routes directory found"
fi

# Recount actual copied files
actual_copied=$(find "$SYNC_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.css" -o -name "*.sql" -o -name "*.mjs" | wc -l)

echo
echo -e "${BLUE}Generating project documentation...${NC}"

# Generate comprehensive file list
cat > "$SYNC_DIR/FILE_LIST.txt" << EOF
Grammar Driller Project Sync
Generated: $(date)
========================================

ACTUAL TECH STACK (based on current codebase):
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- Styling: Tailwind CSS + CSS modules
- AI: DeepSeek API integration
- File Format: TSV (Tab-Separated Values)
- Session Management: In-memory for quiz state

ACTUAL PROJECT STRUCTURE:
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── drills/           # Drill management pages
│   │   ├── [id]/         # Individual drill details
│   │   ├── page.tsx      # Drills listing
│   │   └── upload/       # Upload functionality
│   ├── quiz/             # Quiz pages
│   │   └── [drillId]/    # Dynamic quiz routes
│   └── api/              # API routes
│       ├── drills/       # Drill CRUD operations
│       └── quiz/         # Quiz session management
├── components/            # React components
│   └── upload/           # Upload-specific components
└── lib/                  # Utilities and configurations
    ├── db/               # Database schema and client
    │   ├── index.ts      # Supabase client
    │   ├── types.ts      # TypeScript types
    │   └── schema.sql    # Database schema
    ├── utils/            # Helper functions
    │   └── tsv.ts        # TSV parsing utilities
    ├── quiz-sessions.ts  # Quiz session management
    └── utils.ts          # General utilities

FILES INCLUDED: $actual_copied

NAMING CONVENTION:
Original Path -> Flattened Name
src/app/page.tsx -> app__page.tsx
src/lib/db/types.ts -> lib__db__types.ts
src/components/upload/UploadForm.tsx -> components__upload__UploadForm.tsx
src/app/api/drills/route.ts -> app__api__drills__route.ts

KEY FEATURES:
- TSV file parsing and generation
- Quiz system with progress tracking
- AI-powered explanations and drill generation
- File upload functionality
- Database-backed with Supabase
- Session-based quiz state management
- Responsive web interface

DEVELOPMENT COMMANDS:
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

ENVIRONMENT VARIABLES NEEDED:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- DEEPSEEK_API_KEY
- NEXT_PUBLIC_APP_URL

IMPORTANT FILES TO UNDERSTAND:
1. src/lib/db/types.ts - Database type definitions
2. src/lib/utils/tsv.ts - TSV parsing logic
3. src/lib/quiz-sessions.ts - Quiz state management
4. src/app/api/ - All backend API logic
5. src/lib/db/schema.sql - Database structure
EOF

# Generate updated quick reference
cat > "$SYNC_DIR/QUICK_REFERENCE.md" << EOF
# Grammar Driller Quick Reference

## Core Concepts

### Database (Supabase)
- **DrillFiles**: Metadata about quiz sets
- **Questions**: Individual quiz questions  
- **UserSessions**: Progress tracking (if implemented)

### TSV Format
Human-readable tab-separated format:
- Metadata lines start with #META
- Header line starts with #HEADER
- Data lines are tab-separated values

### Key Components
- TSV Parser/Generator (\`src/lib/utils/tsv.ts\`)
- Database Types (\`src/lib/db/types.ts\`)
- Quiz Session Management (\`src/lib/quiz-sessions.ts\`)
- API Routes (\`src/app/api/\`)

## Common Development Tasks

### Adding New Pages
1. Create in \`src/app/[route]/page.tsx\`
2. Add navigation links if needed

### Database Changes
1. Update \`src/lib/db/schema.sql\`
2. Run migration in Supabase dashboard
3. Update \`src/lib/db/types.ts\` if needed

### Adding Components
1. Create in \`src/components/[feature]/Component.tsx\`
2. Import where needed

### API Routes
1. Create in \`src/app/api/[route]/route.ts\`
2. Export named functions: GET, POST, PUT, DELETE

## File Patterns

### Page Component
\`\`\`tsx
export default function PageName() {
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
\`\`\`

### API Route
\`\`\`ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle GET request
  return NextResponse.json({ data: 'response' });
}

export async function POST(request: NextRequest) {
  // Handle POST request
  const body = await request.json();
  return NextResponse.json({ success: true });
}
\`\`\`

### Component with Props
\`\`\`tsx
interface Props {
  title: string;
  items: string[];
}

export default function Component({ title, items }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      {/* Component content */}
    </div>
  );
}
\`\`\`
EOF

echo
echo -e "${GREEN}Sync Complete!${NC}"
echo "Files included: $actual_copied"
echo "Location: $SYNC_DIR/"
echo
echo -e "${YELLOW}To use with AI:${NC}"
echo "1. Zip/archive the entire $SYNC_DIR folder"
echo "2. Upload to your AI assistant"
echo "3. Reference FILE_LIST.txt for current project context"
echo "4. Check QUICK_REFERENCE.md for development patterns"
echo
echo -e "${BLUE}Current project status:${NC}"
echo "✓ Next.js 14 with App Router"
echo "✓ Supabase database integration"
echo "✓ TSV file format support"
echo "✓ Quiz session management"
echo "✓ API routes for drill/quiz operations"
echo
if [[ ! -f ".env.local" ]]; then
    echo -e "${RED}⚠ Missing .env.local - copy from .env.example${NC}"
fi
