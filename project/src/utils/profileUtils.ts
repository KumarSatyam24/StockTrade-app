import { supabase } from '../lib/supabase';
import type { User } from '../types';

export async function ensureProfile(user: User) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email
      });
  }
}