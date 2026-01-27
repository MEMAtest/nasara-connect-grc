export type QuickAnswer = string | boolean | string[];
export type QuickAnswers = Record<string, QuickAnswer>;

export interface QuickQuestion {
  id: string;
  label: string;
  type: "text" | "boolean" | "multi";
  options?: string[];
  required?: boolean;
  description?: string;
}
