# AI CODER INSTRUCTIONS - Nasara Connect GRC Platform

## IMMEDIATE CONTEXT

You are building a GRC (Governance, Risk, Compliance) platform for UK financial services. The database schema EXISTS in Neon PostgreSQL. Focus on building the Next.js application that connects to this existing database.

## CRITICAL RULES

1. **Database**: Schema is COMPLETE. DO NOT create new tables. Use existing schema at `/database/schema.sql`
2. **Naming**: Use camelCase for ALL JavaScript/TypeScript code
3. **Styling**: Teal primary color (#14B8A6), use Tailwind + Shadcn/ui
4. **Icons**: Use Lucide React icons exclusively
5. **Auth**: Implement multi-tenant auth with organizationId isolation
6. **Testing**: Write at least one test per component

## SETUP COMMANDS

```bash
# Initialize project (if not done)
npx create-next-app@latest nasara-connect --typescript --tailwind --app --src-dir --import-alias "@/*"

cd nasara-connect

# Install dependencies
npm install @supabase/supabase-js drizzle-orm postgres
npm install @radix-ui/themes @radix-ui/react-icons
npm install lucide-react
npm install react-hook-form zod @hookform/resolvers
npm install swr axios
npm install -D @types/node

# Shadcn/ui setup
npx shadcn-ui@latest init
# Choose: TypeScript, Tailwind CSS, yes to CSS variables

# Add Shadcn components as needed
npx shadcn-ui@latest add button card form input label
npx shadcn-ui@latest add dialog dropdown-menu select tabs
npx shadcn-ui@latest add toast table badge avatar
```

## DATABASE CONNECTION

```typescript
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });
export const db = drizzle(sql);

// Example query with camelCase
export async function getOrganizationById(orgId: string) {
  return await db.select().from('organizations').where('id', orgId);
}
```

## BUILD SEQUENCE

### STEP 1: Authentication Pages
```typescript
// src/app/(auth)/login/page.tsx
// Build login page matching the HTML prototype:
// - Teal/white split screen
// - Email/password fields
// - "Remember me" checkbox
// - SSO buttons (Google, Microsoft)
// - Link to register
```

### STEP 2: Dashboard Layout
```typescript
// src/app/(dashboard)/layout.tsx
// Create dashboard with:
// - Fixed sidebar (teal-800 background)
// - Collapsible on mobile
// - Navigation items with Lucide icons
// - User profile dropdown
// - Notification badge
```

### STEP 3: Dashboard Home
```typescript
// src/app/(dashboard)/page.tsx
// Create module grid:
const modules = [
  {
    id: 'authPack',
    title: 'Authorisation Ready Pack',
    icon: 'FileCheck2', // Lucide icon component name
    color: 'teal',
    route: '/authorization-pack'
  },
  // ... other modules
];

// Each module card should:
// - Show icon in colored circle
// - Display title and description  
// - Have hover effect (translateY, shadow)
// - Route to module page on click
```

### STEP 4: Authorization Pack Module
```typescript
// src/app/(dashboard)/authorization-pack/page.tsx
// Implement:
// 1. Questionnaire wizard (multi-step form)
// 2. Progress bar (25%, 50%, 75%, 100%)
// 3. Document checklist with status badges
// 4. "Start Guided Questionnaire" button
// 5. "Schedule Consultation" CTA
```

### STEP 5: Risk Assessment Module
```typescript
// src/app/(dashboard)/risk-assessment/page.tsx
// Table with:
// - Risk ID, Description, Category columns
// - Score badges (High/Medium/Low with colors)
// - Status badges (Open/Under Review/Mitigated)
// - Action buttons (View, Edit, AI Suggest)
// - "Add New Risk" button (top right)
```

### STEP 6: AI Integration
```typescript
// src/app/api/ai/chat/route.ts
export async function POST(request: Request) {
  const { message, context } = await request.json();
  
  // Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a UK regulatory compliance expert..." },
      { role: "user", content: message }
    ],
    stream: true
  });
  
  // Return streaming response
  return new Response(completion.body, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

## COMPONENT PATTERNS

### Module Card Pattern
```typescript
interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
  isLocked?: boolean;
}

