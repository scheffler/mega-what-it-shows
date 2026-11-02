// What a merged report is actually about. causes.ts places a report by tenant and channel; the desk's
// reading (desk-notes.json) overrides that for reports that describe no month flip at all.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem | 'unplaced'; reports: Report[]; tenants: number; mistagged: number };

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => ({
      problem,
      reports: rs,
      tenants: new Set(rs.map((r) => r.tenant)).size,
      // Intake only ever tags parser or hint; a one-day move is mistagged whatever it says.
      mistagged: rs.filter((r) => r.meta.intakeTag !== problem).length,
    }))
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged: merged.length, groups };
}
