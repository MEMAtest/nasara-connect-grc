# POLICY MODULE - AI AGENT BUILD INSTRUCTIONS

## MODULE OVERVIEW

Build a comprehensive Policy Management System that dynamically adapts to firm permissions, integrates with Risk Assessment and other modules, and ensures all FCA-required policies are maintained as living documents.

## CRITICAL INTEGRATION POINTS

### 1. Permission System (MUST BUILD FIRST)
```typescript
// src/lib/permissions.ts
// This drives EVERYTHING - policies, risks, controls, training

interface FirmPermissions {
  // Core permission categories
  investmentServices: boolean;
  paymentServices: boolean;
  eMoney: boolean;
  creditBroking: boolean;
  clientMoney: boolean;
  clientAssets: boolean;
  insuranceMediation: boolean;
  mortgageMediation: boolean;
  
  // Specific activities
  dealingAsAgent: boolean;
  dealingAsPrincipal: boolean;
  arrangingDeals: boolean;
  advising: boolean;
  managing: boolean;
  safeguarding: boolean;
  
  // Additional flags
  retailClients: boolean;
  professionalClients: boolean;
  eligibleCounterparties: boolean;
  complexProducts: boolean;
}

// Permission-driven policy requirements
export function getRequiredPolicies(permissions: FirmPermissions): PolicyRequirement[] {
  const required: PolicyRequirement[] = [];
  
  // EVERYONE needs these 7 core policies
  required.push(
    { code: 'RISK_MGMT', name: 'Risk Management Framework', mandatory: true },
    { code: 'COMPLIANCE_MON', name: 'Compliance Monitoring Plan', mandatory: true },
    { code: 'CONFLICTS', name: 'Conflicts of Interest', mandatory: true },
    { code: 'OUTSOURCING', name: 'Outsourcing & Third Party', mandatory: true },
    { code: 'BCP_RESILIENCE', name: 'Business Continuity & Op Resilience', mandatory: true },
    { code: 'INFO_SECURITY', name: 'Information & Cyber Security', mandatory: true },
    { code: 'AML_CTF', name: 'Anti-Money Laundering', mandatory: true }
  );
  
  // Permission-specific policies
  if (permissions.paymentServices || permissions.eMoney) {
    required.push(
      { code: 'SAFEGUARDING', name: 'Safeguarding Policy', mandatory: true },
      { code: 'OP_SEC_RISK', name: 'Operational & Security Risk', mandatory: true }
    );
  }
  
  if (permissions.investmentServices) {
    required.push(
      { code: 'MARKET_ABUSE', name: 'Market Abuse Policy', mandatory: true },
      { code: 'INDUCEMENTS', name: 'Inducements Policy', mandatory: true },
      { code: 'BEST_EXECUTION', name: 'Best Execution Policy', mandatory: true }
    );
  }
  
  if (permissions.clientMoney || permissions.clientAssets) {
    required.push(
      { code: 'CASS', name: 'Client Assets Policy', mandatory: true },
      { code: 'CASS_RESOLUTION', name: 'CASS Resolution Pack', mandatory: true }
    );
  }
  
  if (permissions.retailClients) {
    required.push(
      { code: 'CONSUMER_DUTY', name: 'Consumer Duty Framework', mandatory: true },
      { code: 'VULNERABLE_CUST', name: 'Vulnerable Customers', mandatory: true },
      { code: 'COMPLAINTS', name: 'Complaints Handling', mandatory: true },
      { code: 'FIN_PROMOTIONS', name: 'Financial Promotions', mandatory: true }
    );
  }
  
  if (permissions.complexProducts) {
    required.push(
      { code: 'PRODUCT_GOV', name: 'Product Governance', mandatory: true },
      { code: 'TARGET_MARKET', name: 'Target Market Assessment', mandatory: true }
    );
  }
  
  return required;
}
```

### 2. Dashboard Integration
```typescript
// src/app/(dashboard)/page.tsx
// ADD to existing dashboard

const PolicyModuleCard = () => {
  const { policyMetrics } = usePolicyMetrics();
  
  return (
    <ModuleCard
      title="Policy Management"
      icon={FileText}
      color="indigo"
      route="/policies"
      alerts={policyMetrics.overdue + policyMetrics.gaps}
      progress={policyMetrics.completionRate}
      metrics={[
        { label: 'Policies', value: policyMetrics.total },
        { label: 'Overdue', value: policyMetrics.overdue, alert: true },
        { label: 'Gaps', value: policyMetrics.gaps, alert: true }
      ]}
    />
  );
};
```

