export type ReviewCadence = "quarterly" | "semi-annual" | "annual" | "one-off";

export type GovernanceState = {
  owner: string;
  version: string;
  effectiveDate: string;
  nextReviewAt: string;
  scopeStatement: string;
  reviewCadence: ReviewCadence;
  distributionList: string[];
  linkedProcedures: string;
};

export interface AuthorizationProjectSummary {
  id: string;
  name?: string | null;
  permissionCode?: string | null;
  permissionName?: string | null;
  status?: string | null;
}
