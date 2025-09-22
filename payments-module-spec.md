# Payments Module Specification
## B2B Money Remittance Service Integration

### Executive Summary
The Payments Module transforms Nasara Connect into a comprehensive fintech platform by adding FCA-authorized money remittance capabilities. This module enables B2B international payments with embedded compliance checks, operating under Payment Institution authorization for money remittance services.

---

## 1. Module Architecture Overview

### 1.1 Core Components
```yaml
payment_framework:
  verification_layer:
    coverage: "KYC/KYB verification for payment access"
    integration: "Companies House, document upload"
    max_file_size: "30MB"
    
  payment_engine:
    base_currency: "GBP"
    supported_currencies: ["EUR", "USD", "JPY", "AUD"]
    processing_time: "Up to 1 hour"
    
  compliance_layer:
    checks: ["AML", "Sanctions", "Risk Scoring"]
    reporting: "Automatic regulatory reports"
    audit_trail: "Full transaction history"
    
  user_interface:
    entry_point: "Dashboard card 'Pay Suppliers'"
    navigation: "Sidebar 'Payments' option"
    status_management: "KYC states and notifications"
```

### 1.2 Regulatory Framework
```yaml
authorization:
  type: "Payment Institution"
  services: "Money Remittance (B2B only)"
  regulator: "FCA"
  
  requirements:
    safeguarding: "Client funds segregation"
    capital: "Initial capital + ongoing requirements"
    reporting: "Transaction reports, SAR filing"
    
  restrictions:
    no_consumer_remittance: true
    b2b_only: true
    max_transaction_limits: "Per risk assessment"
```

---

## 2. Identity & Verification Layer

### 2.1 KYC/KYB Verification System
```typescript
interface VerificationSystem {
  business_verification: {
    companies_house: {
      checks: [
        "Company number validation",
        "Director verification",
        "Registered address confirmation",
        "Active status check"
      ];
      
      api_integration: {
        endpoint: "https://api.companieshouse.gov.uk",
        rate_limit: "600 requests per 5 minutes",
        cache_duration: "24 hours"
      };
    };
    
    document_requirements: {
      mandatory: [
        {
          type: "certificate_of_incorporation",
          format: ["PDF", "JPG", "PNG"],
          max_size: "30MB"
        },
        {
          type: "proof_of_address",
          format: ["PDF", "JPG"],
          max_age_days: 90
        },
        {
          type: "bank_statement",
          format: ["PDF"],
          requirements: "Last 3 months"
        }
      ];
      
      conditional: [
        {
          type: "shareholders_agreement",
          when: "Complex ownership structure"
        },
        {
          type: "source_of_funds",
          when: "High risk jurisdiction"
        }
      ];
    };
  };
  
  individual_verification: {
    directors: {
      required_checks: [
        "Identity verification",
        "PEP screening",
        "Sanctions screening",
        "Adverse media"
      ];
      
      documents: [
        "Passport or driving license",
        "Proof of address"
      ];
    };
    
    authorized_persons: {
      checks: "Similar to directors",
      authorization: "Written mandate required"
    };
  };
}
```

### 2.2 Verification Workflow
```typescript
class VerificationWorkflow {
  async initiateVerification(organizationId: string): Promise<VerificationResult> {
    // Step 1: Check existing GRC verification
    const existingKYC = await this.checkGRCVerification(organizationId);
    if (existingKYC.complete && !existingKYC.expired) {
      return { status: 'approved', reuseExisting: true };
    }
    
    // Step 2: Companies House verification
    const companyData = await this.verifyWithCompaniesHouse(organizationId);
    
    // Step 3: Document collection
    const documents = await this.collectDocuments({
      required: this.getRequiredDocuments(companyData),
      portal: this.documentUploadPortal
    });
    
    // Step 4: Individual verification
    const individuals = await this.verifyIndividuals(companyData.directors);
    
    // Step 5: Risk assessment
    const riskScore = await this.calculateRiskScore({
      company: companyData,
      documents: documents,
      individuals: individuals
    });
    
    // Step 6: Approval workflow
    return await this.processApproval({
      riskScore,
      autoApprove: riskScore < 30,
      manualReview: riskScore >= 30
    });
  }
  
  async monitorOngoing(organizationId: string): Promise<void> {
    // Continuous monitoring
    setInterval(async () => {
      await this.checkCompaniesHouse(organizationId);
      await this.screenSanctions(organizationId);
      await this.reviewTransactionPatterns(organizationId);
    }, 24 * 60 * 60 * 1000); // Daily
  }
}
```

