import type { PolicyTemplate } from "./templates";
import { CORE_POLICY_TEMPLATES_VULNERABLE_CUST } from "./templates.core-templates.vulnerable-cust";
import { CORE_POLICY_TEMPLATES_AML_CTF } from "./templates.core-templates.aml-ctf";
import { CORE_POLICY_TEMPLATES_SAFEGUARDING } from "./templates.core-templates.safeguarding";
import { CORE_POLICY_TEMPLATES_SUITABILITY_ADVICE } from "./templates.core-templates.suitability-advice";
import { CORE_POLICY_TEMPLATES_FIN_PROMOTIONS } from "./templates.core-templates.fin-promotions";
import { CORE_POLICY_TEMPLATES_BCP_RESILIENCE } from "./templates.core-templates.bcp-resilience";
import { CORE_POLICY_TEMPLATES_CONFLICTS } from "./templates.core-templates.conflicts";
import { CORE_POLICY_TEMPLATES_BEST_EXECUTION } from "./templates.core-templates.best-execution";
import { CORE_POLICY_TEMPLATES_RESPONSIBLE_LENDING } from "./templates.core-templates.responsible-lending";
import { CORE_POLICY_TEMPLATES_ARREARS_MANAGEMENT } from "./templates.core-templates.arrears-management";
import { CORE_POLICY_TEMPLATES_PROD } from "./templates.core-templates.prod";
import { CORE_POLICY_TEMPLATES_RISK_MGMT } from "./templates.core-templates.risk-mgmt";
import { CORE_POLICY_TEMPLATES_COMPLIANCE_MON } from "./templates.core-templates.compliance-mon";
import { CORE_POLICY_TEMPLATES_OUTSOURCING } from "./templates.core-templates.outsourcing";
import { CORE_POLICY_TEMPLATES_INFO_SECURITY } from "./templates.core-templates.info-security";
import { CORE_POLICY_TEMPLATES_OP_SEC_RISK } from "./templates.core-templates.op-sec-risk";
import { CORE_POLICY_TEMPLATES_MARKET_ABUSE } from "./templates.core-templates.market-abuse";
import { CORE_POLICY_TEMPLATES_INDUCEMENTS } from "./templates.core-templates.inducements";
import { CORE_POLICY_TEMPLATES_CASS } from "./templates.core-templates.cass";
import { CORE_POLICY_TEMPLATES_CASS_RESOLUTION } from "./templates.core-templates.cass-resolution";
import { CORE_POLICY_TEMPLATES_PRODUCT_GOV } from "./templates.core-templates.product-gov";
import { CORE_POLICY_TEMPLATES_TARGET_MARKET } from "./templates.core-templates.target-market";

export const CORE_POLICY_TEMPLATES: PolicyTemplate[] = [
  ...CORE_POLICY_TEMPLATES_VULNERABLE_CUST,
  ...CORE_POLICY_TEMPLATES_AML_CTF,
  ...CORE_POLICY_TEMPLATES_SAFEGUARDING,
  ...CORE_POLICY_TEMPLATES_SUITABILITY_ADVICE,
  ...CORE_POLICY_TEMPLATES_FIN_PROMOTIONS,
  ...CORE_POLICY_TEMPLATES_BCP_RESILIENCE,
  ...CORE_POLICY_TEMPLATES_CONFLICTS,
  ...CORE_POLICY_TEMPLATES_BEST_EXECUTION,
  ...CORE_POLICY_TEMPLATES_RESPONSIBLE_LENDING,
  ...CORE_POLICY_TEMPLATES_ARREARS_MANAGEMENT,
  ...CORE_POLICY_TEMPLATES_PROD,
  ...CORE_POLICY_TEMPLATES_RISK_MGMT,
  ...CORE_POLICY_TEMPLATES_COMPLIANCE_MON,
  ...CORE_POLICY_TEMPLATES_OUTSOURCING,
  ...CORE_POLICY_TEMPLATES_INFO_SECURITY,
  ...CORE_POLICY_TEMPLATES_OP_SEC_RISK,
  ...CORE_POLICY_TEMPLATES_MARKET_ABUSE,
  ...CORE_POLICY_TEMPLATES_INDUCEMENTS,
  ...CORE_POLICY_TEMPLATES_CASS,
  ...CORE_POLICY_TEMPLATES_CASS_RESOLUTION,
  ...CORE_POLICY_TEMPLATES_PRODUCT_GOV,
  ...CORE_POLICY_TEMPLATES_TARGET_MARKET,
];
