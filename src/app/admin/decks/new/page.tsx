import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function createDeck(formData: FormData) {
  'use server';
  const supabase = createServerClient();
  const title = String(formData.get('title') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const topic = String(formData.get('topic') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error('Forbidden');
  const { data, error } = await supabase
    .from('decks')
    .insert({ title, subject, topic, description, created_by: user.id })
    .select()
    .single();
  if (error) throw error;
  redirect(`/admin/decks/${data.id}`);
}

export default async function NewDeckPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user?.id ?? '').maybeSingle();
  if (!user || !profile?.is_admin) return <div>Not authorized.</div>;
  return (
    <form action={createDeck} className="space-y-3">
      <h1 className="text-xl font-semibold">Create Deck</h1>
      <input className="w-full rounded-md border p-2" name="title" placeholder="Title" required />
      <input className="w-full rounded-md border p-2" name="subject" placeholder="Subject" />
      <input className="w-full rounded-md border p-2" name="topic" placeholder="Topic" />
      <textarea className="w-full rounded-md border p-2" name="description" placeholder="Description" />
      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Create</button>
    </form>
  );
}