### 2.3 Status Management
```yaml
verification_states:
  not_started:
    ui_message: "To ensure payment of suppliers for KYC requirements, we need to verify your identity"
    actions_available: ["Start Verification"]
    dashboard_status: "Action Required"
    
  in_progress:
    ui_message: "Verification in progress - we're reviewing your documents"
    actions_available: ["View Status", "Upload Additional Documents"]
    dashboard_status: "Pending Review"
    
  approved:
    ui_message: "Thanks for submitting KYC documents. Your documents have been approved"
    actions_available: ["Make Payment", "View Limits"]
    dashboard_status: "Verified ✓"
    
  rejected:
    ui_message: "Additional information required for verification"
    actions_available: ["View Requirements", "Resubmit"]
    dashboard_status: "Action Required"
    
  expired:
    ui_message: "Verification expired - please update your information"
    actions_available: ["Update Information"]
    dashboard_status: "Update Required"
```

---

## 3. Payment Initiation Interface

### 3.1 Fund Loading Mechanism
```typescript
interface FundLoading {
  methods: {
    bank_transfer: {
      type: "Manual bank transfer",
      processing_time: "1-2 hours",
      fees: "Free",
      limits: {
        min: 100,
        max: 1000000,
        currency: "GBP"
      }
    };
    
    open_banking: {
      type: "Instant via open banking",
      processing_time: "Immediate",
      fees: "0.5%",
      limits: {
        min: 100,
        max: 25000,
        daily_max: 100000
      }
    };
    
    debit_card: {
      type: "Card payment",
      processing_time: "Immediate",
      fees: "2.9%",
      limits: {
        min: 100,
        max: 5000,
        daily_max: 15000
      }
    };
  };
  
  balance_management: {
    display: "Real-time balance",
    reserved_funds: "For pending payments",
    available_balance: "Total minus reserved",
    notifications: "Low balance alerts"
  };
}
```

### 3.2 Currency Conversion Engine
```typescript
class CurrencyEngine {
  private providers = [
    'CurrencyCloud',
    'Wise',
    'Reuters'
  ];
  
  async getExchangeRate(
    from: 'GBP',
    to: 'EUR' | 'USD' | 'JPY' | 'AUD',
    amount: number
  ): Promise<ExchangeRate> {
    // Get rates from multiple providers
    const rates = await Promise.all(
      this.providers.map(p => this.fetchRate(p, from, to))
    );
    
    // Use best rate
    const bestRate = this.selectBestRate(rates);
    
    // Apply margin based on volume
    const finalRate = this.applyMargin(bestRate, amount);
    
    return {
      rate: finalRate,
      fee: this.calculateFee(amount),
      total: amount * finalRate,
      validUntil: Date.now() + 30000, // 30 seconds
      provider: bestRate.provider
    };
  }
  
  async executeCconversion(
    paymentId: string,
    confirmedRate: ExchangeRate
  ): Promise<ConversionResult> {
    // Lock in rate
    const locked = await this.lockRate(confirmedRate);
    
    // Execute conversion
    const result = await this.provider.convert({
      rate: locked.rate,
      amount: locked.amount,
      reference: paymentId
    });
    
    // Record for audit
    await this.recordConversion(result);
    
    return result;
  }
}
```

### 3.3 Beneficiary Management
```typescript
interface BeneficiaryManagement {
  beneficiary_types: {
    corporate: {
      required_fields: [
        "company_name",
        "registration_number",
        "country",
        "account_details"
      ];
      
      account_formats: {
        IBAN: "For EUR payments",
        SWIFT: "For USD payments",
        LOCAL: "For domestic formats"
      };
    };
    
    individual: {
      restricted: true,
      note: "B2B only - individual beneficiaries require additional approval"
    };
  };
  
  validation: {
    iban_check: "MOD-97 algorithm",
    swift_validation: "BIC directory lookup",
    name_matching: "Fuzzy match with sanctions lists",
    duplicate_check: "Prevent duplicate beneficiaries"
  };
  
  management_features: {
    save_beneficiary: true,
    beneficiary_groups: true,
    bulk_payments: true,
    approval_workflow: "For new beneficiaries"
  };
}
```

