# DASHBOARD BUILD INSTRUCTIONS - Priority #1

## 🎯 OBJECTIVE
Build a stunning, flexible, intuitive dashboard that serves as the command center for Nasara Connect. This is the MOST CRITICAL component - it sets the tone for the entire platform.

## 🚀 IMMEDIATE ACTION PLAN

### STEP 0: Project Setup (10 minutes)
```bash
# Create Next.js project with all requirements
npx create-next-app@latest nasara-connect --typescript --tailwind --app --src-dir --import-alias "@/*"

cd nasara-connect

# Install essential packages
npm install lucide-react framer-motion recharts
npm install @radix-ui/react-avatar @radix-ui/react-dropdown-menu
npm install @radix-ui/react-progress @radix-ui/react-tooltip
npm install clsx tailwind-merge

# Setup Shadcn/ui
npx shadcn-ui@latest init
# Select: New York style, Slate base color, CSS variables

# Add these Shadcn components
npx shadcn-ui@latest add card button badge avatar dropdown-menu
npx shadcn-ui@latest add tooltip progress tabs separator
```

### STEP 1: Create the Dashboard Layout Structure

```typescript
// src/app/(dashboard)/layout.tsx
// THIS IS THE FOUNDATION - GET THIS RIGHT!

const DashboardLayout = ({ children }) => {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Fixed, Collapsible */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
```

## 📐 DASHBOARD COMPONENTS BREAKDOWN

### 1. SIDEBAR COMPONENT
```typescript
// src/components/dashboard/Sidebar.tsx

const Sidebar = () => {
  // DESIGN SPECS:
  // - Width: 256px (w-64) on desktop, full screen on mobile
  // - Background: Gradient from teal-800 to teal-900
  // - Logo at top with white text
  // - Navigation items with hover effects
  // - Bottom section for settings/logout
  
  const navigationItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      href: '/',
      badge: null 
    },
    { 
      label: 'Authorization Pack', 
      icon: FileCheck2, 
      href: '/authorization-pack',
      badge: { text: '75%', variant: 'warning' } // Progress indicator
    },
    { 
      label: 'Risk Assessment', 
      icon: ShieldAlert, 
      href: '/risk-assessment',
      badge: { text: '3', variant: 'danger' } // Count of high risks
    },
    // ... more items
  ];
  
  // Features to implement:
  // - Active state highlighting (use pathname)
  // - Smooth transitions on hover (scale: 1.02, background opacity change)
  // - Collapsible on mobile with hamburger menu
  // - Module icons should have subtle glow effect
};
```

### 2. HEADER COMPONENT
```typescript
// src/components/dashboard/Header.tsx

const Header = () => {
  // DESIGN SPECS:
  // - Height: 64px (h-16)
  // - White background with subtle bottom border
  // - Left: Current page title + breadcrumbs
  // - Right: Notifications bell, user avatar dropdown
  
  // Must include:
  // - Search bar (can be hidden on mobile)
  // - Notification badge with pulse animation for new items
  // - User menu with: Profile, Settings, Logout
  // - Organization name display
};
```

### 3. MAIN DASHBOARD PAGE
```typescript
// src/app/(dashboard)/page.tsx
// THE STAR OF THE SHOW - THIS MUST BE PERFECT!

const DashboardPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <WelcomeHeader />
      
      {/* Key Metrics Row */}
      <MetricsGrid />
      
      {/* Module Cards Grid */}
      <ModuleCardsGrid />
      
      {/* Activity & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
};
```

## 🎨 VISUAL DESIGN SPECIFICATIONS

### Color Palette
```css
/* Primary Colors */
--primary-teal: #14B8A6;
--primary-teal-dark: #0F766E;
--primary-teal-light: #5EEAD4;

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
--info: #3B82F6;

/* Neutral */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Module Card Design
```typescript
// src/components/dashboard/ModuleCard.tsx

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'teal' | 'sky' | 'indigo' | 'rose' | 'amber';
  progress?: number;
  alerts?: number;
  isLocked?: boolean;
  onClick: () => void;
}

