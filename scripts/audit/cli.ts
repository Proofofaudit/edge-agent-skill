#!/usr/bin/env bun
// Edge City Operational Facts Auditor — CLI
// Usage: bun run scripts/audit/cli.ts [--json] [--out <path>] [--strict]

import { writeFileSync } from "node:fs";
import { runOperationalAudit } from "./index";
import { formatMarkdownReport, formatJsonReport } from "./reporter";

function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes("--json");
  const isStrict = args.includes("--strict");
  const outIdx = args.indexOf("--out");
  const outputPath = outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : undefined;

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Edge City Operational Facts Auditor
Usage:
  bun run audit:ops [options]

Options:
  --json           Format output as JSON
  --out <path>     Write report to the specified file path
  --strict         Exit with code 1 if confirmed discrepancies are found
  --help, -h       Show this help message
`);
    process.exit(0);
  }

  try {
    const report = runOperationalAudit();
    const formatted = isJson ? formatJsonReport(report) : formatMarkdownReport(report);

    if (outputPath) {
      writeFileSync(outputPath, formatted, "utf8");
      console.log(`Audit report written to ${outputPath}`);
    } else {
      console.log(formatted);
    }

    if (isStrict && report.summary.confirmedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Audit failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