export function ModuleCard({ title, description, icon: Icon, color, onClick, isLocked }: ModuleCardProps) {
  return (
    <div 
      onClick={!isLocked ? onClick : undefined}
      className={`
        bg-white p-6 rounded-xl shadow-lg cursor-pointer
        transition-all duration-200 hover:shadow-xl hover:-translate-y-1
        ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button className={`w-full bg-${color}-500 hover:bg-${color}-600 text-white py-2 px-4 rounded-lg`}>
        Go to Module
      </button>
    </div>
  );
}
```

### API Call Pattern
```typescript
// Always use try-catch with loading states
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function fetchRisks() {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/risks');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data;
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
}
```

### Form Pattern
```typescript
// Use react-hook-form with zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const riskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.enum(['operational', 'financial', 'compliance', 'strategic']),
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5)
});

type RiskFormData = z.infer<typeof riskSchema>;

function RiskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<RiskFormData>({
    resolver: zodResolver(riskSchema)
  });
  
  const onSubmit = async (data: RiskFormData) => {
    // Submit logic
  };
}
```

## FILE STRUCTURE TO CREATE

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         ✅ BUILD FIRST
│   │   └── register/page.tsx      ✅ BUILD FIRST
│   ├── (dashboard)/
│   │   ├── layout.tsx             ✅ BUILD SECOND
│   │   ├── page.tsx               ✅ BUILD THIRD
│   │   ├── authorization-pack/
│   │   │   └── page.tsx           ✅ BUILD FOURTH
│   │   ├── risk-assessment/
│   │   │   └── page.tsx           ✅ BUILD FIFTH
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── risks/route.ts
│       └── ai/chat/route.ts       ✅ BUILD SIXTH
├── components/
│   ├── ui/                        (Shadcn components)
│   ├── dashboard/
│   │   ├── ModuleCard.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   └── useOrganization.ts
└── types/
    └── index.ts
```

## COMMON MISTAKES TO AVOID

1. ❌ Creating new database tables → Use existing schema
2. ❌ Using snake_case in JS/TS → Always use camelCase
3. ❌ Forgetting organizationId filtering → Every query needs org isolation
4. ❌ Missing loading states → Always show loading indicators
5. ❌ No error handling → Wrap all async operations in try-catch
6. ❌ Hardcoded colors → Use Tailwind classes with teal primary
7. ❌ Wrong icons → Use Lucide React exclusively
8. ❌ No mobile responsiveness → Test on small screens

## TESTING CHECKLIST

For each component/page created, verify:
- [ ] TypeScript types are defined
- [ ] Loading states work
- [ ] Error states display correctly
- [ ] Mobile responsive (< 768px)
- [ ] Keyboard accessible
- [ ] Organization context is maintained
- [ ] API calls are authenticated
- [ ] Forms validate properly

## DEPLOYMENT READINESS

Before deploying to Vercel:
```bash
# Build passes
npm run build

# No TypeScript errors
npm run type-check

# Tests pass
npm test

# Lighthouse score > 90
npx lighthouse http://localhost:3000
```

## ENVIRONMENT VARIABLES

```env
# .env.local
DATABASE_URL=postgresql://[user]:[pass]@[host]/nasaraconnect?sslmode=require
NEXTAUTH_SECRET=generate-random-secret-here
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-key
```

---

## START NOW

Begin with Step 1: Create the login page at `src/app/(auth)/login/page.tsx` matching the design from the HTML prototype. Use Tailwind classes, make it responsive, and include form validation.

Command to start: "Create the login page with teal/white split design, email/password fields, SSO buttons, using Tailwind and TypeScript with proper form validation."