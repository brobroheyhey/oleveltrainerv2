import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div>Please sign in.</div>;
  }
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (!profile?.is_admin) {
    return <div>Not authorized.</div>;
  }
  const { data: decks } = await supabase.from('decks').select('*').order('created_at', { ascending: false });
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Link className="underline" href="/admin/decks/new">Create Deck</Link>
      <ul className="list-disc pl-5">
        {decks?.map((d) => (
          <li key={d.id}>
            {d.title} — <Link className="underline" href={`/admin/decks/${d.id}`}>Manage</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}