### 3.4 Payment Execution Flow
```typescript
class PaymentExecution {
  async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    // Step 1: Pre-flight checks
    const checks = await this.runPreflightChecks({
      balance: this.checkSufficientFunds(paymentRequest),
      beneficiary: this.validateBeneficiary(paymentRequest.beneficiary),
      limits: this.checkTransactionLimits(paymentRequest.amount),
      compliance: this.runComplianceChecks(paymentRequest)
    });
    
    if (!checks.allPassed) {
      return { status: 'rejected', reasons: checks.failures };
    }
    
    // Step 2: Create payment record
    const payment = await this.createPaymentRecord({
      ...paymentRequest,
      status: 'pending',
      reference: this.generateReference(),
      timestamp: new Date()
    });
    
    // Step 3: Lock funds
    await this.lockFunds(payment.amount, payment.currency);
    
    // Step 4: Execute via rails
    const execution = await this.executeViaRails(payment);
    
    // Step 5: Update status
    await this.updatePaymentStatus(payment.id, execution.status);
    
    // Step 6: Send notifications
    await this.sendNotifications(payment, execution);
    
    return {
      status: execution.status,
      reference: payment.reference,
      estimatedCompletion: this.calculateCompletionTime(payment),
      trackingUrl: this.generateTrackingUrl(payment.id)
    };
  }
  
  private async executeViaRails(payment: Payment): Promise<ExecutionResult> {
    // Route based on currency and amount
    const rail = this.selectPaymentRail(payment);
    
    switch(rail) {
      case 'SWIFT':
        return await this.executeSWIFT(payment);
      case 'SEPA':
        return await this.executeSEPA(payment);
      case 'FasterPayments':
        return await this.executeFasterPayments(payment);
      case 'LOCAL':
        return await this.executeLocalRail(payment);
    }
  }
}
```

---

## 4. Compliance Integration

### 4.1 AML/CTF Checks
```typescript
interface AMLChecks {
  transaction_monitoring: {
    rules: [
      {
        id: "velocity",
        description: "Unusual transaction velocity",
        threshold: "5x normal pattern",
        action: "Flag for review"
      },
      {
        id: "amount",
        description: "Large transactions",
        threshold: "> £50,000",
        action: "Enhanced review"
      },
      {
        id: "jurisdiction",
        description: "High-risk countries",
        list: "FATF grey/black list",
        action: "Block or manual review"
      }
    ];
    
    pattern_detection: {
      structuring: "Multiple payments below threshold",
      round_amounts: "Suspicious round numbers",
      rapid_movement: "Quick in-out transactions"
    };
  };
  
  sanctions_screening: {
    lists: [
      "UK HMT Consolidated List",
      "UN Sanctions List", 
      "EU Consolidated List",
      "OFAC SDN List"
    ];
    
    matching: {
      algorithm: "Fuzzy matching",
      threshold: 85,
      manual_review: "80-85% match",
      auto_reject: ">85% match"
    };
    
    frequency: {
      real_time: "Every transaction",
      batch: "Daily full base scan",
      updates: "List updates every 4 hours"
    };
  };
}
```

### 4.2 Risk Scoring Engine
```typescript
class RiskScoringEngine {
  calculateTransactionRisk(transaction: Transaction): RiskScore {
    let score = 0;
    const factors = [];
    
    // Customer risk
    const customerRisk = this.assessCustomerRisk(transaction.sender);
    score += customerRisk.score * 0.3;
    factors.push(...customerRisk.factors);
    
    // Geographic risk
    const geoRisk = this.assessGeographicRisk(
      transaction.originCountry,
      transaction.destinationCountry
    );
    score += geoRisk.score * 0.25;
    factors.push(...geoRisk.factors);
    
    // Transaction risk
    const txRisk = this.assessTransactionRisk(transaction);
    score += txRisk.score * 0.25;
    factors.push(...txRisk.factors);
    
    // Beneficiary risk
    const beneficiaryRisk = this.assessBeneficiaryRisk(transaction.beneficiary);
    score += beneficiaryRisk.score * 0.2;
    factors.push(...beneficiaryRisk.factors);
    
    return {
      score: Math.min(100, score),
      rating: this.getRating(score),
      factors: factors,
      requiredAction: this.determineAction(score)
    };
  }
  
  private determineAction(score: number): RequiredAction {
    if (score < 30) return { type: 'auto_approve', sla: 'immediate' };
    if (score < 60) return { type: 'standard_review', sla: '30 minutes' };
    if (score < 80) return { type: 'enhanced_review', sla: '2 hours' };
    return { type: 'escalation', sla: '4 hours' };
  }
}
```