### 3. Risk Assessment Integration
```typescript
// src/app/(dashboard)/risk-assessment/components/RiskForm.tsx
// ADD policy linking to risk form

const RiskPolicyMapping = ({ riskId, riskCategory }) => {
  const relevantPolicies = getRelevantPolicies(riskCategory);
  
  return (
    <FormField
      name="linkedPolicies"
      label="Related Policies"
      helpText="Link policies that govern this risk"
    >
      <MultiSelect
        options={relevantPolicies}
        onChange={(selected) => linkPoliciesToRisk(riskId, selected)}
      />
    </FormField>
  );
};

// When a risk score changes, trigger policy review
const handleRiskScoreChange = async (riskId: string, newScore: number) => {
  if (newScore >= 15) { // High or Critical
    const linkedPolicies = await getLinkedPolicies(riskId);
    linkedPolicies.forEach(policy => {
      triggerPolicyReview(policy.id, 'high_risk_trigger');
    });
  }
};
```

## DATABASE SCHEMA

```sql
-- Core policy tables
CREATE TABLE policy_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Core permissions
  investment_services BOOLEAN DEFAULT FALSE,
  payment_services BOOLEAN DEFAULT FALSE,
  e_money BOOLEAN DEFAULT FALSE,
  credit_broking BOOLEAN DEFAULT FALSE,
  client_money BOOLEAN DEFAULT FALSE,
  client_assets BOOLEAN DEFAULT FALSE,
  insurance_mediation BOOLEAN DEFAULT FALSE,
  mortgage_mediation BOOLEAN DEFAULT FALSE,
  
  -- Specific activities
  dealing_as_agent BOOLEAN DEFAULT FALSE,
  dealing_as_principal BOOLEAN DEFAULT FALSE,
  arranging_deals BOOLEAN DEFAULT FALSE,
  advising BOOLEAN DEFAULT FALSE,
  managing BOOLEAN DEFAULT FALSE,
  safeguarding BOOLEAN DEFAULT FALSE,
  
  -- Client types
  retail_clients BOOLEAN DEFAULT FALSE,
  professional_clients BOOLEAN DEFAULT FALSE,
  eligible_counterparties BOOLEAN DEFAULT FALSE,
  complex_products BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id)
);

-- Policy clause library
CREATE TABLE policy_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  content TEXT NOT NULL,
  fca_reference TEXT[],
  applicable_to TEXT[], -- Which policies can use this
  is_mandatory BOOLEAN DEFAULT FALSE,
  version VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy approval workflows
CREATE TABLE policy_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES policies(id),
  approval_level INTEGER NOT NULL, -- 1=Draft, 2=Review, 3=Approve, 4=SMF Sign-off
  approver_id UUID REFERENCES users(id),
  smf_function VARCHAR(50), -- SMF1, SMF3, SMF16, SMF17, etc
  status VARCHAR(50), -- pending, approved, rejected, conditional
  comments TEXT,
  conditions TEXT, -- If conditional approval
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(policy_id, approval_level)
);

-- Policy effectiveness tracking
CREATE TABLE policy_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES policies(id),
  measurement_date DATE,
  compliance_rate DECIMAL(5,2), -- % attestations completed
  breach_count INTEGER,
  incident_count INTEGER,
  training_completion DECIMAL(5,2),
  control_effectiveness DECIMAL(5,2),
  overall_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy testing
CREATE TABLE policy_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES policies(id),
  test_date DATE,
  test_type VARCHAR(50), -- walkthrough, sample_testing, full_review
  sample_size INTEGER,
  pass_count INTEGER,
  fail_count INTEGER,
  findings JSONB,
  remediation_required BOOLEAN DEFAULT FALSE,
  tester_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Policy change triggers
CREATE TABLE policy_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type VARCHAR(50), -- regulatory_change, incident, risk_change, control_failure
  trigger_source VARCHAR(100), -- module that triggered
  trigger_id UUID, -- ID in source module
  policy_id UUID REFERENCES policies(id),
  action_required VARCHAR(100), -- review, update, urgent_review
  reason TEXT,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
```

