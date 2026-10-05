import { createClient } from '@supabase/supabase-js';
import { users } from './data';
import type { DemoUser, UserRole } from './types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const dataMode = supabase ? 'Supabase auth + local demo data' : 'Seeded demo mode';

type ProfileRow = { full_name: string; role: UserRole; department: string | null; programme: string | null };

export async function authenticate(email: string, password: string): Promise<DemoUser | null> {
  if (!supabase) return users.find((account) => account.email === email.trim().toLowerCase() && account.password === password) ?? null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  const { data: profile } = await supabase.from('profiles').select('full_name, role, department, programme').eq('id', data.user.id).single<ProfileRow>();
  if (!profile) return null;
  const title = profile.role === 'student' ? profile.programme ?? 'Student' : profile.role === 'staff' ? 'Faculty & staff' : 'University Administration';
  return { id: data.user.id, name: profile.full_name, initials: profile.full_name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(), role: profile.role, title, email, password: '', department: profile.department ?? 'Northbridge University' };
}

export async function endSession() {
  if (supabase) await supabase.auth.signOut();
}
