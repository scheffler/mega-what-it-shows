<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: problem → link to the issue filed for it.
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, { label: string; href: string }>> } = $props();

  const result = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const placed = $derived(result.groups.filter((g) => g.problem !== 'unplaced').length);
</script>

<p class="sum">
  <strong>{result.merged}</strong> reports merged into #{ticket} · <strong>{placed}</strong>
  {placed === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>intake tagged otherwise</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      {@const t = g.problem === 'unplaced' ? undefined : tickets[g.problem]}
      <tr class:open={!t}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.mistagged}</td>
        <td>{#if t}<a href={t.href}>{t.label}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