### 4.3 Regulatory Reporting
```typescript
interface RegulatoryReporting {
  automated_reports: {
    suspicious_activity: {
      trigger: "Risk score > 70 or specific flags",
      format: "SAR format",
      submission: "Via FCA portal",
      timeline: "As soon as practicable",
      retention: "5 years"
    };
    
    transaction_reporting: {
      frequency: "Daily",
      content: [
        "All transactions > £1000",
        "All international transfers",
        "High-risk jurisdiction transactions"
      ];
      format: "FCA specified XML",
      submission: "SFTP to FCA"
    };
    
    monthly_returns: {
      metrics: [
        "Transaction volumes",
        "Geographic distribution",
        "Currency breakdown",
        "Suspicious activity stats"
      ];
      deadline: "20th of following month",
      portal: "FCA GABRIEL system"
    };
  };
  
  audit_trail: {
    captured_data: [
      "User actions",
      "System decisions",
      "Override reasons",
      "Communication logs",
      "Status changes"
    ];
    
    retention: {
      transactions: "7 years",
      kyc_records: "5 years after relationship ends",
      system_logs: "2 years",
      reports: "Permanent"
    };
  };
}
```

---

## 5. User Experience Flow

### 5.1 Dashboard Integration
```typescript
interface PaymentDashboard {
  dashboard_card: {
    title: "Pay Suppliers",
    location: "Main dashboard grid",
    
    states: {
      unverified: {
        icon: "AlertCircle",
        color: "amber",
        text: "Complete verification to enable payments",
        action: "Start Verification"
      },
      
      pending_verification: {
        icon: "Clock",
        color: "blue",
        text: "Verification in progress",
        action: "Check Status"
      },
      
      active: {
        icon: "CreditCard",
        color: "green",
        text: "Available Balance: £{balance}",
        action: "Make Payment"
      }
    };
    
    quick_stats: {
      today_sent: "£{amount}",
      pending_payments: "{count}",
      this_month: "£{total}"
    };
  };
}
```

### 5.2 Payment Workflow UI
```typescript
interface PaymentWorkflow {
  steps: [
    {
      id: "select_beneficiary",
      title: "Select Recipient",
      components: [
        "BeneficiarySearch",
        "AddNewBeneficiary",
        "RecentBeneficiaries"
      ]
    },
    {
      id: "payment_details",
      title: "Payment Details",
      components: [
        "AmountInput",
        "CurrencySelector",
        "ExchangeRateDisplay",
        "PaymentReference",
        "PaymentDate"
      ]
    },
    {
      id: "compliance_check",
      title: "Compliance Review",
      components: [
        "PurposeOfPayment",
        "SupportingDocuments",
        "DeclarationCheckbox"
      ]
    },
    {
      id: "review_confirm",
      title: "Review & Confirm",
      components: [
        "PaymentSummary",
        "FeeBreakdown",
        "EstimatedArrival",
        "TermsAcceptance"
      ]
    },
    {
      id: "payment_status",
      title: "Payment Status",
      components: [
        "ProgressTracker",
        "StatusUpdates",
        "ReceiptDownload",
        "SupportContact"
      ]
    }
  ];
}
```

### 5.3 Navigation Structure
```yaml
navigation_integration:
  sidebar_menu:
    position: "After Dashboard, before Reports"
    icon: "Banknote"
    label: "Payments"
    
    submenu:
      - label: "Make Payment"
        route: "/payments/new"
        
      - label: "Payment History"
        route: "/payments/history"
        
      - label: "Beneficiaries"
        route: "/payments/beneficiaries"
        
      - label: "Account Balance"
        route: "/payments/balance"
        
      - label: "Settings"
        route: "/payments/settings"
        
  breadcrumbs:
    pattern: "Home > Payments > {Current Page}"
    
  quick_actions:
    header_button: "Quick Pay"
    shortcut_key: "Ctrl+P"
```

---

## 6. Integration with Existing Modules

### 6.1 Authorization Module Integration
```typescript
interface AuthorizationIntegration {
  shared_data: {
    company_info: "Pull from authorization assessment",
    regulatory_status: "Check authorization level",
    permissions: "Verify money remittance permission"
  };
  
  data_flow: {
    from_authorization: {
      company_details: CompanyProfile,
      directors: Director[],
      financial_info: FinancialData
    };
    
    to_authorization: {
      payment_volumes: TransactionMetrics,
      compliance_score: ComplianceRating,
      risk_events: RiskEvent[]
    };
  };
  
  checks: {
    before_payment: "Verify active authorization",
    risk_alignment: "Payment risk affects overall risk score",
    reporting: "Payment data in authorization reports"
  };
}
```

