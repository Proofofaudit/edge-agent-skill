// Edge City Operational Facts Auditor — Core Engine
// Orchestrates document reading, fact extraction, conflict comparison, and report generation.

import { join } from "node:path";
import { readReferences } from "../publish";
import { validateSnapshot } from "../reference-state";
import { EVENT } from "../sources";
import { extractFactsFromDocument } from "./extractor";
import { compareOperationalFacts } from "./comparator";
import type { AuditReport, OperationalFact, Discrepancy } from "./types";

export interface RunAuditOptions {
  referencesDir?: string;
  files?: Map<string, string>;
  skipManifestValidation?: boolean;
  now?: string;
}

export function runOperationalAudit(options: RunAuditOptions = {}): AuditReport {
  const refsDir = options.referencesDir ?? join(import.meta.dir, "..", "..", "references");
  const files = options.files ?? readReferences(refsDir);

  if (files.size === 0) {
    throw new Error(`No reference documents found in ${refsDir}`);
  }

  // Ensure reference snapshot integrity unless explicitly skipped (e.g., in synthetic test fixtures)
  if (!options.skipManifestValidation && files.has("manifest.json")) {
    validateSnapshot(files);
  }

  const allFacts: OperationalFact[] = [];
  let docCount = 0;

  // Process all markdown files (excluding index.md which is a directory of references)
  for (const [path, content] of [...files.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (!path.endsWith(".md") || path === "index.md") continue;
    docCount++;
    const facts = extractFactsFromDocument(path, content);
    allFacts.push(...facts);
  }

  const findings: Discrepancy[] = compareOperationalFacts(allFacts);

  let confirmedCount = 0;
  let possibleCount = 0;
  let supersededCount = 0;
  let exceptionCount = 0;

  for (const f of findings) {
    if (f.classification === "confirmed_inconsistency") confirmedCount++;
    else if (f.classification === "possible_inconsistency") possibleCount++;
    else if (f.classification === "superseded_state") supersededCount++;
    else if (f.classification === "date_specific_exception") exceptionCount++;
  }

  return {
    generatedAt: options.now ?? new Date().toISOString(),
    event: EVENT.name,
    timezone: EVENT.timezone,
    documentCount: docCount,
    factsExtracted: allFacts.length,
    findings,
    summary: {
      totalDiscrepancies: findings.length,
      confirmedCount,
      possibleCount,
      supersededCount,
      exceptionCount,
      cleanScan: confirmedCount === 0 && possibleCount === 0,
    },
  };
}
