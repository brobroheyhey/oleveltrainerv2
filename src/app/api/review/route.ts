import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { applySm2, mapRatingToGrade } from '@/lib/sm2';

const bodySchema = z.object({
  cardId: z.string().uuid(),
  grade: z.union([z.literal('again'), z.literal('hard'), z.literal('medium'), z.literal('easy')]).transform(mapRatingToGrade),
});

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const { cardId, grade } = parsed.data;

  const { data: card } = await supabase.from('cards').select('id, deck_id').eq('id', cardId).maybeSingle();
  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });

  const { data: sched } = await supabase
    .from('card_scheduling')
    .select('*')
    .eq('user_id', user.id)
    .eq('card_id', cardId)
    .maybeSingle();

  const repetition = sched?.repetition ?? 0;
  const intervalDays = sched?.interval_days ?? 0;
  const efactor = Number(sched?.efactor ?? 2.5);

  const next = applySm2({ repetition, intervalDays, efactor, grade });

  const { error: upsertErr } = await supabase.from('card_scheduling').upsert({
    user_id: user.id,
    card_id: cardId,
    repetition: next.nextRepetition,
    interval_days: next.nextIntervalDays,
    efactor: next.nextEfactor,
    due_at: next.dueAt.toISOString().slice(0, 10),
    last_reviewed_at: new Date().toISOString(),
  });
  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  await supabase.from('review_logs').insert({
    user_id: user.id,
    card_id: cardId,
    deck_id: card.deck_id,
    grade,
    scheduled_interval: intervalDays,
    next_interval: next.nextIntervalDays,
    efactor_before: efactor,
    efactor_after: next.nextEfactor,
  });

  return NextResponse.json({ ok: true });
}