const ModuleCard = ({ ... }) => {
  // CRITICAL DESIGN ELEMENTS:
  // 1. White background with subtle shadow
  // 2. Hover effect: lift up (translateY(-4px)) + stronger shadow
  // 3. Icon in colored circle (use gradient)
  // 4. Progress bar if applicable (thin, at bottom)
  // 5. Alert badge in top-right corner if alerts > 0
  // 6. Locked state: overlay with blur effect + lock icon
  
  return (
    <div className={`
      relative bg-white rounded-xl p-6
      shadow-lg hover:shadow-xl
      transform transition-all duration-200
      hover:-translate-y-1
      cursor-pointer
      ${isLocked ? 'opacity-75' : ''}
    `}>
      {/* Alert Badge */}
      {alerts > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white 
                        text-xs rounded-full h-6 w-6 flex items-center 
                        justify-center animate-pulse">
          {alerts}
        </div>
      )}
      
      {/* Icon Container with Gradient */}
      <div className={`
        w-14 h-14 rounded-xl mb-4
        bg-gradient-to-br from-${color}-400 to-${color}-600
        flex items-center justify-center
        shadow-lg
      `}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      {/* Content */}
      <h3 className="font-semibold text-gray-800 text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* CTA Button */}
      <button className={`
        mt-4 w-full py-2 px-4 rounded-lg
        bg-${color}-500 hover:bg-${color}-600
        text-white font-medium text-sm
        transition-colors
      `}>
        {isLocked ? 'Unlock Module' : 'Open Module'}
      </button>
    </div>
  );
};
```

### Metrics Widget Design
```typescript
// src/components/dashboard/MetricCard.tsx

const MetricCard = ({ title, value, change, icon, color }) => {
  // Mini card showing key metrics
  // Examples: "Compliance Score: 92%", "Open Risks: 12", "Training Progress: 78%"
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
};
```

## 📊 DASHBOARD DATA STRUCTURE

```typescript
// src/lib/dashboard-data.ts

export const dashboardModules = [
  {
    id: 'authPack',
    title: 'Authorization Ready Pack',
    description: 'Navigate FCA authorization with guided questionnaires and document management',
    icon: FileCheck2,
    color: 'teal',
    route: '/authorization-pack',
    progress: 75,
    alerts: 2,
    isLocked: false
  },
  {
    id: 'riskAssessment',
    title: 'Risk Assessment Tool',
    description: 'Identify, evaluate, and mitigate business risks effectively',
    icon: ShieldAlert,
    color: 'sky',
    route: '/risk-assessment',
    progress: undefined,
    alerts: 3,
    isLocked: false
  },
  {
    id: 'complianceFramework',
    title: 'Compliance Framework',
    description: 'Map controls to risks and regulatory requirements',
    icon: ClipboardList,
    color: 'indigo',
    route: '/compliance-framework',
    progress: 60,
    alerts: 0,
    isLocked: false
  },
  {
    id: 'training',
    title: 'Training Library',
    description: 'Access compliance training modules and track progress',
    icon: BookOpenCheck,
    color: 'amber',
    route: '/training',
    progress: 45,
    alerts: 1,
    isLocked: false
  },
  {
    id: 'regulatoryNews',
    title: 'Regulatory News',
    description: 'Stay updated with latest regulatory changes',
    icon: Newspaper,
    color: 'rose',
    route: '/regulatory-news',
    progress: undefined,
    alerts: 5,
    isLocked: false
  },
  {
    id: 'aiChat',
    title: 'AI Assistant',
    description: 'Get instant regulatory guidance and support',
    icon: MessageCircle,
    color: 'teal',
    route: '/ai-chat',
    progress: undefined,
    alerts: 0,
    isLocked: true // Example of locked module
  }
];

