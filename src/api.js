import { createClient } from '@supabase/supabase-js';
import { newDemo, advanceDemo, answerDemo, finishDemo, resolveDemo, reviewDemo, stanceDemo } from './game';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
const supabase = configured ? createClient(url, key) : null;
const DEMO_KEY = 'entre-potes-demo-v2';
let demoFallback;

function readDemo() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || demoFallback; } catch { return demoFallback; }
}
function writeDemo(room) {
  room = { ...room, revision: (room.revision || 0) + 1 };
  demoFallback = room;
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(room)); } catch { /* In-memory demo remains usable. */ }
  return { ...room, server_now: new Date().toISOString() };
}

async function authenticate() {
  if (!supabase) throw new Error('Le multijoueur sera disponible une fois la base de données connectée. Tu peux déjà essayer la démo.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) throw new Error('Connexion impossible. Vérifie la connexion Internet et l’activation des connexions anonymes dans Supabase.');
  }
}

export async function call(action, args = {}, demo = false) {
  if (demo) {
    if (action === 'create') return writeDemo(newDemo(args.name, args.avatar, args.rounds, args.games));
    const room = readDemo();
    if (!room) throw new Error('Lance d’abord une démo sur ce navigateur.');
    if (action === 'start') return writeDemo(advanceDemo(room));
    if (action === 'answer') return writeDemo(answerDemo(room, args.answer));
    if (action === 'finish') return writeDemo(finishDemo(room));
    if (action === 'resolve') return writeDemo(resolveDemo(room));
    if (action === 'review') return writeDemo(reviewDemo(room, args.player_id, args.points));
    if (action === 'stance') return writeDemo(stanceDemo(room, args.stance));
    return { ...room, server_now: new Date().toISOString() };
  }
  await authenticate();
  const { data, error } = await supabase.rpc('ep_action', { p_action: action, p_code: args.code || null, p_payload: args });
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42P01') throw new Error('La base de données doit encore être initialisée avec le fichier Supabase du projet.');
    throw new Error(error.message);
  }
  return data;
}

export function watch(room, refresh, demo = false) {
  const onFocus = () => { if (!document.hidden) refresh(); };
  document.addEventListener('visibilitychange', onFocus);
  const timer = window.setInterval(refresh, 15000);
  const onStorage = event => { if (event.key === DEMO_KEY) refresh(); };
  let channel;
  if (demo) window.addEventListener('storage', onStorage);
  else channel = supabase.channel(`party-${room.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ep_signals', filter: `room_id=eq.${room.id}` }, refresh)
    .subscribe(status => { if (status === 'SUBSCRIBED') refresh(); });
  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onFocus);
    window.removeEventListener('storage', onStorage);
    if (channel) supabase.removeChannel(channel);
  };
}
