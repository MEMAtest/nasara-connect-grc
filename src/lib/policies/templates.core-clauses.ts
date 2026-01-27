import type { PolicyClause } from "./templates";
import { CORE_POLICY_TEMPLATE_CLAUSES_VULNERABLE_CUST } from "./templates.core-clauses.vulnerable-cust";
import { CORE_POLICY_TEMPLATE_CLAUSES_AML_CTF } from "./templates.core-clauses.aml-ctf";
import { CORE_POLICY_TEMPLATE_CLAUSES_SAFEGUARDING } from "./templates.core-clauses.safeguarding";
import { CORE_POLICY_TEMPLATE_CLAUSES_SUITABILITY_ADVICE } from "./templates.core-clauses.suitability-advice";
import { CORE_POLICY_TEMPLATE_CLAUSES_FIN_PROMOTIONS } from "./templates.core-clauses.fin-promotions";
import { CORE_POLICY_TEMPLATE_CLAUSES_BCP_RESILIENCE } from "./templates.core-clauses.bcp-resilience";
import { CORE_POLICY_TEMPLATE_CLAUSES_CONFLICTS } from "./templates.core-clauses.conflicts";
import { CORE_POLICY_TEMPLATE_CLAUSES_BEST_EXECUTION } from "./templates.core-clauses.best-execution";
import { CORE_POLICY_TEMPLATE_CLAUSES_RESPONSIBLE_LENDING } from "./templates.core-clauses.responsible-lending";
import { CORE_POLICY_TEMPLATE_CLAUSES_ARREARS_MANAGEMENT } from "./templates.core-clauses.arrears-management";
import { CORE_POLICY_TEMPLATE_CLAUSES_PROD } from "./templates.core-clauses.prod";
import { CORE_POLICY_TEMPLATE_CLAUSES_RISK_MGMT } from "./templates.core-clauses.risk-mgmt";
import { CORE_POLICY_TEMPLATE_CLAUSES_COMPLIANCE_MON } from "./templates.core-clauses.compliance-mon";
import { CORE_POLICY_TEMPLATE_CLAUSES_OUTSOURCING } from "./templates.core-clauses.outsourcing";
import { CORE_POLICY_TEMPLATE_CLAUSES_INFO_SECURITY } from "./templates.core-clauses.info-security";
import { CORE_POLICY_TEMPLATE_CLAUSES_OP_SEC_RISK } from "./templates.core-clauses.op-sec-risk";
import { CORE_POLICY_TEMPLATE_CLAUSES_MARKET_ABUSE } from "./templates.core-clauses.market-abuse";
import { CORE_POLICY_TEMPLATE_CLAUSES_INDUCEMENTS } from "./templates.core-clauses.inducements";
import { CORE_POLICY_TEMPLATE_CLAUSES_CASS } from "./templates.core-clauses.cass";
import { CORE_POLICY_TEMPLATE_CLAUSES_CASS_RESOLUTION } from "./templates.core-clauses.cass-resolution";

export const CORE_POLICY_TEMPLATE_CLAUSES: PolicyClause[] = [
  ...CORE_POLICY_TEMPLATE_CLAUSES_VULNERABLE_CUST,
  ...CORE_POLICY_TEMPLATE_CLAUSES_AML_CTF,
  ...CORE_POLICY_TEMPLATE_CLAUSES_SAFEGUARDING,
  ...CORE_POLICY_TEMPLATE_CLAUSES_SUITABILITY_ADVICE,
  ...CORE_POLICY_TEMPLATE_CLAUSES_FIN_PROMOTIONS,
  ...CORE_POLICY_TEMPLATE_CLAUSES_BCP_RESILIENCE,
  ...CORE_POLICY_TEMPLATE_CLAUSES_CONFLICTS,
  ...CORE_POLICY_TEMPLATE_CLAUSES_BEST_EXECUTION,
  ...CORE_POLICY_TEMPLATE_CLAUSES_RESPONSIBLE_LENDING,
  ...CORE_POLICY_TEMPLATE_CLAUSES_ARREARS_MANAGEMENT,
  ...CORE_POLICY_TEMPLATE_CLAUSES_PROD,
  ...CORE_POLICY_TEMPLATE_CLAUSES_RISK_MGMT,
  ...CORE_POLICY_TEMPLATE_CLAUSES_COMPLIANCE_MON,
  ...CORE_POLICY_TEMPLATE_CLAUSES_OUTSOURCING,
  ...CORE_POLICY_TEMPLATE_CLAUSES_INFO_SECURITY,
  ...CORE_POLICY_TEMPLATE_CLAUSES_OP_SEC_RISK,
  ...CORE_POLICY_TEMPLATE_CLAUSES_MARKET_ABUSE,
  ...CORE_POLICY_TEMPLATE_CLAUSES_INDUCEMENTS,
  ...CORE_POLICY_TEMPLATE_CLAUSES_CASS,
  ...CORE_POLICY_TEMPLATE_CLAUSES_CASS_RESOLUTION,
];
