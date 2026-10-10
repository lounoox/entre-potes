import { readFile, writeFile } from 'node:fs/promises';
import { BANK, DEMO } from '../content/catalog.mjs';

const rows = Object.entries(BANK).flatMap(([type, entries]) => entries.map((entry, index) => ({ ...entry, type, id: `${type}-${index + 1}` })));
const demo = Object.entries(DEMO).map(([type, entry]) => ({ ...entry, type, id: `demo-${type}` }));
const sql = `-- Généré par npm run content:generate depuis content/catalog.mjs.\n-- ${rows.length} défis originaux. Rejouable sans doublonner les entrées.\nbegin;\ninsert into public.ep_catalog(id, type, challenge)\nselect value->>'id', value->>'type', value from jsonb_array_elements($content$${JSON.stringify(rows, null, 2)}$content$::jsonb)\non conflict(id) do update set type = excluded.type, challenge = excluded.challenge;\ncommit;\n`;
const files = [['../supabase/003_content.sql', sql], ['../src/demo-content.json', JSON.stringify(demo, null, 2) + '\n']];
for (const [path, content] of files) {
  const destination = new URL(path, import.meta.url);
  if (process.argv.includes('--check')) {
    if (await readFile(destination, 'utf8') !== content) throw new Error(`${path} doit être régénéré avec npm run content:generate.`);
  } else await writeFile(destination, content);
}
console.log(`${rows.length} défis multijoueurs + ${demo.length} démonstrations : ${process.argv.includes('--check') ? 'vérifiés' : 'générés'}.`);
