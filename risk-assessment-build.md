# RISK ASSESSMENT MODULE - COMPLETE BUILD SPECIFICATION

## MODULE OVERVIEW

Build a comprehensive Risk Assessment module that serves multiple firm types (investment firms, payment institutions, e-money institutions) with configurable fields based on permissions and size.

## DATABASE SCHEMA (ALREADY EXISTS)

```sql
-- Existing tables in your Neon database:
- risk_assessments (main risk register)
- risk_mitigation_actions (treatment plans)
- controls (control library)
- framework_control_mappings (risk-control linkage)
- audit_logs (full audit trail)
```

## COMPONENT ARCHITECTURE

```
src/app/(dashboard)/risk-assessment/
├── page.tsx                    // Main risk dashboard
├── components/
│   ├── RiskHeatMap.tsx        // 5x5 visual heat map
│   ├── RiskRegister.tsx       // Searchable data table
│   ├── RiskForm.tsx          // Create/edit risk form
│   ├── RiskDetails.tsx       // Detailed risk view
│   ├── MitigationPlan.tsx    // Action planning
│   ├── RiskFilters.tsx       // Advanced filtering
│   ├── RiskMetrics.tsx       // KPI dashboard
│   └── RiskReporting.tsx     // Report generation
├── hooks/
│   ├── useRiskData.ts        // Data fetching
│   └── useRiskCalculations.ts // Score calculations
└── lib/
    ├── riskConstants.ts       // Categories, scoring
    └── riskValidation.ts      // Zod schemas
```

## 1. RISK HEAT MAP COMPONENT

```typescript
// src/app/(dashboard)/risk-assessment/components/RiskHeatMap.tsx

interface HeatMapProps {
  risks: Risk[];
  view: 'inherent' | 'residual';
  onCellClick: (likelihood: number, impact: number) => void;
}

const RiskHeatMap = ({ risks, view, onCellClick }: HeatMapProps) => {
  // Create 5x5 grid
  const grid = Array(5).fill(null).map(() => Array(5).fill([]));
  
  // Populate grid with risks
  risks.forEach(risk => {
    const score = view === 'inherent' 
      ? { l: risk.likelihood, i: risk.impact }
      : { l: risk.residualLikelihood, i: risk.residualImpact };
    
    grid[5 - score.i][score.l - 1].push(risk);
  });
  
  // Color mapping
  const getCellColor = (l: number, i: number) => {
    const score = l * i;
    if (score <= 4) return 'bg-green-200 hover:bg-green-300';
    if (score <= 9) return 'bg-yellow-200 hover:bg-yellow-300';
    if (score <= 14) return 'bg-orange-200 hover:bg-orange-300';
    if (score <= 19) return 'bg-red-300 hover:bg-red-400';
    return 'bg-red-500 hover:bg-red-600';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Risk Heat Map</h3>
        <ToggleGroup value={view}>
          <ToggleGroupItem value="inherent">Inherent</ToggleGroupItem>
          <ToggleGroupItem value="residual">Residual</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="grid grid-cols-6 gap-1">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-around text-xs text-gray-600">
          <span>5-Severe</span>
          <span>4-Major</span>
          <span>3-Moderate</span>
          <span>2-Minor</span>
          <span>1-Negligible</span>
        </div>
        
        {/* Grid cells */}
        {grid.map((row, i) => 
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`
                relative aspect-square flex items-center justify-center
                border border-gray-300 cursor-pointer transition-all
                ${getCellColor(j + 1, 5 - i)}
              `}
              onClick={() => onCellClick(j + 1, 5 - i)}
            >
              <span className="text-lg font-bold">{cell.length || ''}</span>
              {cell.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 text-white text-xs">
                  View {cell.length} risk{cell.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))
        )}
        
        {/* X-axis labels */}
        <div></div>
        <span className="text-xs text-center">1-V.Unlikely</span>
        <span className="text-xs text-center">2-Unlikely</span>
        <span className="text-xs text-center">3-Possible</span>
        <span className="text-xs text-center">4-Likely</span>
        <span className="text-xs text-center">5-V.Likely</span>
      </div>
    </div>
  );
};
```

## 2. RISK REGISTER TABLE

