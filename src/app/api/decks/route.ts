import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const createDeckSchema = z.object({
  title: z.string().min(1),
  subject: z.string().optional().nullable(),
  topic: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: decks, error } = await supabase.from('decks').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute per-deck due counts including unseen cards for the current user
  let dueTodayByDeck: Record<string, number> = {};
  if (user && decks && decks.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: allCards } = await supabase
      .from('cards')
      .select('id, deck_id')
      .in('deck_id', decks.map((d) => d.id));
    const { data: sched } = await supabase
      .from('card_scheduling')
      .select('card_id, due_at, cards(deck_id)')
      .eq('user_id', user.id);

    const totalByDeck = new Map<string, number>();
    allCards?.forEach((c) => totalByDeck.set(c.deck_id, (totalByDeck.get(c.deck_id) ?? 0) + 1));

    const scheduledCountByDeck = new Map<string, number>();
    const scheduledDueByDeck = new Map<string, number>();
    sched?.forEach((s: any) => {
      const deckId = s.cards?.deck_id as string;
      scheduledCountByDeck.set(deckId, (scheduledCountByDeck.get(deckId) ?? 0) + 1);
      if (s.due_at <= today) {
        scheduledDueByDeck.set(deckId, (scheduledDueByDeck.get(deckId) ?? 0) + 1);
      }
    });

    dueTodayByDeck = Object.fromEntries(
      decks.map((d) => {
        const total = totalByDeck.get(d.id) ?? 0;
        const scheduled = scheduledCountByDeck.get(d.id) ?? 0;
        const unseen = Math.max(0, total - scheduled);
        const due = (scheduledDueByDeck.get(d.id) ?? 0) + unseen;
        return [d.id, due];
      }),
    );
  }

  return NextResponse.json({ decks, dueTodayByDeck });
}

export async function POST(req: Request) {
  const supabase = createServerClient();
  const body = await req.json();
  const parsed = createDeckSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('decks')
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deck: data });
}


