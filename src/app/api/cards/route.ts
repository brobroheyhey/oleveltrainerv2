import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const querySchema = z.object({
  deckId: z.string().uuid(),
  dueOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

const createCardSchema = z.object({
  deckId: z.string().uuid(),
  front: z.string().min(1),
  back: z.string().min(1),
  hint: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const { deckId, dueOnly } = parsed.data;
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch cards and scheduling separately to allow missing scheduling rows to be treated as due
  const { data: cards, error: cardsErr } = await supabase
    .from('cards')
    .select('id, front, back, hint')
    .eq('deck_id', deckId)
    .limit(200);
  if (cardsErr) return NextResponse.json({ error: cardsErr.message }, { status: 500 });

  if (!dueOnly) return NextResponse.json({ cards });

  const ids = (cards ?? []).map((c) => c.id);
  if (ids.length === 0) return NextResponse.json({ cards: [] });

  const today = new Date().toISOString().slice(0, 10);
  const { data: sched, error: schedErr } = await supabase
    .from('card_scheduling')
    .select('card_id, due_at')
    .eq('user_id', user.id)
    .in('card_id', ids);
  if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 });
  const idToDue = new Map<string, string>(sched?.map((s) => [s.card_id, s.due_at]) ?? []);
  const due = (cards ?? []).filter((c) => {
    const dueAt = idToDue.get(c.id);
    if (!dueAt) return true; // unseen card is due
    return dueAt <= today;
  });
  return NextResponse.json({ cards: due });
}

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = createCardSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const { deckId, front, back, hint, tags } = parsed.data;
  const { data, error } = await supabase
    .from('cards')
    .insert({ deck_id: deckId, front, back, hint: hint ?? null, tags: tags ?? null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ card: data });
}