export const dashboardMetrics = [
  {
    title: 'Compliance Score',
    value: '92%',
    change: 3,
    icon: TrendingUp,
    color: 'green'
  },
  {
    title: 'Open Risks',
    value: '12',
    change: -2,
    icon: AlertTriangle,
    color: 'orange'
  },
  {
    title: 'Training Progress',
    value: '78%',
    change: 5,
    icon: GraduationCap,
    color: 'blue'
  },
  {
    title: 'Days to Deadline',
    value: '14',
    change: null,
    icon: Calendar,
    color: 'purple'
  }
];
```

## 🎯 CRITICAL SUCCESS FACTORS

### 1. Responsive Design
```css
/* Mobile First Approach */
/* Base: Mobile (< 640px) */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */

Grid should be:
- Mobile: 1 column
- Tablet: 2 columns  
- Desktop: 3-4 columns
```

### 2. Loading States
```typescript
// Every data fetch needs a skeleton loader
const ModuleCardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 animate-pulse">
    <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4" />
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-full mb-4" />
    <div className="h-10 bg-gray-200 rounded" />
  </div>
);
```

### 3. Animations
```typescript
// Use Framer Motion for smooth transitions
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};
```

### 4. Empty States
```typescript
// Always handle empty data gracefully
const EmptyState = ({ message, icon: Icon }) => (
  <div className="text-center py-12">
    <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500">{message}</p>
  </div>
);
```

## 🚦 TESTING THE DASHBOARD

### Visual Checklist
- [ ] Logo visible and clear
- [ ] Navigation items have hover effects
- [ ] Active page is highlighted
- [ ] Module cards have smooth hover animations
- [ ] Progress bars animate on load
- [ ] Alert badges pulse for attention
- [ ] Colors match brand guidelines
- [ ] Typography is consistent

### Functional Checklist
- [ ] All module cards are clickable
- [ ] Navigation works correctly
- [ ] User dropdown menu functions
- [ ] Notifications display properly
- [ ] Search bar is functional (if implemented)
- [ ] Mobile menu toggles correctly
- [ ] Loading states appear during data fetch
- [ ] Error states handle failures gracefully

### Responsive Checklist
- [ ] Mobile (320px - 768px): Single column, hamburger menu
- [ ] Tablet (768px - 1024px): Two columns, sidebar visible
- [ ] Desktop (1024px+): Full layout, all features visible
- [ ] Text remains readable at all sizes
- [ ] Touch targets are 44px minimum on mobile

## 🎬 BUILD COMMAND SEQUENCE

```bash
# 1. Create the dashboard layout
"Create a dashboard layout with a teal gradient sidebar, white header with user menu, using the specifications in STEP 1"

# 2. Build the sidebar component
"Build the Sidebar component with navigation items, each having an icon, label, optional badge, and hover effects as specified"

# 3. Create the module cards
"Create ModuleCard component with hover animations, progress bars, alert badges, following the exact design in Module Card Design section"

# 4. Build the main dashboard
"Assemble the dashboard page with welcome section, metrics grid, module cards in a responsive grid, and activity feed as specified"

# 5. Add interactivity
"Add routing, loading states, error handling, and animations to make the dashboard fully interactive"
```

## ⚡ PERFORMANCE REQUIREMENTS

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- Bundle size: < 200KB for dashboard
- Smooth 60fps animations

## 🏁 DEFINITION OF DONE

The dashboard is complete when:
1. ✅ All module cards display with proper styling
2. ✅ Hover effects work smoothly
3. ✅ Navigation is fully functional
4. ✅ Responsive on all screen sizes
5. ✅ Loading states implemented
6. ✅ Error handling in place
7. ✅ Animations are smooth (60fps)
8. ✅ Accessibility standards met (ARIA labels, keyboard nav)
9. ✅ TypeScript types defined for all components
10. ✅ Code is clean and well-commented

---

## START NOW!

Begin with the dashboard layout structure. Focus on getting the layout perfect before moving to individual components. The dashboard is the heart of Nasara Connect - make it exceptional!