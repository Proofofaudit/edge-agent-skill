// Edge City Operational Facts Auditor — Type Definitions

export type OperationalTopic =
  | "check_in"
  | "shuttle"
  | "meal_plan"
  | "venue_hours"
  | "accommodation"
  | "deadline"
  | "attendee_instructions";

export type ConflictClassification =
  | "confirmed_inconsistency"
  | "possible_inconsistency"
  | "superseded_state"
  | "date_specific_exception";

export type ConflictStatus = "unverified" | "confirmed" | "resolved" | "dismissed";

export interface DateScope {
  specificDate?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  recurrence?: "weekdays" | "weekends" | "daily" | "specific_day";
  dayOfWeek?: string;
}

export interface OperationalFact {
  id: string;
  topic: OperationalTopic;
  subject: string;
  value: string;
  normalizedValue?: string;
  effectiveScope?: DateScope;
  locationOrEvent?: string;
  sourceUrl: string;
  sourcePath: string;
  sourceKind: "wiki" | "newsletter" | "website";
  publishedDate?: string;
  indexedDate?: string;
  supportingText: string;
  sectionTitle?: string;
}

export interface Discrepancy {
  id: string;
  topic: OperationalTopic;
  subject: string;
  description: string;
  classification: ConflictClassification;
  facts: OperationalFact[];
  whyInconsistent: string;
  suggestedQuestion: string;
  proposedCorrectionLocation: string;
  status: ConflictStatus;
}

export interface AuditReport {
  generatedAt: string;
  event: string;
  timezone: string;
  documentCount: number;
  factsExtracted: number;
  findings: Discrepancy[];
  summary: {
    totalDiscrepancies: number;
    confirmedCount: number;
    possibleCount: number;
    supersededCount: number;
    exceptionCount: number;
    cleanScan: boolean;
  };
}

export interface AuditOptions {
  strict?: boolean;
  format?: "markdown" | "json";
  outputPath?: string;
  quiet?: boolean;
}
