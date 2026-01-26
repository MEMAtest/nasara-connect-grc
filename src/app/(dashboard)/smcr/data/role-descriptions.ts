/**
 * Plain English descriptions for SMF and CF roles to help users understand each function.
 */

export const smfDescriptions: Record<string, string> = {
  // Universal SMFs
  "smf-1": "The Chief Executive is responsible for the overall management and conduct of the firm's business. They are accountable for implementing the firm's strategy and ensuring it operates within regulatory requirements.",
  "smf-3": "The Executive Director role applies to firms that don't have a designated CEO. This person has significant influence over the firm's conduct and affairs.",
  "smf-9": "The Chair of the Board leads the governing body and ensures effective governance. They are responsible for leading the board's discussion and decision-making.",
  "smf-27": "The Partner role applies to individuals who are partners in a partnership firm and have significant responsibility for managing the firm's affairs.",

  // Specific SMFs
  "smf-2": "The Chief Finance Officer is responsible for the firm's financial affairs, including financial planning, record keeping, and financial reporting.",
  "smf-4": "The Chief Risk Officer is responsible for the overall management of the firm's risk function. They ensure risks are properly identified, measured, and controlled.",
  "smf-5": "The Head of Internal Audit is responsible for the firm's internal audit function. They provide independent assurance on the effectiveness of internal controls.",
  "smf-10": "The Chair of the Risk Committee leads the board-level committee responsible for overseeing risk management and ensuring risk appetite is appropriate.",
  "smf-11": "The Chair of the Audit Committee leads the board-level committee responsible for overseeing financial reporting, internal controls, and external audit.",
  "smf-12": "The Chair of the Remuneration Committee leads the board-level committee responsible for setting pay and incentive policies for senior management.",
  "smf-13": "The Chair of the Nominations Committee leads the board-level committee responsible for board appointments and succession planning.",
  "smf-14": "The Senior Independent Director provides a sounding board for the chair and serves as an intermediary for other directors and shareholders when needed.",
  "smf-16": "The Compliance Oversight function is responsible for ensuring the firm operates within all applicable regulatory requirements and internal policies.",
  "smf-17": "The Money Laundering Reporting Officer (MLRO) is responsible for overseeing the firm's anti-money laundering systems and reporting suspicious activity.",
  "smf-18": "The Other Overall Responsibility function covers significant responsibilities not captured by other specific SMF designations.",
  "smf-19": "The Head of Key Business Area has overall responsibility for a significant business unit or division within the firm.",
  "smf-20": "The Other Local Responsibility function is for firms with significant operations in the UK who need someone accountable for UK-specific matters.",
  "smf-21": "The EEA Branch Senior Manager is responsible for managing the operations of a branch in the European Economic Area.",
  "smf-22": "The Other Significant Responsibility function covers any other responsibility that has significant impact but doesn't fit other categories.",
  "smf-23": "The Chief Operations Officer is responsible for the day-to-day operations of the firm, including systems, processes, and operational risk management.",
  "smf-24": "The Chief Information Officer/Technology Officer is responsible for the firm's technology strategy, systems, and information security.",
  "smf-28": "The Systems & Controls function is responsible for ensuring the firm has robust systems and controls for managing its activities.",
  "smf-29": "The Significant Management function applies to those with significant management responsibilities that don't fall under other SMF categories.",
};

export const cfDescriptions: Record<string, string> = {
  // Certification Functions
  "cf-1": "The Significant Management function covers employees who have significant influence over a significant business unit or activity.",
  "cf-2": "Proprietary Traders are individuals who trade in investments, commodities, or derivatives using the firm's own money rather than client funds.",
  "cf-3": "The CASS Oversight function is responsible for ensuring proper handling and protection of client money and assets under CASS rules.",
  "cf-4": "The Benchmark Submission function covers individuals responsible for contributing to or administering financial benchmarks.",
  "cf-5": "The Benchmark Administration function covers individuals responsible for the administration of financial benchmarks.",
  "cf-10": "The Client-Dealing function covers employees who deal with clients in connection with regulated activities.",
  "cf-11": "The Algorithmic Trading function covers employees involved in designing, developing, or overseeing algorithmic trading systems.",
  "cf-30": "The Customer Dealing function covers employees who deal directly with customers in relation to the firm's regulated activities.",
};

/**
 * Get description for a role by its function ID
 */
export function getRoleDescription(functionId: string): string | undefined {
  return smfDescriptions[functionId] ?? cfDescriptions[functionId];
}

/**
 * Get a short summary for a role (first sentence of description)
 */
export function getRoleSummary(functionId: string): string | undefined {
  const description = getRoleDescription(functionId);
  if (!description) return undefined;
  const firstSentence = description.split(". ")[0];
  return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
}
