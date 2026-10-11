// Edge City Operational Facts Auditor — Reporter
// Deterministically formats audit findings into Markdown and JSON reports.

import type { AuditReport, Discrepancy } from "./types";

export function formatMarkdownReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push("# Edge City India 2026 — Operational Facts Audit Report\n");
  lines.push(
    `Audited **${report.documentCount}** documents across Edge City India public sources (Wiki, Website, Substack newsletters).`
  );
  lines.push(`Timezone: \`${report.timezone}\` | Extracted facts: **${report.factsExtracted}**\n`);

  lines.push("## Summary\n");
  lines.push("| Metric | Count |");
  lines.push("| --- | --- |");
  lines.push(`| Total Discrepancies | ${report.summary.totalDiscrepancies} |`);
  lines.push(`| Confirmed Inconsistencies | ${report.summary.confirmedCount} |`);
  lines.push(`| Superseded State / Stale Listings | ${report.summary.supersededCount} |`);
  lines.push(`| Possible Inconsistencies | ${report.summary.possibleCount} |`);
  lines.push(`| Date-Specific Exceptions | ${report.summary.exceptionCount} |`);
  lines.push(`| Clean Scan | ${report.summary.cleanScan ? "YES" : "NO"} |\n`);

  if (report.findings.length === 0) {
    lines.push("## Result: Clean Scan\n");
    lines.push(
      "No operational fact contradictions or discrepancies were detected across the audited reference snapshot. All deadlines, hours, shuttle arrangements, and attendee instructions are consistent.\n"
    );
    return lines.join("\n");
  }

  lines.push("## Findings\n");

  report.findings.forEach((finding: Discrepancy, index: number) => {
    lines.push(`### ${index + 1}. ${finding.description}\n`);
    lines.push(`- **Topic:** \`${finding.topic}\``);
    lines.push(`- **Subject:** \`${finding.subject}\``);
    lines.push(`- **Classification:** \`${finding.classification}\``);
    lines.push(`- **Status:** \`${finding.status}\`\n`);

    lines.push("#### Conflicting / Divergent Claims:\n");
    finding.facts.forEach((fact, fIdx) => {
      lines.push(`**Claim ${String.fromCharCode(65 + fIdx)}:**`);
      lines.push(`- **Stated Value:** \`${fact.value}\``);
      lines.push(`- **Source Document:** [\`${fact.sourcePath}\`](${fact.sourceUrl})`);
      if (fact.publishedDate) lines.push(`- **Published:** \`${fact.publishedDate}\``);
      if (fact.indexedDate) lines.push(`- **Last Indexed:** \`${fact.indexedDate}\``);
      lines.push(`- **Supporting Evidence:** > "${fact.supportingText}"\n`);
    });

    lines.push("#### Why Inconsistent:");
    lines.push(`${finding.whyInconsistent}\n`);

    lines.push("#### Suggested Organizer Verification Question:");
    lines.push(`> "${finding.suggestedQuestion}"\n`);

    lines.push("#### Proposed Correction Location:");
    lines.push(`\`${finding.proposedCorrectionLocation}\`\n`);

    lines.push("---\n");
  });

  lines.push("## Verification Safeguards\n");
  lines.push("- **Read-Only:** This audit inspected existing public references without modifying files or external sources.");
  lines.push("- **Deterministic:** Generated from verifiable document text and temporal metadata without paid API calls.");
  lines.push("- **Organizer Confirmation Required:** Do not modify live operations or attendee instructions without explicit organizer review.\n");

  return lines.join("\n");
}

export function formatJsonReport(report: AuditReport): string {
  return JSON.stringify(report, null, 2) + "\n";
}