## COMPONENT STRUCTURE

```
src/app/(dashboard)/policies/
├── page.tsx                              # Policy dashboard
├── permissions/
│   └── page.tsx                         # Permission management
├── wizard/
│   └── page.tsx                         # Policy creation wizard
├── quick-setup/
│   └── page.tsx                         # Quick setup packages
├── [policyId]/
│   ├── page.tsx                         # Policy viewer
│   ├── edit/page.tsx                    # Policy editor
│   ├── review/page.tsx                  # Review workflow
│   ├── test/page.tsx                    # Testing interface
│   └── effectiveness/page.tsx           # Effectiveness metrics
├── gap-analysis/
│   └── page.tsx                         # Gap analysis dashboard
├── clauses/
│   └── page.tsx                         # Clause library
├── components/
│   ├── PermissionSelector.tsx          # Set firm permissions
│   ├── PolicyWizard/
│   │   ├── StepSelector.tsx            # Choose policy type
│   │   ├── StepPermissionCheck.tsx     # Verify applicability
│   │   ├── StepContent.tsx             # Build content
│   │   ├── StepClauses.tsx            # Select from library
│   │   ├── StepMapping.tsx            # Link risks/controls
│   │   ├── StepApprovals.tsx          # Set workflow
│   │   └── StepReview.tsx             # Final review
│   ├── QuickSetupPackages.tsx         # Pre-built bundles
│   ├── PolicyEditor.tsx               # Rich editor with AI
│   ├── ClauseLibrary.tsx              # Reusable clauses
│   ├── ApprovalWorkflow.tsx           # Multi-level approvals
│   ├── PolicyTester.tsx               # Testing interface
│   ├── EffectivenessTracker.tsx       # Metrics dashboard
│   └── PolicyIntegrations.tsx         # Module connections
└── lib/
    ├── policyTemplates.ts              # 17 FCA templates
    ├── policyPackages.ts               # Quick setup bundles
    ├── policyValidation.ts             # Content validation
    └── policyTriggers.ts               # Auto-review triggers
```

## POLICY WIZARD - STEP BY STEP

### Step 1: Permission Verification
```typescript
const StepPermissionCheck = ({ organization }) => {
  const [permissions, setPermissions] = useState<FirmPermissions>();
  
  return (
    <div>
      <h3>Confirm Your Firm's Permissions</h3>
      <p className="text-sm text-gray-600 mb-4">
        Your policy requirements depend on your FCA permissions
      </p>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-3">Core Activities</h4>
          <div className="grid grid-cols-2 gap-3">
            <Checkbox
              label="Investment Services"
              checked={permissions.investmentServices}
              onChange={(v) => updatePermission('investmentServices', v)}
            />
            <Checkbox
              label="Payment Services"
              checked={permissions.paymentServices}
              onChange={(v) => updatePermission('paymentServices', v)}
            />
            {/* ... other permissions */}
          </div>
        </div>
        
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Based on selections: {calculateRequiredPolicies(permissions).length} policies required
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
```

