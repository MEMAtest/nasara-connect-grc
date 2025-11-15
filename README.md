# MEMA Connect (formerly Nasara Connect)

**Intelligent Compliance Management Platform for Financial Services**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-60%20passing-green)](package.json)

> Transform regulatory compliance from a burden into a competitive advantage with AI-powered policy generation, real-time monitoring, and intelligent risk management.

🌐 **Live Demo**: [https://nasara-connect-grc.vercel.app](https://nasara-connect-grc.vercel.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Policy Creator Module](#policy-creator-module)
- [Admin CMS](#admin-cms)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

MEMA Connect is an enterprise-grade compliance management platform designed specifically for FCA-regulated financial services firms. Our intelligent system automates policy creation, monitors regulatory changes, and ensures continuous compliance through sophisticated rules engines and AI-powered document generation.

### Why MEMA Connect?

**For Compliance Teams:**
- ✅ Generate tailored policy documents in minutes, not weeks
- ✅ Ensure consistency across all policies with centralized clause management
- ✅ Track every change with comprehensive audit trails
- ✅ Reduce manual work by 80% with intelligent automation

**For Firms:**
- 💰 Save £50K+ annually on compliance costs
- ⚡ Respond to regulatory changes 10x faster
- 🛡️ Reduce compliance risk with built-in quality controls
- 📊 Gain real-time visibility into compliance status

**For Regulators:**
- 📝 Access complete audit trails for every policy decision
- 🔍 Review decision logic with transparent rules engine
- ✅ Trust in FCA-aligned policy frameworks

---

## 🚀 Key Features

### 1. **Policy Creator** 📄
Intelligent wizard that generates bespoke policy documents through dynamic questionnaires.

- **Smart Branching Questionnaires**: Questions adapt based on previous answers
- **Rules-Based Clause Selection**: 100+ pre-written clauses automatically selected
- **Live Preview**: See your policy update in real-time as you answer questions
- **Professional Documents**: Generate branded DOCX files with firm colors and logos
- **Comprehensive Audit Trails**: Every answer, rule fired, and clause selected is logged

**Technical Highlights:**
- JSON Logic rules engine with 10+ operators
- Liquid template variables for dynamic content
- Markdown-based clause library
- Auto-save every 30 seconds

### 2. **Admin CMS** ⚙️
Complete administrative interface for managing policy content and approval workflows.

- **Clause Management**: CRUD operations with Markdown editor and Liquid hints
- **Question Builder**: Create conditional questions with validation rules
- **Rules Engine**: Visual rule builder with priority-based execution
- **Test Harness**: Validate rules before deployment with sample inputs
- **Approval Workflow**: Multi-level approval with commenting and version control

**Technical Highlights:**
- Real-time search and filtering
- Drag-and-drop ordering (coming soon)
- Version control and rollback
- Permission-based access control

### 3. **Document Generation** 📑
Transform questionnaire responses into professional, branded policy documents.

- **DOCX Export**: Full Microsoft Word compatibility with styling
- **PDF Generation**: Ready for implementation (LibreOffice/CloudConvert)
- **Audit Bundles**: JSON exports with complete traceability
- **Branding Integration**: Custom colors, fonts, and logos
- **Draft Watermarking**: Prevent accidental distribution of drafts

**Technical Highlights:**
- Markdown to DOCX conversion
- Inline formatting (bold, italic, code)
- Lists, tables, blockquotes support
- Metadata tables with generation info

### 4. **Firm Profile Management** 🏢
Centralized firm configuration that pre-populates questionnaires and drives conditional logic.

- **Attributes**: FCA permissions, client types, firm size, jurisdiction
- **Branding**: Logo, colors, fonts, watermark preferences
- **Defaults**: Pre-fill wizard answers based on firm profile
- **Integration**: Seamless connection with rules engine

### 5. **Real-Time Compliance Intelligence** 🧠
*(Coming Soon)*
- Regulatory change monitoring
- Impact assessment automation
- Policy gap analysis
- Compliance dashboard with KPIs

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+ and npm 9+
- PostgreSQL 15+ (optional for production)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MEMAtest/nasara-connect-grc.git
cd nasara-connect-grc

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations (optional for local development)
# psql -d your_database < database/migrations/001_policy_creator_schema.sql

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the application.

### Using Mock Data

The system works out-of-the-box with mock data for demonstration:

1. **Test the Wizard**: Visit `/wizard/full-demo`
2. **Generate Documents**: Visit `/documents/review/run-001`
3. **Explore Admin CMS**: Visit `/admin`
4. **Test Rules**: Visit `/admin/rules/test`

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Next.js 15.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling with OKLch color space
- **Framer Motion 12** - Animations
- **React Three Fiber** - 3D visualizations

**Backend:**
- **Next.js API Routes** - Serverless functions
- **PostgreSQL** - Primary database
- **Vercel** - Hosting and deployment

**Document Generation:**
- **docx** - DOCX creation
- **marked** - Markdown parsing
- **pdf-lib** - PDF manipulation

**Testing:**
- **Vitest** - Unit and integration tests
- **60 tests** with 100% pass rate

### Project Structure

```
nasara-connect-grc/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── admin/               # Admin CMS routes
│   │   │   ├── clauses/         # Clause management
│   │   │   ├── questions/       # Question management
│   │   │   ├── rules/           # Rules management + test harness
│   │   │   └── approvals/       # Approval workflow
│   │   ├── api/                 # API routes
│   │   │   ├── firms/           # Firm profile APIs
│   │   │   ├── policies/        # Policy APIs
│   │   │   └── runs/            # Document generation APIs
│   │   ├── wizard/              # Policy wizard
│   │   └── documents/           # Document review
│   ├── components/              # React components
│   │   ├── policies/            # Policy-specific components
│   │   └── about/               # Marketing components
│   ├── lib/                     # Business logic
│   │   ├── policies/            # Rules engine, types
│   │   ├── documents/           # Document generation
│   │   └── server/              # Server-side utilities
│   └── hooks/                   # React hooks
├── database/
│   └── migrations/              # SQL migration files
├── public/                      # Static assets
└── tests/                       # Test files

```

### Data Flow

```
User Input (Wizard)
    ↓
Rules Engine Evaluation
    ↓
Clause Selection
    ↓
Liquid Template Rendering
    ↓
Document Generation (DOCX)
    ↓
Audit Bundle Export (JSON)
```

---

## 📚 Policy Creator Module

### Overview

The Policy Creator is the core feature enabling firms to generate bespoke compliance documents through an intelligent questionnaire system.

### How It Works

1. **Firm Profile Setup** (`/admin/firm-profile`)
   - Configure firm attributes (permissions, size, client types)
   - Set branding (logo, colors, fonts)
   - Define default answers

2. **Content Management** (`/admin/clauses`, `/admin/questions`, `/admin/rules`)
   - Admins create reusable clauses with Markdown + Liquid variables
   - Build question library with conditional logic
   - Define rules for automatic clause selection

3. **Wizard Completion** (`/wizard/full-demo`)
   - Users answer dynamically-generated questions
   - Questions appear/disappear based on previous answers
   - Live preview shows selected clauses in real-time
   - Auto-save preserves progress every 30 seconds

4. **Document Generation** (`/documents/review/[runId]`)
   - Generate professional DOCX with firm branding
   - Download comprehensive audit bundle (JSON)
   - Submit for approval workflow (optional)

5. **Approval Process** (`/admin/approvals`)
   - SMF reviewers approve/reject documents
   - Add comments and request changes
   - Track approval history

### Rules Engine

The rules engine uses **JSON Logic** format for flexible, testable conditions.

**Example Rule:**
```json
{
  "name": "Include PEP clause for domestic PEPs",
  "priority": 100,
  "condition": {
    "all": [
      { "q": "firm_role", "eq": "principal" },
      { "q": "pep_domestic", "eq": true }
    ]
  },
  "action": {
    "include_clause_codes": ["aml_edd_domestic_pep"],
    "set_vars": { "approver_role": "SMF17" }
  }
}
```

**Supported Operators:**
- **Logical**: `all` (AND), `any` (OR), `not` (negation)
- **Comparison**: `eq`, `neq`, `in`, `nin`, `includes`
- **Numeric**: `gt`, `lt`, `gte`, `lte`

**Testing Rules:**
Visit `/admin/rules/test` to validate rules with sample inputs before deployment.

### Liquid Templates

Clauses use **Liquid** syntax for dynamic content:

```markdown
## Enhanced Due Diligence

{{ firm_name }} has identified Domestic PEPs as clients.

{% if pep_domestic %}
All PEP relationships require approval by **{{ approver_role }}**.
{% endif %}

### Client Types
{% for type in client_types %}
- {{ type }}
{% endfor %}
```

---

## 🛠️ Admin CMS

### Dashboard (`/admin`)

Central hub showing:
- Statistics: policies, clauses, questions, rules, approvals
- Quick actions: create clause, add question, test rules
- Recent activity feed

### Clause Management (`/admin/clauses`)

**List View:**
- Search by title or code
- Filter by policy and type (mandatory/optional)
- View metadata (tags, version, updated date)

**Editor View:**
- Markdown content editor with syntax highlighting
- Liquid variable hints
- Tag management
- Risk reference tracking
- Display order configuration
- Version control

### Question Management (`/admin/questions`)

**Features:**
- 6 question types: text, number, date, boolean, select, multiselect
- Conditional visibility (depends_on)
- Validation rules (required, min, max, pattern)
- Section organization
- Help text and placeholders

### Rules Management (`/admin/rules`)

**List View:**
- Priority-based ordering
- Condition and action summaries
- Active/inactive toggle
- Quick edit access

**Test Harness (`/admin/rules/test`):**
- JSON input for answers and firm attributes
- Real-time rule evaluation
- Visual results:
  - Included/excluded clauses
  - Suggested clauses with reasoning
  - Variables set
  - Individual rule firing status

### Approval Workflow (`/admin/approvals`)

**Features:**
- Pending approval queue
- Status filtering (pending, approved, rejected)
- Document preview
- Approve/reject actions
- Comment tracking
- Approval history

---

## 🔌 API Documentation

### Firm Profile APIs

```typescript
// Get firm profile
GET /api/firms/:firmId/profile
Response: FirmProfile

// Update firm profile
POST /api/firms/:firmId/profile
Body: { name, attributes, branding }
Response: FirmProfile

// Partial update
PATCH /api/firms/:firmId/profile
Body: { attributes } | { branding }
Response: FirmProfile

// Get wizard defaults
GET /api/firms/:firmId/defaults
Response: { firm_id, defaults }
```

### Policy APIs

```typescript
// Get wizard data
GET /api/policies/:policyId/wizard
Response: { policy_id, questions, rules }
```

### Document Generation APIs

```typescript
// Generate documents
POST /api/runs/:runId/generate
Body: { generated_by, effective_date }
Response: { run_id, filename, docx_url, pdf_url, audit_url, audit_bundle }

// Download DOCX
GET /api/runs/:runId/documents/docx
Response: Binary (DOCX file)

// Download audit bundle
GET /api/runs/:runId/documents/audit
Response: Binary (JSON file)
```

---

## 🗄️ Database Schema

### Tables

**1. policies**
```sql
- id: UUID (PK)
- key: TEXT (unique)
- name: TEXT
- version: TEXT
- jurisdiction: TEXT
- tags: TEXT[]
```

**2. clauses**
```sql
- id: UUID (PK)
- policy_id: UUID (FK)
- code: TEXT (unique per policy)
- title: TEXT
- body_md: TEXT (Markdown with Liquid)
- tags: TEXT[]
- risk_refs: TEXT[]
- is_mandatory: BOOLEAN
- display_order: INTEGER
- version: TEXT
```

**3. questions**
```sql
- id: UUID (PK)
- policy_id: UUID (FK)
- code: TEXT (unique per policy)
- text: TEXT
- help: TEXT
- type: TEXT (text|number|date|boolean|select|multiselect)
- options: JSONB
- validation: JSONB
- depends_on: JSONB
- section: TEXT
- display_order: INTEGER
```

**4. rules**
```sql
- id: UUID (PK)
- policy_id: UUID (FK)
- name: TEXT
- priority: INTEGER
- condition: JSONB (JSON Logic)
- action: JSONB
- is_active: BOOLEAN
```

**5. firm_profiles**
```sql
- firm_id: UUID (PK)
- name: TEXT
- attributes: JSONB
- branding: JSONB
```

**6. runs**
```sql
- id: UUID (PK)
- firm_id: UUID (FK)
- policy_id: UUID (FK)
- status: TEXT
- answers: JSONB
- selected_clause_codes: TEXT[]
- variables: JSONB
- outputs: JSONB
```

**7. approvals**
```sql
- id: UUID (PK)
- run_id: UUID (FK)
- status: TEXT
- approver_role: TEXT
- comments: JSONB
```

**8. audit**
```sql
- id: UUID (PK)
- run_id: UUID (FK)
- event_type: TEXT
- event_data: JSONB
- created_at: TIMESTAMP
```

**9. policy_register**
```sql
- id: UUID (PK)
- firm_id: UUID (FK)
- policy_id: UUID (FK)
- status: TEXT
- published_at: TIMESTAMP
```

### Indexes

- GIN indexes on JSONB columns for performance
- Unique constraints on code fields
- Foreign key relationships with cascading deletes

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/lib/policies/rules-engine.test.ts

# Run with coverage
npm test -- --coverage
```

### Test Coverage

- **Rules Engine**: 24 unit tests
- **Phase 1 Integration**: 11 tests
- **Document Generation**: 21 tests
- **Permissions**: 4 tests

**Total**: 60 tests, 100% passing

### Test Structure

```typescript
describe('Rules Engine', () => {
  it('should evaluate eq (equals)', () => {
    const condition = { q: 'firm_role', eq: 'principal' }
    expect(evaluateCondition(condition, { firm_role: 'principal' })).toBe(true)
  })
})
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Authentication secret
   - `NEXTAUTH_URL`: Production URL

3. **Deploy**
   ```bash
   vercel --prod
   ```

Auto-deploys on push to `main` branch.

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t nasara-connect .
docker run -p 3000:3000 nasara-connect
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication (NextAuth)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here

# Storage (Optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket

# Email (Optional)
RESEND_API_KEY=your-api-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
```

---

## ⚙️ Configuration

### Branding

Customize in `src/app/admin/firm-profile/page.tsx`:
- Primary color (headings, buttons)
- Secondary color (accents)
- Font family (Calibri, Arial, etc.)
- Logo URL
- Watermark preferences

### Rules

Configure in Admin CMS (`/admin/rules`):
- Priority (higher number = earlier execution)
- Conditions (JSON Logic format)
- Actions (include/exclude/suggest clauses)
- Active/inactive status

### Questions

Configure in Admin CMS (`/admin/questions`):
- Question type
- Validation rules
- Dependencies (conditional display)
- Section grouping
- Display order

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with 2-space indent
- **Linting**: ESLint with Next.js config
- **Commits**: Conventional Commits format

### Pull Request Guidelines

- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Updated documentation
- ✅ Added tests for new features
- ✅ Followed code style guidelines

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: [https://docs.nasaraconnect.com](https://docs.nasaraconnect.com)
- **Email**: support@nasaraconnect.com
- **Issues**: [GitHub Issues](https://github.com/MEMAtest/nasara-connect-grc/issues)

---

## 🙏 Acknowledgments

- **FCA** for regulatory guidance
- **Next.js** team for the amazing framework
- **Vercel** for hosting platform
- **Open source community** for dependencies

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Real-time regulatory change monitoring
- [ ] AI-powered policy recommendations
- [ ] Multi-language support
- [ ] Mobile app (iOS/Android)

### Q2 2025
- [ ] Blockchain-based audit trails
- [ ] Integration with RegTech partners
- [ ] Advanced analytics dashboard
- [ ] White-label solution

### Q3 2025
- [ ] European market expansion (ESMA, BaFin)
- [ ] API marketplace
- [ ] Compliance training modules
- [ ] Risk scoring algorithms

---

**Built with ❤️ by the MEMA Connect team**

*Transforming regulatory compliance for financial services*