```typescript
// src/app/(dashboard)/risk-assessment/components/RiskRegister.tsx

interface RiskRegisterProps {
  organizationId: string;
  permissions: string[]; // Firm's regulatory permissions
}

const RiskRegister = ({ organizationId, permissions }: RiskRegisterProps) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filters, setFilters] = useState<RiskFilters>({
    category: 'all',
    status: 'all',
    riskLevel: 'all',
    search: ''
  });
  
  const columns = [
    {
      header: 'Risk ID',
      accessor: 'riskId',
      cell: (risk) => (
        <span className="font-mono text-sm">{risk.riskId}</span>
      )
    },
    {
      header: 'Title',
      accessor: 'title',
      cell: (risk) => (
        <div>
          <p className="font-medium">{risk.title}</p>
          <p className="text-xs text-gray-500">{risk.category}</p>
        </div>
      )
    },
    {
      header: 'Inherent Risk',
      accessor: 'inherentRisk',
      cell: (risk) => {
        const score = risk.likelihood * risk.impact;
        return <RiskBadge score={score} />;
      }
    },
    {
      header: 'Controls',
      accessor: 'controls',
      cell: (risk) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{risk.controlCount || 0}</span>
          {risk.controlEffectiveness && (
            <ProgressBar value={risk.controlEffectiveness * 20} />
          )}
        </div>
      )
    },
    {
      header: 'Residual Risk',
      accessor: 'residualRisk',
      cell: (risk) => {
        const score = risk.residualLikelihood * risk.residualImpact;
        return <RiskBadge score={score} />;
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (risk) => (
        <StatusBadge status={risk.status} />
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (risk) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => viewRisk(risk)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => editRisk(risk)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => suggestMitigation(risk)}>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Risk Register</h2>
        <div className="flex gap-2">
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={openRiskForm} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" /> Add Risk
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <RiskFilters 
        filters={filters} 
        onChange={setFilters}
        categories={getRiskCategories(permissions)}
      />
      
      {/* Table */}
      <DataTable 
        columns={columns}
        data={filteredRisks}
        sortable
        pagination
      />
    </div>
  );
};
```

## 3. RISK FORM (CREATE/EDIT)

```typescript
// src/app/(dashboard)/risk-assessment/components/RiskForm.tsx

const riskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  category: z.enum(['operational', 'financial', 'compliance', 'strategic', 'conduct', 'prudential']),
  subCategory: z.string(),
  
  // Risk Assessment
  likelihood: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  velocity: z.enum(['slow', 'medium', 'fast']),
  
  // Business Context  
  businessUnit: z.string(),
  process: z.string(),
  riskOwner: z.string().uuid(),
  
  // Regulatory
  regulatoryCategory: z.array(z.string()).optional(),
  reportableToFCA: z.boolean(),
  consumerDutyRelevant: z.boolean(),
  
  // Monitoring
  keyRiskIndicators: z.array(z.object({
    name: z.string(),
    metric: z.string(),
    threshold: z.object({
      green: z.number(),
      amber: z.number(),
      red: z.number()
    }),
    currentValue: z.number()
  })),
  
  reviewFrequency: z.enum(['monthly', 'quarterly', 'semi-annually', 'annually'])
});

const RiskForm = ({ risk, onSave, organizationId }) => {
  const form = useForm<RiskFormData>({
    resolver: zodResolver(riskSchema),
    defaultValues: risk || getDefaultRiskValues()
  });
  
  // AI Enhancement
  const [aiSuggestions, setAiSuggestions] = useState(null);
  
  const generateAISuggestions = async () => {
    const response = await fetch('/api/ai/risk-analysis', {
      method: 'POST',
      body: JSON.stringify({
        title: form.watch('title'),
        description: form.watch('description'),
        category: form.watch('category')
      })
    });
    const suggestions = await response.json();
    setAiSuggestions(suggestions);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Identification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Title*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Clear, specific risk title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="Detailed description of the risk and potential consequences"
                    />
                  </FormControl>
                  <FormMessage />
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAISuggestions}
                    className="mt-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Risk Analysis
                  </Button>
                </FormItem>
              )}
            />
            
            {aiSuggestions && (
              <Alert className="bg-teal-50 border-teal-200">
                <AlertTitle>AI Suggestions</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Likelihood drivers: {aiSuggestions.drivers}</li>
                    <li>Potential impacts: {aiSuggestions.impacts}</li>
                    <li>Similar risks: {aiSuggestions.similar}</li>
                    <li>Suggested controls: {aiSuggestions.controls}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {/* Risk Scoring */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="likelihood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Likelihood (1-5)*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Unlikely (&lt;10%)</SelectItem>
                        <SelectItem value="2">2 - Unlikely (10-30%)</SelectItem>
                        <SelectItem value="3">3 - Possible (30-50%)</SelectItem>
                        <SelectItem value="4">4 - Likely (50-80%)</SelectItem>
                        <SelectItem value="5">5 - Very Likely (&gt;80%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact (1-5)*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Negligible</SelectItem>
                        <SelectItem value="2">2 - Minor</SelectItem>
                        <SelectItem value="3">3 - Moderate</SelectItem>
                        <SelectItem value="4">4 - Major</SelectItem>
                        <SelectItem value="5">5 - Severe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Inherent Risk Score Display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Inherent Risk Score</p>
              <p className="text-2xl font-bold">
                {form.watch('likelihood') * form.watch('impact')}
              </p>
              <RiskBadge score={form.watch('likelihood') * form.watch('impact')} />
            </div>
          </CardContent>
        </Card>
        
        {/* Submit */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
            Save Risk
          </Button>
        </div>
      </form>
    </Form>
  );
};
```

