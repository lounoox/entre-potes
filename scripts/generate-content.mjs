import { readFile, writeFile } from 'node:fs/promises';
import { BANK, DEMO } from '../content/catalog.mjs';

const rows = Object.entries(BANK).flatMap(([type, entries]) => entries.map((entry, index) => ({ ...entry, type, id: `${type}-${index + 1}` })));
const demo = Object.entries(DEMO).map(([type, entry]) => ({ ...entry, type, id: `demo-${type}` }));
const sql = `-- Généré par npm run content:generate depuis content/catalog.mjs.\n-- ${rows.length} défis originaux. Rejouable sans doublonner les entrées.\nbegin;\ninsert into public.ep_catalog(id, type, challenge)\nselect value->>'id', value->>'type', value from jsonb_array_elements($content$${JSON.stringify(rows, null, 2)}$content$::jsonb)\non conflict(id) do update set type = excluded.type, challenge = excluded.challenge;\ncommit;\n`;
const previousMigration = await readFile(new URL('../supabase/004_answer_history.sql', import.meta.url), 'utf8');
const setup = previousMigration.split('create or replace function public.ep_snapshot')[0].replace(/^--[^\n]*\n/gm,'').replace('begin;','');
let snapshot = previousMigration.match(/create or replace function public\.ep_snapshot[\s\S]+?\n\$\$;/)[0];
snapshot = snapshot.replace("v_challenge := r.challenge;", "v_challenge := case when r.status in ('review','results','finished') then public.ep_explained(r.challenge) else r.challenge end;");
snapshot = snapshot.replace("v_challenge - 'expected'", "v_challenge - 'expected' - 'explanation'");
snapshot = snapshot.replace("'challenge',h.challenge", "'challenge',public.ep_explained(h.challenge)");
const explanations = rows.map(({id,explanation})=>({id,explanation}));
const explanationMigration = '-- Généré par npm run content:generate. Après 001 à 003 ; inclut aussi 004.\n-- Rejouable : ajoute les explications aux parties existantes sans changer les scores.\nbegin;\n' + setup + `
update public.ep_catalog c set challenge=c.challenge || jsonb_build_object('explanation',e.value->>'explanation')
from jsonb_array_elements($explanations$${JSON.stringify(explanations,null,2)}$explanations$::jsonb) e(value)
where c.id=e.value->>'id';
create or replace function public.ep_explained(p_challenge jsonb) returns jsonb
language sql stable security definer set search_path='' as $$
select p_challenge || coalesce((select jsonb_build_object('explanation',c.challenge->>'explanation')
  from public.ep_catalog c where c.id=p_challenge->>'id' and c.challenge ? 'explanation'),'{}'::jsonb);
$$;
revoke all on function public.ep_explained(jsonb) from public,anon,authenticated;
${snapshot}
commit;
`;
const files = [['../supabase/005_explanations.sql', explanationMigration], ['../supabase/003_content.sql', sql], ['../src/demo-content.json', JSON.stringify(demo, null, 2) + '\n']];
for (const [path, content] of files) {
  const destination = new URL(path, import.meta.url);
  if (process.argv.includes('--check')) {
    if (await readFile(destination, 'utf8') !== content) throw new Error(`${path} doit être régénéré avec npm run content:generate.`);
  } else await writeFile(destination, content);
}
console.log(`${rows.length} défis multijoueurs + ${demo.length} démonstrations : ${process.argv.includes('--check') ? 'vérifiés' : 'générés'}.`);
