// What a merged report is about, counted the desk's way: every report under the cause its tenant and
// channel give it (causes.ts), and a report the desk read as a one-day move (desk-notes.json) also
// under `one-day`, as readAs footnotes it.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export type ProblemGroup = { problem: Problem | 'unplaced'; reports: Report[]; tenants: number; mistagged: number };

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  const add = (p: ProblemGroup['problem'], r: Report) => by.set(p, [...(by.get(p) ?? []), r]);
  for (const r of merged) {
    add(causeOf(r, tenantOf(r)) ?? 'unplaced', r);
    if (oneDayMove.includes(r.id)) add('one-day', r);
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