### Step 2: Policy Selection with Requirements
```typescript
const StepSelector = ({ permissions, existingPolicies }) => {
  const requiredPolicies = getRequiredPolicies(permissions);
  
  return (
    <div>
      <Tabs defaultValue="required">
        <TabsList>
          <TabsItem value="required">Required ({requiredPolicies.filter(p => !p.exists).length})</TabsItem>
          <TabsItem value="recommended">Recommended</TabsItem>
          <TabsItem value="all">All Policies</TabsItem>
        </TabsList>
        
        <TabsContent value="required">
          {requiredPolicies.map(policy => (
            <PolicyCard
              key={policy.code}
              policy={policy}
              status={getPolicyStatus(policy)}
              badge={
                policy.mandatory ? <Badge variant="destructive">Mandatory</Badge> :
                policy.recommended ? <Badge variant="warning">Recommended</Badge> : null
              }
              action={
                !policy.exists ? "Create" :
                policy.needsReview ? "Review" :
                "Up to date"
              }
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### Step 3: Content Builder with Clause Library
```typescript
const StepContent = ({ template, permissions }) => {
  const [selectedClauses, setSelectedClauses] = useState([]);
  const availableClauses = getApplicableClauses(template.code, permissions);
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="col-span-2">
        <RichTextEditor
          template={template}
          permissions={permissions}
          onAIRequest={(section) => generateAIContent(section, permissions)}
        />
      </div>
      
      {/* Clause Library Sidebar */}
      <div>
        <h4 className="font-medium mb-3">Clause Library</h4>
        <div className="space-y-2">
          {availableClauses.map(clause => (
            <ClauseCard
              key={clause.id}
              clause={clause}
              onInsert={() => insertClause(clause)}
              mandatory={clause.isMandatory}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => openClauseCreator()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Clause
        </Button>
      </div>
    </div>
  );
};
```

### Step 4: Multi-Level Approval Setup
```typescript
const StepApprovals = ({ policy, organization }) => {
  const smfRoles = getSMFRoles(organization);
  
  const approvalLevels = [
    { level: 1, role: 'Drafter', description: 'Creates initial content' },
    { level: 2, role: 'Reviewer', description: 'Technical review' },
    { level: 3, role: 'Approver', description: 'Business approval' },
    { level: 4, role: 'SMF Sign-off', description: 'Senior manager attestation' }
  ];
  
  return (
    <div>
      <h3>Approval Workflow</h3>
      
      {approvalLevels.map(level => (
        <div key={level.level} className="p-4 border rounded-lg mb-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{level.role}</h4>
              <p className="text-sm text-gray-600">{level.description}</p>
            </div>
            
            {level.role === 'SMF Sign-off' ? (
              <Select
                value={policy.smfApprover}
                onChange={(v) => setApprover(level.level, v)}
              >
                {smfRoles.map(smf => (
                  <SelectItem key={smf.id} value={smf.id}>
                    {smf.name} ({smf.function})
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <UserSelector
                role={level.role}
                onChange={(userId) => setApprover(level.level, userId)}
              />
            )}
          </div>
          
          {level.role === 'SMF Sign-off' && (
            <Alert className="mt-2 bg-amber-50">
              <AlertDescription>
                SMF must attest: "I confirm this policy meets regulatory requirements"
              </AlertDescription>
            </Alert>
          )}
        </div>
      ))}
    </div>
  );
};
```

## QUICK SETUP PACKAGES

```typescript
// src/app/(dashboard)/policies/quick-setup/page.tsx

const QuickSetupPackages = () => {
  const packages = [
    {
      id: 'payment_institution',
      name: 'Payment Institution Starter',
      description: 'Complete policy pack for payment services',
      permissions: ['paymentServices', 'safeguarding'],
      policies: ['RISK_MGMT', 'AML_CTF', 'SAFEGUARDING', 'OP_SEC_RISK', ...],
      price: 'included',
      setupTime: '2 hours'
    },
    {
      id: 'investment_firm',
      name: 'Investment Firm Package',
      description: 'MiFID-compliant policy framework',
      permissions: ['investmentServices', 'clientMoney'],
      policies: ['RISK_MGMT', 'MARKET_ABUSE', 'BEST_EXECUTION', 'CASS', ...],
      price: 'included',
      setupTime: '3 hours'
    },
    {
      id: 'crypto_firm',
      name: 'Crypto Asset Firm',
      description: 'Policies for crypto asset businesses',
      permissions: ['cryptoAssets', 'clientMoney'],
      policies: ['RISK_MGMT', 'AML_CTF', 'CRYPTO_SPECIFIC', ...],
      price: 'premium',
      setupTime: '3 hours'
    }
  ];
  
  const handlePackageSetup = async (packageId: string) => {
    // 1. Set organization permissions
    // 2. Create all policies from templates
    // 3. Pre-populate with standard clauses
    // 4. Set review schedules
    // 5. Assign default owners
    // 6. Create implementation checklist
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map(pkg => (
        <Card key={pkg.id}>
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <Badge>{pkg.policies.length} Policies</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Setup Time:</span>
                <span className="font-medium">{pkg.setupTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Includes:</span>
                <span className="font-medium">Templates + Checklists</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => handlePackageSetup(pkg.id)}
            >
              Start Setup Wizard
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

## LIVING DOCUMENT TRIGGERS

```typescript
// src/app/(dashboard)/policies/lib/policyTriggers.ts

export const POLICY_TRIGGERS = {
  // From Risk Module
  riskScoreIncrease: (risk: Risk) => {
    if (risk.score >= 15) {
      return {
        action: 'urgent_review',
        policies: getLinkedPolicies(risk.id),
        reason: `High risk identified: ${risk.title}`,
        deadline: addDays(new Date(), 7)
      };
    }
  },
  
  // From Incident Module
  incidentOccurred: (incident: Incident) => {
    const affectedPolicies = getPoliciesForCategory(incident.category);
    return {
      action: 'review',
      policies: affectedPolicies,
      reason: `Incident: ${incident.title}`,
      deadline: addDays(new Date(), 30)
    };
  },
  
  // From Control Module
  controlFailure: (control: Control) => {
    if (control.effectiveness < 3) {
      return {
        action: 'update',
        policies: control.linkedPolicies,
        reason: `Control ineffective: ${control.name}`,
        deadline: addDays(new Date(), 14)
      };
    }
  },
  
  // From Regulatory News Module
  regulatoryChange: (update: RegulatoryUpdate) => {
    const impactedPolicies = matchPoliciesToRegulation(update.references);
    return {
      action: 'mandatory_update',
      policies: impactedPolicies,
      reason: `New regulation: ${update.title}`,
      deadline: update.effectiveDate
    };
  },
  
  // Time-based
  scheduledReview: (policy: Policy) => {
    const daysSinceReview = daysSince(policy.lastReviewDate);
    if (daysSinceReview >= policy.reviewFrequencyDays) {
      return {
        action: 'scheduled_review',
        policies: [policy],
        reason: 'Scheduled review due',
        deadline: new Date()
      };
    }
  }
};
```

## POLICY EFFECTIVENESS SCORING

```typescript
// src/app/(dashboard)/policies/components/EffectivenessTracker.tsx

const PolicyEffectivenessScore = ({ policyId }) => {
  const metrics = usePolicyMetrics(policyId);
  
  // Calculate weighted score
  const score = calculateEffectivenessScore({
    attestationRate: metrics.attestationRate * 0.2,      // 20% weight
    breachCount: (100 - metrics.breaches * 10) * 0.3,   // 30% weight
    trainingCompletion: metrics.training * 0.2,          // 20% weight
    controlEffectiveness: metrics.controls * 0.2,        // 20% weight
    testResults: metrics.lastTestScore * 0.1             // 10% weight
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy Effectiveness</CardTitle>
        <div className="text-3xl font-bold">
          {score}%
          <TrendIndicator value={metrics.trend} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <MetricRow
            label="Attestation Compliance"
            value={metrics.attestationRate}
            target={95}
            status={metrics.attestationRate >= 95 ? 'green' : 'amber'}
          />
          <MetricRow
            label="Related Breaches"
            value={metrics.breaches}
            target={0}
            status={metrics.breaches === 0 ? 'green' : 'red'}
          />
          <MetricRow
            label="Training Completion"
            value={metrics.training}
            target={90}
            status={metrics.training >= 90 ? 'green' : 'amber'}
          />
          <MetricRow
            label="Control Effectiveness"
            value={metrics.controls}
            target={80}
            status={metrics.controls >= 80 ? 'green' : 'amber'}
          />
          
          {score < 70 && (
            <Alert className="mt-4 bg-red-50">
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Policy effectiveness below threshold. Immediate review recommended.
              </AlertDescription>
              <Button size="sm" className="mt-2">
                Start Review
              </Button>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

## AI INTEGRATION FOR POLICIES

```typescript
// src/app/api/ai/policy-assistant/route.ts

export async function POST(request: Request) {
  const { action, context } = await request.json();
  
  switch (action) {
    case 'generate_content':
      return generatePolicyContent(context);
    
    case 'review_policy':
      return reviewPolicyCompliance(context);
    
    case 'suggest_updates':
      return suggestPolicyUpdates(context);
    
    case 'gap_analysis':
      return performGapAnalysis(context);
    
    case 'benchmark':
      return benchmarkPolicy(context);
  }
}

async function generatePolicyContent({ template, section, permissions, firmContext }) {
  const prompt = `
    Generate policy content for ${template.name}, section: ${section.title}
    
    Firm context:
    - Type: ${firmContext.type}
    - Size: ${firmContext.size}
    - Permissions: ${permissions.join(', ')}
    
    Requirements:
    - Must reference specific FCA rules
    - Include practical implementation steps
    - Consider proportionality for firm size
    - Avoid generic language
    
    Section requirements:
    ${section.requirements.join('\n')}
    
    Good practices to include:
    ${template.goodPractices.join('\n')}
    
    Pitfalls to avoid:
    ${template.commonPitfalls.join('\n')}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: FCA_EXPERT_PROMPT },
      { role: "user", content: prompt }
    ]
  });
  
  return NextResponse.json({
    content: response.choices[0].message.content,
    fcaReferences: extractFCAReferences(response),
    implementationChecklist: generateChecklist(response)
  });
}
```

## IMPLEMENTATION CHECKLISTS

```typescript
// Each policy includes implementation checklist
interface PolicyChecklist {
  policyId: string;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  category: 'people' | 'process' | 'technology' | 'governance';
  task: string;
  description: string;
  owner: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  evidence?: string;
  dependencies?: string[];
}

// Example for AML Policy
const AML_IMPLEMENTATION_CHECKLIST = [
  {
    category: 'people',
    task: 'Appoint MLRO',
    description: 'Nominate and register Money Laundering Reporting Officer with FCA',
    criticality: 'critical'
  },
  {
    category: 'process',
    task: 'Create CDD procedures',
    description: 'Document customer due diligence procedures for all customer types',
    criticality: 'critical'
  },
  {
    category: 'technology',
    task: 'Implement screening system',
    description: 'Deploy sanctions and PEP screening solution',
    criticality: 'high'
  },
  {
    category: 'governance',
    task: 'Board approval',
    description: 'Present policy to board for formal approval and sign-off',
    criticality: 'critical'
  }
];
```

## BUILD COMMANDS FOR AI AGENT

```bash
# Step 1: Create permission system
"Build the permission management system that determines which policies each firm needs based on their FCA permissions"

# Step 2: Build policy wizard
"Create the multi-step PolicyWizard with permission checking, template selection, content builder with clause library, and multi-level approval workflow"

# Step 3: Create quick setup packages
"Build QuickSetupPackages with pre-configured policy bundles for common firm types"

# Step 4: Implement clause library
"Create the clause library system with mandatory and optional clauses that can be inserted into policies"

# Step 5: Add living document triggers
"Implement the trigger system that monitors other modules and automatically flags policies for review"

# Step 6: Build effectiveness tracking
"Create PolicyEffectivenessScore component that tracks attestations, breaches, training, and control effectiveness"

# Step 7: Integrate with other modules
"Add policy integration points to Risk Assessment, Dashboard, and Compliance Framework modules"

# Step 8: Add AI assistance
"Implement AI-powered content generation, review, and gap analysis features"
```

## CRITICAL SUCCESS FACTORS

1. **Permission-Driven**: Everything adapts to firm permissions
2. **Living Documents**: Auto-triggers from risks, incidents, regulations
3. **Multi-Level Approval**: Proper governance with SMF sign-off
4. **Clause Reusability**: Build once, use across policies
5. **Integration**: Deep links with Risk, Controls, Training
6. **Effectiveness Tracking**: Not just having policies, but proving they work
7. **Quick Setup**: Get firms compliant in hours, not weeks

## TESTING REQUIREMENTS

- [ ] Permission system correctly identifies required policies
- [ ] Wizard creates complete, FCA-compliant policies
- [ ] Clause library inserts correctly into policies
- [ ] Approval workflow enforces all levels
- [ ] Triggers fire from other modules
- [ ] Effectiveness score calculates correctly
- [ ] Quick setup packages deploy all policies
- [ ] AI generates relevant, compliant content
- [ ] Policies export in FCA-ready format
- [ ] Attestation tracking works across organization

---

This Policy Module becomes the compliance backbone, ensuring firms don't just have policies as PDFs in a folder, but as living, integrated documents that adapt to their business and regulatory changes.