import { createServerClient } from '@/lib/supabase/server';

async function addCard(formData: FormData) {
  'use server';
  const supabase = createServerClient();
  const deckId = String(formData.get('deckId'));
  const front = String(formData.get('front'));
  const back = String(formData.get('back'));
  const hint = String(formData.get('hint') || '');
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user?.id ?? '').maybeSingle();
  if (!user || !profile?.is_admin) throw new Error('Forbidden');
  await supabase.from('cards').insert({ deck_id: deckId, front, back, hint: hint || null });
}

export default async function AdminDeckDetail({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: deck } = await supabase.from('decks').select('*').eq('id', params.id).maybeSingle();
  const { data: cards } = await supabase.from('cards').select('*').eq('deck_id', params.id).order('created_at', { ascending: false });
  if (!deck) return <div>Deck not found</div>;
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">{deck.title}</h1>
      <form action={addCard} className="space-y-2">
        <input type="hidden" name="deckId" value={params.id} />
        <input className="w-full rounded-md border p-2" name="front" placeholder="Front (prompt)" required />
        <textarea className="w-full rounded-md border p-2" name="back" placeholder="Back (answer)" required />
        <input className="w-full rounded-md border p-2" name="hint" placeholder="Hint (optional)" />
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Add Card</button>
      </form>
      <ul className="space-y-2">
        {cards?.map((c) => (
          <li key={c.id} className="rounded-md border p-3">
            <div className="font-medium">{c.front}</div>
            <div className="text-sm text-muted-foreground">{c.back}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}