## 4. RISK CATEGORIES BY FIRM TYPE

```typescript
// src/app/(dashboard)/risk-assessment/lib/riskConstants.ts

export const getRiskCategories = (permissions: string[]): RiskCategory[] => {
  const baseCategories = [
    {
      id: 'operational',
      name: 'Operational Risk',
      subCategories: [
        'Process Failure',
        'System Failure',
        'People Risk',
        'External Events',
        'Outsourcing Risk'
      ],
      fcaReference: 'SYSC 7.1.18'
    },
    {
      id: 'compliance',
      name: 'Compliance Risk',
      subCategories: [
        'Regulatory Change',
        'Breach of Rules',
        'Record Keeping',
        'Reporting Failure'
      ],
      fcaReference: 'SYSC 6.1'
    }
  ];
  
  // Add permission-specific categories
  if (permissions.includes('investment_services')) {
    baseCategories.push({
      id: 'prudential',
      name: 'Prudential Risk',
      subCategories: [
        'Credit Risk',
        'Market Risk',
        'Liquidity Risk',
        'Capital Adequacy'
      ],
      fcaReference: 'MIFIDPRU 7'
    });
  }
  
  if (permissions.includes('client_money')) {
    baseCategories.push({
      id: 'clientAssets',
      name: 'Client Assets Risk',
      subCategories: [
        'Segregation Failure',
        'Reconciliation Issues',
        'Client Money Breach'
      ],
      fcaReference: 'CASS 7'
    });
  }
  
  if (permissions.includes('payment_services')) {
    baseCategories.push({
      id: 'paymentRisk',
      name: 'Payment Risk',
      subCategories: [
        'Settlement Risk',
        'Fraud Risk',
        'PSD2 Compliance'
      ],
      fcaReference: 'PSR Requirements'
    });
  }
  
  return baseCategories;
};
```

## 5. KEY RISK INDICATORS (KRIs)

```typescript
// src/app/(dashboard)/risk-assessment/components/KRIManager.tsx

interface KRIManagerProps {
  riskId: string;
  kris: KeyRiskIndicator[];
  onUpdate: (kris: KeyRiskIndicator[]) => void;
}

const KRIManager = ({ riskId, kris, onUpdate }: KRIManagerProps) => {
  const [selectedKRI, setSelectedKRI] = useState<KeyRiskIndicator | null>(null);
  
  const commonKRIs = [
    {
      category: 'Operational',
      indicators: [
        { name: 'System Downtime', metric: 'Hours/Month' },
        { name: 'Failed Transactions', metric: 'Count/Day' },
        { name: 'Processing Errors', metric: '% of Total' }
      ]
    },
    {
      category: 'Compliance',
      indicators: [
        { name: 'Overdue Actions', metric: 'Count' },
        { name: 'Training Completion', metric: '%' },
        { name: 'Breach Count', metric: 'Number/Quarter' }
      ]
    },
    {
      category: 'Financial Crime',
      indicators: [
        { name: 'SAR Submissions', metric: 'Count/Month' },
        { name: 'PEP Matches', metric: 'Count' },
        { name: 'Sanctions Alerts', metric: 'Count/Day' }
      ]
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Key Risk Indicators</h3>
        <Button size="sm" onClick={() => setSelectedKRI({})}>
          <Plus className="w-4 h-4 mr-2" /> Add KRI
        </Button>
      </div>
      
      {/* KRI List */}
      <div className="grid gap-3">
        {kris.map((kri, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{kri.name}</h4>
                <p className="text-sm text-gray-600">{kri.metric}</p>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-green-600">Green: ≤{kri.threshold.green}</span>
                  <span className="text-amber-600">Amber: ≤{kri.threshold.amber}</span>
                  <span className="text-red-600">Red: >{kri.threshold.amber}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{kri.currentValue}</p>
                <TrendIndicator trend={kri.trend} />
              </div>
            </div>
            <Progress 
              value={calculateKRIHealth(kri)} 
              className="mt-3"
              indicatorColor={getKRIColor(kri)}
            />
          </Card>
        ))}
      </div>
      
      {/* Quick Add Templates */}
      <Collapsible>
        <CollapsibleTrigger>
          <Button variant="outline" size="sm">
            Browse KRI Templates
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-2">
            {commonKRIs.map(category => (
              <div key={category.category}>
                <p className="text-sm font-medium text-gray-700">{category.category}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {category.indicators.map(ind => (
                    <Button
                      key={ind.name}
                      size="sm"
                      variant="outline"
                      onClick={() => addKRIFromTemplate(ind)}
                    >
                      {ind.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
```