### 6.2 SM&CR Module Integration
```typescript
interface SMCRIntegration {
  responsibility_mapping: {
    payment_approval: {
      role: "SMF3 or delegated",
      limits: "Based on role level",
      oversight: "SMF16 compliance oversight"
    };
    
    mlro_oversight: {
      role: "SMF17",
      responsibilities: [
        "SAR decisions",
        "High-risk payment approval",
        "Sanctions override authority"
      ]
    };
  };
  
  conduct_tracking: {
    payment_decisions: "Log in conduct record",
    override_actions: "Track as potential conduct issue",
    training_requirements: "Payment system training mandatory"
  };
}
```

### 6.3 Training Module Integration
```typescript
interface TrainingIntegration {
  required_courses: [
    {
      course: "Payment Systems Basics",
      audience: "All payment users",
      frequency: "Once"
    },
    {
      course: "AML for Payments",
      audience: "Payment approvers",
      frequency: "Annual"
    },
    {
      course: "Sanctions Awareness",
      audience: "All users",
      frequency: "Annual"
    }
  ];
  
  competency_checks: {
    before_access: "Must complete basic training",
    for_approval_rights: "Must pass AML assessment",
    ongoing: "Annual refresher required"
  };
}
```

---

## 7. Database Schema Extensions

### 7.1 Payment Tables
```sql
-- Payment module schema
CREATE SCHEMA IF NOT EXISTS payments;

-- Account balances
CREATE TABLE payments.account_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES core.organizations(id),
    currency VARCHAR(3) NOT NULL,
    available_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    reserved_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_balance DECIMAL(18,2) GENERATED ALWAYS AS 
        (available_balance + reserved_balance) STORED,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_org_currency UNIQUE(organization_id, currency),
    INDEX idx_balance_org (organization_id)
);

-- Beneficiaries
CREATE TABLE payments.beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES core.organizations(id),
    beneficiary_name VARCHAR(255) NOT NULL,
    beneficiary_type VARCHAR(50) NOT NULL, -- 'corporate', 'individual'
    account_details JSONB NOT NULL, -- Encrypted
    country VARCHAR(2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending',
    risk_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    
    INDEX idx_beneficiary_org (organization_id),
    INDEX idx_beneficiary_status (verification_status)
);

-- Payment transactions
CREATE TABLE payments.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES core.organizations(id),
    beneficiary_id UUID REFERENCES payments.beneficiaries(id),
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(12,6),
    converted_amount DECIMAL(18,2),
    converted_currency VARCHAR(3),
    status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    purpose VARCHAR(500),
    reference VARCHAR(100) UNIQUE,
    
    -- Compliance fields
    risk_score INTEGER,
    aml_check_status VARCHAR(50),
    sanctions_check_status VARCHAR(50),
    compliance_notes TEXT,
    
    -- Timestamps
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- User tracking
    initiated_by UUID REFERENCES core.users(id),
    approved_by UUID REFERENCES core.users(id),
    
    -- Indexes
    INDEX idx_transaction_org (organization_id),
    INDEX idx_transaction_status (status),
    INDEX idx_transaction_date (initiated_at DESC),
    INDEX idx_transaction_reference (reference)
);

-- KYC verification records
CREATE TABLE payments.kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES core.organizations(id) UNIQUE,
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    companies_house_check JSONB,
    document_checks JSONB,
    individual_checks JSONB,
    risk_assessment JSONB,
    
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    reviewed_by UUID REFERENCES core.users(id),
    notes TEXT,
    
    INDEX idx_kyc_org (organization_id),
    INDEX idx_kyc_status (status),
    INDEX idx_kyc_expires (expires_at)
);
```

---

## 8. Security & Compliance Considerations

### 8.1 Security Requirements
```yaml
payment_security:
  encryption:
    data_at_rest:
      - "Account details: AES-256"
      - "Personal data: Field-level encryption"
      - "Transaction details: Encrypted storage"
      
    data_in_transit:
      - "TLS 1.3 minimum"
      - "Certificate pinning for APIs"
      - "End-to-end encryption for sensitive data"
      
  access_control:
    payment_initiation:
      - "Requires: Active KYC"
      - "2FA mandatory for amounts > £10,000"
      - "IP whitelist option"
      
    payment_approval:
      - "Dual approval for > £50,000"
      - "Time-based access windows"
      - "Audit log all actions"
      
  fraud_prevention:
    - "Velocity checks"
    - "Behavioral analysis"
    - "Device fingerprinting"
    - "Geolocation verification"
```

