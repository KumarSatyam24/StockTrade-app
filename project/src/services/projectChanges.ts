import { supabase } from '../lib/supabase';

export interface ProjectChange {
  id: string;
  user_id: string;
  description: string;
  category: string;
  files_changed: string[];
  created_at: string;
}

export async function addProjectChange(
  userId: string,
  description: string,
  category: string,
  filesChanged: string[] = []
): Promise<ProjectChange> {
  const { data, error } = await supabase
    .from('project_changes')
    .insert({
      user_id: userId,
      description,
      category,
      files_changed: filesChanged
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectChanges(userId: string): Promise<ProjectChange[]> {
  const { data, error } = await supabase
    .from('project_changes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}