## 6. AI-POWERED MITIGATION SUGGESTIONS

```typescript
// src/app/api/ai/risk-mitigation/route.ts

export async function POST(request: Request) {
  const { risk, organizationType, permissions } = await request.json();
  
  const systemPrompt = `
    You are a UK financial services risk expert familiar with FCA regulations.
    The firm type is: ${organizationType}
    They hold these permissions: ${permissions.join(', ')}
    
    Provide practical, FCA-compliant mitigation strategies.
    Reference specific SYSC rules where applicable.
    Consider proportionality based on firm size.
  `;
  
  const userPrompt = `
    Risk: ${risk.title}
    Description: ${risk.description}
    Category: ${risk.category}
    Inherent Score: ${risk.likelihood * risk.impact}
    
    Suggest:
    1. 3-5 preventive controls
    2. 2-3 detective controls  
    3. Corrective actions if risk materializes
    4. Relevant FCA guidance/requirements
    5. Industry best practices
  `;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7
  });
  
  return NextResponse.json({
    mitigations: completion.choices[0].message.content
  });
}
```

## 7. RISK REPORTING DASHBOARD

```typescript
// src/app/(dashboard)/risk-assessment/components/RiskMetrics.tsx

const RiskMetrics = ({ organizationId }: { organizationId: string }) => {
  const metrics = useRiskMetrics(organizationId);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Active Risks"
        value={metrics.totalRisks}
        change={metrics.riskChange}
        icon={AlertTriangle}
        color="orange"
      />
      
      <MetricCard
        title="High/Critical Risks"
        value={metrics.highRisks}
        change={metrics.highRiskChange}
        icon={AlertCircle}
        color="red"
        alert={metrics.highRisks > 5}
      />
      
      <MetricCard
        title="Overdue Actions"
        value={metrics.overdueActions}
        icon={Clock}
        color="amber"
        alert={metrics.overdueActions > 0}
      />
      
      <MetricCard
        title="Control Effectiveness"
        value={`${metrics.controlEffectiveness}%`}
        change={metrics.effectivenessChange}
        icon={Shield}
        color="green"
      />
      
      {/* Risk by Category Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={metrics.risksByCategory} />
        </CardContent>
      </Card>
      
      {/* Risk Trend Chart */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Risk Trend (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={metrics.riskTrend} />
        </CardContent>
      </Card>
    </div>
  );
};
```

## BUILD SEQUENCE FOR AI CODER

```bash
# Step 1: Create base structure
"Create the risk assessment module structure with all component files as specified in COMPONENT ARCHITECTURE"

# Step 2: Build constants and types
"Create riskConstants.ts with FCA-aligned risk categories, scoring matrices, and status definitions"

# Step 3: Build Heat Map
"Build the RiskHeatMap component with 5x5 grid, color coding, and interactive cells"

# Step 4: Build Risk Register
"Create RiskRegister component with sortable table, filters, and action buttons"

# Step 5: Build Risk Form
"Create comprehensive RiskForm with all fields, validation, and AI integration"

# Step 6: Add KRI Management
"Build KRIManager component with templates and threshold monitoring"

# Step 7: Add Reporting
"Create RiskMetrics dashboard with charts and key metrics"

# Step 8: API Integration
"Add API routes for risk CRUD operations and AI suggestions"
```

## TESTING CHECKLIST

- [ ] Heat map correctly displays risk distribution
- [ ] Risk scores calculate correctly (L × I)
- [ ] Filters work across all risk fields
- [ ] Form validation catches invalid inputs
- [ ] AI suggestions load within 3 seconds
- [ ] Export to Excel maintains formatting
- [ ] Mobile responsive on all screens
- [ ] Audit trail captures all changes
- [ ] Different firm types see appropriate categories
- [ ] KRIs update and show trends

---

This comprehensive Risk Assessment module will serve as the foundation for your GRC platform, with full FCA compliance built in from the start.