### 8.2 Regulatory Compliance
```yaml
fca_requirements:
  safeguarding:
    method: "Segregation in authorized institution"
    frequency: "Daily reconciliation"
    reporting: "Monthly attestation"
    
  capital_requirements:
    initial_capital: "Based on payment volumes"
    ongoing_capital: "Calculated quarterly"
    reporting: "GABRIEL system"
    
  operational_resilience:
    rto: "4 hours" # Recovery Time Objective
    rpo: "1 hour"  # Recovery Point Objective
    testing: "Annual DR test"
```

---

## 9. External Service Integrations

### 9.1 Banking Partners
```typescript
interface BankingIntegrations {
  primary_bank: {
    provider: "Barclays/Lloyds/HSBC",
    services: [
      "Safeguarding accounts",
      "FX services",
      "Payment rails access"
    ],
    integration: "API + SFTP backup"
  };
  
  payment_rails: {
    swift: {
      provider: "Direct or via correspondent",
      currencies: ["USD", "JPY", "AUD"],
      cutoff_times: "14:00 GMT"
    },
    
    sepa: {
      provider: "Direct participation",
      currencies: ["EUR"],
      cutoff_times: "15:00 GMT"
    },
    
    faster_payments: {
      provider: "Direct or sponsored",
      currencies: ["GBP"],
      cutoff_times: "24/7"
    }
  };
}
```

### 9.2 Third-Party Services
```typescript
interface ThirdPartyServices {
  companies_house: {
    api: "Official REST API",
    usage: "Business verification",
    rate_limit: "Managed"
  };
  
  sanctions_screening: {
    provider: "ComplyAdvantage/Refinitiv",
    lists: "Global sanctions + PEP",
    api: "Real-time + batch"
  };
  
  fx_rates: {
    provider: "CurrencyCloud/Wise",
    update_frequency: "Real-time",
    margin_management: "Configurable"
  };
  
  kyc_verification: {
    provider: "Jumio/Onfido",
    services: "Document + biometric verification",
    integration: "API + webhooks"
  };
}
```

---

## 10. Implementation Notes for AI Agent

### Critical Implementation Points
1. **Safeguarding is critical** - Client funds must be segregated
2. **Real-time sanctions screening** - Every transaction, no exceptions
3. **Audit everything** - FCA requires comprehensive transaction records
4. **KYC reuse** - Use existing GRC verification where possible
5. **Risk-based approach** - Higher risk = more checks

### UI/UX Priorities
1. **Clear status indication** - Users must know verification state
2. **Transparent fees** - Show all costs upfront
3. **Payment tracking** - Real-time status updates
4. **One-click repeat** - Save beneficiary details
5. **Mobile responsive** - Payments on the go

### Integration Priorities
1. **Leverage existing KYC** - Don't duplicate verification
2. **Share risk scores** - Payment risk affects overall GRC risk
3. **Unified reporting** - Payment data in compliance reports
4. **Single sign-on** - Use existing Nasara authentication
5. **Consistent UI** - Match existing design system

### Testing Requirements
1. **Safeguarding reconciliation** - Daily balance checks
2. **Sanctions screening** - Test with known matches
3. **Currency conversion** - Verify rate accuracy
4. **Payment rails** - Test each currency/country combo
5. **Regulatory reporting** - Validate report formats

### Compliance Checklist
- [ ] Safeguarding implementation verified
- [ ] AML procedures documented
- [ ] Sanctions screening operational
- [ ] Transaction monitoring active
- [ ] Reporting pipelines tested
- [ ] Audit trails comprehensive
- [ ] Risk scoring calibrated
- [ ] Document retention configured

---

## Appendix: Payment Limits & Fees

### Transaction Limits
| Verification Level | Daily Limit | Monthly Limit | Per Transaction |
|-------------------|-------------|---------------|-----------------|
| Basic KYC | £10,000 | £50,000 | £5,000 |
| Enhanced KYC | £100,000 | £1,000,000 | £50,000 |
| Premium | £500,000 | £5,000,000 | £250,000 |

### Fee Structure
| Service | Fee | Notes |
|---------|-----|-------|
| GBP to GBP | 0.35% | Min £2 |
| Currency Conversion | 0.45% | Plus FX margin |
| Urgent Payment | £25 | Same-day processing |
| International | 0.55% | Min £5 |

---

*This specification completes the Payments module requirements. It integrates with Authorization, SM&CR, and Training modules while maintaining compliance with FCA requirements for payment institutions.*